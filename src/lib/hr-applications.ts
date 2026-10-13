import { z } from "zod";

import { requireHR } from "@/lib/hr-auth";
import { hrReviewStatusSchema } from "@/lib/hr-input";
import { fetchAllPages, sortByTimestampAndId } from "@/lib/supabase/pagination";

const listItemSchema = z.object({
  withdrawn_at: z.string().nullable(),
  withdrawn_by: z.uuid().nullable(),
  id: z.uuid(),
  applicant_id: z.uuid(),
  job_id: z.uuid(),
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
  let data: unknown[];
  try {
    data = await fetchAllPages((afterId, pageSize) => {
      let query = client
        .from("applications")
        .select(
          "withdrawn_at,withdrawn_by,id,applicant_id,job_id,job_title,submitted_at,review_status",
        )
        .eq("submission_state", "submitted");
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch {
    throw new Error("Review data is unavailable.");
  }
  return sortByTimestampAndId(
    listItemSchema.array().parse(data),
    (application) => application.submitted_at,
    false,
  );
}

export async function getSubmittedApplication(id: string) {
  if (!z.uuid().safeParse(id).success) return null;
  const { client } = await requireHR();
  const { data, error } = await client
    .from("applications")
    .select(
      "withdrawn_at,withdrawn_by,education,work_experience,full_name,submitted_email,phone,portfolio_url,id,applicant_id,job_id,job_title,submitted_at,review_status,review_revision,revision,original_submitted_letter,cover_letter",
    )
    .eq("id", id)
    .eq("submission_state", "submitted")
    .maybeSingle();
  if (error) throw new Error("Review data is unavailable.");
  return data ? detailSchema.parse(data) : null;
}

export async function listHRNotes(applicationId: string) {
  const { client } = await requireHR();
  let data: unknown[];
  try {
    data = await fetchAllPages((afterId, pageSize) => {
      let query = client
        .from("application_notes")
        .select("id,author_id,body,created_at")
        .eq("application_id", applicationId);
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch {
    throw new Error("Review data is unavailable.");
  }
  return sortByTimestampAndId(
    noteSchema.array().parse(data),
    (note) => note.created_at,
    true,
  );
}

export async function listHRStatusEvents(applicationId: string) {
  const { client } = await requireHR();
  let data: unknown[];
  try {
    data = await fetchAllPages((afterId, pageSize) => {
      let query = client
        .from("application_status_events")
        .select("id,actor_id,from_status,to_status,created_at")
        .eq("application_id", applicationId);
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch {
    throw new Error("Review data is unavailable.");
  }
  return sortByTimestampAndId(
    statusEventSchema.array().parse(data),
    (event) => event.created_at,
    true,
  );
}
