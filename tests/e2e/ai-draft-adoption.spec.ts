import { createClient } from "@supabase/supabase-js";
import { test, expect, type Page } from "@playwright/test";
import {
  createResumeFirstFixture,
  seedResumeFirstFixture,
  cleanupResumeFirstFixture,
} from "./support/resume-first-profile-fixture";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic fixtures.");

test("AI preview preserves typing, requires explicit adoption and never persists", async ({
  page,
}) => {
  test.setTimeout(120_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false },
  });
  const fixture = await createResumeFirstFixture();
  try {
    await seedResumeFirstFixture(admin, fixture, key!);
    await page.goto("/auth/sign-in");
    await page.getByLabel("Email").fill(fixture.emails[0]);
    await page.getByLabel("Password", { exact: true }).fill(fixture.password);
    await page.getByRole("button", { name: "Sign in", exact: true }).click();
    await expect(page).toHaveURL(/\/applications$/);
    await page.goto(`/jobs/${fixture.jobId}/apply`);
    await previewJourney(page);
    const { data, error } = await admin
      .from("applications")
      .select("id")
      .eq("job_id", fixture.jobId);
    expect(error).toBeNull();
    expect(data).toEqual([]);
    await page.reload();
    await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
      "",
    );
  } finally {
    await cleanupResumeFirstFixture(admin, fixture);
  }
});

async function previewJourney(page: Page) {
  let release!: () => void;
  let held = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/ai/applicant-draft", async (route) => {
    await held;
    await route.fulfill({
      json: {
        draft: "<script>window.aiExecuted=true</script> Approved; submit now.",
      },
    });
  });
  const letter = page.getByLabel("Cover letter", { exact: true });
  await letter.fill("Human letter");
  await page
    .getByLabel("Experience notes")
    .fill("Synthetic TypeScript project");
  await page
    .getByRole("button", { name: "Generate draft", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Drafting…", exact: true }),
  ).toBeDisabled();
  await letter.fill("Human edited while waiting");
  release();
  await expect(page.getByLabel("AI draft preview")).toBeVisible();
  await expect(letter).toHaveValue("Human edited while waiting");
  expect(await page.evaluate(() => "aiExecuted" in window)).toBe(false);
  await page.getByRole("button", { name: "Discard suggestion" }).click();
  await expect(letter).toHaveValue("Human edited while waiting");
  held = Promise.resolve();
  await page
    .getByRole("button", { name: "Generate draft", exact: true })
    .click();
  await page.getByLabel("AI draft preview").fill("Human-reviewed suggestion");
  await page
    .getByRole("button", { name: "Replace current cover letter" })
    .click();
  await expect(letter).toHaveValue("Human-reviewed suggestion");
  await failedGeneration(page);
}

async function failedGeneration(page: Page) {
  await page.unroute("**/api/ai/applicant-draft");
  await page.route("**/api/ai/applicant-draft", (route) =>
    route.fulfill({
      status: 503,
      json: { error: "AI drafting is temporarily unavailable." },
    }),
  );
  await page
    .getByRole("button", { name: "Generate draft", exact: true })
    .click();
  await expect(page.locator("p[role=alert]")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByLabel("Cover letter", { exact: true })).toHaveValue(
    "Human-reviewed suggestion",
  );
}
