import { afterEach, expect, it, vi } from "vitest";

import { listPublishedJobs } from "@/lib/jobs";

const job = {
  id: "00000000-0000-4000-8000-000000000101",
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build accessible web tools.",
  requirements: "TypeScript and testing experience.",
};

type RequestDetails = {
  offset: string | null;
  limit: string | null;
  order: string | null;
  status: string | null;
};

function makeJobs(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    ...job,
    id: `00000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
  }));
}

function createPagedFetch(
  jobs: ReturnType<typeof makeJobs>,
  requests: RequestDetails[],
) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const request = input instanceof Request ? input : new Request(input, init);
    const url = new URL(request.url);
    const offset = url.searchParams.get("offset");
    const limit = url.searchParams.get("limit");
    requests.push({
      offset,
      limit,
      order: url.searchParams.get("order"),
      status: url.searchParams.get("status"),
    });
    const start = Number(offset ?? 0);
    return new Response(
      JSON.stringify(jobs.slice(start, start + Number(limit))),
      {
        status: 200,
        headers: { "content-type": "application/json" },
      },
    );
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

it("loads published jobs across stable Supabase offset pages", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  const requests: RequestDetails[] = [];
  vi.stubGlobal("fetch", createPagedFetch(makeJobs(501), requests));

  await expect(listPublishedJobs("engineering")).resolves.toHaveLength(501);

  expect(requests).toEqual([
    {
      offset: "0",
      limit: "500",
      order: "published_at.desc,id.desc",
      status: "eq.published",
    },
    {
      offset: "500",
      limit: "500",
      order: "published_at.desc,id.desc",
      status: "eq.published",
    },
  ]);
});
