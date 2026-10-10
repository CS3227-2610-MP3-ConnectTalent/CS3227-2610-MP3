"use client";

import { useState } from "react";

import { Textarea } from "@/components/ui/textarea";

export function ApplicantAiDraft({ jobId, onDraft }: { jobId: string; onDraft: (draft: string) => void }) {
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);

  async function generate() {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const response = await fetch("/api/ai/applicant-draft", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ jobId, notes }),
      });
      let result: unknown;
      try {
        result = await response.json() as unknown;
      } catch {
        throw new Error("AI drafting is temporarily unavailable. Your notes are still here; try again later.");
      }

      if (!response.ok || typeof result !== "object" || result === null || !("draft" in result)
        || typeof result.draft !== "string") {
        const message = typeof result === "object" && result !== null && "error" in result && typeof result.error === "string"
          ? result.error
          : "AI drafting is temporarily unavailable. Your notes are still here; try again later.";
        throw new Error(message);
      }

      onDraft(result.draft);
      setNotice("Draft added to the editable cover letter. Check every date, skill, and achievement before saving or submitting.");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI drafting is temporarily unavailable. Your notes are still here; try again later.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="space-y-3 rounded-lg border p-4" aria-labelledby="ai-draft-heading">
    <div className="space-y-1">
      <h2 id="ai-draft-heading" className="text-lg font-semibold">Draft with AI</h2>
      <p className="text-sm text-muted-foreground">Add experience notes. These notes and this job’s title and requirements are sent to SoCLaaS for this request only. Generation does not save or submit your application.</p>
      <p className="text-sm text-muted-foreground">AI can make mistakes. Check every date, skill, and achievement before saving or submitting.</p>
    </div>
    <div className="space-y-3">
      <label htmlFor="ai-experience-notes" className="block font-medium">Experience notes</label>
      <Textarea id="ai-experience-notes" value={notes} onChange={(event) => setNotes(event.target.value)}
        maxLength={4000} rows={5} aria-describedby="ai-notes-limit" />
      <p id="ai-notes-limit" className="text-sm text-muted-foreground">Maximum 4,000 characters. Notes are used for this request only.</p>
      <button type="button" onClick={() => void generate()} disabled={busy || notes.trim().length === 0}
        className="rounded-lg border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-60">
        {busy ? "Drafting…" : "Generate draft"}
      </button>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      {notice && <p role="status" className="text-sm">{notice}</p>}
    </div>
  </section>;
}
