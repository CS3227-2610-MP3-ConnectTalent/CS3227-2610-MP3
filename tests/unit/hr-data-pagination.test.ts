import { beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  requireApplicant: vi.fn(),
  requireHR: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApplicant: auth.requireApplicant }));
vi.mock("@/lib/hr-auth", () => ({ requireHR: auth.requireHR }));

import { listOwnApplications } from "@/lib/applications";
import {
  listHRNotes,
  listHRStatusEvents,
  listSubmittedApplications,
} from "@/lib/hr-applications";
import { listHRJobs } from "@/lib/hr-jobs";

type PageResponse = {
  data: unknown;
  error: { message: string } | null;
};
type QueryBuilder = {
  select: (...args: unknown[]) => QueryBuilder;
  eq: (...args: unknown[]) => QueryBuilder;
  order: (...args: unknown[]) => QueryBuilder;
  gt: (field: string, value: string) => QueryBuilder;
  limit: (count: number) => Promise<PageResponse>;
};

const actorId = "44000000-0000-4000-8000-000000000111";
const jobId = "44000000-0000-4000-8000-000000000112";
const applicationId = "44000000-0000-4000-8000-000000000113";

function configurePages(rows: unknown[], failAfterId?: string) {
  const cursors: Array<string | null> = [];
  let activeCursor: string | null = null;
  const builder: QueryBuilder = {
    select: () => builder,
    eq: () => builder,
    order: () => builder,
    gt: (_field, value) => {
      activeCursor = value;
      return builder;
    },
    limit: async (pageSize) => {
      cursors.push(activeCursor);
      if (activeCursor === failAfterId) {
        return {
          data: null,
          error: { message: "synthetic later-page failure" },
        };
      }
      const page = [...rows]
        .filter((row) => {
          const id = (row as { id: string }).id;
          return activeCursor === null || id > activeCursor;
        })
        .sort((left, right) =>
          (left as { id: string }).id.localeCompare(
            (right as { id: string }).id,
          ),
        )
        .slice(0, pageSize);
      return { data: page, error: null };
    },
  };
  const client = {
    from: vi.fn(() => {
      activeCursor = null;
      return builder;
    }),
  };
  auth.requireApplicant.mockResolvedValue({ client, user: { id: actorId } });
  auth.requireHR.mockResolvedValue({ client, user: { id: actorId } });
  return cursors;
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

function makeApplicantApplications(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    withdrawn_at: null,
    withdrawn_by: null,
    education: "Synthetic university",
    work_experience: null,
    full_name: "Synthetic Applicant",
    submitted_email: "applicant@example.test",
    phone: null,
    portfolio_url: null,
    id: `46000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    job_id: jobId,
    job_title: "Synthetic job",
    submission_state: "submitted",
    cover_letter: "Synthetic letter",
    original_submitted_letter: "Synthetic letter",
    submitted_at: "2026-10-10T00:00:00Z",
    updated_at: "2026-10-10T00:00:00Z",
    revision: 1,
    review_status: "in_review",
  }));
}

function makeNotes(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `47000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    author_id: actorId,
    body: `Synthetic note ${index + 1}`,
    created_at: "2026-10-10T00:00:00Z",
  }));
}

function makeStatusEvents(count: number) {
  return Array.from({ length: count }, (_, index) => ({
    id: `48000000-0000-4000-8000-${String(index + 1).padStart(12, "0")}`,
    actor_id: actorId,
    from_status: "submitted",
    to_status: "in_review",
    created_at: "2026-10-10T00:00:00Z",
  }));
}

beforeEach(() => vi.clearAllMocks());

it("loads all HR jobs when the collection spans multiple response pages", async () => {
  const jobs = makeJobs(501);
  const cursors = configurePages(jobs);

  await expect(listHRJobs()).resolves.toHaveLength(501);

  expect(cursors).toEqual([null, jobs[499].id]);
});

it("loads all submitted applications when the collection spans multiple pages", async () => {
  const applications = makeApplications(501);
  const cursors = configurePages(applications);

  await expect(listSubmittedApplications()).resolves.toHaveLength(501);

  expect(cursors).toEqual([null, applications[499].id]);
});

it("fails the full HR application read when a later page fails", async () => {
  const applications = makeApplications(500);
  const cursors = configurePages(applications, applications[499].id);

  await expect(listSubmittedApplications()).rejects.toThrow(
    "Review data is unavailable",
  );
  expect(cursors).toEqual([null, applications[499].id]);
});

it("loads all Applicant applications through stable ID cursors", async () => {
  const applications = makeApplicantApplications(501);
  const cursors = configurePages(applications);

  await expect(listOwnApplications()).resolves.toHaveLength(501);
  expect(cursors).toEqual([null, applications[499].id]);
});

it("loads all HR notes through stable ID cursors", async () => {
  const notes = makeNotes(501);
  const cursors = configurePages(notes);

  await expect(listHRNotes(applicationId)).resolves.toHaveLength(501);
  expect(cursors).toEqual([null, notes[499].id]);
});

it("loads all HR status events through stable ID cursors", async () => {
  const events = makeStatusEvents(501);
  const cursors = configurePages(events);

  await expect(listHRStatusEvents(applicationId)).resolves.toHaveLength(501);
  expect(cursors).toEqual([null, events[499].id]);
});
