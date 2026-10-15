import "server-only";
import { currentApplicant } from "./auth";
import { profileStateLookupFailure } from "./profile-resume-errors";
import { readResumeInput, type ResumeInput } from "./resume-input";
import type { resumeMutationClient } from "./application-resumes";
import {
  ResumeUploadOperationRetiredError,
  ResumeUploadPreparationError,
} from "./resume-errors";

export async function isCurrentProfileResumeOperation(
  actor: string,
  operation: string,
) {
  let account: Awaited<ReturnType<typeof currentApplicant>>;
  try {
    account = await currentApplicant();
  } catch {
    throw profileStateLookupFailure("profile_state_lookup");
  }
  if (!account || account.user.id !== actor)
    throw profileStateLookupFailure("profile_state_lookup");

  let currentResumeId: unknown;
  try {
    const { data, error } = await account.client
      .from("applicant_profiles")
      .select("resume_id")
      .eq("user_id", actor)
      .maybeSingle();
    if (error) throw new Error("Profile lookup failed.");
    currentResumeId = data?.resume_id;
  } catch {
    throw profileStateLookupFailure("profile_state_lookup");
  }
  return (
    typeof currentResumeId === "string" &&
    currentResumeId.toLowerCase() === operation.toLowerCase()
  );
}

export async function prepareCompletedProfileRetry(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  rawOperation: string,
  expected: string | null,
  file: File,
  reserve: (
    client: ReturnType<typeof resumeMutationClient>,
    actor: string,
    operation: string,
    expected: string | null,
    valid: { filename: string; bytes: Uint8Array; sha256: string },
  ) => Promise<string>,
): Promise<{ input: ResumeInput; isReady: boolean }> {
  const operation = rawOperation.toLowerCase();
  const input = await readResumeInput(file);
  const exists = await isCurrentProfileResumeOperation(actor, operation);
  if (!exists) return { input, isReady: false };
  await reserve(client, actor, operation, expected, input);
  return { input, isReady: true };
}

export async function prepareProfileWithPendingRecovery(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  rawOperation: string,
  expected: string | null,
  valid: { filename: string; bytes: Uint8Array; sha256: string },
  retry: boolean,
  reserve: (
    client: ReturnType<typeof resumeMutationClient>,
    actor: string,
    operation: string,
    expected: string | null,
    valid: { filename: string; bytes: Uint8Array; sha256: string },
  ) => Promise<string>,
  retire: (
    actor: string,
    expected: string | null,
    pendingOnly: boolean,
  ) => Promise<void>,
) {
  const operation = rawOperation.toLowerCase();
  try {
    return await reserve(client, actor, operation, expected, valid);
  } catch (error) {
    if (
      !retry ||
      !(error instanceof ResumeUploadPreparationError) ||
      error.code !== "RESUME_UPLOAD_PENDING"
    ) {
      if (
        retry &&
        error instanceof ResumeUploadPreparationError &&
        error.code === "RESUME_UPLOAD_OPERATION_CONFLICT"
      ) {
        throw new ResumeUploadOperationRetiredError();
      }
      throw error;
    }
    await retire(actor, expected, true);
    return await reserve(client, actor, operation, expected, valid);
  }
}
