"use client";

import { useActionState } from "react";
import { saveProfile } from "@/app/profile/actions";
import type { ApplicantProfile } from "@/lib/applicant-profile";

const profileFields = [
  { key: "full_name", label: "Full name", limit: 120 },
  { key: "phone", label: "Phone (optional)", limit: 40 },
  { key: "portfolio_url", label: "Portfolio URL (optional)", limit: 2048 },
  { key: "education", label: "Education (optional)", limit: 2000 },
  { key: "work_experience", label: "Work experience (optional)", limit: 2000 },
] as const;

type ProfileState = Awaited<ReturnType<typeof saveProfile>>;
type ProfileFieldKey = (typeof profileFields)[number]["key"];

export function ProfileForm({
  profile,
  email,
}: {
  profile: ApplicantProfile;
  email: string;
}) {
  const [state, action, pending] = useActionState(saveProfile, {
    values: Object.fromEntries(
      Object.entries(profile).map(([key, value]) => [key, value ?? ""]),
    ),
    errors: {},
  });
  return (
    <form action={action} className="space-y-5 rounded-xl border p-5">
      <VerifiedProfileEmail email={email} />
      {profileFields.map((field) => (
        <ProfileField key={field.key} field={field} state={state} />
      ))}
      <ProfileFormFeedback state={state} pending={pending} />
    </form>
  );
}

function VerifiedProfileEmail({ email }: { email: string }) {
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

function ProfileField({
  field,
  state,
}: {
  field: (typeof profileFields)[number];
  state: ProfileState;
}) {
  const id = `profile-${field.key}`;
  return (
    <div>
      <label htmlFor={id} className="block font-medium">
        {field.label}
      </label>
      <ProfileFieldInput field={field} id={id} state={state} />
      <p id={`help-${field.key}`} className="text-sm text-muted-foreground">
        {state.errors[field.key] ??
          `Optional. Maximum ${field.limit.toLocaleString()} characters.`}
      </p>
    </div>
  );
}

function ProfileFieldInput({
  field,
  id,
  state,
}: {
  field: (typeof profileFields)[number];
  id: string;
  state: ProfileState;
}) {
  const props = {
    id,
    name: field.key,
    maxLength: field.limit,
    defaultValue: state.values[field.key as ProfileFieldKey],
    "aria-invalid": Boolean(state.errors[field.key]),
    "aria-describedby": `help-${field.key}`,
    className: "mt-2 w-full rounded-lg border p-3",
  };
  if (field.key === "education" || field.key === "work_experience")
    return <textarea {...props} rows={5} />;
  return <input {...props} />;
}

function ProfileFormFeedback({
  state,
  pending,
}: {
  state: ProfileState;
  pending: boolean;
}) {
  return (
    <>
      {state.message && (
        <p role={Object.keys(state.errors).length ? "alert" : "status"}>
          {state.message}
        </p>
      )}
      <button
        disabled={pending}
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </>
  );
}
