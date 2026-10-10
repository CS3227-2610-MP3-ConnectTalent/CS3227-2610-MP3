import Link from "next/link";
import { ResumePanel } from "@/components/resume-panel";
import { getApplicationResume } from "@/lib/application-resumes";
import { notFound } from "next/navigation";

import { ApplicationContactDetails } from "@/components/application-contact-details";
import { requireApplicant } from "@/lib/auth";
import { ApplicationForm } from "@/components/application-form";
import { getOwnApplication } from "@/lib/applications";
import { getPublishedJob } from "@/lib/jobs";
import { reviewStatusLabel } from "@/lib/hr-input";

export const dynamic = "force-dynamic";

type Application = NonNullable<Awaited<ReturnType<typeof getOwnApplication>>>;
type Job = Awaited<ReturnType<typeof getPublishedJob>>;

export default async function ApplicationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ notice?: string }>;
}) {
  const { user } = await requireApplicant();
  const { id } = await params;
  const application = await getOwnApplication(id);
  if (!application) notFound();
  const job = await getPublishedJob(application.job_id);
  const resume = await getApplicationResume(application.id);
  const { notice } = await searchParams;

  return (
    <ApplicationDetailView
      application={application}
      job={job}
      email={user.email ?? ""}
      notice={notice}
      resume={resume}
    />
  );
}

function ApplicationDetailView({
  application,
  job,
  email,
  notice,
  resume,
}: {
  application: Application;
  job: Job;
  email: string;
  notice?: string;
  resume: Awaited<ReturnType<typeof getApplicationResume>>;
}) {
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href="/applications" className="underline">
        ← My applications
      </Link>
      <h1 className="text-3xl font-semibold">{application.job_title}</h1>
      <ApplicationNotices notice={notice} job={job} />
      <ApplicationProgress application={application} />
      {(application.submission_state === "submitted" || !job) && (
        <ApplicationContactDetails {...application} />
      )}
      <ApplicationLetter application={application} job={job} email={email} />
      <ResumePanel
        applicationId={application.id}
        revision={application.revision}
        editable={Boolean(job) && application.submission_state === "draft"}
        resume={resume}
      />
    </main>
  );
}

function ApplicationNotices({ notice, job }: { notice?: string; job: Job }) {
  return (
    <>
      {notice === "already-submitted" && (
        <p role="status" className="rounded-lg border p-3">
          This application was already submitted. Review the saved details and
          letter below; they may differ from what you just tried to send.
        </p>
      )}
      {notice === "saved" && (
        <p role="status" className="rounded-lg border p-3">
          Your change was already saved. Review the current letter below.
        </p>
      )}
      {!job && (
        <p className="rounded-lg border p-3">
          This job is no longer open. Your application remains available to
          read, but cannot be changed.
        </p>
      )}
    </>
  );
}

function ApplicationProgress({ application }: { application: Application }) {
  return (
    <>
      <p>
        {application.submission_state === "draft"
          ? "Saved draft"
          : "Submitted application"}
      </p>
      {application.submission_state === "submitted" &&
        application.review_status && (
          <p>
            Review status:{" "}
            <strong>{reviewStatusLabel(application.review_status)}</strong>
          </p>
        )}
    </>
  );
}

function ApplicationLetter({
  application,
  job,
  email,
}: {
  application: Application;
  job: Job;
  email: string;
}) {
  if (application.submission_state === "submitted")
    return <OriginalSubmission application={application} />;
  if (job)
    return (
      <ApplicationForm
        jobId={application.job_id}
        value={application.cover_letter}
        revision={application.revision}
        submitted={false}
        email={email}
        details={application}
      />
    );
  return <SavedLetter application={application} />;
}

function OriginalSubmission({ application }: { application: Application }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Original submission</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">
        {application.original_submitted_letter}
      </p>
      <p className="text-sm text-muted-foreground">
        Submitted applications are locked. Contact HR if you need to request a
        correction.
      </p>
    </section>
  );
}

function SavedLetter({ application }: { application: Application }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Saved letter</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">
        {application.cover_letter || "(empty draft)"}
      </p>
    </section>
  );
}
