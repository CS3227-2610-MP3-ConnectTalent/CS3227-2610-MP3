import { afterEach, describe, expect, it, vi } from "vitest";

import { isJobCategory } from "../../src/lib/job-categories";
import { getPublishedJob, listPublishedJobs } from "../../src/lib/jobs";

const job = {
  id: "00000000-0000-4000-8000-000000000101",
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build accessible web tools.",
  requirements: "TypeScript and testing experience.",
};

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe("public job queries", () => {
  it("restricts the listing query to published jobs and the requested category", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      expect(url.pathname).toBe("/rest/v1/jobs");
      expect(url.searchParams.get("status")).toBe("eq.published");
      expect(url.searchParams.get("category")).toBe("eq.engineering");
      return new Response(JSON.stringify([job]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(listPublishedJobs("engineering")).resolves.toEqual([job]);
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("restricts a direct detail query to a published job ID", async () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      expect(url.searchParams.get("status")).toBe("eq.published");
      expect(url.searchParams.get("id")).toBe(`eq.${job.id}`);
      return new Response(JSON.stringify(job), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    });
    vi.stubGlobal("fetch", fetchMock);

    await expect(getPublishedJob(job.id)).resolves.toEqual(job);
    await expect(getPublishedJob("not-a-uuid")).resolves.toBeNull();
    expect(fetchMock).toHaveBeenCalledOnce();
  });

  it("rejects unknown category values before a database query", () => {
    expect(isJobCategory("engineering")).toBe(true);
    expect(isJobCategory("engineering,legal")).toBe(false);
    expect(isJobCategory(["engineering", "legal"])).toBe(false);
  });
});
