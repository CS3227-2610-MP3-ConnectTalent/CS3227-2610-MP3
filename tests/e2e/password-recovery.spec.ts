import { createClient } from "@supabase/supabase-js";
import { expect, test, type APIRequestContext } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!localAdminKey, "Local password recovery browser test needs the local Supabase admin key.");

async function waitForRecoveryLink(request: APIRequestContext, recipient: string): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const listResponse = await request.get("http://127.0.0.1:54324/api/v1/messages?limit=50");
    expect(listResponse.ok()).toBe(true);
    const list = await listResponse.json() as { messages: Array<{ ID: string; To: Array<{ Address: string }> }> };
    const message = list.messages.find((item) => item.To.some((address) => address.Address === recipient));
    if (message) {
      const textResponse = await request.get(`http://127.0.0.1:54324/view/${message.ID}.txt`);
      expect(textResponse.ok()).toBe(true);
      const text = await textResponse.text();
      const url = text.match(/https?:\/\/[^\s<>"']+/g)?.find((value) => value.includes("/auth/v1/verify"));
      if (url) return url.replaceAll("&amp;", "&");
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("No recovery email arrived in local Mailpit.");
}

test("Applicant and HR recover passwords without changing roles", async ({ page, request }) => {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const oldPassword = "SyntheticOldPassword9!";
  const newPassword = "SyntheticNewPassword9!";
  const createdIds: string[] = [];

  try {
    for (const role of ["applicant", "hr"] as const) {
      const email = `recovery-${role}-${suffix}@example.test`;
      const { data, error } = await admin.auth.admin.createUser({ email, password: oldPassword, email_confirm: true });
      expect(error).toBeNull();
      const userId = data.user!.id;
      createdIds.push(userId);
      if (role === "hr") {
        const { error: promotionError } = await admin.from("profiles").update({ role: "hr" }).eq("user_id", userId);
        expect(promotionError).toBeNull();
      }

      await page.goto("/auth/sign-in");
      await page.getByRole("link", { name: "Forgot password?" }).click();
      await page.waitForLoadState("networkidle");
      await page.getByLabel("Email").fill(email);
      await expect(page.getByLabel("Email")).toHaveValue(email);
      await page.getByRole("button", { name: "Send reset link" }).click();
      await expect(page.getByRole("heading", { name: "Reset request received" })).toBeVisible();

      const recoveryUrl = await waitForRecoveryLink(request, email);
      await page.goto(recoveryUrl);
      await expect(page).toHaveURL(/\/auth\/reset-password$/);
      await page.waitForLoadState("networkidle");
      await page.getByLabel("New password", { exact: true }).fill(newPassword);
      await page.getByLabel("Confirm new password").fill(newPassword);
      await page.getByRole("button", { name: "Update password" }).click();
      await expect(page).toHaveURL(/\/auth\/sign-in\?reset=success$/);

      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(oldPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(/\/auth\/sign-in\?error=credentials$/);

      await page.getByLabel("Email").fill(email);
      await page.getByLabel("Password", { exact: true }).fill(newPassword);
      await page.getByRole("button", { name: "Sign in" }).click();
      await expect(page).toHaveURL(role === "hr" ? /\/hr\/applications$/ : /\/applications$/);

      const { data: profile, error: profileError } = await admin.from("profiles").select("role").eq("user_id", userId).single();
      expect(profileError).toBeNull();
      expect(profile?.role).toBe(role);
      await page.getByRole("button", { name: "Sign out" }).click();
    }
  } finally {
    for (const userId of createdIds) await admin.auth.admin.deleteUser(userId);
  }
});

test("invalid recovery link cannot open the password form", async ({ page }) => {
  await page.goto("/auth/callback?flow=recovery&code=invalid-code");
  await expect(page).toHaveURL(/\/auth\/forgot-password\?error=link$/);
  await expect(page.getByText("That reset link is invalid or expired.", { exact: false })).toBeVisible();
  await page.goto("/auth/reset-password");
  await expect(page).toHaveURL(/\/auth\/forgot-password\?error=link$/);
});
