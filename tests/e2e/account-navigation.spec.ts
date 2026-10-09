import { createClient } from "@supabase/supabase-js";
import { expect, test } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!localAdminKey, "Needs a local-only TEST_SUPABASE_SERVICE_ROLE_KEY.");

test("guest, Applicant and HR navigation stays distinct and logout clears browser access", async ({ page }) => {
  test.setTimeout(90_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, { auth: { persistSession: false, autoRefreshToken: false } });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const password = "SyntheticNavigation9!";
  const users: Array<{ id: string; email: string; role: "applicant" | "hr" }> = [];
  const jobId = "00000000-0000-4000-8000-000000000101";
  let applicationId: string | undefined;
  try {
    for (const role of ["applicant", "hr"] as const) {
      const email = `navigation-${role}-${suffix}@example.test`;
      const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true });
      expect(error).toBeNull();
      users.push({ id: data.user!.id, email, role });
      if (role === "hr") expect((await admin.from("profiles").update({ role }).eq("user_id", data.user!.id)).error).toBeNull();
    }
    await page.goto("/auth/sign-up");
    await expect(page.getByText("We’ll email a verification link before you can sign in.")).toBeVisible();
    await expect(page.getByText(/Local testing:/)).toHaveCount(0);
    await expect(page.locator('a[href="http://127.0.0.1:54324"]')).toHaveCount(0);
    await page.goto("/");
    const nav = page.getByRole("navigation", { name: "Account" });
    await expect(nav.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "Create account", exact: true })).toBeVisible();
    await expect(nav.getByRole("link", { name: "My applications", exact: true })).toHaveCount(0);
    await page.goto(`/?authError=sign-out`);
    await expect(page.locator('p[role="alert"]')).toContainText("Sign out could not be completed");

    for (const user of users) {
      await page.goto("/auth/sign-in");
      await page.getByLabel("Email").fill(user.email);
      await page.getByLabel("Password", { exact: true }).fill(password);
      await page.getByRole("button", { name: "Sign in", exact: true }).click();
      await expect(page).toHaveURL(user.role === "hr" ? /\/hr\/applications$/ : /\/applications$/);
      const paths = user.role === "hr"
        ? ["/", `/jobs/${jobId}`, "/hr/jobs/new", "/hr/jobs/00000000-0000-4000-8000-000000000104", `/hr/applications/${applicationId}`]
        : ["/", `/jobs/${jobId}`, `/jobs/${jobId}/apply`];
      for (const path of paths) {
        await page.goto(path);
        await expect(nav.getByText(user.role === "hr" ? "HR" : "Applicant", { exact: true })).toBeVisible();
        await expect(nav.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
        await expect(nav.getByRole("link", { name: "Sign in", exact: true })).toHaveCount(0);
        await expect(nav.getByRole("link", { name: "My applications", exact: true })).toHaveCount(user.role === "applicant" ? 1 : 0);
        await expect(nav.getByRole("link", { name: "Application review", exact: true })).toHaveCount(user.role === "hr" ? 1 : 0);
        await expect(nav.getByRole("link", { name: "Manage jobs", exact: true })).toHaveCount(user.role === "hr" ? 1 : 0);
        if (path === `/jobs/${jobId}`) await expect(page.getByRole("link", { name: "Apply for this role" })).toHaveCount(user.role === "applicant" ? 1 : 0);
      }
      if (user.role === "applicant") {
        expect((await page.goto("/hr/jobs"))?.status()).toBe(404);
        await page.goto(`/jobs/${jobId}/apply`);
        await page.getByLabel("Full name").fill("Synthetic Navigation Applicant");
        await page.getByLabel("Cover letter").fill("Synthetic navigation test letter.");
        await page.getByRole("button", { name: "Save draft" }).click();
        await expect(page).toHaveURL(/\/applications\/[0-9a-f-]{36}$/);
        applicationId = page.url().match(/\/applications\/([0-9a-f-]{36})/)?.[1];
        expect(applicationId).toBeTruthy();
        await expect(nav.getByText("Applicant", { exact: true })).toBeVisible();
        await expect(nav.getByRole("button", { name: "Sign out", exact: true })).toBeVisible();
        await page.getByRole("button", { name: "Submit application" }).click();
        await expect(page.getByText("Submitted application", { exact: true })).toBeVisible();
      }
      await page.goto(`/jobs/${jobId}`);
      await nav.getByRole("button", { name: "Sign out", exact: true }).click();
      await expect(page).toHaveURL(/localhost:3000\/$/);
      await expect(nav.getByRole("link", { name: "Sign in", exact: true })).toBeVisible();
      await expect(nav.getByRole("button", { name: "Sign out", exact: true })).toHaveCount(0);
      await page.goto(user.role === "hr" ? "/hr/jobs" : "/applications");
      await expect(page).toHaveURL(/\/auth\/sign-in$/);
    }
  } finally {
    for (const user of users) expect((await admin.auth.admin.deleteUser(user.id)).error).toBeNull();
  }
});
