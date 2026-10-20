import { expect, it } from "vitest";

import { aggregateHRDashboard } from "@/lib/hr-dashboard";

const jobs = [
  {
    id: "44000000-0000-4000-8000-000000000101",
    title: "Software Engineer",
    status: "draft" as const,
  },
  {
    id: "44000000-0000-4000-8000-000000000102",
    title: "Software Engineer",
    status: "published" as const,
  },
  {
    id: "44000000-0000-4000-8000-000000000103",
    title: "Closed role",
    status: "closed" as const,
  },
  {
    id: "44000000-0000-4000-8000-000000000104",
    title: "Other published role",
    status: "published" as const,
  },
];

const applications = [
  {
    job_id: jobs[0].id,
    review_status: "submitted" as const,
    withdrawn_at: null,
  },
  {
    job_id: jobs[0].id,
    review_status: "rejected" as const,
    withdrawn_at: null,
  },
  {
    job_id: jobs[1].id,
    review_status: "in_review" as const,
    withdrawn_at: null,
  },
  {
    job_id: jobs[1].id,
    review_status: "shortlisted" as const,
    withdrawn_at: "2026-10-11T00:00:00Z",
  },
  {
    job_id: jobs[1].id,
    review_status: "rejected" as const,
    withdrawn_at: "2026-10-12T00:00:00Z",
  },
];

const expectedJobs = [
  {
    id: jobs[0].id,
    title: "Software Engineer",
    status: "draft",
    activeCount: 2,
    withdrawnCount: 0,
  },
  {
    id: jobs[1].id,
    title: "Software Engineer",
    status: "published",
    activeCount: 1,
    withdrawnCount: 2,
  },
  {
    id: jobs[2].id,
    title: "Closed role",
    status: "closed",
    activeCount: 0,
    withdrawnCount: 0,
  },
  {
    id: jobs[3].id,
    title: "Other published role",
    status: "published",
    activeCount: 0,
    withdrawnCount: 0,
  },
];

it("counts job lifecycle and active review states without double-counting withdrawals", () => {
  const dashboard = aggregateHRDashboard(jobs, applications);

  expect(dashboard.jobCounts).toEqual({ draft: 1, published: 2, closed: 1 });
  expect(dashboard.applicationCounts).toEqual({
    submitted: 1,
    in_review: 1,
    shortlisted: 0,
    rejected: 1,
  });
  expect(dashboard.withdrawnCount).toBe(2);
  expect(dashboard.jobs).toEqual(expectedJobs);
});

it("returns zero totals and preserves jobs when there are no submitted applications", () => {
  const dashboard = aggregateHRDashboard(jobs, []);

  expect(dashboard.jobCounts).toEqual({ draft: 1, published: 2, closed: 1 });
  expect(dashboard.applicationCounts).toEqual({
    submitted: 0,
    in_review: 0,
    shortlisted: 0,
    rejected: 0,
  });
  expect(dashboard.withdrawnCount).toBe(0);
  expect(dashboard.jobs).toHaveLength(jobs.length);
  expect(dashboard.jobs.every((job) => job.activeCount === 0)).toBe(true);
});

it("counts expired published jobs as closed and keeps future jobs scheduled", () => {
  const dashboard = aggregateHRDashboard(
    [
      {
        id: "44000000-0000-4000-8000-000000000105",
        title: "Expired published role",
        status: "published" as const,
        closes_at: "2000-01-01T00:00:00.000Z",
      },
      {
        id: "44000000-0000-4000-8000-000000000106",
        title: "Future scheduled role",
        status: "published" as const,
        opens_at: "2100-01-01T00:00:00.000Z",
      },
    ],
    [],
  );

  expect(dashboard.jobCounts).toEqual({ draft: 0, published: 1, closed: 1 });
  expect(dashboard.jobs.map(({ title, status }) => [title, status])).toEqual([
    ["Expired published role", "closed"],
    ["Future scheduled role", "scheduled"],
  ]);
});
