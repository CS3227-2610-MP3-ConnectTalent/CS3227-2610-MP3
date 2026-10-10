import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";
import { saveCompleteApplicantProfile } from "./support/profile-fixtures";
const adminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !adminKey,
  "Local synthetic contact-flow test requires the local admin key.",
);
test("Applicant contact drafts, validation, freeze and submitted-only HR review", async ({
  page,
  browser,
}) => {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", adminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emails = [
    `form39-owner-${suffix}@example.test`,
    `form39-hr-${suffix}@example.test`,
    `form39-other-${suffix}@example.test`,
  ];
  const password = "CorrectHorseBattery9!";
  const userIds: string[] = [];
  const jobIds = [crypto.randomUUID(), crypto.randomUUID()];
  async function login(target: typeof page, email: string) {
    await target.goto("/auth/sign-in");
    await target.getByLabel("Email").fill(email);
    await target.getByLabel("Password", { exact: true }).fill(password);
    await target.getByRole("button", { name: "Sign in" }).click();
    await expect(target).toHaveURL(
      email === emails[1] ? /\/hr\/applications$/ : /\/applications$/,
    );
  }
  try {
    for (const email of emails) {
      const { data, error } = await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      });
      expect(error).toBeNull();
      userIds.push(data.user!.id);
    }
    await saveCompleteApplicantProfile(
      adminKey!,
      emails[0],
      password,
      "Synthetic Contact Applicant",
    );
    await saveCompleteApplicantProfile(
      adminKey!,
      emails[2],
      password,
      "Synthetic Other Applicant",
    );
    expect(
      (
        await admin
          .from("profiles")
          .update({ role: "hr" })
          .eq("user_id", userIds[1])
      ).error,
    ).toBeNull();
    for (const id of jobIds)
      expect(
        (
          await admin.from("jobs").insert({
            id,
            title: `Contact role ${id}`,
            team: "Platform",
            category: "engineering",
            description: "Synthetic",
            requirements: "Synthetic",
            status: "published",
            published_at: new Date().toISOString(),
          })
        ).error,
      ).toBeNull();
    await login(page, emails[0]);
    await page.goto(`/jobs/${jobIds[0]}/apply`);
    await expect(page.getByLabel("Verified email")).toHaveValue(emails[0]);
    await expect(page.getByLabel("Verified email")).toHaveAttribute(
      "readonly",
      "",
    );
    await page.getByLabel("Phone (optional)").fill("+65 5555 0101");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel("Full name")).toHaveValue(
      "Synthetic Contact Applicant",
    );
    await expect(page.getByLabel("Phone (optional)")).toHaveValue(
      "+65 5555 0101",
    );
    await page.getByLabel("Full name").fill("Synthetic Applicant");
    await page
      .getByLabel("Portfolio URL (optional)")
      .fill("javascript:alert(1)");
    await page
      .getByLabel("Cover letter", { exact: true })
      .fill("Unsaved synthetic letter");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.locator("p[role=alert]")).toContainText(
      "highlighted fields",
    );
    await expect(page.getByLabel("Full name")).toHaveValue(
      "Synthetic Applicant",
    );
    await expect(page.getByLabel("Phone (optional)")).toHaveValue(
      "+65 5555 0101",
    );
    await expect(page.getByLabel("Portfolio URL (optional)")).toHaveValue(
      "javascript:alert(1)",
    );
    await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
      "Unsaved synthetic letter",
    );
    await page
      .getByLabel("Portfolio URL (optional)")
      .fill("https://example.test/portfolio");
    await page.route("**/api/ai/applicant-draft", async (route) => {
      expect(route.request().postDataJSON()).toEqual({
        jobId: jobIds[0],
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
    await expect(page.getByLabel("Full name")).toHaveValue(
      "Synthetic Applicant",
    );
    await page.unroute("**/api/ai/applicant-draft");
    // The Saved draft heading already exists; wait for this write before reloading.
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
    // Server-side validation also retains all input with JavaScript disabled.
    const noJs = await browser.newContext({
      javaScriptEnabled: false,
      baseURL: "http://localhost:3000",
    });
    try {
      const noJsPage = await noJs.newPage();
      await test.step(
        "Sign in without JavaScript",
        async () => {
          await login(noJsPage, emails[0]);
        },
        { timeout: 25_000 },
      );
      await noJsPage.goto(`/jobs/${jobIds[0]}/apply`, { timeout: 20_000 });
      await noJsPage.getByLabel("Full name").fill("No JS Applicant");
      await noJsPage
        .getByLabel("Portfolio URL (optional)")
        .fill("javascript:alert(1)");
      await noJsPage
        .getByLabel("Cover letter", { exact: true })
        .fill("No JS letter");
      await test.step(
        "Validate without JavaScript",
        async () => {
          await noJsPage
            .getByRole("button", { name: "Save draft", exact: true })
            .click({ timeout: 20_000 });
        },
        { timeout: 25_000 },
      );
      await expect(noJsPage.locator("p[role=alert]")).toContainText(
        "highlighted fields",
      );
      await expect(noJsPage.getByLabel("Full name")).toHaveValue(
        "No JS Applicant",
      );
      await expect(
        noJsPage.getByLabel("Cover letter", { exact: true }),
      ).toHaveValue("No JS letter");
    } finally {
      await noJs.close();
    }
    await page.getByRole("button", { name: "Submit application" }).click();
    await expect(
      page.getByText("Submitted application", { exact: true }),
    ).toBeVisible();
    const submittedUrl = page.url();
    const contact = page.getByRole("region", { name: "Applicant details" });
    await expect(contact).toContainText("Synthetic Applicant");
    await expect(contact).toContainText(emails[0]);
    await expect(contact.getByRole("link")).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(page.getByLabel("Full name")).toHaveCount(0);
    await page.goto(`/jobs/${jobIds[1]}/apply`);
    await page.getByLabel("Full name").fill("Private Name");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText("Saved draft", { exact: true })).toBeVisible();
    const privateUrl = page.url();
    await page.goto("/applications");
    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, emails[1]);
    await page.goto(
      submittedUrl.replace("/applications/", "/hr/applications/"),
    );
    await expect(
      page.getByRole("region", { name: "Applicant details" }),
    ).toContainText(emails[0]);
    expect(
      (
        await page.goto(
          privateUrl.replace("/applications/", "/hr/applications/"),
        )
      )?.status(),
    ).toBe(404);
    await expect(page.getByText("Private Name")).toHaveCount(0);
    await page.goto("/hr/applications");
    await page.getByRole("button", { name: "Sign out" }).click();
    await login(page, emails[2]);
    expect((await page.goto(submittedUrl))?.status()).toBe(404);
    await expect(page.getByText(emails[0])).toHaveCount(0);
  } finally {
    // Remove applications before Auth fixtures so author foreign keys cannot retain synthetic rows.
    await admin.from("applications").delete().in("job_id", jobIds);
    await admin.from("jobs").delete().in("id", jobIds);
    for (const id of userIds)
      expect((await admin.auth.admin.deleteUser(id)).error).toBeNull();
  }
});
