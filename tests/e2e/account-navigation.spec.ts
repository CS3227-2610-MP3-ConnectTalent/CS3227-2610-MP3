import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";

const localAdminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!localAdminKey, "Needs a local-only TEST_SUPABASE_SERVICE_ROLE_KEY.");

type Role = "applicant" | "hr";
type TestUser = { id: string; email: string; role: Role };
import type { AdminClient } from "./support/admin-client";

test("guest, Applicant and HR navigation stays distinct and logout clears browser access", async ({
  page,
}) => runAccountNavigationScenario(page));

async function runAccountNavigationScenario(page: Page) {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", localAdminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = {
    users: [] as TestUser[],
    password: "SyntheticNavigation9!",
    jobId: "00000000-0000-4000-8000-000000000101",
    applicationId: undefined as string | undefined,
  };
  try {
    await createNavigationUsers(admin, fixture.users, fixture.password);
    await checkGuestNavigation(page);
    for (const user of fixture.users) {
      await signIn(page, user, fixture.password);
      await checkRoleNavigation(
        page,
        user,
        fixture.jobId,
        fixture.applicationId,
      );
      await checkRoleContrast(page, user);
      if (user.role === "applicant")
        fixture.applicationId = await createSubmittedApplication(
          page,
          fixture.jobId,
        );
      await signOutAndCheckProtectedRoute(page, user);
    }
  } finally {
    await deleteNavigationUsers(admin, fixture.users);
  }
}

async function createNavigationUsers(
  admin: AdminClient,
  users: TestUser[],
  password: string,
) {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  for (const role of ["applicant", "hr"] as const) {
    const email = `navigation-${role}-${suffix}@example.test`;
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    users.push({ id: data.user!.id, email, role });
    if (role === "hr") await promoteNavigationUser(admin, data.user!.id);
  }
}

async function promoteNavigationUser(admin: AdminClient, userId: string) {
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", userId);
  expect(error).toBeNull();
}

async function checkGuestNavigation(page: Page) {
  await page.goto("/auth/sign-up");
  await expect(
    page.getByText("We’ll email a verification link before you can sign in."),
  ).toBeVisible();
  await expect(page.getByText(/Local testing:/)).toHaveCount(0);
  await expect(page.locator('a[href="http://127.0.0.1:54324"]')).toHaveCount(0);
  await page.goto("/");
  const nav = accountNavigation(page);
  await expect(
    nav.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Create account", exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "My applications", exact: true }),
  ).toHaveCount(0);
  await page.goto("/?authError=sign-out");
  await expect(page.locator('p[role="alert"]')).toContainText(
    "Sign out could not be completed",
  );
}

function accountNavigation(page: Page) {
  return page.getByRole("navigation", { name: "Account" });
}

async function signIn(page: Page, user: TestUser, password: string) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(
    user.role === "hr" ? /\/hr\/applications$/ : /\/applications$/,
  );
}

async function checkRoleNavigation(
  page: Page,
  user: TestUser,
  jobId: string,
  applicationId?: string,
) {
  for (const path of rolePaths(user.role, jobId, applicationId)) {
    await page.goto(path);
    await checkAccountControls(page, user);
    if (path === "/jobs/" + jobId) await checkApplyLink(page, user.role);
    await checkResponsiveWidths(page);
  }
}

function rolePaths(role: Role, jobId: string, applicationId?: string) {
  if (role === "applicant")
    return ["/", "/jobs/" + jobId, "/jobs/" + jobId + "/apply"];
  if (!applicationId)
    throw new Error("Applicant fixture must exist before HR checks.");
  return [
    "/",
    "/jobs/" + jobId,
    "/hr/jobs/new",
    "/hr/jobs/00000000-0000-4000-8000-000000000104",
    "/hr/applications/" + applicationId,
  ];
}

async function checkAccountControls(page: Page, user: TestUser) {
  const nav = accountNavigation(page);
  await expect(
    nav.getByText(user.role === "hr" ? "HR" : "Applicant", { exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("button", { name: "Sign out", exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole("link", { name: "My applications", exact: true }),
  ).toHaveCount(user.role === "applicant" ? 1 : 0);
  await expect(
    nav.getByRole("link", { name: "Application review", exact: true }),
  ).toHaveCount(user.role === "hr" ? 1 : 0);
  await expect(
    nav.getByRole("link", { name: "Manage jobs", exact: true }),
  ).toHaveCount(user.role === "hr" ? 1 : 0);
}

async function checkApplyLink(page: Page, role: Role) {
  await expect(
    page.getByRole("link", { name: "Apply for this role" }),
  ).toHaveCount(role === "applicant" ? 1 : 0);
}

async function checkResponsiveWidths(page: Page) {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
}

async function checkRoleContrast(page: Page, user: TestUser) {
  const nav = accountNavigation(page);
  const roleBadge = nav.getByText(user.role === "hr" ? "HR" : "Applicant", {
    exact: true,
  });
  const signOut = nav.getByRole("button", { name: "Sign out", exact: true });
  await signOut.hover();
  for (const control of [roleBadge, signOut])
    expect(
      await control.evaluate(hasAccessibleContrast),
    ).toBeGreaterThanOrEqual(4.5);
}

function hasAccessibleContrast(element: Element) {
  const style = getComputedStyle(element);
  const luminance = (color: string) => {
    const channels = color
      .match(/[\d.]+/g)!
      .slice(0, 3)
      .map(Number)
      .map((value) => {
        const channel = value / 255;
        return channel <= 0.04045
          ? channel / 12.92
          : ((channel + 0.055) / 1.055) ** 2.4;
      });
    return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
  };
  const foreground = luminance(style.color);
  const background = luminance(style.backgroundColor);
  return (
    (Math.max(foreground, background) + 0.05) /
    (Math.min(foreground, background) + 0.05)
  );
}

async function createSubmittedApplication(page: Page, jobId: string) {
  expect((await page.goto("/hr/jobs"))?.status()).toBe(404);
  await page.goto("/jobs/" + jobId + "/apply");
  await page.getByLabel("Full name").fill("Synthetic Navigation Applicant");
  await page
    .getByLabel("Cover letter")
    .fill("Synthetic navigation test letter.");
  await page.getByRole("button", { name: "Save draft" }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]{36}$/);
  const applicationId = page
    .url()
    .match(/\/applications\/([0-9a-f-]{36})/)?.[1];
  expect(applicationId).toBeTruthy();
  await expect(
    accountNavigation(page).getByText("Applicant", { exact: true }),
  ).toBeVisible();
  await expect(
    accountNavigation(page).getByRole("button", {
      name: "Sign out",
      exact: true,
    }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Submit application" }).click();
  await expect(
    page.getByText("Submitted application", { exact: true }),
  ).toBeVisible();
  return applicationId!;
}

async function signOutAndCheckProtectedRoute(page: Page, user: TestUser) {
  await page.goto("/jobs/00000000-0000-4000-8000-000000000101");
  const nav = accountNavigation(page);
  await nav.getByRole("button", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL((url) => url.pathname === "/");
  await expect(
    nav.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    nav.getByRole("button", { name: "Sign out", exact: true }),
  ).toHaveCount(0);
  await page.goto(user.role === "hr" ? "/hr/jobs" : "/applications");
  await expect(page).toHaveURL(/\/auth\/sign-in$/);
}

async function deleteNavigationUsers(admin: AdminClient, users: TestUser[]) {
  for (const user of users) {
    const { error } = await admin.auth.admin.deleteUser(user.id);
    expect(error).toBeNull();
  }
}
