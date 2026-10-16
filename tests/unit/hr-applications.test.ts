import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireHR: vi.fn() }));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));

import {
  listDistinctJobsFromApplications,
  listSubmittedApplications,
} from "@/lib/hr-applications";

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
  const builder = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    gt: vi.fn(),
    limit: vi.fn().mockResolvedValue({ data: [row], error: null }),
  };
  builder.select.mockReturnValue(builder);
  builder.eq.mockReturnValue(builder);
  builder.order.mockReturnValue(builder);
  builder.gt.mockReturnValue(builder);
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
