import { createClient } from "@supabase/supabase-js";
import { test } from "@playwright/test";
import {
  cleanupWithdrawalFixture,
  createWithdrawalFixture,
  seedWithdrawalFixture,
} from "./support/application-withdrawal-fixture";
import { runApplicationWithdrawalJourney } from "./support/application-withdrawal-journey";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Local synthetic withdrawal test requires local admin key.");

test("one form, private resume retry and confirmed retained withdrawal", async ({
  page,
  browser,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = await createWithdrawalFixture();
  const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
  try {
    await seedWithdrawalFixture(admin, key!, fixture);
    const hrContext = await browser.newContext({ baseURL });
    const otherContext = await browser.newContext({ baseURL });
    contexts.push(hrContext, otherContext);
    await runApplicationWithdrawalJourney(
      page,
      await hrContext.newPage(),
      await otherContext.newPage(),
      admin,
      fixture,
    );
  } finally {
    for (const context of contexts) await context.close();
    await cleanupWithdrawalFixture(admin, fixture);
  }
});
