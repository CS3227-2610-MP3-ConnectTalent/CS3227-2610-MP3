import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;
type AiContext =
  | { status: "anonymous" | "forbidden" }
  | { status: "authorized"; client: ServerClient; user: { id: string } };

const publishedJobSchema = z.object({
  id: z.uuid(),
  title: z.string().trim().min(1).max(160),
  requirements: z.string().max(10_000),
}).strict();

const submittedApplicationSchema = z.object({
  id: z.uuid(),
  job_id: z.uuid(),
  cover_letter: z.string().max(5000),
}).strict();

const requirementsSchema = z.string().min(1).max(10_000);

async function getRoleContext(role: "applicant" | "hr"): Promise<AiContext> {
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) return { status: "anonymous" };
  if (!user.email_confirmed_at) return { status: "forbidden" };

  const { data: profile, error: profileError } = await client.from("profiles")
    .select("role").eq("user_id", user.id).maybeSingle();
  if (profileError) throw new Error("AI authorization data is unavailable.");
  if (profile?.role !== role) return { status: "forbidden" };
  return { status: "authorized", client, user: { id: user.id } };
}

export async function getApplicantContext() {
  return getRoleContext("applicant");
}

export async function getHrContext() {
  return getRoleContext("hr");
}

export async function getPublishedJob(client: SupabaseClient, jobId: string) {
  const { data, error } = await client.from("jobs")
    .select("id,title,requirements")
    .eq("id", jobId)
    .eq("status", "published")
    .maybeSingle();
  if (error) throw new Error("Selected job is unavailable.");
  if (!data) return null;
  return publishedJobSchema.parse(data);
}

export async function getSubmittedApplication(client: SupabaseClient, applicationId: string) {
  const { data, error } = await client.from("applications")
    .select("id,job_id,cover_letter")
    .eq("id", applicationId)
    .eq("submission_state", "submitted")
    .maybeSingle();
  if (error) throw new Error("Selected application is unavailable.");
  if (!data) return null;

  const application = submittedApplicationSchema.parse(data);
  const { data: requirements, error: requirementsError } = await client.rpc(
    "get_submitted_application_requirements",
    { p_application_id: application.id },
  );
  if (requirementsError) throw new Error("Selected application requirements are unavailable.");

  return {
    id: application.id,
    coverLetter: application.cover_letter,
    requirements: requirementsSchema.parse(requirements),
  };
}
