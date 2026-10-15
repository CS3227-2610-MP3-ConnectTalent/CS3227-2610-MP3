import type { ResumeMetadata } from "@/lib/application-resumes";
import type { ResumeIntent, ResumePanelProps } from "./resume-panel-state";

type ProfileCopyAttempt = {
  operation: string;
  sourceId: string;
  revision: number | null;
};

type ResumeResponseState = {
  setOperation: (value: string) => void;
  setAttachment: (value: ResumeMetadata | null) => void;
  setUploadFailed: (value: boolean) => void;
  setProfileCopyRetryAvailable: (value: boolean) => void;
  setProfileCopyAttempt: (value: ProfileCopyAttempt | null) => void;
  setMessage: (value: string) => void;
};

export async function applyResumeResponse(
  response: Response,
  props: ResumePanelProps,
  state: ResumeResponseState,
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
  const canRetryProfileCopy =
    result.code === "RESUME_UPLOAD_PENDING" ||
    result.code === "RESUME_UPLOAD_PERSISTENCE_FAILED";
  state.setProfileCopyRetryAvailable(
    intent === "profile" && !response.ok && canRetryProfileCopy,
  );
  if (intent === "profile" && (response.ok || !canRetryProfileCopy)) {
    state.setProfileCopyAttempt(null);
  }
  state.setMessage(
    responseMessage(response.ok, result.error, result.reference),
  );
}

export function responseMessage(
  ok: boolean,
  error: unknown,
  reference: unknown,
) {
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

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}
