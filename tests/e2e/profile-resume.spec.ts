import { createClient } from "@supabase/supabase-js";
import { test } from "@playwright/test";
import {
  cleanupProfileFixture,
  createApplicantProfile,
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
}) => {
  test.setTimeout(150_000);
  const admin = createClient("http://127.0.0.1:54321", adminKey!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const fixture = createProfileFixture();
  const users: string[] = [];
  const contexts: Awaited<ReturnType<typeof browser.newContext>>[] = [];
  let applicationId: string | undefined;
  try {
    await createProfileUsers(admin, fixture, users);
    await createApplicantProfile(
      adminKey!,
      fixture.emails[0],
      fixture.password,
    );
    await createApplicantProfile(
      adminKey!,
      fixture.emails[2],
      fixture.password,
    );
    await promoteProfileHR(admin, users[1]);
    await createProfileJob(admin, fixture.jobId);
    applicationId = await runApplicantResumeFlow(page, admin, fixture, baseURL);
    const hrContext = await browser.newContext({ baseURL });
    const otherContext = await browser.newContext({ baseURL });
    contexts.push(hrContext, otherContext);
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
    for (const context of contexts) await context.close();
    await cleanupProfileFixture(admin, fixture.jobId, applicationId, users);
  }
});
