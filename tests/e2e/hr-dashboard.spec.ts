import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import {
  createReviewUsers,
  type ReviewFixture,
} from "./support/review-fixtures";
import type { AdminClient } from "./support/admin-client";
import {
  signIn,
  submitApplication,
  withdrawApplication,
} from "./support/hr-dashboard-journey";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !localAdminKey,
  "Local HR dashboard browser test needs TEST_SUPABASE_SERVICE_ROLE_KEY from supabase status.",
);

type DashboardFixture = ReviewFixture & {
  withdrawnJobId: string;
  closedJobId: string;
  sharedTitle: string;
};

test("HR sees private-safe recruitment counts and non-HR users cannot open the dashboard", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = createDashboardFixture();
  const jobIds = [
    fixture.submittedJobId,
    fixture.withdrawnJobId,
    fixture.draftJobId,
    fixture.closedJobId,
  ];
  const contexts: BrowserContext[] = [];

  try {
    await runDashboardJourney({
      admin,
      serviceRoleKey: localAdminKey!,
      guestPage: page,
      browser,
      baseURL,
      contexts,
      fixture,
    });
  } finally {
    for (const context of contexts) await context.close();
    await cleanupDashboardFixture(admin, fixture, jobIds);
  }
});

async function runDashboardJourney({
  admin,
  serviceRoleKey,
  guestPage,
  browser,
  baseURL,
  contexts,
  fixture,
}: {
  admin: AdminClient;
  serviceRoleKey: string;
  guestPage: Page;
  browser: Browser;
  baseURL: string | undefined;
  contexts: BrowserContext[];
  fixture: DashboardFixture;
}) {
  await createReviewUsers(admin, serviceRoleKey, fixture);
  await createDashboardJobs(admin, fixture);
  await verifyGuestDenial(guestPage);

  const applicantPage = await openAccountPage(browser, baseURL, contexts);
  await signIn(
    applicantPage,
    fixture.applicantEmail,
    fixture.password,
    "applicant",
  );
  await submitApplication(applicantPage, fixture.submittedJobId);

  const otherApplicantPage = await openAccountPage(browser, baseURL, contexts);
  await signIn(
    otherApplicantPage,
    fixture.otherEmail,
    fixture.password,
    "applicant",
  );
  await submitApplication(otherApplicantPage, fixture.withdrawnJobId);
  await withdrawApplication(otherApplicantPage);

  const hrPage = await openAccountPage(browser, baseURL, contexts);
  await signIn(hrPage, fixture.hrEmail, fixture.password, "hr");
  await verifyHRDashboard(hrPage, fixture);
  await verifyApplicantDenial(applicantPage);
}
async function openAccountPage(
  browser: Browser,
  baseURL: string | undefined,
  contexts: BrowserContext[],
) {
  const context = await browser.newContext({ baseURL });
  contexts.push(context);
  return context.newPage();
}

async function verifyGuestDenial(page: Page) {
  await page.goto("/hr");
  await expect(page).toHaveURL(/\/auth\/sign-in/);
  await expect(page.getByRole("heading", { name: "HR dashboard" })).toHaveCount(
    0,
  );
}

async function verifyHRDashboard(page: Page, fixture: DashboardFixture) {
  await page.goto("/hr");
  await expect(
    page.getByRole("heading", { name: "HR dashboard" }),
  ).toBeVisible();
  await verifyDashboardLinks(page);
  await verifyPerJobCounts(page, fixture);
  await verifyPrivateDataAbsent(page, fixture);
}

async function verifyDashboardLinks(page: Page) {
  const actions = page.getByRole("navigation", {
    name: "HR dashboard actions",
  });
  await expect(
    actions.getByRole("link", { name: "Manage jobs" }),
  ).toHaveAttribute("href", "/hr/jobs");
  await expect(
    actions.getByRole("link", { name: "Application review" }),
  ).toHaveAttribute("href", "/hr/applications");
}

