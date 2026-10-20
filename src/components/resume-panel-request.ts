import type { ResumeMetadata } from "@/lib/application-resumes";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

type ResumeRequestState = {
  applicationId: string | null;
  revision: number | null;
  attachment: ResumeMetadata | null;
  file: File | null;
};

export type ProfileCopyAttempt = {
  operation: string;
  sourceId: string;
  revision: number | null;
  applicationId?: string | null;
};

export function resolveConfirmedRevision(
  stateRevision: number | null,
  propRevision: number | null,
): number | null {
  if (stateRevision !== null && propRevision !== null) {
    return Math.max(stateRevision, propRevision);
  }
  return stateRevision ?? propRevision ?? null;
}

export function resumeEndpoint(props: ResumePanelProps) {
  if (props.profileMode) return "/api/profile/resume";
  if (props.jobId) return `/api/jobs/${props.jobId}/resume`;
  return `/api/applications/${props.applicationId}/resume`;
}

export function resumeRequestOptions(
  props: ResumePanelProps,
  state: ResumeRequestState,
  intent: ResumeIntent,
  retry: boolean,
  operation: string,
  profileAttempt: ProfileCopyAttempt | null,
): Pick<RequestInit, "headers" | "body"> {
  const confirmed = resolveConfirmedRevision(state.revision, props.revision);
  const revision = profileAttempt ? profileAttempt.revision : confirmed;
  const headers: Record<string, string> = {
    "x-application-id":
      (profileAttempt
        ? profileAttempt.applicationId
        : (state.applicationId ?? props.applicationId)) ?? "",
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
