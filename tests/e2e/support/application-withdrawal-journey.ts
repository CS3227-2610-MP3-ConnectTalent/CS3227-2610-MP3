import { expect, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";
import type { WithdrawalFixture } from "./application-withdrawal-fixture";
import { completeWithdrawalLifecycle } from "./application-withdrawal-lifecycle";

async function login(page: Page, email: string, fixture: WithdrawalFixture) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(
    email === fixture.emails[1] ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function saveApplicationDraft(
  page: Page,
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  await page.goto(`/jobs/${fixture.jobId}/apply`);
  await expect(page.locator("main form")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "My applications", exact: true }),
  ).toHaveCount(1);
  await expect(page.getByLabel("Choose PDF résumé")).toBeEnabled();
  await expect(
    page.getByText("Save your draft to enable résumé upload."),
  ).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "Cancel interrupted upload" }),
  ).toHaveCount(0);
  await page.route("**/api/ai/applicant-draft", (route) =>
    route.fulfill({ json: { draft: "Synthetic AI-assisted letter" } }),
  );
  await page.getByLabel("Experience notes").fill("Synthetic experience");
  await page
    .getByRole("button", { name: "Generate draft", exact: true })
    .click();
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "Synthetic AI-assisted letter",
  );
  const rows = await admin
    .from("applications")
    .select("id")
    .eq("applicant_id", fixture.users[0])
    .eq("job_id", fixture.jobId);
  expect(rows.data).toHaveLength(0);
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Synthetic Withdrawal Applicant");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  fixture.applicationId = new URL(page.url()).pathname.split("/").at(-1)!;
}

async function uploadInitialResume(page: Page, fixture: WithdrawalFixture) {
  await choosePdf(page, "synthetic.pdf", fixture.pdf);
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Download résumé: synthetic.pdf" }),
  ).toBeVisible({ timeout: 30_000 });
  await expect(
    page.getByRole("button", { name: "Retry upload", exact: true }),
  ).toHaveCount(0);
}

async function choosePdf(page: Page, name: string, pdf: Buffer) {
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name,
    mimeType: "application/pdf",
    buffer: pdf,
  });
}

async function reserveInterruptedResume(
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  const result = await admin
    .from("applications")
    .select("revision")
    .eq("id", fixture.applicationId!)
    .single();
  const reservation = await admin.rpc("reserve_application_resume", {
    p_actor: fixture.users[0],
    p_job: fixture.jobId,
    p_revision: result.data!.revision,
    p_operation: crypto.randomUUID(),
    p_filename: "interrupted.pdf",
    p_size: fixture.pdf.length,
    p_sha256: "a".repeat(64),
  });
  expect(reservation.error).toBeNull();
}

async function requestReplacement(page: Page, fixture: WithdrawalFixture) {
  await page
    .getByLabel("Cover letter", { exact: true })
    .fill("Synthetic unsaved letter retained during upload");
  await choosePdf(page, "replacement.pdf", fixture.pdf);
  await page
    .getByRole("button", { name: "Replace résumé", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Retry upload", exact: true }),
  ).toBeVisible();
}

async function retryReplacement(page: Page) {
  await page.getByRole("button", { name: "Retry upload", exact: true }).click();
  await expect(
    page.getByRole("link", { name: "Download résumé: replacement.pdf" }),
  ).toBeVisible();
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "Synthetic unsaved letter retained during upload",
  );
}

async function checkResponsiveWidths(page: Page) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
}

async function submitApplication(page: Page, fixture: WithdrawalFixture) {
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  await page.goto("/applications");
  await expect(
    page.getByRole("button", { name: "Withdraw application", exact: true }),
  ).toHaveCount(0);
  await page
    .locator(`a[href="/applications/${fixture.applicationId}"]`)
    .click();
  await expect(page).toHaveURL(
    new RegExp(`/applications/${fixture.applicationId}$`),
  );
  await expect(
    page.getByRole("button", { name: "Withdraw application", exact: true }),
  ).toHaveCount(1);
}

async function createHrNote(hr: Page, fixture: WithdrawalFixture) {
  await hr.goto(`/hr/applications/${fixture.applicationId}`);
  await hr
    .getByLabel("Add a note", { exact: true })
    .fill("Synthetic retained HR note");
  await hr.getByRole("button", { name: "Add note", exact: true }).click();
  await expect(
    hr.getByText("Synthetic retained HR note", { exact: true }),
  ).toBeVisible();
}

async function verifyOtherApplicantCannotReadResume(
  other: Page,
  fixture: WithdrawalFixture,
) {
  await login(other, fixture.emails[2], fixture);
  expect(
    (
      await other.request.get(
        `/api/applications/${fixture.applicationId}/resume`,
      )
    ).status(),
  ).toBe(404);
}

export async function runApplicationWithdrawalJourney(
  page: Page,
  hr: Page,
  other: Page,
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  await login(page, fixture.emails[0], fixture);
  await saveApplicationDraft(page, admin, fixture);
  await uploadInitialResume(page, fixture);
  await reserveInterruptedResume(admin, fixture);
  await requestReplacement(page, fixture);
  await retryReplacement(page);
  await checkResponsiveWidths(page);
  await submitApplication(page, fixture);
  await createHrNote(hr, fixture);
  await verifyOtherApplicantCannotReadResume(other, fixture);
  await completeWithdrawalLifecycle(page, hr, admin, fixture);
}