async function verifyPerJobCounts(page: Page, fixture: DashboardFixture) {
  const activeRow = page.locator(
    `tr:has(a[href="/hr/jobs/${fixture.submittedJobId}"])`,
  );
  const withdrawnRow = page.locator(
    `tr:has(a[href="/hr/jobs/${fixture.withdrawnJobId}"])`,
  );
  const draftRow = page.locator(
    `tr:has(a[href="/hr/jobs/${fixture.draftJobId}"])`,
  );
  const closedRow = page.locator(
    `tr:has(a[href="/hr/jobs/${fixture.closedJobId}"])`,
  );

  await expect(activeRow).toContainText(fixture.sharedTitle);
  await expect(activeRow).toContainText("Published");
  await expect(activeRow.locator("td").nth(1)).toHaveText("1");
  await expect(activeRow.locator("td").nth(2)).toHaveText("0");
  await expect(withdrawnRow).toContainText(fixture.sharedTitle);
  await expect(withdrawnRow).toContainText("Published");
  await expect(withdrawnRow.locator("td").nth(1)).toHaveText("0");
  await expect(withdrawnRow.locator("td").nth(2)).toHaveText("1");
  await expect(draftRow).toContainText("Draft");
  await expect(draftRow.locator("td").nth(1)).toHaveText("0");
  await expect(closedRow).toContainText("Closed");
  await expect(closedRow.locator("td").nth(1)).toHaveText("0");
  await expect(
    activeRow.getByRole("link", { name: fixture.sharedTitle }),
  ).toHaveAttribute("href", `/hr/jobs/${fixture.submittedJobId}`);
  await expect(
    withdrawnRow.getByRole("link", { name: fixture.sharedTitle }),
  ).toHaveAttribute("href", `/hr/jobs/${fixture.withdrawnJobId}`);

  expect(await metricValue(page, "Submitted")).toBeGreaterThanOrEqual(1);
  expect(await metricValue(page, "Withdrawn")).toBeGreaterThanOrEqual(1);
}

async function metricValue(page: Page, label: string) {
  return Number(
    await page
      .getByText(label, { exact: true })
      .locator("..")
      .locator("dd")
      .textContent(),
  );
}

async function verifyPrivateDataAbsent(page: Page, fixture: DashboardFixture) {
  await expect(page.getByText(/Private dashboard applicant/i)).toHaveCount(0);
  await expect(
    page.getByText("Private dashboard cover letter", { exact: false }),
  ).toHaveCount(0);
  await expect(
    page.getByText(fixture.applicantEmail, { exact: true }),
  ).toHaveCount(0);
  await expect(page.getByText(fixture.otherEmail, { exact: true })).toHaveCount(
    0,
  );
}

async function verifyApplicantDenial(page: Page) {
  expect((await page.goto("/hr"))?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "HR dashboard" })).toHaveCount(
    0,
  );
}

function createDashboardFixture(): DashboardFixture {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const sharedTitle = `Dashboard duplicate ${suffix}`;
  return {
    password: "CorrectHorseBattery9!",
    applicantEmail: `dashboard-applicant-${suffix}@example.test`,
    hrEmail: `dashboard-hr-${suffix}@example.test`,
    otherEmail: `dashboard-other-${suffix}@example.test`,
    submittedJobId: crypto.randomUUID(),
    withdrawnJobId: crypto.randomUUID(),
    draftJobId: crypto.randomUUID(),
    closedJobId: crypto.randomUUID(),
    submittedTitle: sharedTitle,
    draftTitle: `Dashboard draft ${suffix}`,
    sharedTitle,
    userIds: [],
  };
}

async function createDashboardJobs(
  admin: AdminClient,
  fixture: DashboardFixture,
) {
  const jobs = [
    {
      id: fixture.submittedJobId,
      title: fixture.sharedTitle,
      status: "published",
    },
    {
      id: fixture.withdrawnJobId,
      title: fixture.sharedTitle,
      status: "published",
    },
    { id: fixture.draftJobId, title: fixture.draftTitle, status: "draft" },
    {
      id: fixture.closedJobId,
      title: `Dashboard closed ${fixture.draftTitle}`,
      status: "closed",
    },
  ];
  for (const job of jobs) {
    const { error } = await admin.from("jobs").insert({
      ...job,
      team: "Synthetic dashboard team",
      category: "engineering",
      description: "Synthetic dashboard test job",
      requirements: "Synthetic requirement",
      published_at: job.status === "draft" ? null : new Date().toISOString(),
    });
    expect(error).toBeNull();
  }
}

async function cleanupDashboardFixture(
  admin: AdminClient,
  fixture: DashboardFixture,
  jobIds: string[],
) {
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
