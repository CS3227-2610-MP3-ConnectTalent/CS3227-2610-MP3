"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";

export function ApplicantAiDraft({
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

  async function generate() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      onDraft(await requestDraft(jobId, notes));
      setNotice(
        "Draft added to the editable cover letter. Check every date, skill, and achievement before saving or submitting.",
      );
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section
      className="space-y-3 rounded-lg border p-4"
      aria-labelledby="ai-draft-heading"
    >
      <DraftGuidance />
      <DraftControls
        notes={notes}
        setNotes={setNotes}
        busy={busy}
        onGenerate={() => void generate()}
        error={error}
        notice={notice}
      />
    </section>
  );
}

async function requestDraft(jobId: string, notes: string): Promise<string> {
  const response = await fetch("/api/ai/applicant-draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ jobId, notes }),
  });
  const result = await readResult(response);
  if (!response.ok || !isDraftResult(result))
    throw new Error(getApiError(result));
  return result.draft;
}

async function readResult(response: Response): Promise<unknown> {
  try {
    return (await response.json()) as unknown;
  } catch {
    throw new Error(fallbackMessage);
  }
}

const fallbackMessage =
  "AI drafting is temporarily unavailable. Your notes are still here; try again later.";

function isDraftResult(value: unknown): value is { draft: string } {
  return (
    typeof value === "object" &&
    value !== null &&
    "draft" in value &&
    typeof value.draft === "string"
  );
}

function getApiError(value: unknown) {
  if (
    typeof value === "object" &&
    value !== null &&
    "error" in value &&
    typeof value.error === "string"
  )
    return value.error;
  return fallbackMessage;
}

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : fallbackMessage;
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

function DraftControls({
  notes,
  setNotes,
  busy,
  onGenerate,
  error,
  notice,
}: {
  notes: string;
  setNotes: (notes: string) => void;
  busy: boolean;
  onGenerate: () => void;
  error: string;
  notice: string;
}) {
  return (
    <div className="space-y-3">
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
        type="button"
        onClick={onGenerate}
        disabled={busy || notes.trim().length === 0}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? "Drafting…" : "Generate draft"}
      </button>
      <DraftMessage role="alert" value={error} />
      <DraftMessage role="status" value={notice} />
    </div>
  );
}

function DraftMessage({
  role,
  value,
}: {
  role: "alert" | "status";
  value: string;
}) {
  if (!value) return null;
  return (
    <p role={role} className="text-sm">
      {value}
    </p>
  );
}
