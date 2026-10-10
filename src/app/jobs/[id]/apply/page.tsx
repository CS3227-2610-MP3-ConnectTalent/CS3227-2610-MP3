import Link from "next/link";
import { notFound } from "next/navigation";

import { ApplicationForm } from "@/components/application-form";
import { ResumePanel } from "@/components/resume-panel";
import { getApplicantProfile } from "@/lib/applicant-profile";
import { getApplicationResume } from "@/lib/application-resumes";
import { getOwnApplicationForJob } from "@/lib/applications";
import { requireApplicant } from "@/lib/auth";
import { getPublishedJob } from "@/lib/jobs";

export const dynamic = "force-dynamic";

type Job = NonNullable<Awaited<ReturnType<typeof getPublishedJob>>>;
type Application = Awaited<ReturnType<typeof getOwnApplicationForJob>>;
type Resume = Awaited<ReturnType<typeof getApplicationResume>>;
type Profile = Awaited<ReturnType<typeof getApplicantProfile>>;
type FormDetails = NonNullable<Profile> & { submitted_email: string | null };

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
  const { error } = await searchParams;

  return (
    <ApplyPageContent
      id={id}
      job={job}
      application={application}
      details={application ?? { ...profile!, submitted_email: null }}
      email={user.email ?? ""}
      resume={resume}
      hasError={Boolean(error)}
    />
  );
}

function ApplyPageContent({
  id,
  job,
  application,
  details,
  email,
  resume,
  hasError,
}: {
  id: string;
  job: Job;
  application: Application;
  details: FormDetails | NonNullable<Application>;
  email: string;
  resume: Resume;
  hasError: boolean;
}) {
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-6 px-5 py-10">
      <Link href={`/jobs/${id}`} className="text-sm underline">
        ← {job.title}
      </Link>
      <h1 className="text-3xl font-semibold">
        {application?.submission_state === "submitted"
          ? "Application submitted"
          : `Apply for ${job.title}`}
      </h1>
      <p className="text-muted-foreground">{job.team}</p>
      {hasError && <ApplicationSaveError />}
      <ApplicationForm
        jobId={id}
        value={application?.cover_letter ?? ""}
        revision={application?.revision ?? null}
        submitted={application?.submission_state === "submitted"}
        email={email}
        details={details}
      />
      <Link href="/applications" className="inline-block underline">
        My applications
      </Link>
      <ResumePanel
        applicationId={application?.id ?? null}
        revision={application?.revision ?? null}
        editable={application?.submission_state !== "submitted"}
        resume={resume}
      />
    </main>
  );
}

function ApplicationSaveError() {
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
