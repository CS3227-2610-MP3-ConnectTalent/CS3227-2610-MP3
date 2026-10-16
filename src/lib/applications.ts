import { z } from "zod";

import { requireApplicant } from "@/lib/auth";
import { hrReviewStatusSchema } from "@/lib/hr-input";
import { fetchAllPages, sortByTimestampAndId } from "@/lib/supabase/pagination";

const applicationSchema = z.object({
  withdrawn_at: z.string().nullable(),
  withdrawn_by: z.uuid().nullable(),
  education: z.string().nullable(),
  work_experience: z.string().nullable(),
  full_name: z.string().nullable(),
  submitted_email: z.string().nullable(),
  phone: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  id: z.uuid(),
  job_id: z.uuid(),
  job_title: z.string(),
  submission_state: z.enum(["draft", "submitted"]),
  cover_letter: z.string(),
  original_submitted_letter: z.string().nullable(),
  submitted_at: z.string().nullable(),
  updated_at: z.string(),
  revision: z.number().int().positive(),
  review_status: hrReviewStatusSchema.nullable(),
});

export type ApplicantApplication = z.infer<typeof applicationSchema>;

const fields =
  "withdrawn_at,withdrawn_by,education,work_experience,full_name,submitted_email,phone,portfolio_url,id,job_id,job_title,submission_state,cover_letter,original_submitted_letter,submitted_at,updated_at,revision,review_status";

export async function listOwnApplications(): Promise<ApplicantApplication[]> {
  const { client, user } = await requireApplicant();
  let data: unknown[];
  try {
    data = await fetchAllPages((afterId, pageSize) => {
      let query = client
        .from("applications")
        .select(fields)
        .eq("applicant_id", user.id);
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch {
    throw new Error("Unable to load applications.");
  }
  return sortByTimestampAndId(
    applicationSchema.array().parse(data),
    (application) => application.updated_at,
    false,
  );
}

export async function getOwnApplication(
  id: string,
): Promise<ApplicantApplication | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const { client, user } = await requireApplicant();
  const { data, error } = await client
    .from("applications")
    .select(fields)
    .eq("applicant_id", user.id)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Unable to load application.");
  return data ? applicationSchema.parse(data) : null;
}

export async function getOwnApplicationForJob(
  jobId: string,
): Promise<ApplicantApplication | null> {
  if (!z.uuid().safeParse(jobId).success) return null;
  const { client, user } = await requireApplicant();
  const { data, error } = await client
    .from("applications")
    .select(fields)
    .eq("applicant_id", user.id)
    .eq("job_id", jobId)
    .is("withdrawn_at", null)
    .maybeSingle();
  if (error) throw new Error("Unable to load application.");
  return data ? applicationSchema.parse(data) : null;
}
