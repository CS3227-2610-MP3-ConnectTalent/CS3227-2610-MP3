import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationContactDetails } from "@/components/application-contact-details";
import { ApplicationForm } from "@/components/application-form";
import { ResumePanel } from "@/components/resume-panel";
import { WithdrawalControl } from "@/components/withdrawal-control";
import { getApplicationResume } from "@/lib/application-resumes";
import { getOwnApplication } from "@/lib/applications";
import { requireApplicant } from "@/lib/auth";
import { reviewStatusLabel } from "@/lib/hr-input";
import { getPublishedJob } from "@/lib/jobs";
import { getProfileResume } from "@/lib/profile-resumes";

export const dynamic = "force-dynamic";

type Application = NonNullable<Awaited<ReturnType<typeof getOwnApplication>>>;
type Job = Awaited<ReturnType<typeof getPublishedJob>>;
type Resume = Awaited<ReturnType<typeof getApplicationResume>>;
type ProfileResume = Awaited<ReturnType<typeof getProfileResume>>;

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
  const [resume, profileResume, { notice }] = await Promise.all([
    getApplicationResume(application.id),
    job ? getProfileResume() : null,
    searchParams,
  ]);
  return (
    <ApplicationDetailContent
      application={application}
      job={job}
      resume={resume}
      profileResume={profileResume}
      email={user.email ?? ""}
      notice={notice}
    />
  );
}

function ApplicationDetailContent({
  application,
  job,
  resume,
  profileResume,
  email,
  notice,
}: {
  application: Application;
  job: Job;
  resume: Resume;
  profileResume: ProfileResume;
  email: string;
  notice?: string;
}) {
  const submitted = application.submission_state === "submitted";
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href="/applications" className="underline">
        ← My applications
      </Link>
      <h1 className="text-3xl font-semibold">{application.job_title}</h1>
      <ApplicationNotices application={application} notice={notice} />
      <ApplicationState application={application} job={job} />
      {(submitted || !job) && <ApplicationContactDetails {...application} />}
      <ApplicationBody
        application={application}
        job={job}
        email={email}
        resume={resume}
        profileResume={profileResume}
      />
      {(submitted || !job) && (
        <ResumePanel
          applicationId={application.id}
          revision={application.revision}
          editable={false}
          resume={resume}
        />
      )}
    </main>
  );
}

function ApplicationNotices({
  application,
  notice,
}: {
  application: Application;
  notice?: string;
}) {
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
      {application.withdrawn_at && (
        <p role="status" className="rounded-lg border p-3">
          Withdrawn — this application is retained for your records and cannot
          be reopened.
        </p>
      )}
    </>
  );
}

function ApplicationState({
  application,
  job,
}: {
  application: Application;
  job: Job;
}) {
  const submitted = application.submission_state === "submitted";
  return (
    <>
      {submitted && !application.withdrawn_at && (
        <WithdrawalControl applicationId={application.id} />
      )}
      <p>{submitted ? "Submitted application" : "Saved draft"}</p>
      {submitted && application.review_status && !application.withdrawn_at && (
        <p>
          Review status:{" "}
          <strong>{reviewStatusLabel(application.review_status)}</strong>
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

function ApplicationBody({
  application,
  job,
  email,
  resume,
  profileResume,
}: {
  application: Application;
  job: Job;
  email: string;
  resume: Resume;
  profileResume: ProfileResume;
}) {
  if (application.submission_state === "submitted")
    return <SubmittedLetter letter={application.original_submitted_letter} />;
  if (!job) return <SavedLetter letter={application.cover_letter} />;
  return (
    <ApplicationForm
      jobId={application.job_id}
      value={application.cover_letter}
      revision={application.revision}
      submitted={false}
      email={email}
      details={application}
      applicationId={application.id}
      resume={resume}
      profileResume={profileResume}
    />
  );
}

function SubmittedLetter({ letter }: { letter: string | null }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Original submission</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">
        {letter ?? ""}
      </p>
      <p className="text-sm text-muted-foreground">
        Submitted applications are locked. Contact HR if you need to request a
        correction.
      </p>
    </section>
  );
}

function SavedLetter({ letter }: { letter: string }) {
  return (
    <section className="space-y-2">
      <h2 className="text-xl font-semibold">Saved letter</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">
        {letter || "(empty draft)"}
      </p>
    </section>
  );
}
