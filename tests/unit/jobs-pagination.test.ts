import { afterEach, expect, it, vi } from "vitest";

import { listPublishedJobs } from "@/lib/jobs";

const job = {
  id: "00000000-0000-4000-8000-000000000002",
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build accessible web tools.",
  requirements: "TypeScript and testing experience.",
  published_at: "2026-10-01T00:00:00.000Z",
};

type RequestDetails = {
  cursor: string | null;
  offset: string | null;
  limit: string | null;
  order: string | null;
  status: string | null;
};

function makeJobs(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    ...job,
    id: `00000000-0000-4000-8000-${String((index + 1) * 2).padStart(12, "0")}`,
    published_at: new Date(Date.UTC(2026, 9, index + 1)).toISOString(),
  }));
}

function compareJobRows(
  left: ReturnType<typeof makeJobs>[number],
  right: ReturnType<typeof makeJobs>[number],
  order: string | null,
) {
  if (order === "published_at.desc,id.desc") {
    return (
      right.published_at.localeCompare(left.published_at) ||
      right.id.localeCompare(left.id)
    );
  }
  return left.id.localeCompare(right.id);
}

async function loadJobPage(
  input: RequestInfo | URL,
  init: RequestInit | undefined,
  jobs: ReturnType<typeof makeJobs>,
  requests: RequestDetails[],
  state: { inserted: boolean },
) {
  const request = input instanceof Request ? input : new Request(input, init);
  const url = new URL(request.url);
  const cursorFilter = url.searchParams.get("id");
  const cursor = cursorFilter?.startsWith("gt.")
    ? cursorFilter.slice("gt.".length)
    : null;
  const offset = url.searchParams.get("offset");
  const limit = url.searchParams.get("limit");
  const order = url.searchParams.get("order");
  requests.push({
    cursor,
    offset,
    limit,
    order,
    status: url.searchParams.get("status"),
  });

  const orderedJobs = [...jobs].sort((left, right) =>
    compareJobRows(left, right, order),
  );
  const filteredJobs = cursor
    ? orderedJobs.filter((row) => row.id > cursor)
    : orderedJobs;
  const start = cursor ? 0 : Number(offset ?? 0);
  const page = filteredJobs.slice(start, start + Number(limit));

  if (!state.inserted) {
    jobs.push({
      ...job,
      id: "00000000-0000-4000-8000-000000000999",
      published_at: "2027-01-01T00:00:00.000Z",
    });
    state.inserted = true;
  }

  return new Response(JSON.stringify(page), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
}

function createPagedFetch(
  initialJobs: ReturnType<typeof makeJobs>,
  requests: RequestDetails[],
) {
  const jobs = [...initialJobs];
  const state = { inserted: false };
  return vi.fn((input: RequestInfo | URL, init?: RequestInit) =>
    loadJobPage(input, init, jobs, requests, state),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("loads all published jobs without offset duplicates when an earlier ID is inserted", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  const requests: RequestDetails[] = [];
  const initialJobs = makeJobs(501);
  const expectedIds = initialJobs
    .slice()
    .sort((left, right) => right.published_at.localeCompare(left.published_at))
    .map(({ id }) => id);
  vi.stubGlobal("fetch", createPagedFetch(initialJobs, requests));

  const jobs = await listPublishedJobs("engineering");

  expect(jobs.map(({ id }) => id)).toEqual(expectedIds);
  expect(new Set(jobs.map(({ id }) => id)).size).toBe(501);
  expect(requests).toEqual([
    {
      cursor: null,
      offset: null,
      limit: "500",
      order: "id.asc",
      status: "eq.published",
    },
    {
      cursor: "00000000-0000-4000-8000-000000001000",
      offset: null,
      limit: "500",
      order: "id.asc",
      status: "eq.published",
    },
  ]);
});
