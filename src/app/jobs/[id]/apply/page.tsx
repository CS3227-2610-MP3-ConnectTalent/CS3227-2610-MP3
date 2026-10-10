import Link from "next/link";
import { ResumePanel } from "@/components/resume-panel";
import { getApplicationResume } from "@/lib/application-resumes";
import { getProfileResume } from "@/lib/profile-resumes";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/application-form";
import { getApplicantProfile } from "@/lib/applicant-profile";
import { getOwnApplicationForJob } from "@/lib/applications";
import { requireApplicant } from "@/lib/auth";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

export default async function ApplyPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { id } = await params;
  const job = await getPublishedJob(id);
  if (!job) notFound();
  const { user } = await requireApplicant();
  const application = await getOwnApplicationForJob(id);
  const profile = application ? null : await getApplicantProfile();
  const resume = application
    ? await getApplicationResume(application.id)
    : null;
  const profileResume = await getProfileResume();
  const { error } = await searchParams;
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-6 px-5 py-10">
      <ApplyHeader id={id} job={job} application={application} />
      {error && <SaveError />}
      <ApplyForm
        id={id}
        email={user.email ?? ""}
        application={application}
        details={application ?? { ...profile!, submitted_email: null }}
        resume={resume}
        profileResume={profileResume}
      />
      {application?.submission_state === "submitted" && (
        <SubmittedResume application={application} resume={resume} />
      )}
    </main>
  );
}

type Job = NonNullable<Awaited<ReturnType<typeof getPublishedJob>>>;
type Application = Awaited<ReturnType<typeof getOwnApplicationForJob>>;
type Resume = Awaited<ReturnType<typeof getApplicationResume>>;
type ProfileResume = Awaited<ReturnType<typeof getProfileResume>>;

function ApplyHeader({
  id,
  job,
  application,
}: {
  id: string;
  job: Job;
  application: Application;
}) {
  return (
    <>
      <Link href={`/jobs/${id}`} className="text-sm underline">
        ← {job.title}
      </Link>
      <h1 className="text-3xl font-semibold">
        {application?.submission_state === "submitted"
          ? "Application submitted"
          : `Apply for ${job.title}`}
      </h1>
      <p className="text-muted-foreground">{job.team}</p>
    </>
  );
}

function SaveError() {
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive p-3 text-destructive"
    >
      We could not save your change. Check the letter and job status, reload for
      the latest version, then try again.
    </p>
  );
}

function ApplyForm({
  id,
  email,
  application,
  details,
  resume,
  profileResume,
}: {
  id: string;
  email: string;
  application: Application;
  details: {
    full_name: string | null;
    phone: string | null;
    portfolio_url: string | null;
    submitted_email: string | null;
    education?: string | null;
    work_experience?: string | null;
  };
  resume: Resume;
  profileResume: ProfileResume;
}) {
  return (
    <ApplicationForm
      jobId={id}
      value={application?.cover_letter ?? ""}
      revision={application?.revision ?? null}
      submitted={application?.submission_state === "submitted"}
      email={email}
      details={details}
      applicationId={application?.id ?? null}
      resume={resume}
      profileResume={profileResume}
    />
  );
}

function SubmittedResume({
  application,
  resume,
}: {
  application: NonNullable<Application>;
  resume: Resume;
}) {
  return (
    <ResumePanel
      applicationId={application.id}
      revision={application.revision}
      editable={false}
      resume={resume}
    />
  );
}
