import { createClient } from "@supabase/supabase-js";
import { expect, test, type Browser, type Page } from "@playwright/test";

const adminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !adminKey,
  "Local synthetic contact-flow test requires the local admin key.",
);

import type { AdminClient } from "./support/admin-client";
type ContactFixture = {
  emails: [string, string, string];
  password: string;
  jobIds: [string, string];
};

test("Applicant contact drafts, validation, freeze and submitted-only HR review", async ({
  page,
  browser,
}) => runContactFlowScenario(page, browser));

async function runContactFlowScenario(page: Page, browser: Browser) {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", adminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const fixture: ContactFixture = {
    emails: [
      `form39-owner-${suffix}@example.test`,
      `form39-hr-${suffix}@example.test`,
      `form39-other-${suffix}@example.test`,
    ],
    password: "CorrectHorseBattery9!",
    jobIds: [crypto.randomUUID(), crypto.randomUUID()],
  };
  const userIds: string[] = [];
  try {
    await setupContactFixture(admin, fixture, userIds);
    await signIn(page, fixture.emails[0], fixture.password, "applicant");
    await exerciseContactDraft(page, fixture.jobIds[0], fixture.emails[0]);
    await checkNoJavaScriptValidation(browser, fixture, fixture.jobIds[0]);
    const submittedUrl = await submitContactApplication(
      page,
      fixture.emails[0],
    );
    const privateUrl = await savePrivateDraft(page, fixture.jobIds[1]);
    await verifyHRContactAccess(page, fixture, submittedUrl, privateUrl);
    await verifyOtherApplicantCannotRead(page, fixture, submittedUrl);
  } finally {
    expect(
      (await admin.from("applications").delete().in("job_id", fixture.jobIds))
        .error,
    ).toBeNull();
    expect(
      (await admin.from("jobs").delete().in("id", fixture.jobIds)).error,
    ).toBeNull();
    for (const id of userIds) {
      const { error } = await admin.auth.admin.deleteUser(id);
      expect(error).toBeNull();
    }
  }
}

async function setupContactFixture(
  admin: AdminClient,
  fixture: ContactFixture,
  userIds: string[],
) {
  await createContactUsers(admin, fixture, userIds);
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", userIds[1]);
  expect(error).toBeNull();
  await createContactJobs(admin, fixture.jobIds);
}

async function createContactUsers(
  admin: AdminClient,
  fixture: ContactFixture,
  userIds: string[],
) {
  for (const email of fixture.emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    userIds.push(data.user!.id);
  }
}

async function createContactJobs(admin: AdminClient, jobIds: string[]) {
  for (const id of jobIds) {
    const { error } = await admin.from("jobs").insert({
      id,
      title: `Contact role ${id}`,
      team: "Platform",
      category: "engineering",
      description: "Synthetic",
      requirements: "Synthetic",
      status: "published",
      published_at: new Date().toISOString(),
    });
    expect(error).toBeNull();
  }
}

async function signIn(
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
    role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function exerciseContactDraft(page: Page, jobId: string, email: string) {
  await page.goto(`/jobs/${jobId}/apply`);
  await expect(page.getByLabel("Verified email")).toHaveValue(email);
  await expect(page.getByLabel("Verified email")).toHaveAttribute(
    "readonly",
    "",
  );
  await page.getByLabel("Phone (optional)").fill("+65 5555 0101");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Full name")).toHaveValue("");
  await expect(page.getByLabel("Phone (optional)")).toHaveValue(
    "+65 5555 0101",
  );
  await rejectInvalidPortfolio(page);
  await generateApplicantDraft(page, jobId);
  await saveValidatedDraft(page);
}

async function rejectInvalidPortfolio(page: Page) {
  await page.getByLabel("Full name").fill("Synthetic Applicant");
  await page.getByLabel("Portfolio URL (optional)").fill("javascript:alert(1)");
  await page
    .getByLabel("Cover letter", { exact: true })
    .fill("Unsaved synthetic letter");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.locator("p[role=alert]")).toContainText(
    "highlighted fields",
  );
  await expect(page.getByLabel("Full name")).toHaveValue("Synthetic Applicant");
  await expect(page.getByLabel("Phone (optional)")).toHaveValue(
    "+65 5555 0101",
  );
  await expect(page.getByLabel("Portfolio URL (optional)")).toHaveValue(
    "javascript:alert(1)",
  );
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "Unsaved synthetic letter",
  );
}

