import { createClient } from "@supabase/supabase-js";
import { expect } from "@playwright/test";
import type { AdminClient } from "./admin-client";
export type ProfileFixture = {
  password: string;
  emails: [string, string, string];
  jobId: string;
};

export function createProfileFixture(): ProfileFixture {
  const suffix = crypto.randomUUID();
  return {
    password: "SyntheticCorrectHorse9!",
    emails: [
      `profile44-${suffix}@example.test`,
      `profile44-hr-${suffix}@example.test`,
      `profile44-other-${suffix}@example.test`,
    ],
    jobId: crypto.randomUUID(),
  };
}

export async function createProfileUsers(
  admin: AdminClient,
  fixture: ProfileFixture,
  users: string[],
) {
  for (const email of fixture.emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    users.push(data.user!.id);
  }
}

export async function promoteProfileHR(admin: AdminClient, userId: string) {
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", userId);
  expect(error).toBeNull();
}

export async function createApplicantProfile(
  adminKey: string,
  email: string,
  password: string,
) {
  const applicant = createClient("http://127.0.0.1:54321", adminKey, {
    auth: { persistSession: false },
  });
  const { error: signInError } = await applicant.auth.signInWithPassword({
    email,
    password,
  });
  expect(signInError).toBeNull();
  const { error } = await applicant.rpc("save_applicant_profile", {
    p_full_name: "Fixture Applicant",
    p_phone: "+6591234567",
    p_portfolio_url: null,
    p_education: null,
    p_work_experience: null,
  });
  expect(error).toBeNull();
}

export async function createProfileJob(admin: AdminClient, jobId: string) {
  const { error } = await admin.from("jobs").insert({
    id: jobId,
    title: `Profile role ${jobId}`,
    team: "Synthetic Platform",
    category: "engineering",
    description: "Synthetic",
    requirements: "Synthetic",
    status: "published",
    published_at: new Date().toISOString(),
  });
  expect(error).toBeNull();
}

export async function cleanupProfileFixture(
  admin: AdminClient,
  jobId: string,
  applicationId: string | undefined,
  users: string[],
) {
  if (applicationId) {
    const { data: objects } = await admin
      .from("application_resume_objects")
      .select("object_path")
      .eq("application_id", applicationId);
    if (objects?.length)
      await admin.storage
        .from("application-resumes")
        .remove(objects.map((row) => row.object_path));
    const { error } = await admin
      .from("applications")
      .delete()
      .eq("id", applicationId);
    expect(error).toBeNull();
  }
  await admin.from("jobs").delete().eq("id", jobId);
  for (const user of users) await admin.auth.admin.deleteUser(user);
}
