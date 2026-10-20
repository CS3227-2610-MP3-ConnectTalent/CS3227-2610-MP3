"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { ResumeMetadata } from "@/lib/application-resumes";
import {
  resumeEndpoint,
  resumeRequestOptions,
  resolveConfirmedRevision,
  type ProfileCopyAttempt,
} from "./resume-panel-request";
import { applyResumeResponse } from "./resume-panel-response";
import {
  useResumeActionAttachment,
  useResumeActionRevision,
} from "./resume-panel-local-state";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

export function useResumePanelActions(props: ResumePanelProps) {
  const router = useRouter();
  const state = useResumeActionState(
    props.resume,
    props.applicationId,
    props.revision,
  );
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

function useResumeActionState(
  initialResume: ResumePanelProps["resume"],
  initialApplicationId: string | null,
  initialRevision: number | null,
) {
  const [file, setFile] = useState<File | null>(null);
  const [operation, setOperation] = useState("");
  const [pending, setPending] = useState(false);
  const [activeIntent, setActiveIntent] = useState<ResumeIntent | null>(null);
  const [activeRetry, setActiveRetry] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadFailed, setUploadFailed] = useState(false);
  const [profileCopyRetryAvailable, setProfileCopyRetryAvailable] =
    useState(false);
  const [profileCopyAttempt, setProfileCopyAttempt] =
    useState<ProfileCopyAttempt | null>(null);
  const { attachment, setAttachment } =
    useResumeActionAttachment(initialResume);
  const { applicationId, revision, setRevision } = useResumeActionRevision(
    initialApplicationId,
    initialRevision,
  );
  return {
    file,
    operation,
    pending,
    activeIntent,
    activeRetry,
    message,
    uploadFailed,
    profileCopyRetryAvailable,
    profileCopyAttempt,
    attachment,
    applicationId,
    revision,
    setFile,
    setOperation,
    setPending,
    setActiveIntent,
    setActiveRetry,
    setMessage,
    setUploadFailed,
    setProfileCopyRetryAvailable,
    setProfileCopyAttempt,
    setAttachment,
    setRevision,
  };
}

type ActionState = {
  applicationId: string | null;
  file: File | null;
  operation: string;
  pending: boolean;
  activeIntent: ResumeIntent | null;
  activeRetry: boolean;
  message: string;
  uploadFailed: boolean;
  profileCopyRetryAvailable: boolean;
  profileCopyAttempt: ProfileCopyAttempt | null;
  attachment: ResumeMetadata | null;
  revision: number | null;
  setOperation: (value: string) => void;
  setPending: (value: boolean) => void;
  setActiveIntent: (value: ResumeIntent | null) => void;
  setActiveRetry: (value: boolean) => void;
  setMessage: (value: string) => void;
  setUploadFailed: (value: boolean) => void;
  setProfileCopyRetryAvailable: (value: boolean) => void;
  setProfileCopyAttempt: (value: ProfileCopyAttempt | null) => void;
  setAttachment: (value: ResumeMetadata | null) => void;
  setRevision: (value: number, forApplicationId?: string) => void;
};

function resolveProfileCopyAttempt(
  props: ResumePanelProps,
  state: ActionState,
  retry: boolean,
): ProfileCopyAttempt | null {
  if (retry) return state.profileCopyAttempt;
  const sourceId = props.profileResume?.id;
  const revision = resolveConfirmedRevision(state.revision, props.revision);
  return sourceId
    ? {
        operation: crypto.randomUUID(),
        sourceId,
        revision,
        applicationId: state.applicationId ?? props.applicationId,
      }
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
  startRequest(props, state, intent, retry);
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

function startRequest(
  props: ResumePanelProps,
  state: ActionState,
  intent: ResumeIntent,
  retry: boolean,
) {
  state.setPending(true);
  state.setActiveIntent(intent);
  state.setActiveRetry(retry);
  props.onPending?.(true);
  state.setMessage("");
  state.setUploadFailed(false);
  state.setProfileCopyRetryAvailable(false);
}

function finishRequest(props: ResumePanelProps, state: ActionState) {
  state.setPending(false);
  state.setActiveIntent(null);
  state.setActiveRetry(false);
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
  const response = await fetch(resumeEndpoint(props), {
    method: "POST",
    ...resumeRequestOptions(
      props,
      state,
      intent,
      retry,
      operation,
      profileAttempt,
    ),
  });
  await applyResumeResponse(
    response,
    {
      ...props,
      applicationId: profileAttempt
        ? (profileAttempt.applicationId ?? null)
        : (state.applicationId ?? props.applicationId),
    },
    state,
    intent,
  );
}
