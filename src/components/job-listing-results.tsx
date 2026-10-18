import Link from "next/link";
import { ArrowUpRight, BriefcaseBusiness } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "@/lib/job-categories";
import { JOB_SEARCH_ERROR } from "@/lib/job-search";
import type { PublishedJob } from "@/lib/jobs";
import { PendingLinkStatus } from "@/components/pending-link-status";
type Jobs = PublishedJob[];
type Job = PublishedJob;

export function JobResults({
  jobs,
  invalidCategory,
  query = "",
  invalidSearch = false,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
  query?: string;
  invalidSearch?: boolean;
}) {
  if (invalidSearch) return <p role="alert">{JOB_SEARCH_ERROR}</p>;
  return (
    <section aria-labelledby="open-roles" className="min-w-0 space-y-6">
      <JobResultsHeading jobs={jobs} invalidCategory={invalidCategory} />
      {!invalidCategory && query && !jobs.length ? (
        <div className="empty-state">
          <h3 className="font-semibold">No matching roles</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Try a different phrase or category.
          </p>
        </div>
      ) : (
        <JobResultsBody jobs={jobs} invalidCategory={invalidCategory} />
      )}
    </section>
  );
}

function JobResultsHeading({
  jobs,
  invalidCategory,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <p className="mb-1 text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
          Opportunities
        </p>
        <h2 id="open-roles" className="text-2xl font-semibold tracking-tight">
          Open roles
        </h2>
      </div>
      <p
        role="status"
        className="rounded-full border bg-white px-4 py-2 text-sm text-muted-foreground"
      >
        {invalidCategory
          ? "Choose a valid category."
          : `${jobs.length} ${jobs.length === 1 ? "role" : "roles"} available`}
      </p>
    </div>
  );
}

function JobResultsBody({
  jobs,
  invalidCategory,
}: {
  jobs: Jobs;
  invalidCategory: boolean;
}) {
  if (invalidCategory) return <UnknownCategory />;
  if (jobs.length === 0) return <EmptyJobResults />;
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}

function UnknownCategory() {
  return (
    <div className="empty-state">
      <h3 className="font-semibold">Unknown category</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Choose one of the listed categories to browse jobs.
      </p>
    </div>
  );
}

function EmptyJobResults() {
  return (
    <div className="empty-state">
      <BriefcaseBusiness
        className="mb-4 text-muted-foreground"
        aria-hidden="true"
      />
      <h3 className="font-semibold">No open roles in this category</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        Try another category or check back later.
      </p>
    </div>
  );
}

function JobCard({ job }: { job: Job }) {
  return (
    <Link
      href={`/jobs/${job.id}`}
      className="job-card group flex min-w-0 flex-col rounded-2xl border bg-white p-3"
    >
      <div
        className={`job-card-panel job-tone-${job.category} flex flex-1 flex-col rounded-xl p-5`}
      >
        <div className="mb-7 flex items-center justify-between gap-3">
          <Badge
            variant="outline"
            className="border-black/15 bg-white/60 text-slate-800"
          >
            {categoryLabel(job.category)}
          </Badge>
          <ArrowUpRight size={18} aria-hidden="true" />
        </div>
        <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-700">
          {job.team}
        </p>
        <h3 className="break-words text-xl font-semibold leading-snug tracking-tight">
          {job.title}
        </h3>
        <p className="mt-4 line-clamp-3 text-sm leading-relaxed text-slate-700">
          {job.description}
        </p>
      </div>
      <JobCardFooter />
    </Link>
  );
}

function JobCardFooter() {
  return (
    <div className="flex items-center justify-between gap-3 px-2 pb-1 pt-4">
      <span className="text-xs font-medium text-muted-foreground">
        Find your next chapter
      </span>
      <span className="rounded-full bg-slate-950 px-4 py-2 text-xs font-semibold text-white">
        View role
        <PendingLinkStatus label="Opening role…" />
      </span>
    </div>
  );
}
