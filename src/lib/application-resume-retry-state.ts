import "server-only";
import { randomUUID } from "node:crypto";
import { currentApplicant } from "./auth";
import { ResumeUploadPreparationError } from "./resume-errors";

export async function isCurrentApplicationResumeOperation(
  actor: string,
  job: string,
  operation: string,
) {
  let account: Awaited<ReturnType<typeof currentApplicant>>;
  try {
    account = await currentApplicant();
  } catch {
    throw completedOperationLookupFailure();
  }
  if (!account || account.user.id !== actor)
    throw completedOperationLookupFailure();

  let currentResumeId: unknown;
  try {
    const { data, error } = await account.client
      .from("applications")
      .select("resume_id")
      .eq("applicant_id", actor)
      .eq("job_id", job)
      .maybeSingle();
    if (error) throw new Error("Application lookup failed.");
    currentResumeId = data?.resume_id;
  } catch {
    throw completedOperationLookupFailure();
  }
  return currentResumeId === operation;
}

function completedOperationLookupFailure() {
  const reference = randomUUID();
  console.error("resume_upload_prepare_failed", {
    reference,
    stage: "completed_operation_application",
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
  });
  return new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PREPARATION_FAILED",
    reference,
  );
}
