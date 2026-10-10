import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { expect } from "@playwright/test";
import type { AdminClient } from "./admin-client";

export type WithdrawalFixture = {
  emails: [string, string, string];
  jobId: string;
  password: string;
  pdf: Buffer;
  users: string[];
  applicationId?: string;
};

export async function createWithdrawalFixture(): Promise<WithdrawalFixture> {
  const suffix = crypto.randomUUID();
  const document = await PDFDocument.create();
  document.addPage();
  return {
    emails: [
      `withdraw50-${suffix}@example.test`,
      `withdraw50-hr-${suffix}@example.test`,
      `withdraw50-other-${suffix}@example.test`,
    ],
    jobId: crypto.randomUUID(),
    password: "SyntheticCorrectHorse9!",
    pdf: Buffer.from(await document.save()),
    users: [],
  };
}

async function createUser(admin: AdminClient, email: string, password: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  expect(error).toBeNull();
  return data.user!.id;
}

async function createApplicantProfile(
  adminKey: string,
  email: string,
  password: string,
) {
  const fixture = createClient("http://127.0.0.1:54321", adminKey, {
    auth: { persistSession: false },
  });
  const { error: signInError } = await fixture.auth.signInWithPassword({
    email,
    password,
  });
  expect(signInError).toBeNull();
  const { error } = await fixture.rpc("save_applicant_profile", {
    p_full_name: "Fixture Applicant",
    p_phone: "+6591234567",
    p_portfolio_url: null,
    p_education: null,
    p_work_experience: null,
  });
  expect(error).toBeNull();
}

async function seedRoleProfiles(
  admin: AdminClient,
  adminKey: string,
  fixture: WithdrawalFixture,
) {
  const [applicantEmail, , otherEmail] = fixture.emails;
  for (const email of fixture.emails) {
    fixture.users.push(await createUser(admin, email, fixture.password));
  }
  await createApplicantProfile(adminKey, applicantEmail, fixture.password);
  await createApplicantProfile(adminKey, otherEmail, fixture.password);
  const { error } = await admin
    .from("profiles")
    .update({ role: "hr" })
    .eq("user_id", fixture.users[1]);
  expect(error).toBeNull();
}

async function seedWithdrawalJob(
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  const { error } = await admin.from("jobs").insert({
    id: fixture.jobId,
    title: `Withdrawal role ${fixture.jobId}`,
    team: "Synthetic Platform",
    category: "engineering",
    description: "Synthetic",
    requirements: "Synthetic requirements",
    status: "published",
    published_at: new Date().toISOString(),
  });
  expect(error).toBeNull();
}

export async function seedWithdrawalFixture(
  admin: AdminClient,
  adminKey: string,
  fixture: WithdrawalFixture,
) {
  await seedRoleProfiles(admin, adminKey, fixture);
  await seedWithdrawalJob(admin, fixture);
}

async function removeApplicationResume(
  admin: AdminClient,
  applicationId: string,
) {
  const { data: objects } = await admin
    .from("application_resume_objects")
    .select("object_path")
    .eq("application_id", applicationId);
  if (objects?.length) {
    await admin.storage
      .from("application-resumes")
      .remove(objects.map((row) => row.object_path));
  }
}

async function removeWithdrawalApplication(
  admin: AdminClient,
  applicationId: string | undefined,
) {
  if (!applicationId) return;
  await removeApplicationResume(admin, applicationId);
  const { error } = await admin
    .from("applications")
    .delete()
    .eq("id", applicationId);
  expect(error).toBeNull();
}

export async function cleanupWithdrawalFixture(
  admin: AdminClient,
  fixture: WithdrawalFixture,
) {
  await removeWithdrawalApplication(admin, fixture.applicationId);
  await admin.from("jobs").delete().eq("id", fixture.jobId);
  for (const userId of fixture.users) await admin.auth.admin.deleteUser(userId);
}
