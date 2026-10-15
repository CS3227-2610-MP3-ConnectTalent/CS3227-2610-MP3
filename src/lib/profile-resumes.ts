import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { currentApplicant } from "./auth";
import {
  resumeMutationClient,
  type ResumeMetadata,
} from "./application-resumes";
import {
  ResumeUploadPreparationError,
  ResumeValidationError,
  resumePreparationCode,
} from "./resume-errors";
import {
  isMissingProfileObject,
  profileStateLookupFailure,
  profileStorageDownloadFailure,
} from "./profile-resume-errors";
import { validateResume, type ResumeInput } from "./resume-input";
import {
  isCurrentProfileResumeOperation,
  prepareCompletedProfileRetry,
  prepareProfileWithPendingRecovery,
} from "./profile-resume-retry-state";

export { isCurrentProfileResumeOperation } from "./profile-resume-retry-state";
const bucket = "profile-resumes";
const metadata = z.object({
  id: z.uuid(),
  filename: z.string(),
  byte_size: z.number().int().positive(),
  object_path: z.string(),
});
export async function getProfileResume(): Promise<ResumeMetadata | null> {
  const account = await currentApplicant();
  if (!account) return null;
  const { data, error } = await account.client
    .from("profile_resume_objects")
    .select("id,filename,byte_size,object_path")
    .eq("applicant_id", account.user.id)
    .eq("state", "ready")
    .maybeSingle();
  if (error) throw profileStateLookupFailure("profile_metadata_lookup");
  if (!data) return null;
  const parsed = metadata.safeParse(data);
  if (!parsed.success)
    throw profileStateLookupFailure("profile_metadata_invalid");
  return parsed.data;
}
export async function downloadProfileResume(expectedId?: string) {
  const account = await currentApplicant();
  if (!account) return null;
  const info = await getProfileResume();
  if (!info || (expectedId && info.id !== expectedId)) return null;
  try {
    const { data, error } = await account.client.storage
      .from(bucket)
      .download(info.object_path);
    if (isMissingProfileObject(error)) return null;
    if (error) throw profileStorageDownloadFailure();
    return data ? { info, bytes: data } : null;
  } catch (error) {
    if (error instanceof ResumeUploadPreparationError) throw error;
    throw profileStorageDownloadFailure();
  }
}

async function cleanup(actor: string) {
  const client = resumeMutationClient();
  const { data, error } = await client.rpc("claim_profile_resume_cleanup", {
    p_actor: actor,
  });
  if (error || !Array.isArray(data)) return;
  for (const item of data) {
    const parsed = z
      .object({ object_path: z.string().regex(/^[0-9a-f-]{36}\.pdf$/) })
      .safeParse(item);
    if (parsed.success)
      await client.storage.from(bucket).remove([parsed.data.object_path]);
  }
}
export async function retireProfileResume(
  actor: string,
  expected: string | null,
  pendingOnly = false,
) {
  const { error } = await resumeMutationClient().rpc("retire_profile_resume", {
    p_actor: actor,
    p_expected: expected,
    p_pending_only: pendingOnly,
  });
  if (error) throw new Error("Reload your profile before changing the résumé.");
  await cleanup(actor);
}

export async function uploadProfileResume(
  actor: string,
  file: File,
  rawOperation: string,
  expected: string | null,
  retry = false,
) {
  const operation = rawOperation.toLowerCase();
  const client = resumeMutationClient();
  let retryState: { input: ResumeInput; isReady: boolean } | null = null;
  if (retry || (await isCurrentProfileResumeOperation(actor, operation))) {
    retryState = await prepareCompletedProfileRetry(
      client,
      actor,
      operation,
      expected,
      file,
      reserveProfileResume,
    );
    if (retryState.isReady) return;
  }
  const valid = await validateResume(file, retryState?.input);
  const path = await prepareProfileWithPendingRecovery(
    client,
    actor,
    operation,
    expected,
    valid,
    retry,
    reserveProfileResume,
    retireProfileResume,
  );
  await uploadAndFinalizeProfileResume(client, actor, operation, path, valid);
  await cleanup(actor);
}

