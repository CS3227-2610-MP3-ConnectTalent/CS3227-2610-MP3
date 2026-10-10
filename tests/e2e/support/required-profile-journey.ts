import { PDFDocument } from "pdf-lib";
import { expect, type APIRequestContext, type Page } from "@playwright/test";
import type { AdminClient } from "./admin-client";

export async function createRequiredProfileJob(
  admin: AdminClient,
  jobId: string,
) {
  const { error } = await admin.from("jobs").insert({
    id: jobId,
    title: `Onboarding ${jobId}`,
    team: "Synthetic",
    category: "engineering",
    description: "Synthetic",
    requirements: "Synthetic",
    status: "published",
    published_at: new Date().toISOString(),
  });
  expect(error).toBeNull();
}

async function findConfirmationEmail(
  request: APIRequestContext,
  email: string,
) {
  let confirmation: string | undefined;
  await expect
    .poll(async () => {
      const response = await request.get(
        "http://127.0.0.1:54324/api/v1/messages?limit=50",
      );
      const list = await response.json();
      const message = list.messages.find(
        (item: { To: { Address: string }[] }) =>
          item.To.some((to) => to.Address === email),
      );
      if (!message) return false;
      const detail = await request.get(
        `http://127.0.0.1:54324/api/v1/message/${message.ID}`,
      );
      const body = await detail.json();
      confirmation = (body.Text as string).match(
        /https?:\/\/[^\s<>"']+\/auth\/v1\/verify\?[^\s<>"']+/,
      )?.[0];
      return Boolean(confirmation);
    })
    .toBe(true);
  return confirmation!;
}

export async function registerRequiredProfileApplicant(
  page: Page,
  request: APIRequestContext,
  email: string,
  password: string,
) {
  await page.goto("/auth/sign-up");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page
    .getByRole("button", { name: "Create account", exact: true })
    .click();
  await expect(page).toHaveURL(/\/auth\/check-email$/);
  await page.goto(await findConfirmationEmail(request, email));
  await expect(page).toHaveURL(/\/profile$/);
}

export async function findRequiredProfileUser(
  admin: AdminClient,
  email: string,
) {
  const users = await admin.auth.admin.listUsers({ perPage: 1000 });
  const userId = users.data.users.find((user) => user.email === email)?.id;
  expect(userId).toBeTruthy();
  return userId!;
}

export async function verifyRequiredProfileGuards(page: Page, email: string) {
  await expect(page.getByLabel("Verified email")).toHaveValue(email);
  const nav = page.getByRole("navigation", { name: "Account" });
  await expect(
    nav.getByRole("link", { name: "My applications", exact: true }),
  ).toHaveCount(0);
  await expect(
    nav.getByRole("link", { name: "My profile", exact: true }),
  ).toBeVisible();
  await expect(page.locator('header a[href="/"]')).toHaveCount(0);
  await expect(page.getByLabel("Full name", { exact: true })).toHaveAttribute(
    "required",
    "",
  );
  await expect(
    page.getByLabel("Phone number", { exact: true }),
  ).toHaveAttribute("required", "");
  await expect(
    page.getByText(
      "Existing drafts and submitted applications will stay unchanged.",
      {
        exact: true,
      },
    ),
  ).toHaveCount(0);
  await expect(
    page.getByText("Optional. Maximum 120 characters.", { exact: true }),
  ).toHaveCount(0);
}

export async function verifyRequiredProfileBlockedRoutes(
  page: Page,
  admin: AdminClient,
  baseURL: string | undefined,
  jobId: string,
  userId: string,
) {
  await redirectIncompleteApplicant(page, jobId);
  const denied = await page.request.post("/api/ai/applicant-draft", {
    headers: { origin: baseURL! },
    data: { jobId, notes: "Synthetic" },
  });
  expect(denied.status()).toBe(403);
  const invocations = await admin
    .from("ai_invocations")
    .select("id")
    .eq("actor_id", userId);
  expect(invocations.data).toHaveLength(0);
}

async function redirectIncompleteApplicant(page: Page, jobId: string) {
  for (const path of [
    "/",
    "/?category=engineering",
    `/jobs/${jobId}`,
    `/jobs/${jobId}/apply`,
    "/applications",
    `/applications/${crypto.randomUUID()}`,
  ]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/profile$/);
  }
}

export async function verifyRequiredProfileUpload(page: Page) {
  const doc = await PDFDocument.create();
  doc.addPage();
  const buffer = Buffer.from(await doc.save());
  await page.getByLabel("Choose PDF résumé").setInputFiles({
    name: "onboarding.pdf",
    mimeType: "application/pdf",
    buffer,
  });
  await page
    .getByRole("button", { name: "Upload résumé", exact: true })
    .click();
  await expect(
    page.getByRole("link", { name: "Download résumé: onboarding.pdf" }),
  ).toBeVisible({ timeout: 30_000 });
  await page.goto("/applications");
  await expect(page).toHaveURL(/\/profile$/);
}

export async function completeRequiredProfile(
  page: Page,
  admin: AdminClient,
  userId: string,
) {
  await page
    .getByLabel("Full name", { exact: true })
    .fill("Synthetic Onboarding Applicant");
  await page.getByLabel("Country code", { exact: true }).selectOption("SG");
  await page.getByLabel("Phone number", { exact: true }).fill("91234567");
  await page.getByRole("button", { name: "Save profile", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  const profile = await admin
    .from("applicant_profiles")
    .select("phone")
    .eq("user_id", userId)
    .single();
  expect(profile.data?.phone).toBe("+6591234567");
}

export async function verifyRequiredProfileAutofill(
  page: Page,
  jobId: string,
  email: string,
) {
  await page.goto(`/jobs/${jobId}/apply`);
  await expect(page.getByLabel("Full name", { exact: true })).toHaveValue(
    "Synthetic Onboarding Applicant",
  );
  await expect(page.getByLabel("Verified email")).toHaveValue(email);
  await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue(
    "91234567",
  );
  await expect(page.getByLabel("Country code", { exact: true })).toHaveValue(
    "SG",
  );
}

export async function verifyRequiredProfileSignIn(
  page: Page,
  email: string,
  password: string,
) {
  await page.getByRole("button", { name: "Sign out", exact: true }).click();
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/applications$/);
  await page.goto("/profile");
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBeLessThanOrEqual(width);
  }
}

async function removeRequiredProfileResume(admin: AdminClient, userId: string) {
  const { data: objects } = await admin
    .from("profile_resume_objects")
    .select("object_path")
    .eq("applicant_id", userId);
  if (objects?.length) {
    await admin.storage
      .from("profile-resumes")
      .remove(objects.map((item) => item.object_path));
  }
  await admin
    .from("applicant_profiles")
    .update({ resume_id: null })
    .eq("user_id", userId);
  await admin
    .from("profile_resume_objects")
    .delete()
    .eq("applicant_id", userId);
}

export async function cleanupRequiredProfile(
  admin: AdminClient,
  jobId: string,
  email: string,
  userId?: string,
) {
  const actor =
    userId ??
    (await findRequiredProfileUser(admin, email).catch(() => undefined));
  if (actor) {
    await removeRequiredProfileResume(admin, actor);
    await admin.auth.admin.deleteUser(actor);
  }
  await admin.from("jobs").delete().eq("id", jobId);
}
