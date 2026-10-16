import { afterEach, expect, it, vi } from "vitest";

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

function createFetchMock(verify: (url: URL) => void, data: unknown) {
  return vi.fn(async (input: RequestInfo | URL) => {
    const url = new URL(input instanceof Request ? input.url : String(input));
    verify(url);
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  });
}

const publicJobRow = {
  ...job,
  published_at: "2026-10-10T00:00:00Z",
};

it("restricts the listing query to published jobs and the requested category", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  const fetchMock = createFetchMock(
    (url) => {
      expect(url.pathname).toBe("/rest/v1/jobs");
      expect(url.searchParams.get("status")).toBe("eq.published");
      expect(url.searchParams.get("category")).toBe("eq.engineering");
    },
    [publicJobRow],
  );
  vi.stubGlobal("fetch", fetchMock);

  await expect(listPublishedJobs("engineering")).resolves.toEqual([job]);
  expect(fetchMock).toHaveBeenCalledOnce();
});

it("restricts a direct detail query to a published job ID", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  const fetchMock = createFetchMock((url) => {
    expect(url.searchParams.get("status")).toBe("eq.published");
    expect(url.searchParams.get("id")).toBe(`eq.${job.id}`);
  }, publicJobRow);
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

it("rejects overlong search before client configuration or network access", async () => {
  const fetch = vi.fn();
  vi.stubGlobal("fetch", fetch);
  await expect(listPublishedJobs(undefined, "a".repeat(101))).rejects.toThrow(
    "Invalid job search.",
  );
  expect(fetch).not.toHaveBeenCalled();
});

it("wraps reader failure in a generic job-loading error", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ message: "private diagnostic" }), {
        status: 400,
      }),
    ),
  );
  await expect(listPublishedJobs(undefined, "software")).rejects.toThrow(
    "Unable to load published jobs.",
  );
});

it.each([
  "software ENGINEER",
  " digital   products ",
  "accessible web",
  "TYPESCRIPT",
])(
  "searches public fields using a normalized literal phrase: %s",
  async (phrase) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubGlobal(
      "fetch",
      createFetchMock(
        (url) => {
          expect(url.searchParams.get("status")).toBe("eq.published");
          expect(url.searchParams.get("category")).toBe("eq.engineering");
          expect(url.searchParams.has("or")).toBe(false);
        },
        [
          publicJobRow,
          {
            ...publicJobRow,
            id: "00000000-0000-4000-8000-000000000102",
            title: "Unrelated",
            team: "Other",
            description: "None",
            requirements: "None",
          },
        ],
      ),
    );
    await expect(listPublishedJobs("engineering", phrase)).resolves.toEqual([
      job,
    ]);
  },
);

it.each(["%", "_", "(title.ilike.*)", "software typescript"])(
  "does not treat %s as query syntax or separate terms",
  async (phrase) => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
    vi.stubGlobal(
      "fetch",
      createFetchMock(() => {}, [publicJobRow]),
    );
    await expect(listPublishedJobs(undefined, phrase)).resolves.toEqual([]);
  },
);

it("excludes future-scheduled and expired jobs from public listings and detail", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  const futureJob = {
    ...publicJobRow,
    id: "00000000-0000-4000-8000-000000000103",
    opens_at: "2099-01-01T00:00:00Z",
  };
  const expiredJob = {
    ...publicJobRow,
    id: "00000000-0000-4000-8000-000000000104",
    closes_at: "2020-01-01T00:00:00Z",
  };
  const activeJob = {
    ...publicJobRow,
    id: "00000000-0000-4000-8000-000000000105",
    opens_at: "2020-01-01T00:00:00Z",
    closes_at: "2099-01-01T00:00:00Z",
  };

  vi.stubGlobal(
    "fetch",
    createFetchMock(() => {}, [futureJob, expiredJob, activeJob]),
  );

  const results = await listPublishedJobs();
  expect(results.map((j) => j.id)).toEqual([activeJob.id]);

  // Test getPublishedJob for future
  vi.stubGlobal(
    "fetch",
    createFetchMock(() => {}, futureJob),
  );
  await expect(getPublishedJob(futureJob.id)).resolves.toBeNull();

  // Test getPublishedJob for expired
  vi.stubGlobal(
    "fetch",
    createFetchMock(() => {}, expiredJob),
  );
  await expect(getPublishedJob(expiredJob.id)).resolves.toBeNull();
});

it("falls back gracefully when opens_at/closes_at columns do not exist in database", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://jobs.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");

  let callCount = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL) => {
      const url = new URL(input instanceof Request ? input.url : String(input));
      callCount++;
      if (url.searchParams.get("select")?.includes("opens_at")) {
        return new Response(
          JSON.stringify({
            code: "42703",
            message: "column jobs.opens_at does not exist",
          }),
          { status: 400, headers: { "content-type": "application/json" } },
        );
      }
      return new Response(JSON.stringify([publicJobRow]), {
        status: 200,
        headers: { "content-type": "application/json" },
      });
    }),
  );

  const results = await listPublishedJobs();
  expect(results).toEqual([job]);
  expect(callCount).toBe(2);
});