async function generateApplicantDraft(page: Page, jobId: string) {
  await page
    .getByLabel("Portfolio URL (optional)")
    .fill("https://example.test/portfolio");
  await page.route("**/api/ai/applicant-draft", async (route) => {
    expect(route.request().postDataJSON()).toEqual({
      jobId,
      notes: "Synthetic skill evidence",
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ draft: "AI synthetic letter" }),
    });
  });
  await page.getByLabel("Experience notes").fill("Synthetic skill evidence");
  await page.getByRole("button", { name: "Generate draft" }).click();
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "AI synthetic letter",
  );
  await expect(page.getByLabel("Full name")).toHaveValue("Synthetic Applicant");
  await page.unroute("**/api/ai/applicant-draft");
}

async function saveValidatedDraft(page: Page) {
  const savedResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      Boolean(response.request().headers()["next-action"]),
  );
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  expect(await (await savedResponse).finished()).toBeNull();
  await expect(
    page.getByRole("button", { name: "Save draft", exact: true }),
  ).toBeEnabled();
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel("Portfolio URL (optional)")).toHaveValue(
    "https://example.test/portfolio",
  );
}

async function checkNoJavaScriptValidation(
  browser: Browser,
  fixture: ContactFixture,
  jobId: string,
) {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://localhost:3000",
  });
  try {
    const page = await context.newPage();
    await signIn(page, fixture.emails[0], fixture.password, "applicant");
    await page.goto(`/jobs/${jobId}/apply`);
    await page.getByLabel("Full name").fill("No JS Applicant");
    await page
      .getByLabel("Portfolio URL (optional)")
      .fill("javascript:alert(1)");
    await page.getByLabel("Cover letter", { exact: true }).fill("No JS letter");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toContainText(
      "highlighted fields",
    );
    await expect(page.getByLabel("Full name")).toHaveValue("No JS Applicant");
    await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
      "No JS letter",
    );
  } finally {
    await context.close();
  }
}

async function submitContactApplication(page: Page, email: string) {
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  const contact = page.getByRole("region", { name: "Applicant details" });
  await expect(contact).toContainText("Synthetic Applicant");
  await expect(contact).toContainText(email);
  await expect(contact.getByRole("link")).toHaveAttribute(
    "rel",
    "noopener noreferrer",
  );
  await expect(page.getByLabel("Full name")).toHaveCount(0);
  return page.url();
}

async function savePrivateDraft(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}/apply`);
  await page.getByLabel("Full name").fill("Private Name");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
  return page.url();
}

async function verifyHRContactAccess(
  page: Page,
  fixture: ContactFixture,
  submittedUrl: string,
  privateUrl: string,
) {
  await page.goto("/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, fixture.emails[1], fixture.password, "hr");
  await page.goto(submittedUrl.replace("/applications/", "/hr/applications/"));
  await expect(
    page.getByRole("region", { name: "Applicant details" }),
  ).toContainText(fixture.emails[0]);
  await expect(
    page.getByText("Synthetic Applicant", { exact: true }),
  ).toBeVisible();
  expect(
    (
      await page.goto(privateUrl.replace("/applications/", "/hr/applications/"))
    )?.status(),
  ).toBe(404);
  await expect(page.getByText("Private Name")).toHaveCount(0);
}

async function verifyOtherApplicantCannotRead(
  page: Page,
  fixture: ContactFixture,
  submittedUrl: string,
) {
  await page.goto("/hr/applications");
  await page.getByRole("button", { name: "Sign out" }).click();
  await signIn(page, fixture.emails[2], fixture.password, "applicant");
  expect((await page.goto(submittedUrl))?.status()).toBe(404);
  await expect(page.getByText(fixture.emails[0])).toHaveCount(0);
}
