import "server-only";
import { randomUUID } from "node:crypto";
import { ResumeUploadPreparationError } from "./resume-errors";

export function profileStateLookupFailure(
  stage:
    | "profile_state_lookup"
    | "profile_state_unexpected"
    | "profile_metadata_lookup"
    | "profile_metadata_invalid"
    | "profile_reservation_invalid_response",
) {
  const reference = randomUUID();
  console.error("resume_upload_preparation_failed", { reference, stage });
  return new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PREPARATION_FAILED",
    reference,
  );
}

export function profileStorageDownloadFailure() {
  const reference = randomUUID();
  console.error("resume_upload_persistence_failed", {
    reference,
    stage: "profile_source_download",
  });
  return new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PERSISTENCE_FAILED",
    reference,
  );
}

export function isMissingProfileObject(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const status = "status" in error ? error.status : undefined;
  const statusCode = "statusCode" in error ? error.statusCode : undefined;
  return status === 404 || statusCode === "404";
}
