"use client";

import { useActionState, useState } from "react";
import { updateApplication } from "@/app/applications/actions";
import { ApplicantAiDraft } from "@/components/applicant-ai-draft";
import { ApplicationContactDetails } from "@/components/application-contact-details";
import {
  ApplicantContactFields,
  ApplicationBackgroundFields,
  ApplicationFormActions,
  CoverLetterField,
} from "@/components/application-form-fields";
import type { ApplicationFormState } from "@/lib/application-form-state";

type ApplicationDetails = {
  full_name: string | null;
  phone: string | null;
  portfolio_url: string | null;
  submitted_email: string | null;
  education?: string | null;
  work_experience?: string | null;
};
type ApplicationFormProps = {
  jobId: string;
  value: string;
  revision: number | null;
  submitted: boolean;
  email: string;
  details: ApplicationDetails;
};

export function ApplicationForm(props: ApplicationFormProps) {
  const initial = createInitialState(props.details, props.value);
  const [state, formAction, pending] = useActionState(
    updateApplication,
    initial,
    `/jobs/${props.jobId}/apply`,
  );
  const [coverLetter, setCoverLetter] = useState(state.values.cover_letter);
  if (props.submitted)
    return (
      <SubmittedApplication details={props.details} coverLetter={coverLetter} />
    );
  return (
    <ApplicationDraftForm
      {...props}
      state={state}
      formAction={formAction}
      pending={pending}
      coverLetter={coverLetter}
      setCoverLetter={setCoverLetter}
    />
  );
}

function createInitialState(
  details: ApplicationDetails,
  coverLetter: string,
): ApplicationFormState {
  return {
    values: {
      education: details.education ?? "",
      work_experience: details.work_experience ?? "",
      full_name: details.full_name ?? "",
      phone: details.phone ?? "",
      portfolio_url: details.portfolio_url ?? "",
      cover_letter: coverLetter,
    },
    errors: {},
  };
}

function SubmittedApplication({
  details,
  coverLetter,
}: {
  details: ApplicationDetails;
  coverLetter: string;
}) {
  return (
    <div className="space-y-5">
      <ApplicationContactDetails {...details} />
      <section className="space-y-3 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Current cover letter</h2>
        <p className="whitespace-pre-wrap">{coverLetter}</p>
        <p className="text-sm text-muted-foreground">
          Submitted applications are locked. Contact HR if you need to request a
          correction.
        </p>
      </section>
    </div>
  );
}

function ApplicationDraftForm({
  jobId,
  revision,
  email,
  state,
  formAction,
  pending,
  coverLetter,
  setCoverLetter,
}: ApplicationFormProps & {
  state: ApplicationFormState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  coverLetter: string;
  setCoverLetter: (value: string) => void;
}) {
  return (
    <div className="mt-8 space-y-5">
      <form action={formAction} className="form-surface space-y-5">
        <input type="hidden" name="jobId" value={jobId} />
        <input type="hidden" name="revision" value={revision ?? ""} />
        <ApplicationFormMessage message={state.message} />
        <fieldset disabled={pending} className="space-y-5">
          <legend className="mb-4 text-xl font-semibold">Your details</legend>
          <ApplicantContactFields
            values={state.values}
            errors={state.errors}
            email={email}
          />
          <ApplicationBackgroundFields
            values={state.values}
            errors={state.errors}
          />
          <CoverLetterField
            value={coverLetter}
            error={state.errors.cover_letter}
            onChange={setCoverLetter}
          />
          <ApplicationFormActions />
        </fieldset>
        {pending && <p role="status">Saving your application…</p>}
      </form>
      <ApplicantAiDraft jobId={jobId} onDraft={setCoverLetter} />
    </div>
  );
}

function ApplicationFormMessage({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-lg border border-destructive p-3 text-destructive"
    >
      {message}
    </p>
  );
}
