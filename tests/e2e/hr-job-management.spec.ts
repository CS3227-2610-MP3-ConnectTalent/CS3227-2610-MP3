import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { saveCompleteApplicantProfile } from "./support/profile-fixtures";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !localAdminKey,
  "Local HR browser test needs TEST_SUPABASE_SERVICE_ROLE_KEY.",
);

test("HR creates, publishes and closes a job while public and Applicant access stay bounded", async ({
  page,
}) => {
  test.setTimeout(90_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const password = "CorrectHorseBattery9!";
  const hrEmail = `job8-hr-${suffix}@example.test`;
  const applicantEmail = `job8-applicant-${suffix}@example.test`;
  const title = `Job management ${suffix}`;
  const userIds: string[] = [];
  let jobId: string | undefined;

  try {
    for (const email of [hrEmail, applicantEmail]) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(error).toBeNull();
      userIds.push(data.user!.id);
    }
    const { error: promotionError } = await admin
      .from("profiles")
      .update({ role: "hr" })
      .eq("user_id", userIds[0]);
    expect(promotionError).toBeNull();
    await saveCompleteApplicantProfile(
      localAdminKey!,
      applicantEmail,
      password,
      "Synthetic Job Applicant",
    );

    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(hrEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/hr\/applications$/);

    await page.goto("/hr/jobs");
    await expect(
      page.getByRole("heading", { name: "Manage jobs" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Create draft" }).click();
    await page.getByLabel("Job title").fill(title);
    await page.getByLabel("Team").fill("Platform");
    await page.getByLabel("Category").selectOption("engineering");
    await page.getByLabel("Description").fill("Synthetic role description");
    await page.getByLabel("Requirements").fill("Synthetic requirements");
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(page).toHaveURL(/\/hr\/jobs\/[0-9a-f-]{36}\?notice=created$/);
    jobId = page.url().match(/\/hr\/jobs\/([0-9a-f-]{36})/)?.[1];
    expect(jobId).toBeTruthy();
    await page.goto("/");
    await expect(page.getByText(title)).toHaveCount(0);
    expect((await page.goto(`/jobs/${jobId}`))?.status()).toBe(404);

    await page.goto(`/hr/jobs/${jobId}`);
    await page.getByLabel("Job title").fill(`${title} revised`);
    await page.getByRole("button", { name: "Save draft" }).click();
    await expect(
      page.getByRole("heading", { name: `${title} revised` }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Publish job" }).click();
    await expect(page.getByText("Published", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Job title")).toHaveCount(0);
    await page.goto("/");
    await expect(
      page.getByText(`${title} revised`, { exact: true }),
    ).toBeVisible();
    await page.goto(`/jobs/${jobId}`);
    await expect(
      page.getByRole("heading", { name: `${title} revised` }),
    ).toBeVisible();

    await page.goto(`/hr/jobs/${jobId}`);
    await page.getByRole("button", { name: "Close job" }).click();
    await expect(page.getByText("Closed", { exact: true })).toBeVisible();
    await page.goto("/");
    await expect(
      page.getByText(`${title} revised`, { exact: true }),
    ).toHaveCount(0);
    expect((await page.goto(`/jobs/${jobId}`))?.status()).toBe(404);

    await page.goto("/hr/jobs");
    await page.getByRole("button", { name: "Sign out" }).click();
    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(applicantEmail);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/applications$/);
    expect((await page.goto("/hr/jobs"))?.status()).toBe(404);
  } finally {
    if (jobId) {
      const { error } = await admin.from("jobs").delete().eq("id", jobId);
      expect(error).toBeNull();
    }
    for (const id of userIds) {
      const { error } = await admin.auth.admin.deleteUser(id);
      expect(error).toBeNull();
    }
  }
});
