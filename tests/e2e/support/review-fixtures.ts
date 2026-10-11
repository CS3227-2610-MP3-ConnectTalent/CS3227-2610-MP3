import { expect } from "@playwright/test";
import { saveCompleteApplicantProfiles } from "./profile-fixtures";
import type { AdminClient } from "./admin-client";

export type ReviewFixture = {
  password: string;
  applicantEmail: string;
  hrEmail: string;
  otherEmail: string;
  submittedJobId: string;
  draftJobId: string;
  submittedTitle: string;
  draftTitle: string;
  userIds: string[];
};

export async function createReviewUsers(
  admin: AdminClient,
  serviceRoleKey: string,
  fixture: ReviewFixture,
) {
  for (const email of [
    fixture.applicantEmail,
    fixture.hrEmail,
    fixture.otherEmail,
  ]) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    if (data.user) fixture.userIds.push(data.user.id);
  }
  await saveCompleteApplicantProfiles(serviceRoleKey, fixture.password, [
    {
      email: fixture.applicantEmail,
      fullName: "Synthetic HR review Applicant",
    },
    { email: fixture.otherEmail, fullName: "Synthetic other Applicant" },
  ]);
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", fixture.userIds[1]);
  expect(error).toBeNull();
}
