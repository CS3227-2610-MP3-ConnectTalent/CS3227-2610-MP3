import { PDFDocument } from "pdf-lib";
import { expect, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";
export async function createResumePdf() {
  const doc = await PDFDocument.create();
  doc.addPage();
  return Buffer.from(await doc.save());
}

export async function uploadInitialResume(
  page: Page,
  applicationId: string,
  pdf: Buffer,
) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name: "not.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("spoofed bytes"),
  });
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "valid, unencrypted PDF",
  );
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name: "synthetic.pdf",
    mimeType: "application/pdf",
    buffer: pdf,
  });
  const request = page.waitForRequest(
    (item) =>
      item.url().endsWith("/resume") &&
      item.headers()["x-resume-intent"] === "upload",
  );
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  const operation = (await request).headers()["x-resume-operation"];
  await expect(
    page.getByRole("link", { name: "Download résumé: synthetic.pdf" }),
  ).toBeVisible();
  expect(operation).toBeTruthy();
  return operation!;
}

export async function verifyResumeDownloadAndRetry(
  page: Page,
  applicationId: string,
  operation: string,
  pdf: Buffer,
  baseURL: string | undefined,
  admin: AdminClient,
) {
  const download = await page.request.get(
    `/api/applications/${applicationId}/resume`,
  );
  expect(download.status()).toBe(200);
  expect(download.headers()["content-disposition"]).toContain("attachment");
  expect(download.headers()["cache-control"]).toBe("private, no-store");
  expect(await download.body()).toEqual(pdf);
  const repeated = await retrySameResumeOperation(
    page,
    applicationId,
    operation,
    pdf,
    baseURL,
  );
  expect(repeated.status()).toBe(200);
  const { data } = await admin
    .from("application_resume_objects")
    .select("object_path")
    .eq("application_id", applicationId)
    .eq("state", "ready");
  return data![0].object_path as string;
}

export async function retrySameResumeOperation(
  page: Page,
  applicationId: string,
  operation: string,
  pdf: Buffer,
  baseURL: string | undefined,
) {
  return page.request.post(`/api/applications/${applicationId}/resume`, {
    headers: {
      origin: baseURL!,
      "x-resume-intent": "upload",
      "x-application-revision": "1",
      "x-resume-operation": operation,
      "x-resume-filename": "synthetic.pdf",
      "content-type": "application/pdf",
    },
    data: pdf,
  });
}

export async function replaceRemoveAndReupload(
  page: Page,
  admin: AdminClient,
  applicationId: string,
  originalObjectPath: string,
  pdf: Buffer,
) {
  await rejectInvalidReplacement(page);
  await uploadReplacement(page, "replacement.pdf", pdf, "Replace résumé");
  const oldObject = await admin.storage
    .from("application-resumes")
    .download(originalObjectPath);
  expect(oldObject.error).not.toBeNull();
  await page
    .getByRole("button", { name: "Remove résumé", exact: true })
    .click();
  await expect(
    page.getByText("No résumé attached.", { exact: true }),
  ).toBeVisible();
  await uploadReplacement(page, "synthetic.pdf", pdf, "Upload résumé");
}

export async function rejectInvalidReplacement(page: Page) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name: "broken.pdf",
    mimeType: "application/pdf",
    buffer: Buffer.from("invalid replacement"),
  });
  await page
    .getByRole("button", { name: "Replace résumé", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "valid, unencrypted PDF",
  );
  await expect(
    page.getByRole("link", { name: "Download résumé: synthetic.pdf" }),
  ).toBeVisible();
}

export async function uploadReplacement(
  page: Page,
  name: string,
  pdf: Buffer,
  actionName: "Upload résumé" | "Replace résumé",
) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name,
    mimeType: "application/pdf",
    buffer: pdf,
  });
  await page.getByRole("button", { name: actionName, exact: true }).click();
  await expect(
    page.getByRole("link", { name: `Download résumé: ${name}` }),
  ).toBeVisible();
}
