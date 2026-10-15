import Link from "next/link";
import { notFound } from "next/navigation";

import {
  closeHRJob,
  editHRJobDraft,
  publishHRJob,
  unpublishHRJob,
} from "@/app/hr/jobs/actions";
import { JobEditor } from "@/app/hr/jobs/job-editor";
import { PendingSubmitButton } from "@/components/pending-submit-button";
import { categoryLabel } from "@/lib/job-categories";
import { requireHR } from "@/lib/hr-auth";
import { getHRJob, getHROperationalJobStatus } from "@/lib/hr-jobs";

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
    <JobDetailContent job={job} hasError={Boolean(error)} notice={notice} />
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
  notice,
}: {
  job: Job;
  hasError: boolean;
  notice?: string;
}) {
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-7 px-5 py-10">
      <Link href="/hr/jobs" className="underline">
        ← Manage jobs
      </Link>
      <JobHeader job={job} />
      <JobNotices hasError={hasError} notice={notice} />
      <JobActions job={job} />
    </main>
  );
}

function formatTimestamp(iso?: string | null): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return "";
  }
}

function JobHeader({ job }: { job: Job }) {
  const operationalStatus = getHROperationalJobStatus(job);
  const statusLabel =
    operationalStatus === "draft"
      ? "Draft"
      : operationalStatus === "scheduled"
        ? "Scheduled"
        : operationalStatus === "published"
          ? "Published"
          : "Closed";

  return (
    <header className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {categoryLabel(job.category)} · {job.team}
      </p>
      <h1 className="text-3xl font-semibold">{job.title}</h1>
      <p className="font-medium">{statusLabel}</p>
      {operationalStatus === "scheduled" && job.opens_at && (
        <p className="text-sm text-muted-foreground">
          Scheduled to open on {formatTimestamp(job.opens_at)}
          {job.closes_at && ` (closes ${formatTimestamp(job.closes_at)})`}
        </p>
      )}
      {operationalStatus === "published" && job.closes_at && (
        <p className="text-sm text-muted-foreground">
          Applications close on {formatTimestamp(job.closes_at)}
        </p>
      )}
    </header>
  );
}

function JobNotices({
  hasError,
  notice,
}: {
  hasError: boolean;
  notice?: string;
}) {
  return (
    <>
      {hasError && (
        <p role="alert" className="rounded-lg border p-3">
          The change was not saved. Reload and try again.
        </p>
      )}
      {notice === "unpublished" && (
        <p role="status" className="rounded-lg border p-3">
          The job was reverted to draft.
        </p>
      )}
      {notice && notice !== "unpublished" && (
        <p role="status" className="rounded-lg border p-3">
          The change was saved.
        </p>
      )}
    </>
  );
}

function JobActions({ job }: { job: Job }) {
  const operationalStatus = getHROperationalJobStatus(job);

  if (operationalStatus === "draft") {
    return <DraftJobActions job={job} />;
  }

  if (operationalStatus === "scheduled") {
    return <ScheduledJobActions job={job} />;
  }

  return <PublishedJobDetails job={job} />;
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
          Publishing makes this fixed description visible and opens applications
          according to its schedule. Review the draft first.
        </p>
        <form action={publishHRJob}>
          <input type="hidden" name="jobId" value={job.id} />
          <PendingSubmitButton
            label="Publish job"
            pendingLabel="Publishing job…"
            className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
          />
        </form>
      </section>
    </>
  );
}

function ScheduledJobActions({ job }: { job: Job }) {
  return (
    <>
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Revert to draft</h2>
        <p>
          This job is scheduled to open in the future. You can revert it to
          draft to edit its requirements, description, or schedule before it
          goes live.
        </p>
        <form action={unpublishHRJob}>
          <input type="hidden" name="jobId" value={job.id} />
          <PendingSubmitButton
            label="Revert to draft"
            pendingLabel="Reverting to draft…"
            className="rounded-lg border px-4 py-2 font-medium"
          />
        </form>
      </section>
      <JobTextSection title="Description" text={job.description} />
      <JobTextSection title="Requirements" text={job.requirements} />
      <CloseJobSection jobId={job.id} />
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
        <PendingSubmitButton
          label="Close job"
          pendingLabel="Closing job…"
          className="rounded-lg border px-4 py-2 font-medium"
        />
      </form>
    </section>
  );
}
