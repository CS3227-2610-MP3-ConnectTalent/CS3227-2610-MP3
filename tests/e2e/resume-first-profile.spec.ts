import { createClient } from "@supabase/supabase-js";
import { createHash } from "node:crypto";
import { PDFDocument } from "pdf-lib";
import { expect, test } from "@playwright/test";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures.");
test("upload before saving, private profile copy and preserved unsaved fields", async ({ page, browser, baseURL }) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, { auth: { persistSession: false } });
  const suffix = crypto.randomUUID(), job = crypto.randomUUID(), password = "SyntheticCorrectHorse9!";
  const users: string[] = [];
  const doc = await PDFDocument.create(); doc.addPage(); const pdf = Buffer.from(await doc.save());
  const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
  async function login(target: typeof page, email: string) {
    await target.goto("/auth/sign-in"); await target.getByLabel("Email").fill(email);
    await target.getByLabel("Password", { exact: true }).fill(password);
    await target.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(target).toHaveURL(/\/applications$/);
  }
  try {
    for (const role of ["owner", "other"]) {
      const { data, error } = await admin.auth.admin.createUser({ email: `${role}53-${suffix}@example.test`, password, email_confirm: true });
      expect(error).toBeNull(); users.push(data.user!.id);
      const fixture=createClient("http://127.0.0.1:54321",key!,{auth:{persistSession:false}});
      expect((await fixture.auth.signInWithPassword({email:`${role}53-${suffix}@example.test`,password})).error).toBeNull();
      expect((await fixture.rpc("save_applicant_profile",{p_full_name:"Fixture Applicant",p_phone:"+6591234567",p_portfolio_url:null,p_education:null,p_work_experience:null})).error).toBeNull();
    }
    expect((await admin.from("jobs").insert({ id: job, title: `Upload first ${suffix}`, team: "Synthetic", category: "engineering", description: "Synthetic", requirements: "Synthetic", status: "published", published_at: new Date().toISOString() })).error).toBeNull();
    await login(page, `owner53-${suffix}@example.test`); await page.goto("/profile");
    await page.getByLabel("Full name", { exact: true }).fill("Unsaved profile name");
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "profile.pdf", mimeType: "application/pdf", buffer: pdf });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("link", { name: "Download résumé: profile.pdf" })).toBeVisible();
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Unsaved profile name");
    expect((await admin.from("applicant_profiles").select("full_name").eq("user_id", users[0]).single()).data?.full_name).toBe("Fixture Applicant");
    expect((await page.request.get("/api/profile/resume")).status()).toBe(200);
    const otherContext = await browser.newContext({ baseURL }); contexts.push(otherContext);
    const other = await otherContext.newPage(); await login(other, `other53-${suffix}@example.test`);
    expect((await other.request.get("/api/profile/resume")).status()).toBe(404);
    await page.goto(`/jobs/${job}/apply`);
    await page.getByLabel("Full name", { exact: true }).fill("Unsaved application name");
    await page.getByLabel("Work experience (optional)").fill("Unsaved experience");
    await page.getByLabel("Cover letter", { exact: true }).fill("Unsaved letter retained");
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "invalid.pdf", mimeType: "application/pdf", buffer: Buffer.from("invalid") });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("status")).toContainText("valid, unencrypted PDF");
    expect((await admin.from("applications").select("id").eq("applicant_id", users[0])).data).toHaveLength(0);
    await page.getByLabel("Choose PDF résumé").setInputFiles({ name: "direct.pdf", mimeType: "application/pdf", buffer: pdf });
    // Simulate a first request that allocates its private pending record, then loses the response.
    let interruptedOperation: string | undefined;
    await page.route(`**/api/jobs/${job}/resume`, async route => {
      const headers = route.request().headers();
      expect(headers["x-application-revision"]).toBe("");
      interruptedOperation = headers["x-resume-operation"];
      expect((await admin.rpc("prepare_application_resume", {
        p_actor: users[0], p_job: job, p_revision: null, p_operation: interruptedOperation,
        p_filename: "direct.pdf", p_size: pdf.length, p_sha256: createHash("sha256").update(pdf).digest("hex"),
      })).error).toBeNull();
      await route.abort("failed");
    }, { times: 1 });
    await page.getByRole("button", { name: "Upload résumé", exact: true }).click();
    await expect(page.getByRole("button", { name: "Retry upload", exact: true })).toBeVisible();
    const retryRequest = page.waitForRequest(request => request.url().endsWith(`/api/jobs/${job}/resume`) && request.headers()["x-resume-retry"] === "true");
    await page.getByRole("button", { name: "Retry upload", exact: true }).click();
    const retryHeaders = (await retryRequest).headers();
    expect(retryHeaders["x-application-revision"]).toBe("");
    expect(retryHeaders["x-resume-operation"]).not.toBe(interruptedOperation);
    await expect(page.getByRole("link", { name: "Download résumé: direct.pdf" })).toBeVisible({ timeout: 30_000 });
    expect((await admin.from("applications").select("id").eq("applicant_id", users[0]).eq("job_id", job)).data).toHaveLength(1);
    // Recovery retires the reservation; cleanup claims and retains its deleting tombstone.
    expect((await admin.from("application_resume_objects").select("state").eq("id", interruptedOperation!).single()).data?.state).toBe("deleting");
    await page.getByRole("button", { name: "Use profile résumé", exact: true }).click();
    await expect(page.getByRole("link", { name: "Download résumé: profile.pdf" })).toBeVisible();
    const { data: draft } = await admin.from("applications").select("id,full_name,cover_letter,resume_id").eq("applicant_id", users[0]).single();
    expect(draft?.full_name).toBeNull(); expect(draft?.cover_letter).toBe(""); expect(draft?.resume_id).not.toBeNull();
    await expect(page.getByLabel("Full name", { exact: true })).toHaveValue("Unsaved application name");
    await expect(page.getByLabel("Work experience (optional)")).toHaveValue("Unsaved experience");
    await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue("Unsaved letter retained");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
    await page.getByLabel("Cover letter", { exact: true }).fill("Second saved letter");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect.poll(async () => (await admin.from("applications").select("cover_letter").eq("id", draft!.id).single()).data?.cover_letter).toBe("Second saved letter");
    await page.getByLabel("Cover letter", { exact: true }).fill("Third saved letter");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect.poll(async () => (await admin.from("applications").select("cover_letter").eq("id", draft!.id).single()).data?.cover_letter).toBe("Third saved letter");
    await page.getByRole("button", { name: "Submit application", exact: true }).click();
    await expect(page.getByText("Submitted application", { exact: true })).toBeVisible();
    await page.goto("/profile"); await page.getByRole("button", { name: "Remove résumé", exact: true }).click();
    await expect(page.getByText("No résumé attached.", { exact: true })).toBeVisible();
    expect((await page.request.get("/api/profile/resume")).status()).toBe(404);
    const snapshot = await page.request.get(`/api/applications/${draft!.id}/resume`);
    expect(snapshot.status()).toBe(200); expect(await snapshot.body()).toEqual(pdf);
  } finally {
    for (const context of contexts) await context.close();
    const { data: objects } = await admin.from("application_resume_objects").select("object_path").eq("applicant_id", users[0]);
    if (objects?.length) await admin.storage.from("application-resumes").remove(objects.map(row => row.object_path));
    await admin.from("applications").delete().eq("applicant_id", users[0]);
    const { data: profileObjects } = await admin.from("profile_resume_objects").select("object_path").eq("applicant_id", users[0]);
    if (profileObjects?.length) await admin.storage.from("profile-resumes").remove(profileObjects.map(row => row.object_path));
    await admin.from("applicant_profiles").update({ resume_id: null }).eq("user_id", users[0]);
    await admin.from("profile_resume_objects").delete().eq("applicant_id", users[0]);
    await admin.from("jobs").delete().eq("id", job);
    for (const user of users) await admin.auth.admin.deleteUser(user);
  }
});
