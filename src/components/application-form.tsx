"use client";

import { useActionState, useState } from "react";
import { updateApplication } from "@/app/applications/actions";
import { ApplicantAiDraft } from "@/components/applicant-ai-draft";
import { ApplicationContactDetails } from "@/components/application-contact-details";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ApplicationFormState } from "@/lib/application-form-state";

export function ApplicationForm({ jobId, value, revision, submitted, details, email }: {
  jobId: string; value: string; revision: number | null; submitted: boolean; email: string;
  details: { full_name: string | null; phone: string | null; portfolio_url: string | null; submitted_email: string | null; education?: string | null; work_experience?: string | null };
}) {
  const initial: ApplicationFormState = { values: {
    education: details.education ?? "", work_experience: details.work_experience ?? "", full_name: details.full_name ?? "", phone: details.phone ?? "", portfolio_url: details.portfolio_url ?? "", cover_letter: value,
  }, errors: {} };
  const [state, formAction, pending] = useActionState(updateApplication, initial, `/jobs/${jobId}/apply`);
  const [coverLetter, setCoverLetter] = useState(state.values.cover_letter);
  if (submitted) return <div className="space-y-5">
    <ApplicationContactDetails {...details} />
    <section className="space-y-3 rounded-lg border p-4"><h2 className="text-xl font-semibold">Current cover letter</h2>
      <p className="whitespace-pre-wrap">{coverLetter}</p>
      <p className="text-sm text-muted-foreground">Submitted applications are locked. Contact HR if you need to request a correction.</p>
    </section>
  </div>;
  return <div className="mt-8 space-y-5">
    <form action={formAction} className="form-surface space-y-5">
      <input type="hidden" name="jobId" value={jobId} />
      <input type="hidden" name="revision" value={revision ?? ""} />
      {state.message && <p role="alert" className="rounded-lg border border-destructive p-3 text-destructive">{state.message}</p>}
      <fieldset disabled={pending} className="space-y-5">
        <legend className="mb-4 text-xl font-semibold">Your details</legend>
        <div className="space-y-2"><Label htmlFor="full_name">Full name</Label>
          <input id="full_name" name="full_name" required maxLength={120} autoComplete="name" defaultValue={state.values.full_name}
            aria-invalid={Boolean(state.errors.full_name)} aria-describedby="name-help" className="w-full rounded-lg border p-3" />
          <p id="name-help" className="text-sm text-muted-foreground">{state.errors.full_name ?? "Required when submitting. Maximum 120 characters."}</p>
        </div>
        <div className="space-y-2"><Label htmlFor="verified_email">Verified email</Label>
          <input id="verified_email" type="email" readOnly value={email} className="w-full rounded-lg border bg-muted p-3" aria-describedby="email-help" />
          <p id="email-help" className="text-sm text-muted-foreground">From your verified account. This address is recorded when you submit.</p>
        </div>
        <div className="space-y-2"><Label htmlFor="phone">Phone (optional)</Label>
          <input id="phone" name="phone" type="tel" maxLength={40} autoComplete="tel" defaultValue={state.values.phone}
            aria-invalid={Boolean(state.errors.phone)} aria-describedby="phone-help" className="w-full rounded-lg border p-3" />
          <p id="phone-help" className="text-sm text-muted-foreground">{state.errors.phone ?? "Include a country code if appropriate. Maximum 40 characters."}</p>
        </div>
        <div className="space-y-2"><Label htmlFor="portfolio_url">Portfolio URL (optional)</Label>
          <input id="portfolio_url" name="portfolio_url" inputMode="url" maxLength={2048} defaultValue={state.values.portfolio_url}
            aria-invalid={Boolean(state.errors.portfolio_url)} aria-describedby="portfolio-help" className="w-full rounded-lg border p-3" />
          <p id="portfolio-help" className="text-sm text-muted-foreground">{state.errors.portfolio_url ?? "Use an http:// or https:// address without embedded credentials. Maximum 2,048 characters."}</p>
        </div>
        {([['education','Education (optional)'],['work_experience','Work experience (optional)']] as const).map(([key,label]) => <div className="space-y-2" key={key}><Label htmlFor={key}>{label}</Label><Textarea id={key} name={key} rows={5} maxLength={2000} defaultValue={state.values[key]} aria-invalid={Boolean(state.errors[key])} aria-describedby={key+'-help'} /><p id={key+'-help'} className="text-sm text-muted-foreground">{state.errors[key] ?? 'Optional. Maximum 2,000 characters. Submitted details are locked.'}</p></div>)}
        <div className="space-y-2"><Label htmlFor="cover_letter">Cover letter</Label>
          <Textarea id="cover_letter" name="cover_letter" value={coverLetter} onChange={(event) => setCoverLetter(event.target.value)}
            maxLength={5000} rows={12} aria-invalid={Boolean(state.errors.cover_letter)} aria-describedby="letter-help" />
          <p id="letter-help" className="text-sm text-muted-foreground">{state.errors.cover_letter ?? "Maximum 5,000 characters. Drafts are private; submission shares your details and letter with HR and locks them."}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="submit" name="intent" value="save" formNoValidate className="rounded-lg border px-4 py-2">Save draft</button>
          <button type="submit" name="intent" value="submit" className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">Submit application</button>
        </div>
      </fieldset>
      {pending && <p role="status">Saving your application…</p>}
    </form>
    <ApplicantAiDraft jobId={jobId} onDraft={setCoverLetter} />
  </div>;
}
