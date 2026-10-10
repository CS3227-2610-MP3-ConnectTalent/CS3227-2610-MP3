import Link from "next/link";
import { notFound } from "next/navigation";
import { HRApplicationActions } from "@/components/hr-application-actions";
import { ApplicationContactDetails } from "@/components/application-contact-details";
import { HrAiSummary } from "@/components/hr-ai-summary";
import { ResumePanel } from "@/components/resume-panel";
import { getApplicationResume } from "@/lib/application-resumes";
import {
  getSubmittedApplication,
  listHRNotes,
  listHRStatusEvents,
} from "@/lib/hr-applications";
import { requireHR } from "@/lib/hr-auth";
import { reviewStatusLabel } from "@/lib/hr-input";

export const dynamic = "force-dynamic";

type Application = NonNullable<
  Awaited<ReturnType<typeof getSubmittedApplication>>
>;
type Notes = Awaited<ReturnType<typeof listHRNotes>>;
type Events = Awaited<ReturnType<typeof listHRStatusEvents>>;
type Resume = Awaited<ReturnType<typeof getApplicationResume>>;

export default async function HRApplicationDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; notice?: string }>;
}) {
  await requireHR();
  const { id } = await params;
  const review = await loadReview(id);
  if (review.status === "missing") notFound();
  if (review.status === "error") return <ReviewLoadError />;
  const [{ error, notice }, resume] = await Promise.all([
    searchParams,
    getApplicationResume(review.application.id),
  ]);
  return (
    <HRApplicationReview
      application={review.application}
      notes={review.notes}
      events={review.events}
      resume={resume}
      error={error}
      notice={notice}
    />
  );
}

async function loadReview(id: string) {
  try {
    const application = await getSubmittedApplication(id);
    if (!application) return { status: "missing" as const };
    const [notes, events] = await Promise.all([
      listHRNotes(id),
      listHRStatusEvents(id),
    ]);
    return { status: "loaded" as const, application, notes, events };
  } catch {
    return { status: "error" as const };
  }
}

function ReviewLoadError() {
  return (
    <main className="page-shell mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Application review</h1>
      <p role="alert" className="mt-5">
        Review data is temporarily unavailable. Try again later.
      </p>
    </main>
  );
}

function HRApplicationReview({
  application,
  notes,
  events,
  resume,
  error,
  notice,
}: {
  application: Application;
  notes: Notes;
  events: Events;
  resume: Resume;
  error?: string;
  notice?: string;
}) {
  const withdrawn = Boolean(application.withdrawn_at);
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-8 px-5 py-10">
      <Link href="/hr/applications" className="underline">
        ← Application review
      </Link>
      <ApplicationHeading application={application} />
      <ReviewFeedback error={error} notice={notice} withdrawn={withdrawn} />
      <ApplicationContactDetails {...application} />
      <ResumePanel
        applicationId={application.id}
        revision={application.revision}
        editable={false}
        resume={resume}
      />
      <CoverLetterSections application={application} withdrawn={withdrawn} />
      <HRApplicationActions
        application={application}
        notes={notes}
        events={events}
        editable={!withdrawn}
      />
    </main>
  );
}

function ApplicationHeading({ application }: { application: Application }) {
  const status = application.withdrawn_at
    ? "Withdrawn"
    : reviewStatusLabel(application.review_status);
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold">{application.job_title}</h1>
      <p>Applicant {application.applicant_id}</p>
      <p>
        Review status: <strong>{status}</strong>
      </p>
      <p className="text-sm text-muted-foreground">
        Submitted {new Date(application.submitted_at).toLocaleString()}
      </p>
    </header>
  );
}

function ReviewFeedback({
  error,
  notice,
  withdrawn,
}: {
  error?: string;
  notice?: string;
  withdrawn: boolean;
}) {
  return (
    <>
      {error && (
        <p role="alert" className="rounded-lg border p-3">
          The change was not saved. Reload this page and try again.
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg border p-3">
          The change was saved.
        </p>
      )}
      {withdrawn && <WithdrawnNotice />}
    </>
  );
}

function WithdrawnNotice() {
  return (
    <p className="rounded-lg border p-3">
      Withdrawn by the Applicant. History remains available; further review
      actions are disabled.
    </p>
  );
}

function CoverLetterSections({
  application,
  withdrawn,
}: {
  application: Application;
  withdrawn: boolean;
}) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <OriginalLetter letter={application.original_submitted_letter} />
      {!withdrawn && <HrAiSummary applicationId={application.id} />}
      <CurrentLetter letter={application.cover_letter} />
    </div>
  );
}

function OriginalLetter({ letter }: { letter: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Original cover letter</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">{letter}</p>
    </section>
  );
}

function CurrentLetter({ letter }: { letter: string }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl font-semibold">Current cover letter</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">{letter}</p>
    </section>
  );
}
