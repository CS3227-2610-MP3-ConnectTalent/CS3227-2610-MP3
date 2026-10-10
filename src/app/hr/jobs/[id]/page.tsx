import Link from "next/link";
import { notFound } from "next/navigation";

import {
  closeHRJob,
  editHRJobDraft,
  publishHRJob,
} from "@/app/hr/jobs/actions";
import { JobEditor } from "@/app/hr/jobs/job-editor";
import { categoryLabel } from "@/lib/job-categories";
import { requireHR } from "@/lib/hr-auth";
import { getHRJob } from "@/lib/hr-jobs";

export const dynamic = "force-dynamic";

type Job = NonNullable<Awaited<ReturnType<typeof getHRJob>>>;

export default async function HRJobDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireHR();
  const { id } = await params;
  let job: Job | null;
  try {
    job = await getHRJob(id);
  } catch {
    return <JobUnavailable />;
  }
  if (!job) notFound();
  const { error, notice } = await searchParams;
  return (
    <JobDetailContent
      job={job}
      hasError={Boolean(error)}
      hasNotice={Boolean(notice)}
    />
  );
}

function JobUnavailable() {
  return (
    <main className="page-shell mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Manage jobs</h1>
      <p role="alert" className="mt-5">
        Job is temporarily unavailable. Try again later.
      </p>
    </main>
  );
}

function JobDetailContent({
  job,
  hasError,
  hasNotice,
}: {
  job: Job;
  hasError: boolean;
  hasNotice: boolean;
}) {
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-7 px-5 py-10">
      <Link href="/hr/jobs" className="underline">
        ← Manage jobs
      </Link>
      <JobHeader job={job} />
      <JobNotices hasError={hasError} hasNotice={hasNotice} />
      <JobActions job={job} />
    </main>
  );
}

function JobHeader({ job }: { job: Job }) {
  const status =
    job.status === "draft"
      ? "Draft"
      : job.status === "published"
        ? "Published"
        : "Closed";
  return (
    <header className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {categoryLabel(job.category)} · {job.team}
      </p>
      <h1 className="text-3xl font-semibold">{job.title}</h1>
      <p>{status}</p>
    </header>
  );
}

function JobNotices({
  hasError,
  hasNotice,
}: {
  hasError: boolean;
  hasNotice: boolean;
}) {
  return (
    <>
      {hasError && (
        <p role="alert" className="rounded-lg border p-3">
          The change was not saved. Reload and try again.
        </p>
      )}
      {hasNotice && (
        <p role="status" className="rounded-lg border p-3">
          The change was saved.
        </p>
      )}
    </>
  );
}

function JobActions({ job }: { job: Job }) {
  return job.status === "draft" ? (
    <DraftJobActions job={job} />
  ) : (
    <PublishedJobDetails job={job} />
  );
}

function DraftJobActions({ job }: { job: Job }) {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Edit draft</h2>
        <JobEditor job={job} action={editHRJobDraft} />
      </section>
      <section className="space-y-3 border-t pt-5">
        <h2 className="text-xl font-semibold">Publish job</h2>
        <p>
          Publishing makes this fixed description visible and opens
          applications. Review the draft first.
        </p>
        <form action={publishHRJob}>
          <input type="hidden" name="jobId" value={job.id} />
          <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
            Publish job
          </button>
        </form>
      </section>
    </>
  );
}

function PublishedJobDetails({ job }: { job: Job }) {
  return (
    <>
      <JobTextSection title="Description" text={job.description} />
      <JobTextSection title="Requirements" text={job.requirements} />
      {job.status === "published" && <CloseJobSection jobId={job.id} />}
    </>
  );
}

function JobTextSection({ title, text }: { title: string; text: string }) {
  return (
    <section className="space-y-3 border-t pt-5">
      <h2 className="text-xl font-semibold">{title}</h2>
      <p className="whitespace-pre-wrap">{text}</p>
    </section>
  );
}

function CloseJobSection({ jobId }: { jobId: string }) {
  return (
    <section className="space-y-3 border-t pt-5">
      <h2 className="text-xl font-semibold">Close job</h2>
      <p>
        Closing stops new applications and letter edits. Existing applications
        remain available for review.
      </p>
      <form action={closeHRJob}>
        <input type="hidden" name="jobId" value={jobId} />
        <button className="rounded-lg border px-4 py-2 font-medium">
          Close job
        </button>
      </form>
    </section>
  );
}
