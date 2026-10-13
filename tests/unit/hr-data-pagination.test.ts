import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({ requireHR: vi.fn() }));

vi.mock("@/lib/hr-auth", () => ({ requireHR: auth.requireHR }));

import { listSubmittedApplications } from "@/lib/hr-applications";
import { listHRJobs } from "@/lib/hr-jobs";

type PageResponse = {
  data: unknown;
  error: { message: string } | null;
};
type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  range: (from: number, to: number) => Promise<PageResponse>;
};

const actorId = "44000000-0000-4000-8000-000000000111";
const jobId = "44000000-0000-4000-8000-000000000112";

function rowsByPage(rows: unknown[]) {
  return new Map(
    Array.from({ length: Math.ceil(rows.length / 500) }, (_, index) => {
      const from = index * 500;
      return [from, { data: rows.slice(from, from + 500), error: null }];
    }),
  );
}

function configureHRPages(pages: Map<number, PageResponse>) {
  const ranges: Array<[number, number]> = [];
  const builder: QueryBuilder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    range: async (from, to) => {
      ranges.push([from, to]);
      return pages.get(from) ?? { data: [], error: null };
    },
  };
  auth.requireHR.mockResolvedValue({
    client: { from: vi.fn(() => builder) },
    user: { id: actorId },
  });
  return ranges;
}

function makeJobs(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `44000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    title: `Synthetic job ${index + 1}`,
    team: "Synthetic team",
    category: "engineering",
    description: "Synthetic description.",
    requirements: "Synthetic requirements.",
    status: "published",
    created_at: "2026-10-10T00:00:00Z",
    published_at: "2026-10-10T00:00:00Z",
  }));
}

function makeApplications(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    withdrawn_at: null,
    withdrawn_by: null,
    id: `45000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    applicant_id: actorId,
    job_id: jobId,
    job_title: "Synthetic job",
    submitted_at: "2026-10-10T00:00:00Z",
    review_status: "submitted",
  }));
}

beforeEach(() => vi.clearAllMocks());

it("loads all HR jobs when the collection spans multiple response pages", async () => {
  const jobs = makeJobs(501);
  const ranges = configureHRPages(rowsByPage(jobs));

  await expect(listHRJobs()).resolves.toHaveLength(501);

  expect(ranges).toEqual([
    [0, 499],
    [500, 999],
  ]);
});

it("loads all submitted applications when the collection spans multiple pages", async () => {
  const applications = makeApplications(501);
  const ranges = configureHRPages(rowsByPage(applications));

  await expect(listSubmittedApplications()).resolves.toHaveLength(501);

  expect(ranges).toEqual([
    [0, 499],
    [500, 999],
  ]);
});

it("fails the full HR application read when a later page fails", async () => {
  const applications = makeApplications(500);
  const ranges = configureHRPages(
    new Map([
      [0, { data: applications, error: null }],
      [500, { data: null, error: { message: "synthetic later-page failure" } }],
    ]),
  );

  await expect(listSubmittedApplications()).rejects.toThrow(
    "Review data is unavailable",
  );
  expect(ranges).toEqual([
    [0, 499],
    [500, 999],
  ]);
});
