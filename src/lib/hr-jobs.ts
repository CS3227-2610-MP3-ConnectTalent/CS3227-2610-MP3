import { z } from "zod";

import { requireHR } from "@/lib/hr-auth";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";
import { fetchAllPages, sortByTimestampAndId } from "@/lib/supabase/pagination";

const categories = JOB_CATEGORIES.map((category) => category.value) as [
  JobCategory,
  ...JobCategory[],
];

export const hrJobSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  team: z.string(),
  category: z.enum(categories),
  description: z.string(),
  requirements: z.string(),
  status: z.enum(["draft", "published", "closed"]),
  created_at: z.string(),
  published_at: z.string().nullable(),
  opens_at: z.string().nullable().optional(),
  closes_at: z.string().nullable().optional(),
});

export type HRJob = z.infer<typeof hrJobSchema>;

export type HROperationalJobStatus =
  "draft" | "scheduled" | "published" | "closed";

export function getHROperationalJobStatus(
  job: Pick<HRJob, "status" | "opens_at" | "closes_at">,
  now: Date = new Date(),
): HROperationalJobStatus {
  if (job.status === "draft") return "draft";
  if (job.status === "closed") return "closed";
  // status is 'published'
  if (job.opens_at && new Date(job.opens_at).getTime() > now.getTime()) {
    return "scheduled";
  }
  if (job.closes_at && new Date(job.closes_at).getTime() <= now.getTime()) {
    return "closed";
  }
  return "published";
}

const fields =
  "id,title,team,category,description,requirements,status,created_at,published_at,opens_at,closes_at";

export async function listHRJobs(): Promise<HRJob[]> {
  const { client } = await requireHR();
  let data: unknown[];
  try {
    data = await fetchAllPages((afterId, pageSize) => {
      let query = client.from("jobs").select(fields);
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch {
    throw new Error("Jobs are temporarily unavailable.");
  }
  return sortByTimestampAndId(
    hrJobSchema.array().parse(data),
    (job) => job.created_at,
    false,
  );
}

export async function getHRJob(id: string): Promise<HRJob | null> {
  if (!z.uuid().safeParse(id).success) return null;
  const { client } = await requireHR();
  const { data, error } = await client
    .from("jobs")
    .select(fields)
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error("Job is temporarily unavailable.");
  return data ? hrJobSchema.parse(data) : null;
}