async function reserveProfileResume(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  operation: string,
  expected: string | null,
  valid: { filename: string; bytes: Uint8Array; sha256: string },
) {
  let result: Awaited<
    ReturnType<ReturnType<typeof resumeMutationClient>["rpc"]>
  >;
  try {
    result = await client.rpc("reserve_profile_resume", {
      p_actor: actor,
      p_operation: operation,
      p_filename: valid.filename,
      p_size: valid.bytes.length,
      p_sha256: valid.sha256,
      p_expected: expected,
    });
  } catch (error) {
    throw profileReservationFailure(error);
  }
  const { data: path, error } = result;
  if (error) throw profileReservationFailure(error);
  if (typeof path !== "string")
    throw profileStateLookupFailure("profile_reservation_invalid_response");
  return path;
}

function profileReservationFailure(error: unknown) {
  const code = resumePreparationCode(error);
  const reference = randomUUID();
  if (code === "RESUME_UPLOAD_PREPARATION_FAILED") {
    const details =
      typeof error === "object" && error !== null
        ? (error as Record<string, unknown>)
        : null;
    const sqlState =
      typeof details?.code === "string" && /^[0-9A-Z]{5}$/.test(details.code)
        ? details.code
        : undefined;
    console.error("resume_upload_preparation_failed", {
      reference,
      stage: "profile_reservation",
      ...(sqlState ? { sqlState } : {}),
    });
  }
  return new ResumeUploadPreparationError(code, reference);
}

async function uploadAndFinalizeProfileResume(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  operation: string,
  path: string,
  valid: Awaited<ReturnType<typeof validateResume>>,
) {
  try {
    await storeOrVerifyProfileUpload(client, path, valid);
    await finalizeProfileUpload(client, actor, operation);
  } catch (error) {
    try {
      await cancelProfileUpload(client, actor, operation);
    } catch {
      // Cancellation is best effort; retain the original failure for the route.
    }
    try {
      await cleanup(actor);
    } catch {
      // Cleanup is best effort; retain the original failure for the route.
    }
    if (error instanceof ResumeValidationError) throw error;
    const reference = randomUUID();
    console.error("resume_upload_persistence_failed", {
      reference,
      stage: "profile_storage_or_finalize",
    });
    throw new ResumeUploadPreparationError(
      "RESUME_UPLOAD_PERSISTENCE_FAILED",
      reference,
    );
  }
}

async function storeOrVerifyProfileUpload(
  client: ReturnType<typeof resumeMutationClient>,
  path: string,
  valid: Awaited<ReturnType<typeof validateResume>>,
) {
  const { data: stored } = await client.storage.from(bucket).download(path);
  if (stored) return verifyStoredProfileResume(stored, valid);
  const { error } = await client.storage
    .from(bucket)
    .upload(path, valid.bytes, {
      contentType: "application/pdf",
      upsert: false,
    });
  if (error) throw new Error("Upload failed");
}

async function verifyStoredProfileResume(
  stored: Blob,
  valid: Awaited<ReturnType<typeof validateResume>>,
) {
  const storedFile = await validateResume(
    new File([stored], valid.filename, { type: "application/pdf" }),
  );
  if (storedFile.sha256 !== valid.sha256)
    throw new Error("Stored upload differs");
}

async function finalizeProfileUpload(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  operation: string,
) {
  const args = { p_actor: actor, p_operation: operation };
  let { error } = await client.rpc("finalize_profile_resume", args);
  if (error) ({ error } = await client.rpc("finalize_profile_resume", args));
  if (error) throw new Error("Finalize failed");
}

async function cancelProfileUpload(
  client: ReturnType<typeof resumeMutationClient>,
  actor: string,
  operation: string,
) {
  await client.rpc("cancel_profile_resume", {
    p_actor: actor,
    p_operation: operation,
  });
}
