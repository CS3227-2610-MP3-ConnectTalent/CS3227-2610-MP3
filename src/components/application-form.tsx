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
import { ResumePanel } from "@/components/resume-panel";
import type { ResumeMetadata } from "@/lib/application-resumes";
import type { ApplicationFormState } from "@/lib/application-form-state";

type ApplicationDetails = {
  full_name: string | null;
  phone: string | null;
  portfolio_url: string | null;
  submitted_email: string | null;
  education?: string | null;
  work_experience?: string | null;
};

type Props = {
  jobId: string;
  value: string;
  revision: number | null;
  submitted: boolean;
  details: ApplicationDetails;
  email: string;
  applicationId?: string | null;
  resume?: ResumeMetadata | null;
  profileResume?: ResumeMetadata | null;
};

export function ApplicationForm(props: Props) {
  const initial = createInitialState(props.details, props.value);
  const [state, formAction, pending] = useActionState(
    updateApplication,
    initial,
    `/jobs/${props.jobId}/apply`,
  );
  const [coverLetter, setCoverLetter] = useState(state.values.cover_letter);
  const [attachment, setAttachment] = useState({
    applicationId: props.applicationId ?? null,
    revision: props.revision,
  });
  const [attachmentPending, setAttachmentPending] = useState(false);
  if (props.submitted)
    return (
      <SubmittedApplication details={props.details} coverLetter={coverLetter} />
    );
  return (
    <ApplicationDraftForm
      {...props}
      state={state}
      formAction={formAction}
      pending={pending || attachmentPending}
      attachment={attachment}
      setAttachment={setAttachment}
      onAttachmentPending={setAttachmentPending}
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

type Attachment = { applicationId: string | null; revision: number | null };
type DraftProps = Props & {
  state: ApplicationFormState;
  formAction: (formData: FormData) => void;
  pending: boolean;
  attachment: Attachment;
  setAttachment: (value: Attachment) => void;
  onAttachmentPending: (value: boolean) => void;
  coverLetter: string;
  setCoverLetter: (value: string) => void;
};

function ApplicationDraftForm(props: DraftProps) {
  return (
    <div className="mt-8 space-y-5">
      <form action={props.formAction} className="form-surface space-y-5">
        <input type="hidden" name="jobId" value={props.jobId} />
        <input
          type="hidden"
          name="revision"
          value={props.attachment.revision ?? ""}
        />
        <ApplicationFormMessage message={props.state.message} />
        <fieldset disabled={props.pending} className="space-y-5">
          <legend className="mb-4 text-xl font-semibold">Your details</legend>
          <ApplicantContactFields
            values={props.state.values}
            errors={props.state.errors}
            email={props.email}
          />
          <ApplicationBackgroundFields
            values={props.state.values}
            errors={props.state.errors}
          />
          <ApplicationResumeFields {...props} />
          <ApplicantAiDraft
            jobId={props.jobId}
            onDraft={props.setCoverLetter}
          />
          <CoverLetterField
            value={props.coverLetter}
            error={props.state.errors.cover_letter}
            onChange={props.setCoverLetter}
          />
          <ApplicationFormActions />
        </fieldset>
        {props.pending && <p role="status">Saving your application…</p>}
      </form>
    </div>
  );
}

function ApplicationResumeFields(props: DraftProps) {
  return (
    <ResumePanel
      jobId={props.jobId}
      applicationId={props.attachment.applicationId}
      revision={props.attachment.revision}
      editable
      resume={props.resume ?? null}
      profileResume={props.profileResume}
      onPending={props.onAttachmentPending}
      onChange={(result) => {
        if (
          typeof result.applicationId === "string" &&
          typeof result.revision === "number"
        )
          props.setAttachment({
            applicationId: result.applicationId,
            revision: result.revision,
          });
      }}
    />
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
