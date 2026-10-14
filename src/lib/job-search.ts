import type { PublishedJob } from "./jobs";

export const JOB_SEARCH_LIMIT = 100;
export const JOB_SEARCH_DELAY = 300;
export const JOB_SEARCH_ERROR =
  "Use one search phrase of at most 100 characters without control characters.";

/** Distinguishes malformed history destinations while their server results load. */
export function invalidJobSearchKey(category: unknown, query: unknown) {
  return `invalid:${JSON.stringify([category ?? null, query ?? null])}`;
}

export function normalizeJobSearch(value: string) {
  return value.trim().replace(/\s+/gu, " ");
}

export function parseJobSearch(raw: unknown): {
  query: string;
  invalid: boolean;
} {
  if (raw === undefined) return { query: "", invalid: false };
  if (
    typeof raw !== "string" ||
    /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(raw)
  )
    return { query: "", invalid: true };
  const query = normalizeJobSearch(raw);
  return [...query].length <= JOB_SEARCH_LIMIT
    ? { query, invalid: false }
    : { query: "", invalid: true };
}

export function matchesJobSearch(job: PublishedJob, query: string) {
  const phrase = normalizeJobSearch(query).toLowerCase();
  return [job.title, job.team, job.description, job.requirements].some(
    (field) => normalizeJobSearch(field).toLowerCase().includes(phrase),
  );
}

export function jobSearchUrl(query: string, category?: string) {
  const params = new URLSearchParams();
  if (category) params.set("category", category);
  const phrase = normalizeJobSearch(query);
  if (phrase) params.set("q", phrase);
  const suffix = params.toString();
  return suffix ? `/?${suffix}` : "/";
}
