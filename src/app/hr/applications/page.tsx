import Link from "next/link";

import { PendingLinkStatus } from "@/components/pending-link-status";
import { requireHR } from "@/lib/hr-auth";
import {
  listDistinctApplicationJobs,
  listSubmittedApplications,
} from "@/lib/hr-applications";
import { reviewStatusLabel } from "@/lib/hr-input";
import {
  filterApplications,
  listDistinctJobsFromApplications,
  paginateApplications,
  parseHRApplicationFilterParams,
  sortApplications,
  type HRApplicationFilterParams,
  type PaginatedResult,
} from "@/lib/hr-application-search";
import { HRApplicationFilters } from "@/components/hr-application-filters";
import { HRApplicationPagination } from "@/components/hr-application-pagination";

export const dynamic = "force-dynamic";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

async function loadReviewData(
  params: ReturnType<typeof parseHRApplicationFilterParams>,
) {
  const [distinctJobs, applications] = await Promise.all([
    listDistinctApplicationJobs(),
    listSubmittedApplications({
      jobId: params.job,
      status: params.status,
      withdrawal: params.withdrawal,
    }),
  ]);
  const jobs =
    distinctJobs.length > 0
      ? distinctJobs
      : listDistinctJobsFromApplications(applications);
  return { jobs, applications };
}

export default async function HRApplicationsPage({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  await requireHR();
  const rawParams = searchParams ? await searchParams : {};
  const filterParams = parseHRApplicationFilterParams(rawParams);

  let data;
  try {
    data = await loadReviewData(filterParams);
  } catch {
    return <ReviewDataUnavailable />;
  }
  const { jobs, applications } = data;

  const filtered = filterApplications(applications, filterParams);
  const sorted = sortApplications(filtered, filterParams.sort);
  const paginated = paginateApplications(
    sorted,
    filterParams.page,
    filterParams.pageSize,
  );

  return (
    <main className="page-shell mx-auto max-w-4xl space-y-8 px-5 py-10">
      <Header />
      <HRApplicationFilters initialParams={filterParams} jobs={jobs} />
      <ApplicationContent
        totalCount={applications.length}
        invalidSearch={filterParams.invalidSearch}
        filteredCount={filtered.length}
        paginated={paginated}
        filterParams={filterParams}
      />
    </main>
  );
}

function Header() {
  return (
    <>
      <header className="flex items-center justify-between gap-4">
        <Link href="/" className="underline">
          ← Careers
          <PendingLinkStatus label="Opening roles…" />
        </Link>
      </header>
      <div className="space-y-1">
        <h1 className="text-3xl font-semibold">Application review</h1>
        <p className="text-muted-foreground">
          Submitted applications for this careers site.
        </p>
      </div>
    </>
  );
}

function ApplicationContent({
  totalCount,
  invalidSearch,
  filteredCount,
  paginated,
  filterParams,
}: {
  totalCount: number;
  invalidSearch: boolean;
  filteredCount: number;
  paginated: PaginatedResult<
    Awaited<ReturnType<typeof listSubmittedApplications>>[number]
  >;
  filterParams: HRApplicationFilterParams;
}) {
  if (totalCount === 0) {
    return <p>No submitted applications yet.</p>;
  }
  if (invalidSearch) {
    return (
      <p role="alert" className="text-sm text-destructive">
        Use a search phrase of at most 100 characters without control
        characters.
      </p>
    );
  }
  if (filteredCount === 0) {
    return (
      <p className="py-6 text-center text-muted-foreground">
        No applications match your selected filters.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <ul className="space-y-3">
        {paginated.items.map((application) => (
          <li key={application.id}>
            <HRApplicationLink application={application} />
          </li>
        ))}
      </ul>
      <HRApplicationPagination pagination={paginated} params={filterParams} />
    </div>
  );
}

function ReviewDataUnavailable() {
  return (
    <main className="page-shell mx-auto max-w-4xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Application review</h1>
      <p role="alert" className="mt-5">
        Review data is temporarily unavailable. Try again later.
      </p>
    </main>
  );
}

function HRApplicationLink({
  application,
}: {
  application: Awaited<ReturnType<typeof listSubmittedApplications>>[number];
}) {
  const status = application.withdrawn_at
    ? "Withdrawn"
    : reviewStatusLabel(application.review_status);
  return (
    <Link
      href={`/hr/applications/${application.id}`}
      className="block rounded-lg border p-5 hover:bg-muted/40 transition-colors"
    >
      <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <span className="block font-semibold">
          {application.full_name || application.job_title}
        </span>
        {application.full_name ? (
          <span className="block text-xs font-medium text-muted-foreground sm:text-right">
            {application.job_title}
          </span>
        ) : null}
      </div>
      <span className="block text-sm text-muted-foreground mt-0.5">
        Applicant {application.applicant_id}
      </span>
      <span className="block text-sm text-muted-foreground mt-2">
        <span className="inline-flex items-center rounded px-2 py-0.5 text-xs font-semibold bg-muted text-foreground">
          {status}
        </span>{" "}
        · Submitted {new Date(application.submitted_at).toLocaleString()}
      </span>
    </Link>
  );
}
