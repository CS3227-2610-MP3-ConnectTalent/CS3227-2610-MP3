import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !localAdminKey,
  "Local HR browser test needs TEST_SUPABASE_SERVICE_ROLE_KEY from supabase status.",
);

import type { AdminClient } from "./support/admin-client";
type ReviewFixture = {
  password: string;
  applicantEmail: string;
  hrEmail: string;
  otherEmail: string;
  submittedJobId: string;
  draftJobId: string;
  submittedTitle: string;
  draftTitle: string;
  userIds: string[];
};

test("HR reviews only submitted applications and Applicant sees status without private notes", async ({
  page,
}) => runHRApplicationReview(page));

async function runHRApplicationReview(page: Page) {
  test.setTimeout(90_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = createReviewFixture();
  try {
    await setupReviewFixture(admin, fixture);
    const urls = await createApplicantApplications(page, fixture);
    await reviewSubmittedApplication(page, fixture, urls.draftUrl);
    await closeJobAndUpdateStatus(page, admin, fixture.submittedJobId);
    await verifyApplicantStatusPrivacy(page, fixture, urls.submittedUrl);
  } finally {
    const jobIds = [fixture.submittedJobId, fixture.draftJobId];
    const { error: applicationError } = await admin
      .from("applications")
      .delete()
      .in("job_id", jobIds);
    expect(applicationError).toBeNull();
    const { error: jobError } = await admin
      .from("jobs")
      .delete()
      .in("id", jobIds);
    expect(jobError).toBeNull();
    for (const id of fixture.userIds) {
      const { error } = await admin.auth.admin.deleteUser(id);
      expect(error).toBeNull();
    }
  }
}

function createReviewFixture(): ReviewFixture {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return {
    password: "CorrectHorseBattery9!",
    applicantEmail: `hr9-applicant-${suffix}@example.test`,
    hrEmail: `hr9-hr-${suffix}@example.test`,
    otherEmail: `hr9-other-${suffix}@example.test`,
    submittedJobId: crypto.randomUUID(),
    draftJobId: crypto.randomUUID(),
    submittedTitle: `HR review ${suffix}`,
    draftTitle: `HR draft ${suffix}`,
    userIds: [],
  };
}

async function setupReviewFixture(admin: AdminClient, fixture: ReviewFixture) {
  await insertReviewJobs(admin, fixture);
  await createReviewUsers(admin, fixture);
}

async function insertReviewJobs(admin: AdminClient, fixture: ReviewFixture) {
  for (const [id, title] of [
    [fixture.submittedJobId, fixture.submittedTitle],
    [fixture.draftJobId, fixture.draftTitle],
  ]) {
    const { error } = await admin.from("jobs").insert({
      id,
      title,
      team: "Engineering",
      category: "engineering",
      description: "Synthetic browser test job",
      requirements: "Synthetic requirement",
      status: "published",
      published_at: new Date().toISOString(),
    });
    expect(error).toBeNull();
  }
}

async function createReviewUsers(admin: AdminClient, fixture: ReviewFixture) {
  const emails = [fixture.applicantEmail, fixture.hrEmail, fixture.otherEmail];
  for (const email of emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    if (data.user) fixture.userIds.push(data.user.id);
  }
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", fixture.userIds[1]);
  expect(error).toBeNull();
}

async function signIn(
  page: Page,
  email: string,
  fixture: ReviewFixture,
  role: "applicant" | "hr",
) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function createApplicantApplications(page: Page, fixture: ReviewFixture) {
  await signIn(page, fixture.applicantEmail, fixture, "applicant");
  const draftUrl = await createPrivateDraft(page, fixture.draftJobId);
  const submittedUrl = await createSubmittedApplication(
    page,
    fixture.submittedJobId,
  );
  await page.goto("/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
  return { draftUrl, submittedUrl };
}

async function createPrivateDraft(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}/apply`);
  await page.getByLabel("Cover letter").fill("Unsubmitted private draft");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]{36}(?:\?.*)?$/, {
    timeout: 15_000,
  });
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  return page.url();
}

async function createSubmittedApplication(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}/apply`);
  await page.getByLabel("Cover letter").fill("Original synthetic letter");
  await page.getByLabel("Full name").fill("Synthetic Applicant");
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Cover letter")).toHaveCount(0);
  await expect(
    page.getByText(/Submitted applications are locked\. Contact HR/),
  ).toBeVisible();
  return page.url();
}

