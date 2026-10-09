import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!localAdminKey, "Local HR browser test needs TEST_SUPABASE_SERVICE_ROLE_KEY from supabase status.");

test("HR reviews only submitted applications and Applicant sees status without private notes", async ({ page }) => {
  test.setTimeout(90_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const password = "CorrectHorseBattery9!";
  const applicantEmail = `hr9-applicant-${suffix}@example.test`;
  const hrEmail = `hr9-hr-${suffix}@example.test`;
  const otherEmail = `hr9-other-${suffix}@example.test`;
  const submittedJobId = crypto.randomUUID();
  const draftJobId = crypto.randomUUID();
  const submittedTitle = `HR review ${suffix}`;
  const draftTitle = `HR draft ${suffix}`;
  const createdUserIds: string[] = [];

  for (const [id, title] of [[submittedJobId, submittedTitle], [draftJobId, draftTitle]]) {
    const { error } = await admin.from("jobs").insert({
      id, title, team: "Engineering", category: "engineering",
      description: "Synthetic browser test job", requirements: "Synthetic requirement",
      status: "published", published_at: new Date().toISOString(),
    });
    expect(error).toBeNull();
  }
  const applicantResult = await admin.auth.admin.createUser({ email: applicantEmail, password, email_confirm: true });
  if (applicantResult.data.user) createdUserIds.push(applicantResult.data.user.id);
  const hrResult = await admin.auth.admin.createUser({ email: hrEmail, password, email_confirm: true });
  if (hrResult.data.user) createdUserIds.push(hrResult.data.user.id);
  const otherResult = await admin.auth.admin.createUser({ email: otherEmail, password, email_confirm: true });
  if (otherResult.data.user) createdUserIds.push(otherResult.data.user.id);
  expect(applicantResult.error).toBeNull();
  expect(hrResult.error).toBeNull();
  expect(otherResult.error).toBeNull();
  const { error: promotionError } = await admin.from("profiles").update({ role: "hr" }).eq("user_id", hrResult.data.user!.id);
  expect(promotionError).toBeNull();

  async function signIn(email: string, destination: "applicant" | "hr" = "applicant") {
    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(destination === "hr" ? /\/hr\/applications$/ : /\/applications$/);
  }

  await signIn(applicantEmail);
  await expect(page.getByRole("heading", { name: "My applications" })).toBeVisible();
  await page.goto(`/jobs/${draftJobId}/apply`);
  await page.getByLabel("Cover letter").fill("Unsubmitted private draft");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]{36}(?:\?.*)?$/, { timeout: 15_000 });
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  const draftUrl = page.url();

  await page.goto(`/jobs/${submittedJobId}/apply`);
  await page.getByLabel("Cover letter").fill("Original synthetic letter");
  await page.getByLabel("Full name").fill("Synthetic Applicant");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(page.getByText("Submitted application", { exact: true })).toBeVisible();
  const applicantUrl = page.url();
  await expect(page.getByLabel("Cover letter")).toHaveCount(0);
  await expect(page.getByText(/Submitted applications are locked\. Contact HR/)).toBeVisible();
  await page.goto("/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await signIn(hrEmail, "hr");
  await expect(page.getByRole("heading", { name: "Application review" })).toBeVisible();
  await expect(page.getByText(submittedTitle)).toBeVisible();
  await expect(page.getByText(draftTitle)).toHaveCount(0);
  const deniedDraft = await page.goto(draftUrl.replace("/applications/", "/hr/applications/"));
  expect(deniedDraft?.status()).toBe(404);
  await page.goto("/hr/applications");
  await page.getByRole("link", { name: new RegExp(submittedTitle) }).click();
  await expect(page.getByRole("heading", { name: "Original cover letter" }).locator("..")).toContainText("Original synthetic letter");
  await expect(page.getByRole("heading", { name: "Current cover letter" }).locator("..")).toContainText("Original synthetic letter");

  await page.route("**/api/ai/hr-summary", async (route) => {
    await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "AI summaries are temporarily unavailable." }) });
  });
  await page.getByRole("button", { name: "Summarize" }).click();
  await expect(page.locator("p[role=alert]")).toContainText("summary is temporarily unavailable");
  await expect(page.getByText("Review status: Submitted")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Original cover letter" }).locator("..")).toContainText("Original synthetic letter");
  await page.unroute("**/api/ai/hr-summary");

  const markup = "<script>window.compromised=true</script>";
  await page.route("**/api/ai/hr-summary", async (route) => {
    expect(route.request().postDataJSON()).toEqual({ applicationId: new URL(page.url()).pathname.split("/").at(-1) });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        evidence_mentioned: [markup],
        requirements_not_addressed: ["No deployment evidence in the letter"],
        follow_up_questions: ["Which testing tools did you use?"],
      }),
    });
  });
  await page.getByRole("button", { name: "Summarize" }).click();
  await expect(page.getByText(markup, { exact: true })).toBeVisible();
  await expect(page.locator("script").filter({ hasText: "window.compromised" })).toHaveCount(0);
  await expect(page.getByText("Review status: Submitted")).toBeVisible();
  await expect(page.getByRole("heading", { name: "Original cover letter" }).locator("..")).toContainText("Original synthetic letter");

  await page.getByLabel("Add a note").fill("Private synthetic HR note");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Private synthetic HR note")).toBeVisible();
  await page.getByLabel("New status").selectOption("in_review");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Review status: In review")).toBeVisible();

  const { error: closeError } = await admin.from("jobs").update({ status: "closed" }).eq("id", submittedJobId);
  expect(closeError).toBeNull();
  await page.reload();
  await expect(page.getByText("Private synthetic HR note")).toBeVisible();
  await page.getByLabel("New status").selectOption("shortlisted");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Review status: Shortlisted")).toBeVisible();
  await page.goto("/hr/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await signIn(applicantEmail);
  await page.goto(applicantUrl);
  await expect(page.getByText("Review status: Shortlisted")).toBeVisible();
  await expect(page.getByText("Private synthetic HR note")).toHaveCount(0);
  const deniedHR = await page.goto("/hr/applications");
  expect(deniedHR?.status()).toBe(404);
  await page.goto("/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);

  await signIn(otherEmail);
  const deniedOther = await page.goto(applicantUrl);
  expect(deniedOther?.status()).toBe(404);
  await expect(page.getByText("Private synthetic HR note")).toHaveCount(0);
  // Only this test's synthetic rows are removed. Notes/events cascade from applications.
  const { error: applicationCleanupError } = await admin.from("applications")
    .delete().in("job_id", [submittedJobId, draftJobId]);
  expect(applicationCleanupError).toBeNull();
  const { error: jobCleanupError } = await admin.from("jobs")
    .delete().in("id", [submittedJobId, draftJobId]);
  expect(jobCleanupError).toBeNull();
  for (const id of createdUserIds) {
    const { error } = await admin.auth.admin.deleteUser(id);
    expect(error).toBeNull();
  }
});
