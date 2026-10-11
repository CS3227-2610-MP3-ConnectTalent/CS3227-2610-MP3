"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/profile/actions";
import { PhoneInput } from "@/components/phone-input";
import { ResumePanel } from "@/components/resume-panel";
import type { ResumeMetadata } from "@/lib/application-resumes";
import type { ApplicantProfile } from "@/lib/applicant-profile";
import type { ProfileState } from "@/app/profile/actions";

type FieldKey = "full_name" | "portfolio_url" | "education" | "work_experience";
type FieldSpec = {
  key: FieldKey;
  label: string;
  limit: number;
  multiline?: boolean;
};
const fields: FieldSpec[] = [
  { key: "full_name", label: "Full name", limit: 120 },
  { key: "portfolio_url", label: "Portfolio URL (optional)", limit: 2048 },
  {
    key: "education",
    label: "Education (optional)",
    limit: 2000,
    multiline: true,
  },
  {
    key: "work_experience",
    label: "Work experience (optional)",
    limit: 2000,
    multiline: true,
  },
];

export function ProfileForm({
  profile,
  email,
  resume = null,
}: {
  profile: ApplicantProfile;
  email: string;
  resume?: ResumeMetadata | null;
}) {
  const [state, action, pending] = useActionState(saveProfile, {
    values: Object.fromEntries(
      Object.entries(profile).map(([key, value]) => [key, value ?? ""]),
    ),
    errors: {},
  });
  return (
    <form action={action} className="space-y-5 rounded-xl border p-5">
      <VerifiedEmail email={email} />
      <ProfileFields state={state} />
      <ResumePanel
        profileMode
        applicationId={null}
        revision={null}
        editable
        resume={resume}
      />
      <ProfileFeedback state={state} />
      <SaveProfileButton pending={pending} />
    </form>
  );
}

function VerifiedEmail({ email }: { email: string }) {
  return (
    <label className="block">
      Verified email
      <input
        readOnly
        value={email}
        className="mt-2 w-full rounded-lg border bg-muted p-3"
      />
    </label>
  );
}

function ProfileFields({ state }: { state: ProfileState }) {
  return (
    <>
      <ProfileField field={fields[0]} state={state} />
      <PhoneInput value={state.values.phone} error={state.errors.phone} />
      {fields.slice(1).map((field) => (
        <ProfileField key={field.key} field={field} state={state} />
      ))}
    </>
  );
}

function ProfileField({
  field,
  state,
}: {
  field: FieldSpec;
  state: ProfileState;
}) {
  const error = state.errors[field.key];
  return (
    <div>
      <label htmlFor={`profile-${field.key}`} className="block font-medium">
        {field.label}
      </label>
      <ProfileFieldInput
        field={field}
        value={state.values[field.key]}
        error={error}
      />
      <ProfileFieldHelp field={field} error={error} />
    </div>
  );
}

function ProfileFieldInput({
  field,
  value,
  error,
}: {
  field: FieldSpec;
  value: string;
  error?: string;
}) {
  const common = {
    id: `profile-${field.key}`,
    name: field.key,
    maxLength: field.limit,
    defaultValue: value,
    "aria-invalid": Boolean(error),
    "aria-describedby":
      field.key !== "full_name" || error ? `help-${field.key}` : undefined,
    className: "mt-2 w-full rounded-lg border p-3",
  };
  return field.multiline ? (
    <textarea {...common} rows={5} />
  ) : (
    <input {...common} required={field.key === "full_name"} />
  );
}

function ProfileFieldHelp({
  field,
  error,
}: {
  field: FieldSpec;
  error?: string;
}) {
  if (field.key === "full_name" && !error) return null;
  return (
    <p id={`help-${field.key}`} className="text-sm text-muted-foreground">
      {error ?? `Optional. Maximum ${field.limit.toLocaleString()} characters.`}
    </p>
  );
}

function ProfileFeedback({ state }: { state: ProfileState }) {
  if (!state.message) return null;
  return (
    <p role={Object.keys(state.errors).length ? "alert" : "status"}>
      {state.message}
    </p>
  );
}

function SaveProfileButton({ pending }: { pending: boolean }) {
  return (
    <button
      disabled={pending}
      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
    >
      {pending ? "Saving…" : "Save profile"}
    </button>
  );
}
