import { createClient } from "@supabase/supabase-js";
import {
  expect,
  test,
  type APIRequestContext,
  type Page,
} from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !localAdminKey,
  "Local password recovery browser test needs the local Supabase admin key.",
);

type RecoveryRole = "applicant" | "hr";
import type { AdminClient } from "./support/admin-client";

async function waitForRecoveryLink(
  request: APIRequestContext,
  recipient: string,
): Promise<string> {
  for (let attempt = 0; attempt < 30; attempt += 1) {
    const list = await listMessages(request);
    const message = list.messages.find((item) =>
      item.To.some((address) => address.Address === recipient),
    );
    if (message) {
      const url = await readVerificationUrl(request, message.ID);
      if (url) return url;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("No recovery email arrived in local Mailpit.");
}

async function listMessages(request: APIRequestContext) {
  const response = await request.get(
    "http://127.0.0.1:54324/api/v1/messages?limit=50",
  );
  expect(response.ok()).toBe(true);
  return (await response.json()) as {
    messages: Array<{ ID: string; To: Array<{ Address: string }> }>;
  };
}

async function readVerificationUrl(
  request: APIRequestContext,
  messageId: string,
) {
  const response = await request.get(
    `http://127.0.0.1:54324/view/${messageId}.txt`,
  );
  expect(response.ok()).toBe(true);
  const text = await response.text();
  const url = text
    .match(/https?:\/\/[^\s<>"']+/g)
    ?.find((value) => value.includes("/auth/v1/verify"));
  return url?.replaceAll("&amp;", "&");
}

test("Applicant and HR recover passwords without changing roles", async ({
  page,
  request,
}) => runRecoveryScenarios(page, request));

async function runRecoveryScenarios(page: Page, request: APIRequestContext) {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const oldPassword = "SyntheticOldPassword9!";
  const newPassword = "SyntheticNewPassword9!";
  const createdIds: string[] = [];
  try {
    for (const role of ["applicant", "hr"] as const)
      await recoverOneAccount(
        admin,
        page,
        request,
        role,
        `recovery-${role}-${suffix}@example.test`,
        oldPassword,
        newPassword,
        createdIds,
      );
  } finally {
    await deleteRecoveryUsers(admin, createdIds);
  }
}

async function recoverOneAccount(
  admin: AdminClient,
  page: Page,
  request: APIRequestContext,
  role: RecoveryRole,
  email: string,
  oldPassword: string,
  newPassword: string,
  createdIds: string[],
) {
  const userId = await createRecoveryUser(admin, role, email, oldPassword);
  createdIds.push(userId);
  await requestPasswordReset(page, email);
  await applyRecoveryLink(page, request, email, newPassword);
  await verifyNewCredentials(page, email, oldPassword, newPassword, role);
  await verifyRecoveryRole(admin, page, userId, role);
}

async function createRecoveryUser(
  admin: AdminClient,
  role: RecoveryRole,
  email: string,
  password: string,
) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  expect(error).toBeNull();
  const userId = data.user!.id;
  if (role === "hr") {
    const { error: promotionError } = await admin
      .from("profiles")
      .update({ role })
      .eq("user_id", userId);
    expect(promotionError).toBeNull();
  }
  return userId;
}

async function requestPasswordReset(page: Page, email: string) {
  await page.goto("/auth/sign-in");
  await page.getByRole("link", { name: "Forgot password?" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Email").fill(email);
  await expect(page.getByLabel("Email")).toHaveValue(email);
  await page.getByRole("button", { name: "Send reset link" }).click();
  await expect(
    page.getByRole("heading", { name: "Reset request received" }),
  ).toBeVisible();
}

async function applyRecoveryLink(
  page: Page,
  request: APIRequestContext,
  email: string,
  newPassword: string,
) {
  await page.goto(await waitForRecoveryLink(request, email));
  await expect(page).toHaveURL(/\/auth\/reset-password$/);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("New password", { exact: true }).fill(newPassword);
  await page.getByLabel("Confirm new password").fill(newPassword);
  await page.getByRole("button", { name: "Update password" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in\?reset=success$/);
}

async function verifyNewCredentials(
  page: Page,
  email: string,
  oldPassword: string,
  newPassword: string,
  role: RecoveryRole,
) {
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(oldPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/sign-in\?error=credentials$/);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(
    role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function verifyRecoveryRole(
  admin: AdminClient,
  page: Page,
  userId: string,
  role: RecoveryRole,
) {
  const { data: profile, error } = await admin
    .from("profiles")
    .select("role")
    .eq("user_id", userId)
    .single();
  expect(error).toBeNull();
  expect(profile?.role).toBe(role);
  await page.getByRole("button", { name: "Sign out" }).click();
}

async function deleteRecoveryUsers(admin: AdminClient, ids: string[]) {
  for (const id of ids) await admin.auth.admin.deleteUser(id);
}

test("invalid recovery link cannot open the password form", async ({
  page,
}) => {
  await page.goto("/auth/callback?flow=recovery&code=invalid-code");
  await expect(page).toHaveURL(/\/auth\/forgot-password\?error=link$/);
  await expect(
    page.getByText("That reset link is invalid or expired.", { exact: false }),
  ).toBeVisible();
  await page.goto("/auth/reset-password");
  await expect(page).toHaveURL(/\/auth\/forgot-password\?error=link$/);
});
