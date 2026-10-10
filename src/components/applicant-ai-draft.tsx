"use client";

import { useState, type FormEvent } from "react";

import { Textarea } from "@/components/ui/textarea";

const unavailableMessage =
  "AI drafting is temporarily unavailable. Your notes are still here; try again later.";
const successMessage =
  "Draft added to the editable cover letter. Check every date, skill, and achievement before saving or submitting.";

type DraftResponse = { draft: string };
type DraftState = {
  setError: (message: string) => void;
  setNotice: (message: string) => void;
  setBusy: (busy: boolean) => void;
};

export function ApplicantAiDraft({
  jobId,
  onDraft,
}: {
  jobId: string;
  onDraft: (draft: string) => void;
}) {
  return (
    <section
      className="space-y-3 rounded-lg border p-4"
      aria-labelledby="ai-draft-heading"
    >
      <DraftGuidance />
      <ApplicantAiDraftForm jobId={jobId} onDraft={onDraft} />
    </section>
  );
}

function DraftGuidance() {
  return (
    <div className="space-y-1">
      <h2 id="ai-draft-heading" className="text-lg font-semibold">
        Draft with AI
      </h2>
      <p className="text-sm text-muted-foreground">
        Add experience notes. These notes and this job’s title and requirements
        are sent to SoCLaaS for this request only. Generation does not save or
        submit your application.
      </p>
      <p className="text-sm text-muted-foreground">
        AI can make mistakes. Check every date, skill, and achievement before
        saving or submitting.
      </p>
    </div>
  );
}

function ApplicantAiDraftForm({
  jobId,
  onDraft,
}: {
  jobId: string;
  onDraft: (draft: string) => void;
}) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const state = { setError, setNotice, setBusy };

  return (
    <form
      onSubmit={(event) =>
        void generateDraft(event, jobId, notes, onDraft, state)
      }
      className="space-y-3"
    >
      <label htmlFor="ai-experience-notes" className="block font-medium">
        Experience notes
      </label>
      <Textarea
        id="ai-experience-notes"
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        maxLength={4000}
        rows={5}
        aria-describedby="ai-notes-limit"
      />
      <p id="ai-notes-limit" className="text-sm text-muted-foreground">
        Maximum 4,000 characters. Notes are used for this request only.
      </p>
      <button
        type="submit"
        disabled={busy || notes.trim().length === 0}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Drafting…" : "Generate draft"}
      </button>
      <DraftMessages error={error} notice={notice} />
    </form>
  );
}

function DraftMessages({ error, notice }: { error: string; notice: string }) {
  return (
    <>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm">
          {notice}
        </p>
      )}
    </>
  );
}

async function generateDraft(
  event: FormEvent<HTMLFormElement>,
  jobId: string,
  notes: string,
  onDraft: (draft: string) => void,
  state: DraftState,
) {
  event.preventDefault();
  state.setError("");
  state.setNotice("");
  state.setBusy(true);
  try {
    const draft = await requestDraft(jobId, notes);
    onDraft(draft);
    state.setNotice(successMessage);
  } catch (caught) {
    state.setError(
      caught instanceof Error ? caught.message : unavailableMessage,
    );
  } finally {
    state.setBusy(false);
  }
}

async function requestDraft(jobId: string, notes: string) {
  const response = await fetch("/api/ai/applicant-draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jobId, notes }),
  });
  const result = await readDraftResponse(response);
  if (!response.ok || !isDraftResponse(result))
    throw new Error(responseError(result));
  return result.draft;
}

async function readDraftResponse(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error(unavailableMessage);
  }
}

function isDraftResponse(result: unknown): result is DraftResponse {
  return (
    typeof result === "object" &&
    result !== null &&
    "draft" in result &&
    typeof result.draft === "string"
  );
}

function responseError(result: unknown) {
  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    typeof result.error === "string"
  )
    return result.error;
  return unavailableMessage;
}
