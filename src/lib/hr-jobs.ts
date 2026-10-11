import { z } from "zod";

import { requireHR } from "@/lib/hr-auth";
import { JOB_CATEGORIES, type JobCategory } from "@/lib/job-categories";

const categories = JOB_CATEGORIES.map((category) => category.value) as [
  JobCategory,
  ...JobCategory[],
];
const hrJobSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  team: z.string(),
  category: z.enum(categories),
  description: z.string(),
  requirements: z.string(),
  status: z.enum(["draft", "published", "closed"]),
  created_at: z.string(),
  published_at: z.string().nullable(),
});
export type HRJob = z.infer<typeof hrJobSchema>;
const fields =
  "id,title,team,category,description,requirements,status,created_at,published_at";

export async function listHRJobs(): Promise<HRJob[]> {
  const { client } = await requireHR();
  const { data, error } = await client
    .from("jobs")
    .select(fields)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Jobs are temporarily unavailable.");
  return hrJobSchema.array().parse(data);
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