async function reviewSubmittedApplication(
  page: Page,
  fixture: ReviewFixture,
  draftUrl: string,
) {
  await signIn(page, fixture.hrEmail, fixture, "hr");
  await expect(
    page.getByRole("heading", { name: "Application review" }),
  ).toBeVisible();
  await expect(page.getByText(fixture.submittedTitle)).toBeVisible();
  await expect(page.getByText(fixture.draftTitle)).toHaveCount(0);
  expect(
    (
      await page.goto(draftUrl.replace("/applications/", "/hr/applications/"))
    )?.status(),
  ).toBe(404);
  await openSubmittedReview(page, fixture.submittedTitle);
  await checkUnavailableSummary(page);
  await checkSafeSummaryRendering(page);
  await addPrivateNoteAndChangeStatus(page);
}

async function openSubmittedReview(page: Page, title: string) {
  await page.goto("/hr/applications");
  await page.getByRole("link", { name: new RegExp(title) }).click();
  await expect(
    page.getByRole("heading", { name: "Original cover letter" }).locator(".."),
  ).toContainText("Original synthetic letter");
  await expect(
    page.getByRole("heading", { name: "Current cover letter" }).locator(".."),
  ).toContainText("Original synthetic letter");
}

async function checkUnavailableSummary(page: Page) {
  await page.route("**/api/ai/hr-summary", async (route) => {
    await route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({
        error: "AI summaries are temporarily unavailable.",
      }),
    });
  });
  await page.getByRole("button", { name: "Summarize" }).click();
  await expect(page.locator("p[role=alert]")).toContainText(
    "summary is temporarily unavailable",
  );
  await expect(page.getByText("Review status: Submitted")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Original cover letter" }).locator(".."),
  ).toContainText("Original synthetic letter");
  await page.unroute("**/api/ai/hr-summary");
}

async function checkSafeSummaryRendering(page: Page) {
  const markup = "<script>window.compromised=true</script>";
  await page.route("**/api/ai/hr-summary", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      applicationId: new URL(page.url()).pathname.split("/").at(-1),
    });
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
  await expect(
    page.locator("script").filter({ hasText: "window.compromised" }),
  ).toHaveCount(0);
  await expect(page.getByText("Review status: Submitted")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Original cover letter" }).locator(".."),
  ).toContainText("Original synthetic letter");
  await page.unroute("**/api/ai/hr-summary");
}

async function addPrivateNoteAndChangeStatus(page: Page) {
  await page.getByLabel("Add a note").fill("Private synthetic HR note");
  await page.getByRole("button", { name: "Add note" }).click();
  await expect(page.getByText("Private synthetic HR note")).toBeVisible();
  await page.getByLabel("New status").selectOption("in_review");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Review status: In review")).toBeVisible();
}

async function closeJobAndUpdateStatus(
  page: Page,
  admin: AdminClient,
  jobId: string,
) {
  const { error } = await admin
    .from("jobs")
    .update({ status: "closed" })
    .eq("id", jobId);
  expect(error).toBeNull();
  await page.reload();
  await expect(page.getByText("Private synthetic HR note")).toBeVisible();
  await page.getByLabel("New status").selectOption("shortlisted");
  await page.getByRole("button", { name: "Update status" }).click();
  await expect(page.getByText("Review status: Shortlisted")).toBeVisible();
  await page.goto("/hr/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
}

async function verifyApplicantStatusPrivacy(
  page: Page,
  fixture: ReviewFixture,
  submittedUrl: string,
) {
  await signIn(page, fixture.applicantEmail, fixture, "applicant");
  await page.goto(submittedUrl);
  await expect(page.getByText("Review status: Shortlisted")).toBeVisible();
  await expect(page.getByText("Private synthetic HR note")).toHaveCount(0);
  expect((await page.goto("/hr/applications"))?.status()).toBe(404);
  await page.goto("/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/$/);
  await signIn(page, fixture.otherEmail, fixture, "applicant");
  expect((await page.goto(submittedUrl))?.status()).toBe(404);
  await expect(page.getByText("Private synthetic HR note")).toHaveCount(0);
}
