import { z } from "zod";

import { requireApplicant } from "@/lib/auth";

const applicationSchema = z.object({
  id: z.uuid(),
  job_id: z.uuid(),
  job_title: z.string(),
  submission_state: z.enum(["draft", "submitted"]),
  cover_letter: z.string(),
  original_submitted_letter: z.string().nullable(),
  submitted_at: z.string().nullable(),
  updated_at: z.string(),
  revision: z.number().int().positive(),
});

export type ApplicantApplication = z.infer<typeof applicationSchema>;

const fields = "id,job_id,job_title,submission_state,cover_letter,original_submitted_letter,submitted_at,updated_at,revision";

export async function listOwnApplications(): Promise<ApplicantApplication[]> {
  const { client, user } = await requireApplicant();
  const { data, error } = await client.from("applications").select(fields)
    .eq("applicant_id", user.id).order("updated_at", { ascending: false });
  if (error) throw new Error("Unable to load applications.");
  return applicationSchema.array().parse(data);
}

export async function getOwnApplication(id: string): Promise<ApplicantApplication | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const { client, user } = await requireApplicant();
  const { data, error } = await client.from("applications").select(fields)
    .eq("applicant_id", user.id).eq("id", id).maybeSingle();
  if (error) throw new Error("Unable to load application.");
  return data ? applicationSchema.parse(data) : null;
}

export async function getOwnApplicationForJob(jobId: string): Promise<ApplicantApplication | null> {
  if (!z.uuid().safeParse(jobId).success) return null;
  const { client, user } = await requireApplicant();
  const { data, error } = await client.from("applications").select(fields)
    .eq("applicant_id", user.id).eq("job_id", jobId).maybeSingle();
  if (error) throw new Error("Unable to load application.");
  return data ? applicationSchema.parse(data) : null;
}
