import Link from "next/link";
import { notFound } from "next/navigation";

import { addHRNote, changeHRStatus } from "@/app/hr/applications/actions";
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
type ReviewLoad =
  | { status: "unavailable" }
  | { status: "missing" }
  | { status: "ready"; application: Application; notes: Notes; events: Events };

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
  if (review.status === "unavailable") return <ReviewUnavailable />;
  if (review.status === "missing") notFound();

  const { error, notice } = await searchParams;
  const resume = await getApplicationResume(review.application.id);
  return (
    <HRApplicationContent
      application={review.application}
      notes={review.notes}
      events={review.events}
      resume={resume}
      hasError={Boolean(error)}
      hasNotice={Boolean(notice)}
    />
  );
}

async function loadReview(id: string): Promise<ReviewLoad> {
  try {
    const application = await getSubmittedApplication(id);
    if (!application) return { status: "missing" };
    const [notes, events] = await Promise.all([
      listHRNotes(id),
      listHRStatusEvents(id),
    ]);
    return { status: "ready", application, notes, events };
  } catch {
    return { status: "unavailable" };
  }
}

function ReviewUnavailable() {
  return (
    <main className="page-shell mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Application review</h1>
      <p role="alert" className="mt-5">
        Review data is temporarily unavailable. Try again later.
      </p>
    </main>
  );
}

function HRApplicationContent({
  application,
  notes,
  events,
  resume,
  hasError,
  hasNotice,
}: {
  application: Application;
  notes: Notes;
  events: Events;
  resume: Awaited<ReturnType<typeof getApplicationResume>>;
  hasError: boolean;
  hasNotice: boolean;
}) {
  return (
    <main className="page-shell mx-auto max-w-3xl space-y-8 px-5 py-10">
      <Link href="/hr/applications" className="underline">
        ← Application review
      </Link>
      <ReviewHeader application={application} />
      <ReviewNotices hasError={hasError} hasNotice={hasNotice} />
      <ApplicationContactDetails {...application} />
      <ResumePanel
        applicationId={application.id}
        revision={application.revision}
        editable={false}
        resume={resume}
      />
      <ApplicationLetters application={application} />
      <PrivateNotesSection applicationId={application.id} notes={notes} />
      <ReviewStatusSection application={application} events={events} />
    </main>
  );
}

function ReviewHeader({ application }: { application: Application }) {
  return (
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold">{application.job_title}</h1>
      <p>Applicant {application.applicant_id}</p>
      <p>
        Review status:{" "}
        <strong>{reviewStatusLabel(application.review_status)}</strong>
      </p>
      <p className="text-sm text-muted-foreground">
        Submitted {new Date(application.submitted_at).toLocaleString()}
      </p>
    </header>
  );
}

function ReviewNotices({
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
          The change was not saved. Reload this page and try again.
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

function ApplicationLetters({ application }: { application: Application }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Original cover letter</h2>
        <p className="whitespace-pre-wrap rounded-lg border p-4">
          {application.original_submitted_letter}
        </p>
      </section>
      <HrAiSummary applicationId={application.id} />
      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Current cover letter</h2>
        <p className="whitespace-pre-wrap rounded-lg border p-4">
          {application.cover_letter}
        </p>
      </section>
    </div>
  );
}

function PrivateNotesSection({
  applicationId,
  notes,
}: {
  applicationId: string;
  notes: Notes;
}) {
  return (
    <section className="space-y-4 border-t pt-6">
      <h2 className="text-xl font-semibold">Private HR notes</h2>
      <NotesList notes={notes} />
      <form action={addHRNote} className="space-y-3">
        <input type="hidden" name="applicationId" value={applicationId} />
        <label htmlFor="hr-note" className="block font-medium">
          Add a note
        </label>
        <textarea
          id="hr-note"
          name="body"
          required
          maxLength={2000}
          rows={5}
          className="w-full rounded-lg border p-3"
        />
        <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
          Add note
        </button>
      </form>
    </section>
  );
}

function NotesList({ notes }: { notes: Notes }) {
  if (notes.length === 0) return <p>No notes yet.</p>;
  return (
    <ul className="space-y-3">
      {notes.map((note) => (
        <li key={note.id} className="rounded-lg border p-4">
          <p className="whitespace-pre-wrap">{note.body}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            By {note.author_id} · {new Date(note.created_at).toLocaleString()}
          </p>
        </li>
      ))}
    </ul>
  );
}

function ReviewStatusSection({
  application,
  events,
}: {
  application: Application;
  events: Events;
}) {
  return (
    <section className="space-y-4 border-t pt-6">
      <h2 className="text-xl font-semibold">Change review status</h2>
      <p className="text-sm text-muted-foreground">
        This is a separate human action. It does not change the cover letter.
      </p>
      <ReviewStatusForm application={application} />
      <StatusHistory events={events} />
    </section>
  );
}

function ReviewStatusForm({ application }: { application: Application }) {
  return (
    <form action={changeHRStatus} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="applicationId" value={application.id} />
      <input
        type="hidden"
        name="expectedRevision"
        value={application.review_revision}
      />
      <div className="space-y-2">
        <label htmlFor="review-status" className="block font-medium">
          New status
        </label>
        <select
          id="review-status"
          name="status"
          required
          defaultValue=""
          className="rounded-lg border bg-background p-2"
        >
          <option value="" disabled>
            Choose status
          </option>
          <option value="in_review">In review</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <button className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">
        Update status
      </button>
    </form>
  );
}

function StatusHistory({ events }: { events: Events }) {
  if (events.length === 0) return null;
  return (
    <>
      <h3 className="font-medium">Status history</h3>
      <ul className="space-y-2">
        {events.map((event) => (
          <li key={event.id} className="text-sm text-muted-foreground">
            {reviewStatusLabel(event.from_status)} →{" "}
            {reviewStatusLabel(event.to_status)} ·{" "}
            {new Date(event.created_at).toLocaleString()} · By {event.actor_id}
          </li>
        ))}
      </ul>
    </>
  );
}
