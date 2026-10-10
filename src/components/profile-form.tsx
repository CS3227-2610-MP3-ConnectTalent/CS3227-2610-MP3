"use client";
import { useActionState } from "react";
import { saveProfile } from "@/app/profile/actions";
import type { ApplicantProfile } from "@/lib/applicant-profile";
import { ResumePanel } from "@/components/resume-panel";
import type { ResumeMetadata } from "@/lib/application-resumes";
import { PhoneInput } from "@/components/phone-input";
export function ProfileForm({ profile, email, resume = null }: { profile: ApplicantProfile; email: string; resume?: ResumeMetadata | null }) {
  const [state, action, pending] = useActionState(saveProfile, { values: Object.fromEntries(Object.entries(profile).map(([key, value]) => [key, value ?? ""])), errors: {} });
  const fields = [{ key: "full_name", label: "Full name", limit: 120 },
    { key: "portfolio_url", label: "Portfolio URL (optional)", limit: 2048 }, { key: "education", label: "Education (optional)", limit: 2000 },
    { key: "work_experience", label: "Work experience (optional)", limit: 2000 }];
  return <form action={action} className="space-y-5 rounded-xl border p-5">
    <label className="block">Verified email<input readOnly value={email} className="mt-2 w-full rounded-lg border bg-muted p-3" /></label>
    {fields.map(({ key, label, limit }) => <div key={key}>
      <label htmlFor={`profile-${key}`} className="block font-medium">{label}</label>
      {key === "education" || key === "work_experience" ? <textarea id={`profile-${key}`} name={key} rows={5} maxLength={limit} defaultValue={state.values[key]}
        aria-invalid={Boolean(state.errors[key])} aria-describedby={`help-${key}`} className="mt-2 w-full rounded-lg border p-3" /> :
        <input id={`profile-${key}`} name={key} required={key === "full_name"} maxLength={limit} defaultValue={state.values[key]} aria-invalid={Boolean(state.errors[key])}
          aria-describedby={key !== "full_name" || state.errors[key] ? `help-${key}` : undefined} className="mt-2 w-full rounded-lg border p-3" />}
      {(key !== "full_name" || state.errors[key]) && <p id={`help-${key}`} className="text-sm text-muted-foreground">{state.errors[key] ?? `Optional. Maximum ${limit.toLocaleString()} characters.`}</p>}
      {key === "full_name" && <PhoneInput value={state.values.phone} error={state.errors.phone} />}
    </div>)}
    <ResumePanel profileMode applicationId={null} revision={null} editable resume={resume} />
    {state.message && <p role={Object.keys(state.errors).length ? "alert" : "status"}>{state.message}</p>}
    <button disabled={pending} className="rounded-lg bg-primary px-4 py-2 text-primary-foreground">{pending ? "Saving…" : "Save profile"}</button>
  </form>;
}
