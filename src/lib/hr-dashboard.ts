import type { HRJob } from "@/lib/hr-jobs";
import type { HRReviewStatus } from "@/lib/hr-input";

type Job = Pick<HRJob, "id" | "title" | "status">;
type Application = {
  job_id: string;
  review_status: HRReviewStatus;
  withdrawn_at: string | null;
};

const jobStatuses = ["draft", "published", "closed"] as const;
const reviewStatuses = [
  "submitted",
  "in_review",
  "shortlisted",
  "rejected",
] as const satisfies readonly HRReviewStatus[];

export function aggregateHRDashboard(jobs: Job[], applications: Application[]) {
  const jobCounts = Object.fromEntries(
    jobStatuses.map((status) => [status, 0]),
  ) as Record<(typeof jobStatuses)[number], number>;
  const applicationCounts = Object.fromEntries(
    reviewStatuses.map((status) => [status, 0]),
  ) as Record<(typeof reviewStatuses)[number], number>;
  const dashboardJobs = jobs.map((job) => ({
    ...job,
    activeCount: 0,
    withdrawnCount: 0,
  }));
  const jobsById = new Map(dashboardJobs.map((job) => [job.id, job]));
  let withdrawnCount = 0;

  for (const job of jobs) jobCounts[job.status] += 1;

  for (const application of applications) {
    const job = jobsById.get(application.job_id);
    if (application.withdrawn_at !== null) {
      withdrawnCount += 1;
      if (job) job.withdrawnCount += 1;
      continue;
    }

    applicationCounts[application.review_status] += 1;
    if (job) job.activeCount += 1;
  }

  return { jobCounts, applicationCounts, withdrawnCount, jobs: dashboardJobs };
}
