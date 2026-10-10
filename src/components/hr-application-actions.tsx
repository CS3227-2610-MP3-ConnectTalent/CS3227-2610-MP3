import { addHRNote, changeHRStatus } from "@/app/hr/applications/actions";
import { listHRNotes, listHRStatusEvents } from "@/lib/hr-applications";
import { reviewStatusLabel } from "@/lib/hr-input";
import { getSubmittedApplication } from "@/lib/hr-applications";

type Application = NonNullable<
  Awaited<ReturnType<typeof getSubmittedApplication>>
>;
type Notes = Awaited<ReturnType<typeof listHRNotes>>;
type Events = Awaited<ReturnType<typeof listHRStatusEvents>>;

export function HRApplicationActions({
  application,
  notes,
  events,
  editable,
}: {
  application: Application;
  notes: Notes;
  events: Events;
  editable: boolean;
}) {
  return (
    <>
      <PrivateNotes
        applicationId={application.id}
        notes={notes}
        editable={editable}
      />
      <ReviewStatusSection
        application={application}
        events={events}
        editable={editable}
      />
    </>
  );
}

function PrivateNotes({
  applicationId,
  notes,
  editable,
}: {
  applicationId: string;
  notes: Notes;
  editable: boolean;
}) {
  return (
    <section className="space-y-3 border-t pt-6">
      <h2 className="text-xl font-semibold">Private HR notes</h2>
      <HRNoteList notes={notes} />
      {editable && <HRNoteForm applicationId={applicationId} />}
    </section>
  );
}

function HRNoteList({ notes }: { notes: Notes }) {
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

function HRNoteForm({ applicationId }: { applicationId: string }) {
  return (
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
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Add note
      </button>
    </form>
  );
}

function ReviewStatusSection({
  application,
  events,
  editable,
}: {
  application: Application;
  events: Events;
  editable: boolean;
}) {
  return (
    <section className="space-y-4 border-t pt-6">
      <h2 className="text-xl font-semibold">Change review status</h2>
      <p className="text-sm text-muted-foreground">
        This is a separate human action. It does not change the cover letter.
      </p>
      {editable && <StatusUpdateForm application={application} />}
      <StatusHistory events={events} />
    </section>
  );
}

function StatusUpdateForm({ application }: { application: Application }) {
  return (
    <form action={changeHRStatus} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="applicationId" value={application.id} />
      <input
        type="hidden"
        name="expectedRevision"
        value={application.review_revision}
      />
      <ReviewStatusSelect />
      <button
        type="submit"
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Update status
      </button>
    </form>
  );
}

function ReviewStatusSelect() {
  return (
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
