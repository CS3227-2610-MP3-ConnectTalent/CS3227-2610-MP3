import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireHR: vi.fn() }));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));

import {
  listDistinctApplicationJobs,
  listDistinctJobsFromApplications,
  listSubmittedApplications,
} from "@/lib/hr-applications";

function createMockBuilder(data: unknown[] = []) {
  const builder: Record<string, ReturnType<typeof vi.fn>> = {
    select: vi.fn(),
    eq: vi.fn(),
    is: vi.fn(),
    not: vi.fn(),
    ilike: vi.fn(),
    order: vi.fn(),
    gt: vi.fn(),
    limit: vi.fn(),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.is.mockReturnValue(builder);
  builder.not.mockReturnValue(builder);
  builder.ilike.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.gt.mockReturnValue(builder);
  builder.limit.mockResolvedValue({ data, error: null });
  return builder;
}

beforeEach(() => {
  vi.clearAllMocks();
});

it("returns job IDs and full_name from the authorized submitted-application list query", async () => {
  const jobId = "44000000-0000-4000-8000-000000000103";
  const row = {
    id: "44000000-0000-4000-8000-000000000101",
    applicant_id: "44000000-0000-4000-8000-000000000102",
    full_name: "John Doe",
    job_id: jobId,
    job_title: "Synthetic role",
    submitted_at: "2026-10-10T00:00:00Z",
    withdrawn_at: null,
    withdrawn_by: null,
    review_status: "submitted",
  };
  const builder = createMockBuilder([row]);
  mocks.requireHR.mockResolvedValue({
    client: { from: () => builder },
  });

  const applications = await listSubmittedApplications();

  expect(builder.select).toHaveBeenCalledWith(
    expect.stringContaining("full_name"),
  );
  expect(builder.select).toHaveBeenCalledWith(
    expect.stringContaining("job_id"),
  );
  expect(builder.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(builder.limit).toHaveBeenCalledWith(500);
  expect(applications[0]).toMatchObject({
    job_id: jobId,
    full_name: "John Doe",
  });
});

it("applies pushdown query filters for job, status, withdrawal, and name", async () => {
  const builder = createMockBuilder([]);
  mocks.requireHR.mockResolvedValue({ client: { from: () => builder } });

  await listSubmittedApplications({
    jobId: "44000000-0000-4000-8000-000000000103",
    status: "shortlisted",
    withdrawal: "active",
    nameQuery: "John",
  });

  expect(builder.is).toHaveBeenCalledWith("withdrawn_at", null);
  expect(builder.eq).toHaveBeenCalledWith(
    "job_id",
    "44000000-0000-4000-8000-000000000103",
  );
  expect(builder.eq).toHaveBeenCalledWith("review_status", "shortlisted");
  expect(builder.ilike).toHaveBeenCalledWith("full_name", "%John%");

  await listSubmittedApplications({ withdrawal: "withdrawn" });
  expect(builder.not).toHaveBeenCalledWith("withdrawn_at", "is", null);
});

it("queries and returns distinct jobs from submitted applications", async () => {
  const rows = [
    { id: "1", job_id: "job-2", job_title: "Software Engineer" },
    { id: "2", job_id: "job-1", job_title: "DevOps Engineer" },
    { id: "3", job_id: "job-2", job_title: "Software Engineer" },
  ];
  const builder = createMockBuilder(rows);
  mocks.requireHR.mockResolvedValue({ client: { from: () => builder } });

  const jobs = await listDistinctApplicationJobs();
  expect(builder.select).toHaveBeenCalledWith("id,job_id,job_title");
  expect(builder.eq).toHaveBeenCalledWith("submission_state", "submitted");
  expect(jobs).toEqual([
    { id: "job-1", title: "DevOps Engineer" },
    { id: "job-2", title: "Software Engineer" },
  ]);
});

it("extracts distinct sorted jobs from application items", () => {
  const distinct = listDistinctJobsFromApplications([
    { job_id: "job-2", job_title: "Software Engineer" },
    { job_id: "job-1", job_title: "DevOps Engineer" },
    { job_id: "job-2", job_title: "Software Engineer" },
  ]);
  expect(distinct).toEqual([
    { id: "job-1", title: "DevOps Engineer" },
    { id: "job-2", title: "Software Engineer" },
  ]);
});
