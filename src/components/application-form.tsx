"use client";

import { useState } from "react";

import { updateApplication } from "@/app/applications/actions";
import { ApplicantAiDraft } from "@/components/applicant-ai-draft";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ApplicationForm({
  jobId, value, revision, submitted,
}: { jobId: string; value: string; revision: number | null; submitted: boolean }) {
  const [coverLetter, setCoverLetter] = useState(value);

  if (submitted) {
    return <section className="space-y-3 rounded-lg border p-4">
      <h2 className="text-xl font-semibold">Current cover letter</h2>
      <p className="whitespace-pre-wrap">{coverLetter}</p>
      <p className="text-sm text-muted-foreground">Submitted applications are locked. Contact HR if you need to request a correction.</p>
    </section>;
  }

  return <div className="mt-8 space-y-5">
    <ApplicantAiDraft jobId={jobId} onDraft={setCoverLetter} />
    <form action={updateApplication.bind(null, jobId)} className="space-y-5">
      <input type="hidden" name="revision" value={revision ?? ""} />
      <div className="space-y-2">
        <Label htmlFor="cover_letter">Cover letter</Label>
        <Textarea id="cover_letter" name="cover_letter" value={coverLetter}
          onChange={(event) => setCoverLetter(event.target.value)} maxLength={5000}
          rows={12} aria-describedby="letter-help" />
        <p id="letter-help" className="text-sm text-muted-foreground">Maximum 5,000 characters. Your saved draft is private. Submitting is a separate action.</p>
      </div>
      <div className="flex flex-wrap gap-3">
        <button type="submit" name="intent" value="save" formNoValidate className="rounded-lg border px-4 py-2">Save draft</button>
        <button type="submit" name="intent" value="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Submit application</button>
      </div>
    </form>
  </div>;
}
