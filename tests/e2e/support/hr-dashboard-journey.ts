import { expect, type Page } from "@playwright/test";

export async function signIn(
  page: Page,
  email: string,
  password: string,
  role: "applicant" | "hr",
) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    role === "hr" ? /\/hr\/applications$/ : /\/applications\/?$/,
    { timeout: 20_000 },
  );
}

export async function submitApplication(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}/apply`);
  await page.getByLabel("Cover letter").fill("Private dashboard cover letter");
  await page.getByLabel("Full name").fill("Private dashboard applicant");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible({ timeout: 20_000 });
  await expect(page.getByLabel("Cover letter")).toHaveCount(0);
}

export async function withdrawApplication(page: Page) {
  await page
    .getByRole("button", { name: "Withdraw application", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Confirm withdrawal", exact: true })
    .click();
  await expect(page.getByRole("status")).toContainText("Withdrawn");
}
