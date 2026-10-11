import { expect } from "@playwright/test";
import { saveCompleteApplicantProfiles } from "./profile-fixtures";
import type { AdminClient } from "./admin-client";

export type ContactFixture = {
  emails: [string, string, string];
  password: string;
  jobIds: [string, string];
};

export async function setupContactFixture(
  admin: AdminClient,
  serviceRoleKey: string,
  fixture: ContactFixture,
  userIds: string[],
) {
  for (const email of fixture.emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    userIds.push(data.user!.id);
  }
  await saveCompleteApplicantProfiles(serviceRoleKey, fixture.password, [
    { email: fixture.emails[0], fullName: "Synthetic Contact Applicant" },
    { email: fixture.emails[2], fullName: "Synthetic Other Applicant" },
  ]);
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", userIds[1]);
  expect(error).toBeNull();
  await createContactJobs(admin, fixture.jobIds);
}

async function createContactJobs(admin: AdminClient, jobIds: string[]) {
  for (const id of jobIds) {
    const { error } = await admin.from("jobs").insert({
      id,
      title: `Contact role ${id}`,
      team: "Platform",
      category: "engineering",
      description: "Synthetic",
      requirements: "Synthetic",
      status: "published",
      published_at: new Date().toISOString(),
    });
    expect(error).toBeNull();
  }
}
