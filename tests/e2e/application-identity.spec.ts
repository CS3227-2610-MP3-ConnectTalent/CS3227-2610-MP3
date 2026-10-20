import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import {
  createResumeFirstFixture,
  seedResumeFirstFixture,
  cleanupResumeFirstFixture,
} from "./support/resume-first-profile-fixture";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures.");

test("stale tabs cannot save, submit or attach files to a newer reapplication", async ({
  page,
  context,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = await createResumeFirstFixture();
  const applicant = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  try {
    await seedResumeFirstFixture(admin, fixture, key!);
    const { oldId, oldSubmit } = await openOldForms(page, context, fixture);

    const newId = await createReapplication(applicant, fixture, oldId);

    await page.locator('[name="cover_letter"]').fill("Stale overwrite from A");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(page.getByText(/could not save your changes/)).toBeVisible();
    await oldSubmit
      .getByRole("button", { name: "Submit application", exact: true })
      .click();
    await expect(
      oldSubmit.getByText(/could not save your changes/),
    ).toBeVisible();

    await rejectStaleFiles(context, fixture, oldId, baseURL!);
    await assertUntouchedDraft(admin, newId);

    await submitCurrentDraft(page, admin, newId);
    await oldSubmit.close();
  } finally {
    await cleanupResumeFirstFixture(admin, fixture);
  }
});

type Fixture = Awaited<ReturnType<typeof createResumeFirstFixture>>;
type Client = SupabaseClient;

async function openOldForms(
  page: Page,
  context: BrowserContext,
  fixture: Fixture,
) {
  await page.goto("/auth/sign-in");
  await page.getByLabel("Email").fill(fixture.emails[0]);
  await page.getByLabel("Password", { exact: true }).fill(fixture.password);
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/applications$/);
  await page.goto(`/jobs/${fixture.jobId}/apply`);
  await expect(page.locator("form[data-hydrated=true]")).toBeVisible();
  await page.locator('[name="cover_letter"]').fill("Original draft A");
  await page.getByRole("button", { name: "Save draft", exact: true }).click();
  await expect(page).toHaveURL(/\/applications\/[0-9a-f-]+$/);
  const oldId = new URL(page.url()).pathname.split("/").at(-1)!;
  const oldSubmit = await context.newPage();
  await oldSubmit.goto(`/applications/${oldId}`);
  await expect(oldSubmit.locator("form[data-hydrated=true]")).toBeVisible();

  return { oldId, oldSubmit };
}

async function createReapplication(
  applicant: Client,
  fixture: Fixture,
  oldId: string,
) {
  expect(
    (
      await applicant.auth.signInWithPassword({
        email: fixture.emails[0],
        password: fixture.password,
      })
    ).error,
  ).toBeNull();
  const args = {
    p_job_id: fixture.jobId,
    p_cover_letter: "Original submitted A",
    p_full_name: "Fixture Applicant",
    p_phone: "+6591234567",
    p_portfolio_url: null,
    p_education: null,
    p_work_experience: null,
  };
  expect(
    (
      await applicant.rpc("submit_application_details_v3", {
        ...args,
        p_application: oldId,
        p_expected_revision: 1,
      })
    ).error,
  ).toBeNull();
  expect(
    (await applicant.rpc("withdraw_application", { p_application_id: oldId }))
      .error,
  ).toBeNull();
  const created = await applicant.rpc("save_application_details_v3", {
    ...args,
    p_cover_letter: "Independent draft B",
    p_application: null,
    p_expected_revision: null,
  });
  expect(created.error).toBeNull();
  const newId = created.data as string;
  expect(newId).not.toBe(oldId);

  return newId;
}

async function rejectStaleFiles(
  context: BrowserContext,
  fixture: Fixture,
  oldId: string,
  baseURL: string,
) {
  const staleFile = await context.request.post(
    `/api/jobs/${fixture.jobId}/resume`,
    {
      headers: {
        origin: new URL(baseURL!).origin,
        "x-application-id": oldId,
        "x-application-revision": "1",
        "x-resume-intent": "upload",
        "x-resume-operation": crypto.randomUUID(),
        "x-resume-filename": "synthetic.pdf",
        "content-type": "application/pdf",
      },
      data: fixture.pdf,
    },
  );
  expect(staleFile.status()).toBe(409);
  const removed = await context.request.post(
    `/api/applications/${oldId}/resume`,
    {
      headers: {
        origin: new URL(baseURL!).origin,
        "x-application-revision": "1",
        "x-resume-intent": "remove",
      },
    },
  );
  expect(removed.status()).toBe(400);
}

async function assertUntouchedDraft(admin: Client, newId: string) {
  const { data: current } = await admin
    .from("applications")
    .select("cover_letter,submission_state,revision,resume_id")
    .eq("id", newId)
    .single();
  expect(current).toMatchObject({
    cover_letter: "Independent draft B",
    submission_state: "draft",
    revision: 1,
    resume_id: null,
  });
  const objects = await admin
    .from("application_resume_objects")
    .select("id")
    .eq("application_id", newId);
  expect(objects.data).toEqual([]);
}

async function submitCurrentDraft(page: Page, admin: Client, newId: string) {
  await page.goto(`/applications/${newId}`);
  await expect(page.locator("form[data-hydrated=true]")).toBeVisible();
  await page
    .getByRole("button", { name: "Submit application", exact: true })
    .click();
  await expect(
    page.getByText("Submitted applications are locked.", { exact: false }),
  ).toBeVisible();
  expect(
    (
      await admin
        .from("applications")
        .select("cover_letter,submission_state")
        .eq("id", newId)
        .single()
    ).data,
  ).toMatchObject({
    cover_letter: "Independent draft B",
    submission_state: "submitted",
  });
}
