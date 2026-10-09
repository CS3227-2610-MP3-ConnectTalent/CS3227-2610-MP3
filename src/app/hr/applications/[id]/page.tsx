import Link from "next/link";
import { notFound } from "next/navigation";

import { addHRNote, changeHRStatus } from "@/app/hr/applications/actions";
import { HrAiSummary } from "@/components/hr-ai-summary";
import { getSubmittedApplication, listHRNotes, listHRStatusEvents } from "@/lib/hr-applications";
import { requireHR } from "@/lib/hr-auth";
import { reviewStatusLabel } from "@/lib/hr-input";

export const dynamic = "force-dynamic";

export default async function HRApplicationDetail({
  params, searchParams,
}: { params: Promise<{ id: string }>; searchParams: Promise<{ error?: string; notice?: string }> }) {
  await requireHR();
  const { id } = await params;
  let application;
  let notes;
  let events;
  try {
    application = await getSubmittedApplication(id);
    if (application) [notes, events] = await Promise.all([listHRNotes(id), listHRStatusEvents(id)]);
  } catch {
    return <main className="mx-auto max-w-3xl px-5 py-10">
      <h1 className="text-3xl font-semibold">Application review</h1>
      <p role="alert" className="mt-5">Review data is temporarily unavailable. Try again later.</p>
    </main>;
  }
  if (!application || !notes || !events) notFound();
  const { error, notice } = await searchParams;

  return <main className="mx-auto max-w-3xl space-y-8 px-5 py-10">
    <Link href="/hr/applications" className="underline">← Application review</Link>
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold">{application.job_title}</h1>
      <p>Applicant {application.applicant_id}</p>
      <p>Review status: <strong>{reviewStatusLabel(application.review_status)}</strong></p>
      <p className="text-sm text-muted-foreground">Submitted {new Date(application.submitted_at).toLocaleString()}</p>
    </header>
    {error && <p role="alert" className="rounded-lg border p-3">The change was not saved. Reload this page and try again.</p>}
    {notice && <p role="status" className="rounded-lg border p-3">The change was saved.</p>}

    <div className="grid gap-6 lg:grid-cols-2">
      <section className="space-y-3"><h2 className="text-xl font-semibold">Original cover letter</h2>
        <p className="whitespace-pre-wrap rounded-lg border p-4">{application.original_submitted_letter}</p></section>
      <HrAiSummary applicationId={application.id} />
    </div>
    <section className="space-y-3"><h2 className="text-xl font-semibold">Current cover letter</h2>
      <p className="whitespace-pre-wrap rounded-lg border p-4">{application.cover_letter}</p></section>

    <section className="space-y-4 border-t pt-6"><h2 className="text-xl font-semibold">Private HR notes</h2>
      {notes.length === 0 ? <p>No notes yet.</p> : <ul className="space-y-3">{notes.map((note) =>
        <li key={note.id} className="rounded-lg border p-4">
          <p className="whitespace-pre-wrap">{note.body}</p>
          <p className="mt-2 text-sm text-muted-foreground">By {note.author_id} · {new Date(note.created_at).toLocaleString()}</p>
        </li>)}</ul>}
      <form action={addHRNote} className="space-y-3">
        <input type="hidden" name="applicationId" value={application.id} />
        <label htmlFor="hr-note" className="block font-medium">Add a note</label>
        <textarea id="hr-note" name="body" required maxLength={2000} rows={5} className="w-full rounded-lg border p-3" />
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Add note</button>
      </form>
    </section>

    <section className="space-y-4 border-t pt-6"><h2 className="text-xl font-semibold">Change review status</h2>
      <p className="text-sm text-muted-foreground">This is a separate human action. It does not change the cover letter.</p>
      <form action={changeHRStatus} className="flex flex-wrap items-end gap-3">
        <input type="hidden" name="applicationId" value={application.id} />
        <input type="hidden" name="expectedRevision" value={application.review_revision} />
        <div className="space-y-2"><label htmlFor="review-status" className="block font-medium">New status</label>
          <select id="review-status" name="status" required defaultValue="" className="rounded-lg border bg-background p-2">
            <option value="" disabled>Choose status</option>
            <option value="in_review">In review</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="rejected">Rejected</option>
          </select></div>
        <button type="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Update status</button>
      </form>
      {events.length > 0 && <><h3 className="font-medium">Status history</h3><ul className="space-y-2">
        {events.map((event) => <li key={event.id} className="text-sm text-muted-foreground">
          {reviewStatusLabel(event.from_status)} → {reviewStatusLabel(event.to_status)} · {new Date(event.created_at).toLocaleString()} · By {event.actor_id}
        </li>)}
      </ul></>}
    </section>
  </main>;
}
