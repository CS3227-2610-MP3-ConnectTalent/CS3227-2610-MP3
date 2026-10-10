import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { expect, test } from "@playwright/test";
const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures and Mailpit.");

test("verified signup is profile-only until required details save, then applications autofill", async ({ page, request, baseURL }) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, { auth: { persistSession: false } });
  const suffix = crypto.randomUUID(), email = `onboarding52-${suffix}@example.test`, job = crypto.randomUUID();
  const password = "SyntheticOnboarding9!";
  let actor: string | undefined;
  try {
    expect((await admin.from("jobs").insert({ id: job, title: `Onboarding ${suffix}`, team: "Synthetic", category: "engineering", description: "Synthetic", requirements: "Synthetic", status: "published", published_at: new Date().toISOString() })).error).toBeNull();
    await page.goto("/auth/sign-up");
    await page.getByLabel("Email").fill(email); await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByLabel("Confirm password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Create account", exact: true }).click();
    await expect(page).toHaveURL(/\/auth\/check-email$/);
    let confirmation: string | undefined;
    await expect.poll(async () => {
      const list = await (await request.get("http://127.0.0.1:54324/api/v1/messages?limit=50")).json();
      const message = list.messages.find((item: { To: { Address: string }[] }) => item.To.some(to => to.Address === email));
      if (!message) return false;
      const body = await (await request.get(`http://127.0.0.1:54324/api/v1/message/${message.ID}`)).json();
      confirmation = (body.Text as string).match(/https?:\/\/[^\s<>"']+\/auth\/v1\/verify\?[^\s<>"']+/)?.[0];
      return Boolean(confirmation);
    }).toBe(true);
    await page.goto(confirmation!); await expect(page).toHaveURL(/\/profile$/);
    actor = (await admin.auth.admin.listUsers({ perPage: 1000 })).data.users.find(user => user.email === email)?.id;
    expect(actor).toBeTruthy();
    await expect(page.getByLabel("Verified email")).toHaveValue(email);
    const nav = page.getByRole("navigation", { name: "Account" });
    await expect(nav.getByRole("link", { name: "My applications", exact: true })).toHaveCount(0);
    await expect(nav.getByRole("link", { name: "My profile", exact: true })).toBeVisible();
    await expect(page.locator('header a[href="/"]')).toHaveCount(0);
    await expect(page.getByLabel("Full name", { exact: true })).toHaveAttribute("required", "");
    await expect(page.getByLabel("Phone number", { exact: true })).toHaveAttribute("required", "");
    await expect(page.getByText("Existing drafts and submitted applications will stay unchanged.", { exact: true })).toHaveCount(0);
    await expect(page.getByText("Optional. Maximum 120 characters.", { exact: true })).toHaveCount(0);
    for (const path of ["/", `/?category=engineering`, `/jobs/${job}`, `/jobs/${job}/apply`, "/applications", `/applications/${crypto.randomUUID()}`]) {
      await page.goto(path); await expect(page).toHaveURL(/\/profile$/);
    }
    const denied = await page.request.post("/api/ai/applicant-draft", { headers: { origin: baseURL! }, data: { jobId: job, notes: "Synthetic" } });
    expect(denied.status()).toBe(403);
    expect((await admin.from("ai_invocations").select("id").eq("actor_id", actor!)).data).toHaveLength(0);
    const doc = await PDFDocument.create(); doc.addPage(); const pdf = Buffer.from(await doc.save());
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "onboarding.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("link", { name: "Download résumé: onboarding.pdf" })).toBeVisible({ timeout: 30_000 });
    await page.goto("/applications"); await expect(page).toHaveURL(/\/profile$/);
    await page.getByLabel("Full name", { exact: true }).fill("Synthetic Onboarding Applicant");
    await page.getByLabel("Country code", { exact: true }).selectOption("SG");
    await page.getByLabel("Phone number", { exact: true }).fill("91234567");
    await page.getByRole("button", { name: "Save profile", exact: true }).click();
    await expect(page).toHaveURL(baseURL! + "/");
    expect((await admin.from("applicant_profiles").select("phone").eq("user_id", actor!).single()).data?.phone).toBe("+6591234567");
    await page.goto(`/jobs/${job}/apply`);
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Synthetic Onboarding Applicant");
    await expect(page.getByLabel("Verified email")).toHaveValue(email);
    await expect(page.getByLabel("Phone number", { exact: true })).toHaveValue("91234567");
    await expect(page.getByLabel("Country code", { exact: true })).toHaveValue("SG");
    await page.getByRole("button", { name: "Sign out", exact: true }).click();
    await page.goto("/auth/sign-in"); await page.getByLabel("Email").fill(email); await page.getByLabel("Password", { exact: true }).fill(password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click(); await expect(page).toHaveURL(/\/applications$/);
    await page.goto("/profile");
    for (const width of [390, 1440]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width); }
  } finally {
    if (!actor) actor = (await admin.auth.admin.listUsers({ perPage: 1000 })).data.users.find(user => user.email === email)?.id;
    if (actor) {
      const { data: objects } = await admin.from("profile_resume_objects").select("object_path").eq("applicant_id", actor);
      if (objects?.length) await admin.storage.from("profile-resumes").remove(objects.map(item => item.object_path));
      await admin.from("applicant_profiles").update({ resume_id: null }).eq("user_id", actor);
      await admin.from("profile_resume_objects").delete().eq("applicant_id", actor);
      await admin.auth.admin.deleteUser(actor);
    }
    await admin.from("jobs").delete().eq("id", job);
  }
});
