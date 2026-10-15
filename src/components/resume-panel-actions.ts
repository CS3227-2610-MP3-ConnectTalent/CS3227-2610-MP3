"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";
import { responseMessage } from "./resume-panel-response";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

export function useResumePanelActions(props: ResumePanelProps) {
  const router = useRouter();
  const state = useResumeActionState(props.resume);
  const change = (intent: ResumeIntent, retry = false) => {
    const shouldRetry = retry || (intent === "upload" && state.uploadFailed);
    return performResumeChange(
      props,
      state,
      intent,
      shouldRetry,
      intent === "profile"
        ? resolveProfileCopyAttempt(props, state, shouldRetry)
        : null,
      () => router.refresh(),
    );
  };
  const deleteResume = async () => {
    if (
      !globalThis.confirm("Delete your résumé? You can upload it again later.")
    ) {
      return;
    }
    await change("remove");
  };
  const selectFile = (next: File | null) => {
    state.setFile(next);
    state.setOperation(crypto.randomUUID());
    state.setUploadFailed(false);
    state.setProfileCopyRetryAvailable(false);
    state.setProfileCopyAttempt(null);
    state.setMessage("");
  };
  return { ...state, selectFile, change, deleteResume };
}

function useResumeActionState(initialResume: ResumePanelProps["resume"]) {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [profileCopyRetryAvailable, setProfileCopyRetryAvailable] =
    useState(false);
  const [profileCopyAttempt, setProfileCopyAttempt] =
    useState<ProfileCopyAttempt | null>(null);
  const [attachment, setAttachment] = useState(initialResume);
  return {
    file,
    operation,
    pending,
    message,
    uploadFailed,
    profileCopyRetryAvailable,
    profileCopyAttempt,
    attachment,
    setFile,
    setOperation,
    setPending,
    setMessage,
    setUploadFailed,
    setProfileCopyRetryAvailable,
    setProfileCopyAttempt,
    setAttachment,
  };
}

type ActionState = {
  file: File | null;
  operation: string;
  pending: boolean;
  message: string;
  uploadFailed: boolean;
  profileCopyRetryAvailable: boolean;
  profileCopyAttempt: ProfileCopyAttempt | null;
  attachment: ResumeMetadata | null;
  setOperation: (value: string) => void;
  setPending: (value: boolean) => void;
  setMessage: (value: string) => void;
  setUploadFailed: (value: boolean) => void;
  setProfileCopyRetryAvailable: (value: boolean) => void;
  setProfileCopyAttempt: (value: ProfileCopyAttempt | null) => void;
  setAttachment: (value: ResumeMetadata | null) => void;
};

type ProfileCopyAttempt = {
  operation: string;
  sourceId: string;
  revision: number | null;
};

function resolveProfileCopyAttempt(
  props: ResumePanelProps,
  state: ActionState,
  retry: boolean,
): ProfileCopyAttempt | null {
  if (retry) return state.profileCopyAttempt;
  const sourceId = props.profileResume?.id;
  return sourceId
    ? { operation: crypto.randomUUID(), sourceId, revision: props.revision }
    : null;
}

async function performResumeChange(
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
  retry: boolean,
  profileAttempt: ProfileCopyAttempt | null,
  refresh: () => void,
) {
  if (!canChange(props, state.file, intent, profileAttempt)) {
    state.setMessage("Choose a PDF résumé.");
    return;
  }
  if (profileAttempt) state.setProfileCopyAttempt(profileAttempt);
  const operation =
    profileAttempt?.operation ?? resolveOperation(intent, state.operation);
  if (retry) state.setOperation(operation);
  startRequest(props, state);
  try {
    await sendResumeRequest(
      props,
      state,
      intent,
      retry,
      operation,
      profileAttempt,
    );
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
  if (intent === "upload")
    return "We could not confirm the upload. Press Upload résumé again to retry, or reload to check whether it saved.";
  return "We could not confirm the change. Reload to check whether it saved.";
}

function canChange(
  props: ResumePanelProps,
  file: File | null,
  intent: ResumeIntent,
  profileAttempt: ProfileCopyAttempt | null,
) {
  return (
    !(!props.profileMode && !props.jobId && !props.applicationId) &&
    !(intent === "upload" && !file) &&
    !(intent === "profile" && !profileAttempt)
  );
}

function resolveOperation(intent: ResumeIntent, current: string) {
  return intent === "profile" ? crypto.randomUUID() : current;
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
  profileAttempt: ProfileCopyAttempt | null,
) {
  const response = await fetch(endpoint(props), {
    method: "POST",
    ...requestOptions(props, state, intent, retry, operation, profileAttempt),
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
  profileAttempt: ProfileCopyAttempt | null,
): Pick<RequestInit, "headers" | "body"> {
  const revision = profileAttempt ? profileAttempt.revision : props.revision;
  const headers: Record<string, string> = {
    "x-resume-intent": intent,
    "x-application-revision": String(revision ?? ""),
    "x-profile-resume":
      profileAttempt?.sourceId ?? profileResumeId(props, state.attachment),
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
  if (
    intent === "upload" &&
    (result.code === "RESUME_UPLOAD_OPERATION_RETIRED" ||
      (!props.profileMode &&
        (result.code === "RESUME_JOB_CLOSED" ||
          result.code === "RESUME_APPLICATION_CHANGED")))
  ) {
    state.setOperation(crypto.randomUUID());
  }
  if (intent === "remove" && response.ok)
    state.setOperation(crypto.randomUUID());
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
  if (
    intent === "profile" &&
    (response.ok || result.code !== "RESUME_UPLOAD_PENDING")
  ) {
    state.setProfileCopyAttempt(null);
  }
  state.setMessage(
    responseMessage(response.ok, result.error, result.reference),
  );
}

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
