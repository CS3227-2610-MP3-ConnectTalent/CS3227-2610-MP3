"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";

type ResumeIntent = "upload" | "remove" | "cancel";
type ResumePanelProps = {
  applicationId: string | null;
  revision: number | null;
  editable: boolean;
  resume: ResumeMetadata | null;
};
type ChangeState = {
  file: File | null;
  operation: string;
  setMessage: (message: string) => void;
  setPending: (pending: boolean) => void;
  refresh: () => void;
};

export function ResumePanel(props: ResumePanelProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const change = (intent: ResumeIntent) =>
    void submitResumeChange(intent, props, {
      file,
      operation,
      setMessage,
      setPending,
      refresh: () => router.refresh(),
    });
  return (
    <ResumePanelView
      {...props}
      file={file}
      setFile={setFile}
      setOperation={setOperation}
      pending={pending}
      message={message}
      onIntent={change}
    />
  );
}

async function submitResumeChange(
  intent: ResumeIntent,
  props: ResumePanelProps,
  state: ChangeState,
) {
  if (!props.applicationId || (intent === "upload" && !state.file)) {
    state.setMessage("Choose a PDF after saving your draft.");
    return;
  }
  state.setPending(true);
  state.setMessage("");
  try {
    const message = await sendResumeChange(intent, props, state);
    state.setMessage(message);
  } catch {
    state.setMessage(
      "We could not confirm the change. Reload to check your saved résumé.",
    );
  } finally {
    state.setPending(false);
    state.refresh();
  }
}

async function sendResumeChange(
  intent: ResumeIntent,
  props: ResumePanelProps,
  state: ChangeState,
) {
  const response = await fetch(
    `/api/applications/${props.applicationId}/resume`,
    {
      method: "POST",
      headers: resumeRequestHeaders(intent, props.revision, state),
      body: intent === "upload" ? state.file : undefined,
    },
  );
  const data = await response.json();
  return response.ok
    ? "Résumé change saved. Review the attachment below."
    : data.error || "Résumé change could not be saved.";
}

function resumeRequestHeaders(
  intent: ResumeIntent,
  revision: number | null,
  state: ChangeState,
) {
  return {
    "x-resume-intent": intent,
    "x-application-revision": String(revision ?? ""),
    ...(intent === "upload" && state.file
      ? {
          "content-type": state.file.type,
          "x-resume-filename": encodeURIComponent(state.file.name),
          "x-resume-operation": state.operation,
        }
      : {}),
  };
}

function ResumePanelView({
  applicationId,
  editable,
  resume,
  file,
  setFile,
  setOperation,
  pending,
  message,
  onIntent,
}: ResumePanelProps & {
  file: File | null;
  setFile: (file: File | null) => void;
  setOperation: (operation: string) => void;
  pending: boolean;
  message: string;
  onIntent: (intent: ResumeIntent) => void;
}) {
  return (
    <section
      className="space-y-3 rounded-xl border p-5"
      aria-labelledby="resume-heading"
    >
      <h2 id="resume-heading" className="text-xl font-semibold">
        Résumé (optional)
      </h2>
      <ResumeAttachment applicationId={applicationId} resume={resume} />
      {editable && (
        <ResumeControls
          applicationId={applicationId}
          resume={resume}
          file={file}
          setFile={setFile}
          setOperation={setOperation}
          pending={pending}
          onIntent={onIntent}
        />
      )}
      {message && <p role="status">{message}</p>}
      {pending && <p role="status">Saving résumé…</p>}
    </section>
  );
}

function ResumeAttachment({
  applicationId,
  resume,
}: {
  applicationId: string | null;
  resume: ResumeMetadata | null;
}) {
  if (!resume) return <p>No résumé attached.</p>;
  return (
    <p className="break-all">
      <a
        href={`/api/applications/${applicationId}/resume`}
        className="underline"
      >
        Download résumé: {resume.filename}
      </a>{" "}
      ({Math.ceil(resume.byte_size / 1024)} KiB)
    </p>
  );
}

function ResumeControls({
  applicationId,
  resume,
  file,
  setFile,
  setOperation,
  pending,
  onIntent,
}: {
  applicationId: string | null;
  resume: ResumeMetadata | null;
  file: File | null;
  setFile: (file: File | null) => void;
  setOperation: (operation: string) => void;
  pending: boolean;
  onIntent: (intent: ResumeIntent) => void;
}) {
  return (
    <>
      <ResumeInstructions />
      <label className="block">
        Choose PDF résumé
        <input
          type="file"
          accept=".pdf,application/pdf"
          disabled={pending || !applicationId}
          onChange={(event) => {
            setFile(event.target.files?.[0] ?? null);
            setOperation(crypto.randomUUID());
          }}
          className="mt-2 block w-full min-w-0"
        />
      </label>
      <ResumeButtons
        applicationId={applicationId}
        resume={resume}
        file={file}
        pending={pending}
        onIntent={onIntent}
      />
    </>
  );
}

function ResumeInstructions() {
  return (
    <p className="text-sm">
      PDF only, up to 1 MiB. Save your draft first. Submission locks your
      attachment. Files are private and are not sent to AI.
    </p>
  );
}

function ResumeButtons({
  applicationId,
  resume,
  file,
  pending,
  onIntent,
}: {
  applicationId: string | null;
  resume: ResumeMetadata | null;
  file: File | null;
  pending: boolean;
  onIntent: (intent: ResumeIntent) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        disabled={pending || !applicationId || !file}
        onClick={() => onIntent("upload")}
        className="rounded-lg border px-4 py-2"
      >
        {resume ? "Replace résumé" : "Upload résumé"}
      </button>
      {resume && (
        <button
          type="button"
          disabled={pending}
          onClick={() => onIntent("remove")}
          className="rounded-lg border px-4 py-2"
        >
          Remove résumé
        </button>
      )}
      <button
        type="button"
        disabled={pending || !applicationId}
        onClick={() => onIntent("cancel")}
        className="rounded-lg border px-4 py-2"
      >
        Cancel interrupted upload
      </button>
    </div>
  );
}
