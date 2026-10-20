import "server-only";
import { applicationResumeIdentity } from "./application-resume-client";
import { randomUUID } from "node:crypto";
import {
  ResumeUploadPreparationError,
  resumePreparationCode,
} from "./resume-errors";
import {
  applicationResumeBucket,
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";

type MutationClient = ReturnType<typeof resumeMutationClient>;

export type ApplicationResumeUploadArguments = {
  p_actor: string;
  p_job: string;
  p_revision: number;
  p_operation: string;
};

export async function uploadAndFinalizeApplicationResume(
  client: MutationClient,
  actor: string,
  job: string,
  objectPath: string,
  bytes: Uint8Array,
  args: ApplicationResumeUploadArguments,
  retry = false,
) {
  try {
    await uploadObject(client, objectPath, bytes, retry);
    await finalizeApplicationUpload(client, args);
  } catch (error) {
    if (isTerminalFinalizationFailure(error)) {
      try {
        const { error: cancelError } = await client.rpc(
          "cancel_application_resume",
          {
            p_actor: actor,
            p_job: job,
            p_operation: args.p_operation,
          },
        );
        if (cancelError) throw new Error("Cancellation was not confirmed.");
        await cleanupApplicationResume(
          actor,
          job,
          applicationResumeIdentity(client),
        );
      } catch {
        throw persistenceFailure("application_terminal_cleanup");
      }
      throw error;
    }
    try {
      await cleanupApplicationResume(
        actor,
        job,
        applicationResumeIdentity(client),
      );
    } catch {
      // Cleanup is best effort for retryable storage/finalization failures.
    }
    throw persistenceFailure("application_storage_or_finalize");
  }
}

async function uploadObject(
  client: MutationClient,
  objectPath: string,
  bytes: Uint8Array,
  retry: boolean,
) {
  const { error } = await client.storage
    .from(applicationResumeBucket)
    .upload(objectPath, bytes, {
      contentType: "application/pdf",
      upsert: retry,
    });
  if (error) throw new Error("Upload failed.");
}

async function finalizeApplicationUpload(
  client: MutationClient,
  args: ApplicationResumeUploadArguments,
) {
  const first = await client.rpc("finalize_application_resume", args);
  if (!first.error) return;
  const terminal = terminalFinalizationFailure(first.error);
  if (terminal) throw terminal;

  const retry = await client.rpc("finalize_application_resume", args);
  if (!retry.error) return;
  const retryTerminal = terminalFinalizationFailure(retry.error);
  if (retryTerminal) throw retryTerminal;
  throw new Error("Upload could not be finalized.");
}

function terminalFinalizationFailure(error: unknown) {
  const code = resumePreparationCode(error);
  if (code !== "RESUME_JOB_CLOSED" && code !== "RESUME_APPLICATION_CHANGED")
    return null;
  const reference = randomUUID();
  const details = asRecord(error);
  const sqlState =
    typeof details?.code === "string" && /^[A-Z0-9]{5}$/.test(details.code)
      ? details.code
      : undefined;
  console.error("resume_upload_finalize_rejected", {
    reference,
    stage: "finalize_application_resume",
    code,
    ...(sqlState ? { sqlState } : {}),
  });
  return new ResumeUploadPreparationError(code, reference);
}

function isTerminalFinalizationFailure(
  error: unknown,
): error is ResumeUploadPreparationError {
  return (
    error instanceof ResumeUploadPreparationError &&
    (error.code === "RESUME_JOB_CLOSED" ||
      error.code === "RESUME_APPLICATION_CHANGED")
  );
}

function persistenceFailure(stage: string) {
  const reference = randomUUID();
  console.error("resume_upload_persistence_failed", { reference, stage });
  return new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PERSISTENCE_FAILED",
    reference,
  );
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
