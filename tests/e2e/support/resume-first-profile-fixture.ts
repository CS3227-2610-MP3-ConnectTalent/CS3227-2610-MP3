import { createClient } from "@supabase/supabase-js";
import { PDFDocument } from "pdf-lib";
import { expect } from "@playwright/test";
import type { AdminClient } from "./admin-client";

export type ResumeFirstFixture = {
  emails: [string, string];
  jobId: string;
  password: string;
  pdf: Buffer;
  users: string[];
};

export async function createResumeFirstPdf() {
  const document = await PDFDocument.create();
  document.addPage();
  return Buffer.from(await document.save());
}

export async function createResumeFirstFixture(): Promise<ResumeFirstFixture> {
  const suffix = crypto.randomUUID();
  return {
    emails: [
      `owner53-${suffix}@example.test`,
      `other53-${suffix}@example.test`,
    ],
    jobId: crypto.randomUUID(),
    password: "SyntheticCorrectHorse9!",
    pdf: await createResumeFirstPdf(),
    users: [],
  };
}

async function createApplicant(
  adminKey: string,
  email: string,
  password: string,
) {
  const fixture = createClient("http://127.0.0.1:54321", adminKey, {
    auth: { persistSession: false },
  });
  expect(
    (await fixture.auth.signInWithPassword({ email, password })).error,
  ).toBeNull();
  const { error: profileError } = await fixture.rpc("save_applicant_profile", {
    p_full_name: "Fixture Applicant",
    p_phone: "+6591234567",
    p_portfolio_url: null,
    p_education: null,
    p_work_experience: null,
  });
  expect(profileError).toBeNull();
}

async function createJob(admin: AdminClient, jobId: string) {
  const { error } = await admin.from("jobs").insert({
    id: jobId,
    title: `Upload first ${jobId}`,
    team: "Synthetic",
    category: "engineering",
    description: "Synthetic",
    requirements: "Synthetic",
    status: "published",
    published_at: new Date().toISOString(),
  });
  expect(error).toBeNull();
}

export async function seedResumeFirstFixture(
  admin: AdminClient,
  fixture: ResumeFirstFixture,
  adminKey: string,
) {
  for (const email of fixture.emails) {
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password: fixture.password,
      email_confirm: true,
    });
    expect(error).toBeNull();
    fixture.users.push(data.user!.id);
    await createApplicant(adminKey, email, fixture.password);
  }
  await createJob(admin, fixture.jobId);
}

async function removeApplicationResumeData(
  admin: AdminClient,
  applicantId: string,
) {
  const { data: objects } = await admin
    .from("application_resume_objects")
    .select("object_path")
    .eq("applicant_id", applicantId);
  if (objects?.length) {
    await admin.storage
      .from("application-resumes")
      .remove(objects.map((row) => row.object_path));
  }
  await admin.from("applications").delete().eq("applicant_id", applicantId);
}

async function removeProfileResumeData(
  admin: AdminClient,
  applicantId: string,
) {
  const { data: objects } = await admin
    .from("profile_resume_objects")
    .select("object_path")
    .eq("applicant_id", applicantId);
  if (objects?.length) {
    await admin.storage
      .from("profile-resumes")
      .remove(objects.map((row) => row.object_path));
  }
  await admin
    .from("applicant_profiles")
    .update({ resume_id: null })
    .eq("user_id", applicantId);
  await admin
    .from("profile_resume_objects")
    .delete()
    .eq("applicant_id", applicantId);
}

export async function cleanupResumeFirstFixture(
  admin: AdminClient,
  fixture: ResumeFirstFixture,
) {
  const [ownerId] = fixture.users;
  if (ownerId) {
    await removeApplicationResumeData(admin, ownerId);
    await removeProfileResumeData(admin, ownerId);
  }
  await admin.from("jobs").delete().eq("id", fixture.jobId);
  for (const userId of fixture.users) await admin.auth.admin.deleteUser(userId);
}
