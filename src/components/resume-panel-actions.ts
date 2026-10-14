"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

export function useResumePanelActions(props: ResumePanelProps) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [profileCopyRetryAvailable, setProfileCopyRetryAvailable] =
    useState(false);
  const [attachment, setAttachment] = useState(props.resume);
  const state = {
    file,
    operation,
    pending,
    message,
    uploadFailed,
    profileCopyRetryAvailable,
    attachment,
    setOperation,
    setPending,
    setMessage,
    setUploadFailed,
    setProfileCopyRetryAvailable,
    setAttachment,
  };
  const change = (intent: ResumeIntent, retry = false) =>
    performResumeChange(props, state, intent, retry, () => router.refresh());
  const selectFile = (next: File | null) => {
    setFile(next);
    setOperation(crypto.randomUUID());
    setUploadFailed(false);
    setProfileCopyRetryAvailable(false);
    setMessage("");
  };
  return { ...state, selectFile, change };
}

type ActionState = {
  file: File | null;
  operation: string;
  pending: boolean;
  message: string;
  uploadFailed: boolean;
  profileCopyRetryAvailable: boolean;
  attachment: ResumeMetadata | null;
  setOperation: (value: string) => void;
  setPending: (value: boolean) => void;
  setMessage: (value: string) => void;
  setUploadFailed: (value: boolean) => void;
  setProfileCopyRetryAvailable: (value: boolean) => void;
  setAttachment: (value: ResumeMetadata | null) => void;
};

async function performResumeChange(
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
  retry: boolean,
  refresh: () => void,
) {
  if (!canChange(props, state.file, intent)) {
    state.setMessage("Choose a PDF résumé.");
    return;
  }
  const operation = resolveOperation(intent, retry, state.operation);
  if (retry) state.setOperation(operation);
  startRequest(props, state);
  try {
    await sendResumeRequest(props, state, intent, retry, operation);
  } catch {
    state.setUploadFailed(intent === "upload");
    state.setProfileCopyRetryAvailable(intent === "profile");
    state.setMessage(interruptedChangeMessage(intent));
  } finally {
    finishRequest(props, state);
    refresh();
  }
}

function interruptedChangeMessage(intent: ResumeIntent) {
  if (intent === "profile")
    return "Profile résumé status is unclear. Use Retry profile copy below.";
  return "We could not confirm the change. Reload to check your saved résumé.";
}

function canChange(
  props: ResumePanelProps,
  file: File | null,
  intent: ResumeIntent,
) {
  return (
    !(!props.profileMode && !props.jobId && !props.applicationId) &&
    !(intent === "upload" && !file)
  );
}

function resolveOperation(
  intent: ResumeIntent,
  retry: boolean,
  current: string,
) {
  return retry || intent === "profile" ? crypto.randomUUID() : current;
}

function startRequest(props: ResumePanelProps, state: ActionState) {
  state.setPending(true);
  props.onPending?.(true);
  state.setMessage("");
  state.setUploadFailed(false);
  state.setProfileCopyRetryAvailable(false);
}

function finishRequest(props: ResumePanelProps, state: ActionState) {
  state.setPending(false);
  props.onPending?.(false);
}

async function sendResumeRequest(
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
  retry: boolean,
  operation: string,
) {
  const response = await fetch(endpoint(props), {
    method: "POST",
    ...requestOptions(props, state, intent, retry, operation),
  });
  await applyResponse(response, props, state, intent);
}

function endpoint(props: ResumePanelProps) {
  if (props.profileMode) return "/api/profile/resume";
  if (props.jobId) return `/api/jobs/${props.jobId}/resume`;
  return `/api/applications/${props.applicationId}/resume`;
}

function requestOptions(
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
  retry: boolean,
  operation: string,
): Pick<RequestInit, "headers" | "body"> {
  const headers: Record<string, string> = {
    "x-resume-intent": intent,
    "x-application-revision": String(props.revision ?? ""),
    "x-profile-resume": profileResumeId(props, state.attachment),
    "x-resume-operation": operation,
    "x-resume-retry": String(retry),
    ...uploadHeaders(intent, state.file, operation, retry),
  };
  return { headers, body: intent === "upload" ? state.file : undefined };
}

function profileResumeId(
  props: ResumePanelProps,
  attachment: ResumeMetadata | null,
) {
  return (props.profileMode ? attachment?.id : props.profileResume?.id) ?? "";
}

function uploadHeaders(
  intent: ResumeIntent,
  file: File | null,
  operation: string,
  retry: boolean,
): Record<string, string> {
  if (intent !== "upload" || !file) return {};
  return {
    "content-type": file.type,
    "x-resume-filename": encodeURIComponent(file.name),
    "x-resume-operation": operation,
    "x-resume-retry": String(retry),
  };
}

async function applyResponse(
  response: Response,
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
) {
  const result: unknown = await response.json();
  if (!isObject(result)) throw new Error("Invalid résumé response.");
  if ("resume" in result)
    state.setAttachment(result.resume as ResumeMetadata | null);
  props.onChange?.({
    applicationId:
      typeof result.applicationId === "string"
        ? result.applicationId
        : undefined,
    revision: typeof result.revision === "number" ? result.revision : undefined,
  });
  state.setUploadFailed(intent === "upload" && !response.ok);
  state.setProfileCopyRetryAvailable(
    intent === "profile" &&
      !response.ok &&
      result.code === "RESUME_UPLOAD_PENDING",
  );
  state.setMessage(
    responseMessage(response.ok, result.error, result.reference),
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function responseMessage(ok: boolean, error: unknown, reference: unknown) {
  if (ok) return "Résumé change saved. Review the attachment below.";
  const message =
    typeof error === "string" ? error : "Résumé change could not be saved.";
  return isReferenceCode(reference)
    ? `${message} Reference code: ${reference}`
    : message;
}

function isReferenceCode(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
