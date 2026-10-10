import { createClient } from "@supabase/supabase-js";
import { test } from "@playwright/test";
import {
  cleanupResumeFirstFixture,
  createResumeFirstFixture,
  seedResumeFirstFixture,
} from "./support/resume-first-profile-fixture";
import { runResumeFirstProfileJourney } from "./support/resume-first-profile-journey";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures.");

test("upload before saving, private profile copy and preserved unsaved fields", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false },
  });
  const fixture = await createResumeFirstFixture();
  const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
  try {
    await seedResumeFirstFixture(admin, fixture, key!);
    const otherContext = await browser.newContext({ baseURL });
    contexts.push(otherContext);
    await runResumeFirstProfileJourney(
      page,
      await otherContext.newPage(),
      admin,
      fixture,
    );
  } finally {
    for (const context of contexts) await context.close();
    await cleanupResumeFirstFixture(admin, fixture);
  }
});
