import { createClient } from "@supabase/supabase-js";
import { z } from "zod";

import { JOB_CATEGORIES, type JobCategory } from "./job-categories";
import { fetchAllPages, sortByTimestampAndId } from "./supabase/pagination";
import { matchesJobSearch, parseJobSearch } from "./job-search";

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
  closes_at: z.string().nullable().optional(),
});

export type PublishedJob = z.infer<typeof jobSchema>;

const publishedJobRowSchema = jobSchema.extend({
  published_at: z.string(),
  opens_at: z.string().nullable().optional(),
});

const publicFields =
  "id,title,team,category,description,requirements,published_at,opens_at,closes_at";
const legacyPublicFields =
  "id,title,team,category,description,requirements,published_at";

function isMissingColumnError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const code = "code" in error ? (error as { code: unknown }).code : undefined;
  const message =
    "message" in error ? (error as { message: unknown }).message : undefined;
  return (
    code === "42703" ||
    (typeof message === "string" && message.includes("does not exist"))
  );
}

function isJobInActiveWindow(
  row: { opens_at?: string | null; closes_at?: string | null },
  now: number = Date.now(),
): boolean {
  if (row.opens_at && new Date(row.opens_at).getTime() > now) return false;
  if (row.closes_at && new Date(row.closes_at).getTime() <= now) return false;
  return true;
}

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

async function fetchPublishedJobRows(
  client: ReturnType<typeof publicClient>,
  category?: JobCategory,
): Promise<unknown[]> {
  try {
    return await fetchAllPages((afterId, pageSize) => {
      let query = client
        .from("jobs")
        .select(publicFields)
        .eq("status", "published");
      if (category) query = query.eq("category", category);
      if (afterId !== null) query = query.gt("id", afterId);
      return query.order("id", { ascending: true }).limit(pageSize);
    });
  } catch (error) {
    if (!isMissingColumnError(error)) {
      throw new Error("Unable to load published jobs.", { cause: error });
    }
    try {
      return await fetchAllPages((afterId, pageSize) => {
        let query = client
          .from("jobs")
          .select(legacyPublicFields)
          .eq("status", "published");
        if (category) query = query.eq("category", category);
        if (afterId !== null) query = query.gt("id", afterId);
        return query.order("id", { ascending: true }).limit(pageSize);
      });
    } catch (fallbackError) {
      throw new Error("Unable to load published jobs.", {
        cause: fallbackError,
      });
    }
  }
}

export async function listPublishedJobs(
  category?: JobCategory,
  search?: string,
): Promise<PublishedJob[]> {
  const { query: phrase, invalid } = parseJobSearch(search);
  if (invalid) throw new Error("Invalid job search.");
  const data = await fetchPublishedJobRows(publicClient(), category);
  return sortByTimestampAndId(
    publishedJobRowSchema.array().parse(data),
    (row) => row.published_at,
    false,
  )
    .filter((row) => isJobInActiveWindow(row))
    .map((row) => jobSchema.parse(row))
    .filter((row) => matchesJobSearch(row, phrase));
}

export async function getPublishedJob(
  id: string,
): Promise<PublishedJob | null> {
  if (!z.uuid().safeParse(id).success) {
    return null;
  }

  let { data, error } = await publicClient()
    .from("jobs")
    .select(publicFields)
    .eq("status", "published")
    .eq("id", id)
    .maybeSingle();

  if (error && isMissingColumnError(error)) {
    ({ data, error } = await publicClient()
      .from("jobs")
      .select(legacyPublicFields)
      .eq("status", "published")
      .eq("id", id)
      .maybeSingle());
  }

  if (error) {
    throw new Error("Unable to load the selected job.", { cause: error });
  }

  const parsed = data ? publishedJobRowSchema.parse(data) : null;
  if (!parsed || !isJobInActiveWindow(parsed)) {
    return null;
  }

  return jobSchema.parse(parsed);
}
