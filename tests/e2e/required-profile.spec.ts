import { createClient } from "@supabase/supabase-js";
import { test } from "@playwright/test";
import {
  cleanupRequiredProfile,
  completeRequiredProfile,
  createRequiredProfileJob,
  findRequiredProfileUser,
  registerRequiredProfileApplicant,
  verifyRequiredProfileAutofill,
  verifyRequiredProfileBlockedRoutes,
  verifyRequiredProfileGuards,
  verifyRequiredProfileSignIn,
  verifyRequiredProfileUpload,
} from "./support/required-profile-journey";

const key = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(!key, "Requires local synthetic admin fixtures and Mailpit.");

test("verified signup is profile-only until required details save, then applications autofill", async ({
  page,
  request,
  baseURL,
}) => {
  test.setTimeout(180_000);
  const admin = createClient("http://127.0.0.1:54321", key!, {
    auth: { persistSession: false },
  });
  const scenario = {
    jobId: crypto.randomUUID(),
    email: `onboarding52-${crypto.randomUUID()}@example.test`,
    password: "SyntheticOnboarding9!",
    userId: undefined as string | undefined,
  };
  try {
    await createRequiredProfileJob(admin, scenario.jobId);
    await registerRequiredProfileApplicant(
      page,
      request,
      scenario.email,
      scenario.password,
    );
    scenario.userId = await findRequiredProfileUser(admin, scenario.email);
    await verifyRequiredProfileGuards(page, scenario.email);
    await verifyRequiredProfileBlockedRoutes(
      page,
      admin,
      baseURL,
      scenario.jobId,
      scenario.userId,
    );
    await verifyRequiredProfileUpload(page);
    await completeRequiredProfile(page, admin, scenario.userId);
    await verifyRequiredProfileAutofill(page, scenario.jobId, scenario.email);
    await verifyRequiredProfileSignIn(page, scenario.email, scenario.password);
  } finally {
    await cleanupRequiredProfile(
      admin,
      scenario.jobId,
      scenario.email,
      scenario.userId,
    );
  }
});
