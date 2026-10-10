import { z } from "zod";

import { requireHR } from "@/lib/hr-auth";
import { hrReviewStatusSchema } from "@/lib/hr-input";

const listItemSchema = z.object({
  id: z.uuid(),
  applicant_id: z.uuid(),
  job_title: z.string(),
  submitted_at: z.string(),
  review_status: hrReviewStatusSchema,
});

const detailSchema = listItemSchema.extend({
  education: z.string().nullable(),
  work_experience: z.string().nullable(),
  full_name: z.string().nullable(),
  submitted_email: z.string().nullable(),
  phone: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  job_id: z.uuid(),
  original_submitted_letter: z.string(),
  cover_letter: z.string(),
  review_revision: z.number().int().positive(),
  revision: z.number().int().positive(),
});

const noteSchema = z.object({
  id: z.uuid(),
  author_id: z.uuid(),
  body: z.string(),
  created_at: z.string(),
});

const statusEventSchema = z.object({
  id: z.uuid(),
  actor_id: z.uuid(),
  from_status: hrReviewStatusSchema,
  to_status: hrReviewStatusSchema,
  created_at: z.string(),
});

export type HRApplication = z.infer<typeof detailSchema>;

export async function listSubmittedApplications() {
  const { client } = await requireHR();
  const { data, error } = await client
    .from("applications")
    .select("id,applicant_id,job_title,submitted_at,review_status")
    .eq("submission_state", "submitted")
    .order("submitted_at", { ascending: false });
  if (error) throw new Error("Review data is unavailable.");
  return listItemSchema.array().parse(data);
}

export async function getSubmittedApplication(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const { client } = await requireHR();
  const { data, error } = await client
    .from("applications")
    .select(
      "education,work_experience,full_name,submitted_email,phone,portfolio_url,id,applicant_id,job_id,job_title,submitted_at,review_status,review_revision,revision,original_submitted_letter,cover_letter",
    )
    .eq("id", id)
    .eq("submission_state", "submitted")
    .maybeSingle();
  if (error) throw new Error("Review data is unavailable.");
  return data ? detailSchema.parse(data) : null;
}

export async function listHRNotes(applicationId: string) {
  const { client } = await requireHR();
  const { data, error } = await client
    .from("application_notes")
    .select("id,author_id,body,created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Review data is unavailable.");
  return noteSchema.array().parse(data);
}

export async function listHRStatusEvents(applicationId: string) {
  const { client } = await requireHR();
  const { data, error } = await client
    .from("application_status_events")
    .select("id,actor_id,from_status,to_status,created_at")
    .eq("application_id", applicationId)
    .order("created_at", { ascending: true });
  if (error) throw new Error("Review data is unavailable.");
  return statusEventSchema.array().parse(data);
}
