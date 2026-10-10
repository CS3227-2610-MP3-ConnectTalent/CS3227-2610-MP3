import { expect, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";
import type { WithdrawalFixture } from "./application-withdrawal-fixture";

async function closeJob(admin: AdminClient, jobId: string) {
  const { error } = await admin
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", jobId);
  expect(error).toBeNull();
}

async function cancelWithKeyboard(
  page: Page,
  admin: AdminClient,
  applicationId: string,
) {
  await page.reload();
  const withdraw = page.getByRole("button", {
    name: "Withdraw application",
    exact: true,
  });
  await withdraw.focus();
  await expect(withdraw).toBeFocused();
  await page.keyboard.press("Enter");
  await page
    .getByRole("button", { name: "Keep application", exact: true })
    .click();
  const result = await admin
    .from("applications")
    .select("withdrawn_at")
    .eq("id", applicationId)
    .single();
  expect(result.data!.withdrawn_at).toBeNull();
}

async function confirmWithdrawal(page: Page, applicationId: string) {
  await page
    .getByRole("button", { name: "Withdraw application", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm withdrawal", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Withdrawn");
  await expect(
    page.getByRole("button", { name: "Withdraw application", exact: true }),
  ).toHaveCount(0);
  expect(
    (
      await page.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(200);
}

async function verifyHrReadOnlyState(hr: Page, applicationId: string) {
  await hr.reload();
  await expect(
    hr.getByText("Withdrawn by the Applicant.", { exact: false }),
  ).toBeVisible();
  await expect(
    hr.getByRole("button", { name: "Add note", exact: true }),
  ).toHaveCount(0);
  await expect(
    hr.getByRole("button", { name: "Update status", exact: true }),
  ).toHaveCount(0);
  await expect(
    hr.getByRole("button", { name: /Generate summary/ }),
  ).toHaveCount(0);
  await expect(
    hr.getByText("Synthetic retained HR note", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await hr.request.get(`/api/applications/${applicationId}/resume`)
    ).status(),
  ).toBe(200);
}

async function verifyRetainedApplication(
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  const { data } = await admin
    .from("applications")
    .select(
      "withdrawn_at,withdrawn_by,cover_letter,original_submitted_letter,resume_id",
    )
    .eq("id", fixture.applicationId!)
    .single();
  expect(data!.withdrawn_at).not.toBeNull();
  expect(data!.withdrawn_by).toBe(fixture.users[0]);
  expect(data!.cover_letter).toBe(
    "Synthetic unsaved letter retained during upload",
  );
  expect(data!.resume_id).not.toBeNull();
}

async function verifyApplicantHistory(page: Page) {
  await page.goto("/applications");
  await expect(page.getByText("Withdrawn", { exact: true })).toBeVisible();
  await expect(
    page.getByText("View application", { exact: true }),
  ).toBeVisible();
}

export async function completeWithdrawalLifecycle(
  page: Page,
  hr: Page,
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  const applicationId = fixture.applicationId!;
  await closeJob(admin, fixture.jobId);
  await cancelWithKeyboard(page, admin, applicationId);
  await confirmWithdrawal(page, applicationId);
  await verifyHrReadOnlyState(hr, applicationId);
  await verifyRetainedApplication(admin, fixture);
  await verifyApplicantHistory(page);
}
