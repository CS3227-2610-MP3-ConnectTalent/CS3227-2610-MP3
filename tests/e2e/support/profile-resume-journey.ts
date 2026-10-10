import { expect, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";
import type { ProfileFixture } from "./profile-resume-fixture";
import {
  createResumePdf,
  replaceRemoveAndReupload,
  uploadInitialResume,
  verifyResumeDownloadAndRetry,
} from "./profile-resume-upload";
export async function signIn(
  page: Page,
  email: string,
  password: string,
  role: "applicant" | "hr",
) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(
    role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

export async function saveProfileAndCreateDraft(page: Page, jobId: string) {
  await page.getByRole("link", { name: "My profile", exact: true }).click();
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Synthetic Profile Applicant");
  await page
    .getByLabel("Education (optional)")
    .fill("Synthetic College\nComputing");
  await page
    .getByLabel("Work experience (optional)")
    .fill("Synthetic internship");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");
  await page.reload();
  await expect(page.getByLabel("Education (optional)")).toHaveValue(
    "Synthetic College\nComputing",
  );
  await page.goto(`/jobs/${jobId}/apply`);
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Synthetic Profile Applicant",
  );
  await expect(page.getByLabel("Education (optional)")).toHaveValue(
    "Synthetic College\nComputing",
  );
  await page
    .getByLabel("Cover letter", { exact: true })
    .fill("Synthetic application letter");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  return page.url().split("/").at(-1)!;
}

export async function verifyRoleBoundaries(
  hr: Page,
  other: Page,
  fixture: ProfileFixture,
  applicationId: string,
) {
  await signIn(hr, fixture.emails[1], fixture.password, "hr");
  expect(
    (
      await hr.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(404);
  await hr.goto("/profile");
  await expect(hr).toHaveURL(/\/auth\/sign-in$/);
  await signIn(other, fixture.emails[2], fixture.password, "applicant");
  expect(
    (
      await other.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(404);
}

export async function verifyProfileDoesNotOverwriteApplication(
  page: Page,
  jobId: string,
) {
  await page.goto("/profile");
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Changed profile name");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("status")).toContainText("Profile saved");
  await page.goto(`/jobs/${jobId}/apply`);
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Synthetic Profile Applicant",
  );
}

async function submitAndCheckResumeFrozen(
  page: Page,
  applicationId: string,
  baseURL: string | undefined,
) {
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Replace résumé" }),
  ).toHaveCount(0);
  const response = await page.request.post(
    "/api/applications/" + applicationId + "/resume",
    {
      headers: {
        origin: baseURL!,
        "x-resume-intent": "remove",
        "x-application-revision": "4",
      },
    },
  );
  expect(response.status()).toBe(400);
}

export async function submitAndReviewApplication(
  page: Page,
  hr: Page,
  admin: AdminClient,
  jobId: string,
  applicationId: string,
  baseURL: string | undefined,
) {
  await checkResponsiveWidths(page);
  await submitAndCheckResumeFrozen(page, applicationId, baseURL);
  await hr.goto(`/hr/applications/${applicationId}`);
  await expect(
    hr.getByText("Synthetic Profile Applicant", { exact: true }),
  ).toBeVisible();
  await expect(
    hr.getByText("Synthetic internship", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await hr.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(200);
  const { error } = await admin
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", jobId);
  expect(error).toBeNull();
  expect(
    (
      await page.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(200);
}

export async function checkResponsiveWidths(page: Page) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
}

export async function runApplicantResumeFlow(
  page: Page,
  admin: AdminClient,
  fixture: ProfileFixture,
  baseURL: string | undefined,
) {
  await signIn(page, fixture.emails[0], fixture.password, "applicant");
  const applicationId = await saveProfileAndCreateDraft(page, fixture.jobId);
  const pdf = await createResumePdf();
  const operation = await uploadInitialResume(page, applicationId, pdf);
  const originalObjectPath = await verifyResumeDownloadAndRetry(
    page,
    applicationId,
    operation,
    pdf,
    baseURL,
    admin,
  );
  await replaceRemoveAndReupload(
    page,
    admin,
    applicationId,
    originalObjectPath,
    pdf,
  );
  return applicationId;
}
