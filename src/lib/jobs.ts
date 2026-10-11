import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { JOB_CATEGORIES, type JobCategory } from "./job-categories";

const categoryValues = JOB_CATEGORIES.map((category) => category.value) as [
  JobCategory,
  ...JobCategory[],
];

const jobSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  team: z.string(),
  category: z.enum(categoryValues),
  description: z.string(),
  requirements: z.string(),
});

export type PublishedJob = z.infer<typeof jobSchema>;

const publicFields = "id,title,team,category,description,requirements";

function publicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Supabase URL and publishable key are required to load jobs.",
    );
  }

  // The publishable key is subject to RLS. No privileged key is used for public reads.
  return createClient(url, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false,
    },
  });
}

export async function listPublishedJobs(
  category?: JobCategory,
): Promise<PublishedJob[]> {
  let query = publicClient()
    .from("jobs")
    .select(publicFields)
    .eq("status", "published");

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query.order("published_at", {
    ascending: false,
  });

  if (error) {
    throw new Error("Unable to load published jobs.", { cause: error });
  }

  return jobSchema.array().parse(data);
}

export async function getPublishedJob(
  id: string,
): Promise<PublishedJob | null> {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }

  const { data, error } = await publicClient()
    .from("jobs")
    .select(publicFields)
    .eq("status", "published")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to load the selected job.", { cause: error });
  }

  return data ? jobSchema.parse(data) : null;
}
