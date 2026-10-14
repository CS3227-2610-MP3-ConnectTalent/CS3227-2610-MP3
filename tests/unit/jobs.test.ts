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
