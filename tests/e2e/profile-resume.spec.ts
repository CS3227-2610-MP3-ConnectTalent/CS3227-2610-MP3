import { createClient } from "@supabase/supabase-js";
import {
  test,
  type Browser,
  type BrowserContext,
  type Page,
} from "@playwright/test";
import type { AdminClient } from "./support/admin-client";
import {
  cleanupProfileFixture,
  createProfileFixture,
  createProfileJob,
  createProfileUsers,
  promoteProfileHR,
} from "./support/profile-resume-fixture";
import {
  runApplicantResumeFlow,
  submitAndReviewApplication,
  verifyProfileDoesNotOverwriteApplication,
  verifyRoleBoundaries,
} from "./support/profile-resume-journey";

const adminKey = process.env.TEST_SUPABASE_SERVICE_ROLE_KEY;
test.skip(
  !adminKey,
  "Local synthetic profile/resume test requires local admin key.",
);

test("profile prefill, private PDF, submission freeze and HR access", async ({
  page,
  browser,
  baseURL,
}) => runProfileResumeScenario(page, browser, baseURL));

async function runProfileResumeScenario(
  page: Page,
  browser: Browser,
  baseURL: string | undefined,
) {
  test.setTimeout(150_000);
  const admin: AdminClient = createClient("http://127.0.0.1:54321", adminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = createProfileFixture();
  const users: string[] = [];
  let applicationId: string | undefined;
  let hrContext: BrowserContext | undefined;
  let otherContext: BrowserContext | undefined;
  try {
    await createProfileUsers(admin, fixture, users);
    await promoteProfileHR(admin, users[1]);
    await createProfileJob(admin, fixture.jobId);
    applicationId = await runApplicantResumeFlow(page, admin, fixture, baseURL);
    hrContext = await browser.newContext({ baseURL });
    otherContext = await browser.newContext({ baseURL });
    const hr = await hrContext.newPage();
    const other = await otherContext.newPage();
    await verifyRoleBoundaries(hr, other, fixture, applicationId);
    await verifyProfileDoesNotOverwriteApplication(page, fixture.jobId);
    await submitAndReviewApplication(
      page,
      hr,
      admin,
      fixture.jobId,
      applicationId,
      baseURL,
    );
  } finally {
    await hrContext?.close();
    await otherContext?.close();
    await cleanupProfileFixture(admin, fixture.jobId, applicationId, users);
  }
}
