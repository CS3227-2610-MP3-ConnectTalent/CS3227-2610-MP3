"use client";

import type { ResumeMetadata } from "@/lib/application-resumes";
import { useResumePanelActions } from "./resume-panel-actions";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

export function ResumePanel(props: ResumePanelProps) {
  const state = useResumePanelActions(props);
  return (
    <section
      className="space-y-3 rounded-xl border p-5"
      aria-labelledby="resume-heading"
    >
      <h2 id="resume-heading" className="text-xl font-semibold">
        Résumé (optional)
      </h2>
      <ResumeDownload
        attachment={state.attachment}
        profileMode={props.profileMode ?? false}
        applicationId={props.applicationId}
      />
      <ResumeEditor
        props={props}
        file={state.file}
        pending={state.pending}
        activeIntent={state.activeIntent}
        activeRetry={state.activeRetry}
        attachment={state.attachment}
        uploadFailed={state.uploadFailed}
        onSelect={state.selectFile}
        onChange={state.change}
      />
      <ResumeFeedback
        message={state.message}
        activeIntent={state.activeIntent}
      />
    </section>
  );
}

function ResumeDownload({
  attachment,
  profileMode,
  applicationId,
}: {
  attachment: ResumeMetadata | null;
  profileMode: boolean;
  applicationId: string | null;
}) {
  if (!attachment) return <p>No résumé attached.</p>;
  const href = profileMode
    ? "/api/profile/resume"
    : `/api/applications/${applicationId}/resume`;
  return (
    <p className="break-all">
      <a href={href} className="underline">
        Download résumé: {attachment.filename}
      </a>{" "}
      ({Math.ceil(attachment.byte_size / 1024)} KiB)
    </p>
  );
}

function ResumeEditor({
  props,
  file,
  pending,
  activeIntent,
  activeRetry,
  attachment,
  uploadFailed,
  onSelect,
  onChange,
}: {
  props: ResumePanelProps;
  file: File | null;
  pending: boolean;
  activeIntent: ResumeIntent | null;
  activeRetry: boolean;
  attachment: ResumeMetadata | null;
  uploadFailed: boolean;
  onSelect: (file: File | null) => void;
  onChange: (intent: ResumeIntent, retry?: boolean) => Promise<void>;
}) {
  if (!props.editable) return null;
  return (
    <div className="space-y-3">
      <ResumeGuidance profileMode={props.profileMode ?? false} />
      <ResumeFilePicker pending={pending} onSelect={onSelect} />
      <ResumeActionButtons
        file={file}
        pending={pending}
        activeIntent={activeIntent}
        activeRetry={activeRetry}
        attachment={attachment}
        profileResume={props.profileResume ?? null}
        profileMode={props.profileMode ?? false}
        uploadFailed={uploadFailed}
        onChange={onChange}
      />
    </div>
  );
}
function ResumeGuidance({ profileMode }: { profileMode: boolean }) {
  return (
    <p className="text-sm">
      PDF only, up to 1 MiB.{" "}
      {profileMode
        ? "Uploading does not save other profile fields."
        : "Upload without saving your form. Submission locks your attachment."}{" "}
      Files are private and are not sent to AI.
    </p>
  );
}
function ResumeFilePicker({
  pending,
  onSelect,
}: {
  pending: boolean;
  onSelect: (file: File | null) => void;
}) {
  return (
    <label className="block">
      Choose PDF résumé
      <input
        type="file"
        accept=".pdf,application/pdf"
        disabled={pending}
        onChange={(event) => onSelect(event.target.files?.[0] ?? null)}
        className="mt-2 block w-full min-w-0 rounded-lg border p-2 text-sm file:mr-3 file:cursor-pointer file:rounded-md file:border-0 file:bg-primary file:px-4 file:py-2 file:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      />
    </label>
  );
}

type ResumeActionButtonsProps = {
  file: File | null;
  pending: boolean;
  activeIntent: ResumeIntent | null;
  activeRetry: boolean;
  attachment: ResumeMetadata | null;
  profileResume: ResumeMetadata | null;
  profileMode: boolean;
  uploadFailed: boolean;
  onChange: (intent: ResumeIntent, retry?: boolean) => Promise<void>;
};

function ResumeActionButtons({
  file,
  pending,
  activeIntent,
  activeRetry,
  attachment,
  profileResume,
  profileMode,
  uploadFailed,
  onChange,
}: ResumeActionButtonsProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <UploadButton
        pending={pending}
        active={activeIntent === "upload" && !activeRetry}
        hasFile={Boolean(file)}
        hasAttachment={Boolean(attachment)}
        onClick={() => void onChange("upload")}
      />
      {attachment && (
        <RemoveButton
          pending={pending}
          active={activeIntent === "remove"}
          onClick={() => void onChange("remove")}
        />
      )}
      {!profileMode && profileResume && (
        <UseProfileButton
          pending={pending}
          active={activeIntent === "profile"}
          onClick={() => void onChange("profile")}
        />
      )}
      {(uploadFailed || activeRetry) && file && (
        <RetryButton
          pending={pending}
          active={activeRetry}
          onClick={() => void onChange("upload", true)}
        />
      )}
    </div>
  );
}
function UploadButton({
  pending,
  active,
  hasFile,
  hasAttachment,
  onClick,
}: {
  pending: boolean;
  active: boolean;
  hasFile: boolean;
  hasAttachment: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending || !hasFile}
      onClick={onClick}
      className="rounded-lg bg-primary px-4 py-2 text-primary-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {active
        ? hasAttachment
          ? "Replacing résumé…"
          : "Uploading résumé…"
        : hasAttachment
          ? "Replace résumé"
          : "Upload résumé"}
    </button>
  );
}

function RemoveButton({
  pending,
  active,
  onClick,
}: {
  pending: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="rounded-lg border px-4 py-2"
    >
      {active ? "Removing résumé…" : "Remove résumé"}
    </button>
  );
}

function UseProfileButton({
  pending,
  active,
  onClick,
}: {
  pending: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="rounded-lg border px-4 py-2"
    >
      {active ? "Using profile résumé…" : "Use profile résumé"}
    </button>
  );
}

function RetryButton({
  pending,
  active,
  onClick,
}: {
  pending: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="rounded-lg border px-4 py-2 disabled:opacity-50"
    >
      {active ? "Retrying upload…" : "Retry upload"}
    </button>
  );
}

function ResumeFeedback({
  message,
  activeIntent,
}: {
  message: string;
  activeIntent: ResumeIntent | null;
}) {
  return (
    <>
      {message && <p role="status">{message}</p>}
      {activeIntent && <p role="status">Résumé change in progress…</p>}
    </>
  );
}
