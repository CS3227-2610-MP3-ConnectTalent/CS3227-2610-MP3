import Link from "next/link";
import { unstable_rethrow } from "next/navigation";

import { requireHR } from "@/lib/hr-auth";
import { listSubmittedApplications } from "@/lib/hr-applications";
import { aggregateHRDashboard } from "@/lib/hr-dashboard";
import { listHRJobs, type HROperationalJobStatus } from "@/lib/hr-jobs";

export const dynamic = "force-dynamic";

type Dashboard = ReturnType<typeof aggregateHRDashboard>;

export default async function HRDashboardPage() {
  await requireHR();

  let dashboard: Dashboard | null = null;
  try {
    const [jobs, applications] = await Promise.all([
      listHRJobs(),
      listSubmittedApplications(),
    ]);
    dashboard = aggregateHRDashboard(jobs, applications);
  } catch (error) {
    unstable_rethrow(error);
  }

  return dashboard ? (
    <DashboardContent dashboard={dashboard} />
  ) : (
    <DashboardUnavailable />
  );
}

function DashboardUnavailable() {
  return (
    <main className="page-shell mx-auto max-w-6xl px-5 py-10">
      <h1 className="text-3xl font-semibold">HR dashboard</h1>
      <p role="alert" className="mt-5">
        Recruitment overview is temporarily unavailable. Try again later.
      </p>
    </main>
  );
}

function DashboardContent({ dashboard }: { dashboard: Dashboard }) {
  return (
    <main className="page-shell mx-auto max-w-6xl space-y-8 px-5 py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">HR dashboard</h1>
          <p className="text-muted-foreground">
            A read-only overview of jobs and submitted applications.
          </p>
        </div>
        <nav aria-label="HR dashboard actions" className="flex gap-4 text-sm">
          <Link href="/hr/jobs" className="underline">
            Manage jobs
          </Link>
          <Link href="/hr/applications" className="underline">
            Application review
          </Link>
        </nav>
      </header>
      <JobCounts counts={dashboard.jobCounts} />
      <ApplicationCounts
        counts={dashboard.applicationCounts}
        withdrawn={dashboard.withdrawnCount}
      />
      <ApplicationsByJob jobs={dashboard.jobs} />
    </main>
  );
}

function JobCounts({ counts }: { counts: Dashboard["jobCounts"] }) {
  return (
    <section aria-labelledby="job-totals-heading" className="space-y-3">
      <h2 id="job-totals-heading" className="text-xl font-semibold">
        Jobs
      </h2>
      <dl className="grid gap-3 sm:grid-cols-3">
        <Metric label="Draft jobs" value={counts.draft} />
        <Metric label="Published jobs" value={counts.published} />
        <Metric label="Closed jobs" value={counts.closed} />
      </dl>
    </section>
  );
}

function ApplicationCounts({
  counts,
  withdrawn,
}: {
  counts: Dashboard["applicationCounts"];
  withdrawn: number;
}) {
  return (
    <section aria-labelledby="application-totals-heading" className="space-y-3">
      <h2 id="application-totals-heading" className="text-xl font-semibold">
        Submitted applications
      </h2>
      <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Metric label="Submitted" value={counts.submitted} />
        <Metric label="In review" value={counts.in_review} />
        <Metric label="Shortlisted" value={counts.shortlisted} />
        <Metric label="Rejected" value={counts.rejected} />
        <Metric label="Withdrawn" value={withdrawn} />
      </dl>
    </section>
  );
}

function ApplicationsByJob({ jobs }: { jobs: Dashboard["jobs"] }) {
  return (
    <section aria-labelledby="per-job-heading" className="space-y-3">
      <h2 id="per-job-heading" className="text-xl font-semibold">
        Applications by job
      </h2>
      {jobs.length === 0 ? (
        <p>No jobs yet. Create a draft to begin.</p>
      ) : (
        <JobTable jobs={jobs} />
      )}
    </section>
  );
}

function JobTable({ jobs }: { jobs: Dashboard["jobs"] }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm">
        <caption className="sr-only">
          Active and withdrawn submitted applications grouped by job
        </caption>
        <thead className="bg-muted/40">
          <tr>
            <th scope="col" className="p-3">
              Job
            </th>
            <th scope="col" className="p-3">
              Job status
            </th>
            <th scope="col" className="p-3">
              Active submitted
            </th>
            <th scope="col" className="p-3">
              Withdrawn
            </th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow key={job.id} job={job} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobRow({ job }: { job: Dashboard["jobs"][number] }) {
  return (
    <tr className="border-t">
      <th scope="row" className="p-3 font-medium">
        <Link href={`/hr/jobs/${job.id}`} className="underline">
          {job.title}
        </Link>
      </th>
      <td className="p-3">{jobStatusLabel(job.status)}</td>
      <td className="p-3">{job.activeCount}</td>
      <td className="p-3">{job.withdrawnCount}</td>
    </tr>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border p-4">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-2xl font-semibold">{value}</dd>
    </div>
  );
}

function jobStatusLabel(status: HROperationalJobStatus) {
  switch (status) {
    case "draft":
      return "Draft";
    case "scheduled":
      return "Scheduled";
    case "published":
      return "Published";
    case "closed":
      return "Closed";
  }
}
