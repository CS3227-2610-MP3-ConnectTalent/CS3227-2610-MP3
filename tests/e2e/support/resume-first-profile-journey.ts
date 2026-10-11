import { createHash } from "node:crypto";
import { expect, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";
import type { ResumeFirstFixture } from "./resume-first-profile-fixture";

async function login(page: Page, email: string, password: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/applications$/);
}

async function uploadUnsavedProfileResume(
  page: Page,
  admin: AdminClient,
  fixture: ResumeFirstFixture,
  ownerId: string,
) {
  await login(page, fixture.emails[0], fixture.password);
  await page.goto("/profile");
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Unsaved profile name");
  await selectPdf(page, "profile.pdf", fixture.pdf);
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Download résumé: profile.pdf" }),
  ).toBeVisible();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Unsaved profile name",
  );
  const profile = await admin
    .from("applicant_profiles")
    .select("full_name")
    .eq("user_id", ownerId)
    .single();
  expect(profile.data?.full_name).toBe("Fixture Applicant");
  expect((await page.request.get("/api/profile/resume")).status()).toBe(200);
}

async function selectPdf(page: Page, name: string, pdf: Buffer) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name,
    mimeType: "application/pdf",
    buffer: pdf,
  });
}

async function verifyOtherApplicantCannotReadResume(
  page: Page,
  fixture: ResumeFirstFixture,
) {
  await login(page, fixture.emails[1], fixture.password);
  expect((await page.request.get("/api/profile/resume")).status()).toBe(404);
}

async function prepareUnsavedApplication(
  page: Page,
  admin: AdminClient,
  fixture: ResumeFirstFixture,
  ownerId: string,
) {
  await page.goto(`/jobs/${fixture.jobId}/apply`);
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Unsaved application name");
  await page
    .getByLabel("Work experience (optional)")
    .fill("Unsaved experience");
  await page
    .getByLabel("Cover letter", { exact: true })
    .fill("Unsaved letter retained");
  await selectPdf(page, "invalid.pdf", Buffer.from("invalid"));
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText(
    "valid, unencrypted PDF",
  );
  const applications = await admin
    .from("applications")
    .select("id")
    .eq("applicant_id", ownerId);
  expect(applications.data).toHaveLength(0);
  await selectPdf(page, "direct.pdf", fixture.pdf);
}

async function interruptInitialUpload(
  page: Page,
  admin: AdminClient,
  fixture: ResumeFirstFixture,
  ownerId: string,
) {
  let operation: string | undefined;
  await page.route(
    `**/api/jobs/${fixture.jobId}/resume`,
    async (route) => {
      const headers = route.request().headers();
      expect(headers["x-application-revision"]).toBe("");
      operation = headers["x-resume-operation"];
      const prepared = await admin.rpc("prepare_application_resume", {
        p_actor: ownerId,
        p_job: fixture.jobId,
        p_revision: null,
        p_operation: operation,
        p_filename: "direct.pdf",
        p_size: fixture.pdf.length,
        p_sha256: createHash("sha256").update(fixture.pdf).digest("hex"),
      });
      expect(prepared.error).toBeNull();
      await route.abort("failed");
    },
    { times: 1 },
  );
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry upload", exact: true }),
  ).toBeVisible();
  return operation;
}

async function retryInitialUpload(
  page: Page,
  admin: AdminClient,
  fixture: ResumeFirstFixture,
  ownerId: string,
  interruptedOperation: string | undefined,
) {
  const retryRequest = page.waitForRequest(
    (request) =>
      request.url().endsWith(`/api/jobs/${fixture.jobId}/resume`) &&
      request.headers()["x-resume-retry"] === "true",
  );
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  const headers = (await retryRequest).headers();
  expect(headers["x-application-revision"]).toBe("");
  expect(headers["x-resume-operation"]).not.toBe(interruptedOperation);
  await expect(
    page.getByRole("link", { name: "Download résumé: direct.pdf" }),
  ).toBeVisible({ timeout: 30_000 });
  const applications = await admin
    .from("applications")
    .select("id")
    .eq("applicant_id", ownerId)
    .eq("job_id", fixture.jobId);
  expect(applications.data).toHaveLength(1);
  const retired = await admin
    .from("application_resume_objects")
    .select("state")
    .eq("id", interruptedOperation!)
    .single();
  expect(retired.data?.state).toBe("deleting");
}

async function selectProfileResumeAndCheckDraft(
  page: Page,
  admin: AdminClient,
  ownerId: string,
) {
  await page
    .getByRole("button", { name: "Use profile résumé", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Download résumé: profile.pdf" }),
  ).toBeVisible();
  const result = await admin
    .from("applications")
    .select("id,full_name,cover_letter,resume_id")
    .eq("applicant_id", ownerId)
    .single();
  expect(result.data?.full_name).toBeNull();
  expect(result.data?.cover_letter).toBe("");
  expect(result.data?.resume_id).not.toBeNull();
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Unsaved application name",
  );
  await expect(page.getByLabel("Work experience (optional)")).toHaveValue(
    "Unsaved experience",
  );
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "Unsaved letter retained",
  );
  return result.data!.id;
}

async function saveLetterRevision(
  page: Page,
  admin: AdminClient,
  applicationId: string,
  letter: string,
) {
  await page.getByLabel("Cover letter", { exact: true }).fill(letter);
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect
    .poll(async () => {
      const result = await admin
        .from("applications")
        .select("cover_letter")
        .eq("id", applicationId)
        .single();
      return result.data?.cover_letter;
    })
    .toBe(letter);
}

async function saveMultipleDraftRevisions(
  page: Page,
  admin: AdminClient,
  applicationId: string,
) {
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  await saveLetterRevision(page, admin, applicationId, "Second saved letter");
  await saveLetterRevision(page, admin, applicationId, "Third saved letter");
}

async function submitAndRemoveProfileResume(
  page: Page,
  fixture: ResumeFirstFixture,
  applicationId: string,
) {
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  await page.goto("/profile");
  await page
    .getByRole("button", { name: "Remove résumé", exact: true })
    .click();
  await expect(
    page.getByText("No résumé attached.", { exact: true }),
  ).toBeVisible();
  expect((await page.request.get("/api/profile/resume")).status()).toBe(404);
  const snapshot = await page.request.get(
    `/api/applications/${applicationId}/resume`,
  );
  expect(snapshot.status()).toBe(200);
  expect(await snapshot.body()).toEqual(fixture.pdf);
}

export async function runResumeFirstProfileJourney(
  page: Page,
  other: Page,
  admin: AdminClient,
  fixture: ResumeFirstFixture,
) {
  const ownerId = fixture.users[0];
  await uploadUnsavedProfileResume(page, admin, fixture, ownerId);
  await verifyOtherApplicantCannotReadResume(other, fixture);
  await prepareUnsavedApplication(page, admin, fixture, ownerId);
  const interruptedOperation = await interruptInitialUpload(
    page,
    admin,
    fixture,
    ownerId,
  );
  await retryInitialUpload(page, admin, fixture, ownerId, interruptedOperation);
  const applicationId = await selectProfileResumeAndCheckDraft(
    page,
    admin,
    ownerId,
  );
  await saveMultipleDraftRevisions(page, admin, applicationId);
  await submitAndRemoveProfileResume(page, fixture, applicationId);
}
