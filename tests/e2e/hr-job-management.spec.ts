import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !localAdminKey,
  "Local HR browser test needs TEST_SUPABASE_SERVICE_ROLE_KEY.",
);

import type { AdminClient } from "./support/admin-client";

test("HR creates, publishes and closes a job while public and Applicant access stay bounded", async ({
  page,
}) => runJobManagementScenario(page));

async function runJobManagementScenario(page: Page) {
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
    userIds.push(
      ...(await createJobUsers(admin, hrEmail, applicantEmail, password)),
    );
    await signIn(page, hrEmail, password, "hr");
    jobId = await createJobDraft(page, title);
    await verifyDraftIsPrivate(page, jobId, title);
    await publishJob(page, jobId, title);
    await closeJob(page, jobId, title);
    await verifyApplicantCannotManageJobs(page, applicantEmail, password);
  } finally {
    await cleanupJobFixture(admin, jobId, userIds);
  }
}

async function createJobUsers(
  admin: AdminClient,
  hrEmail: string,
  applicantEmail: string,
  password: string,
) {
  const ids: string[] = [];
  for (const email of [hrEmail, applicantEmail]) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    ids.push(data.user!.id);
  }
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", ids[0]);
  expect(error).toBeNull();
  return ids;
}

async function signIn(
  page: Page,
  email: string,
  password: string,
  role: "hr" | "applicant",
) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function createJobDraft(page: Page, title: string) {
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
  const jobId = page.url().match(/\/hr\/jobs\/([0-9a-f-]{36})/)?.[1];
  expect(jobId).toBeTruthy();
  return jobId!;
}

async function verifyDraftIsPrivate(page: Page, jobId: string, title: string) {
  await page.goto("/");
  await expect(page.getByText(title)).toHaveCount(0);
  expect((await page.goto(`/jobs/${jobId}`))?.status()).toBe(404);
}

async function publishJob(page: Page, jobId: string, title: string) {
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
}

async function closeJob(page: Page, jobId: string, title: string) {
  await page.goto(`/hr/jobs/${jobId}`);
  await page.getByRole("button", { name: "Close job" }).click();
  await expect(page.getByText("Closed", { exact: true })).toBeVisible();
  await page.goto("/");
  await expect(page.getByText(`${title} revised`, { exact: true })).toHaveCount(
    0,
  );
  expect((await page.goto(`/jobs/${jobId}`))?.status()).toBe(404);
}

async function verifyApplicantCannotManageJobs(
  page: Page,
  email: string,
  password: string,
) {
  await page.goto("/hr/jobs");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, email, password, "applicant");
  expect((await page.goto("/hr/jobs"))?.status()).toBe(404);
}

async function cleanupJobFixture(
  admin: AdminClient,
  jobId: string | undefined,
  userIds: string[],
) {
  if (jobId) {
    const { error } = await admin.from("jobs").delete().eq("id", jobId);
    expect(error).toBeNull();
  }
  for (const id of userIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    expect(error).toBeNull();
  }
}
