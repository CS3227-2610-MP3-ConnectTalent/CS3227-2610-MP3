import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { expect, test } from "@playwright/test";
const adminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!adminKey, "Local synthetic profile/resume test requires local admin key.");
test("profile prefill, private PDF, submission freeze and HR access", async ({ page, browser, baseURL }) => {
  test.setTimeout(150_000);
  const admin = createClient("http://127.0.0.1:54321", adminKey!, { auth: { persistSession: false, autoRefreshToken: false } });
  const password = "SyntheticCorrectHorse9!"; const suffix = crypto.randomUUID();
  const emails = [`profile44-${suffix}@example.test`, `profile44-hr-${suffix}@example.test`, `profile44-other-${suffix}@example.test`];
  const users: string[] = []; const job = crypto.randomUUID(); let appId: string | undefined;
  const doc = await PDFDocument.create(); doc.addPage(); const pdf = Buffer.from(await doc.save());
  async function login(target: typeof page, email: string) {
    await target.goto("/auth/sign-in"); await target.getByLabel("Email").fill(email); await target.getByLabel("Password", { exact: true }).fill(password);
    await target.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(target).toHaveURL(email === emails[1] ? /\/hr\/applications$/ : /\/applications$/);
  }
  try {
    for (const email of emails) { const { data, error } = await admin.auth.admin.createUser({ email, password, email_confirm: true }); expect(error).toBeNull(); users.push(data.user!.id); }
    for(const email of [emails[0],emails[2]]) {
      const fixture=createClient("http://127.0.0.1:54321",adminKey!,{auth:{persistSession:false}});
      expect((await fixture.auth.signInWithPassword({email,password})).error).toBeNull();
      expect((await fixture.rpc("save_applicant_profile",{p_full_name:"Fixture Applicant",p_phone:"+6591234567",p_portfolio_url:null,p_education:null,p_work_experience:null})).error).toBeNull();
    }
    expect((await admin.from("profiles").update({ role: "hr" }).eq("user_id", users[1])).error).toBeNull();
    expect((await admin.from("jobs").insert({ id: job, title: `Profile role ${suffix}`, team: "Synthetic Platform", category: "engineering", description: "Synthetic", requirements: "Synthetic", status: "published", published_at: new Date().toISOString() })).error).toBeNull();
    await login(page, emails[0]); await page.getByRole("link", { name: "My profile", exact: true }).click();
    await page.getByLabel("Full name", { exact: true }).fill("Synthetic Profile Applicant");
    await page.getByLabel("Education (optional)").fill("Synthetic College\nComputing");
    await page.getByLabel("Work experience (optional)").fill("Synthetic internship");
    await page.getByRole("button", { name: "Save profile" }).click();
    await expect(page.getByRole("status")).toContainText("Profile saved"); await page.reload();
    await expect(page.getByLabel("Education (optional)")).toHaveValue("Synthetic College\nComputing");
    await page.goto(`/jobs/${job}/apply`);
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Synthetic Profile Applicant");
    await expect(page.getByLabel("Education (optional)")).toHaveValue("Synthetic College\nComputing");
    await page.getByLabel("Cover letter", { exact: true }).fill("Synthetic application letter");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/); appId = page.url().split("/").at(-1)!;
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "not.pdf", mimeType: "application/pdf", buffer: Buffer.from("spoofed bytes") });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("valid, unencrypted PDF");
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "synthetic.pdf", mimeType: "application/pdf", buffer: pdf });
    const uploadRequest = page.waitForRequest(request => request.url().endsWith("/resume") && request.headers()["x-resume-intent"] === "upload");
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    const operation = (await uploadRequest).headers()["x-resume-operation"];
    await expect(page.getByRole("link", { name: "Download résumé: synthetic.pdf" })).toBeVisible();
    const download = await page.request.get(`/api/applications/${appId}/resume`);
    expect(download.status()).toBe(200); expect(download.headers()["content-disposition"]).toContain("attachment");
    expect(download.headers()["cache-control"]).toBe("private, no-store"); expect(await download.body()).toEqual(pdf);
    const repeat = await page.request.post(`/api/applications/${appId}/resume`, { headers: { origin: baseURL!, "x-resume-intent": "upload", "x-application-revision": "1",
      "x-resume-operation": operation, "x-resume-filename": "synthetic.pdf", "content-type": "application/pdf" }, data: pdf });
    expect(repeat.status()).toBe(200); // Separate HTTP request, stale revision, same finalized operation.
    const { data: initialObjects } = await admin.from("application_resume_objects").select("object_path").eq("application_id", appId).eq("state", "ready");
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "broken.pdf", mimeType: "application/pdf", buffer: Buffer.from("invalid replacement") });
    await page.getByRole("button", { name: "Replace résumé", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("valid, unencrypted PDF");
    await expect(page.getByRole("link", { name: "Download résumé: synthetic.pdf" })).toBeVisible();
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "replacement.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.getByRole("button", { name: "Replace résumé", exact: true }).click();
    await expect(page.getByRole("link", { name: "Download résumé: replacement.pdf" })).toBeVisible();
    expect((await admin.storage.from("application-resumes").download(initialObjects![0].object_path)).error).not.toBeNull();
    await page.getByRole("button", { name: "Remove résumé", exact: true }).click();
    await expect(page.getByText("No résumé attached.", { exact: true })).toBeVisible();
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "synthetic.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("link", { name: "Download résumé: synthetic.pdf" })).toBeVisible();
    const hrContext = await browser.newContext({ baseURL }); const hr = await hrContext.newPage(); await login(hr, emails[1]);
    expect((await hr.request.get(`/api/applications/${appId}/resume`)).status()).toBe(404);
    await hr.goto("/profile"); await expect(hr).toHaveURL(/\/auth\/sign-in$/);
    const otherContext = await browser.newContext({ baseURL }); const other = await otherContext.newPage(); await login(other, emails[2]);
    expect((await other.request.get(`/api/applications/${appId}/resume`)).status()).toBe(404);
    await page.goto("/profile"); await page.getByLabel("Full name", { exact: true }).fill("Changed profile name");
    await page.getByRole("button", { name: "Save profile" }).click(); await expect(page.getByRole("status")).toContainText("Profile saved");
    await page.goto(`/jobs/${job}/apply`); await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Synthetic Profile Applicant");
    await page.setViewportSize({ width: 390, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
    await page.setViewportSize({ width: 1440, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);
    await page.getByRole("button", { name: "Submit application", exact: true }).click();
    await expect(page.getByText("Submitted application", { exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: "Replace résumé" })).toHaveCount(0);
    const mutate = await page.request.post(`/api/applications/${appId}/resume`, { headers: { origin: baseURL!, "x-resume-intent": "remove", "x-application-revision": "4" } });
    expect(mutate.status()).toBe(400);
    await hr.goto(`/hr/applications/${appId}`); await expect(hr.getByText("Synthetic Profile Applicant", { exact: true })).toBeVisible();
    await expect(hr.getByText("Synthetic internship", { exact: true })).toBeVisible();
    expect((await hr.request.get(`/api/applications/${appId}/resume`)).status()).toBe(200);
    expect((await admin.from("jobs").update({ status: "closed" }).eq("id", job)).error).toBeNull();
    expect((await page.request.get(`/api/applications/${appId}/resume`)).status()).toBe(200);
    await otherContext.close(); await hrContext.close();
  } finally {
    // Fixture cleanup uses a scoped admin operation; normal product roles cannot delete submitted data.
    if (appId) {
      const { data: objects } = await admin.from("application_resume_objects").select("object_path").eq("application_id", appId);
      if (objects?.length) await admin.storage.from("application-resumes").remove(objects.map(row => row.object_path));
      expect((await admin.from("applications").delete().eq("id", appId)).error).toBeNull();
    }
    await admin.from("jobs").delete().eq("id", job); for (const user of users) await admin.auth.admin.deleteUser(user);
  }
});
