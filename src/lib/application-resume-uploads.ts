import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { validateResume } from "./resume-input";
import { prepareWithPendingRecovery } from "./application-resume-retry";
import {
  applicationResumeBucket,
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";
import {
  ResumeUploadPreparationError,
  type ResumePreparationErrorCode,
} from "./resume-errors";

type MutationClient = ReturnType<typeof resumeMutationClient>;
type ValidatedResume = Awaited<ReturnType<typeof validateResume>>;
type UploadArguments = {
  p_actor: string;
  p_job: string;
  p_revision: number;
  p_operation: string;
};

export async function uploadApplicationResume(
  actor: string,
  job: string,
  revision: number,
  file: File,
  operation: string = randomUUID(),
  retry = false,
) {
  const normalizedOperation = normalizeOperation(operation);
  const validated = await validateResume(file);
  const client = resumeMutationClient();
  const prepared = await prepareWithPendingRecovery(
    client,
    actor,
    job,
    revision,
    retry,
    () =>
      prepareJobResume(
        client,
        actor,
        job,
        revision,
        normalizedOperation,
        validated,
      ),
  );
  await finishPreparedJobResume(
    client,
    actor,
    job,
    normalizedOperation,
    validated,
    prepared,
    retry,
  );
}

function uploadArguments(
  actor: string,
  job: string,
  revision: number,
  operation: string,
): UploadArguments {
  return {
    p_actor: actor,
    p_job: job,
    p_revision: revision,
    p_operation: operation,
  };
}

async function uploadAndFinalize(
  client: MutationClient,
  actor: string,
  job: string,
  objectPath: string,
  bytes: Uint8Array,
  args: UploadArguments,
  retry = false,
) {
  try {
    await uploadObject(client, objectPath, bytes, retry);
    await finalizeApplicationUpload(client, args);
  } catch {
    try {
      await cleanupApplicationResume(actor, job);
    } catch {
      // Cleanup is best effort; keep the persistence failure response safe.
    }
    const reference = randomUUID();
    console.error("resume_upload_persistence_failed", {
      reference,
      stage: "application_storage_or_finalize",
    });
    throw new ResumeUploadPreparationError(
      "RESUME_UPLOAD_PERSISTENCE_FAILED",
      reference,
    );
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
  args: UploadArguments,
) {
  let { error } = await client.rpc("finalize_application_resume", args);
  if (error)
    ({ error } = await client.rpc("finalize_application_resume", args));
  if (error) throw new Error("Upload could not be finalized.");
}

export async function uploadResumeForJob(
  actor: string,
  job: string,
  revision: number | null,
  file: File,
  operation: string,
  retry = false,
) {
  const normalizedOperation = normalizeOperation(operation);
  const validated = await validateResume(file);
  const client = resumeMutationClient();
  const prepared = await prepareWithPendingRecovery(
    client,
    actor,
    job,
    revision,
    retry,
    () =>
      prepareJobResume(
        client,
        actor,
        job,
        revision,
        normalizedOperation,
        validated,
      ),
  );
  await finishPreparedJobResume(
    client,
    actor,
    job,
    normalizedOperation,
    validated,
    prepared,
    retry,
  );
}

async function prepareJobResume(
  client: MutationClient,
  actor: string,
  job: string,
  revision: number | null,
  operation: string,
  validated: ValidatedResume,
) {
  const { data, error } = await client.rpc("prepare_application_resume", {
    p_actor: actor,
    p_job: job,
    p_revision: revision,
    p_operation: operation,
    p_filename: validated.filename,
    p_size: validated.bytes.length,
    p_sha256: validated.sha256,
  });
  const prepared = z
    .object({
      id: z.uuid(),
      revision: z.number().int().positive(),
      object_path: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/i),
      state: z.enum(["ready", "pending"]),
    })
    .safeParse(data);
  if (error) {
    const code = preparationCode(error);
    const reference = randomUUID();
    logPreparationFailure(reference, code, error);
    throw new ResumeUploadPreparationError(code, reference);
  }
  if (
    !prepared.success ||
    prepared.data.object_path !==
      `${prepared.data.id.toLowerCase()}/${operation}.pdf`
  ) {
    const reference = randomUUID();
    logPreparationFailure(
      reference,
      "RESUME_UPLOAD_PREPARATION_FAILED",
      undefined,
      "invalid_response",
    );
    throw new ResumeUploadPreparationError(
      "RESUME_UPLOAD_PREPARATION_FAILED",
      reference,
    );
  }
  return prepared.data;
}

function normalizeOperation(operation: string) {
  const parsed = z.uuid().safeParse(operation);
  if (!parsed.success) throw new Error("Choose the file again.");
  return parsed.data.toLowerCase();
}

async function finishPreparedJobResume(
  client: MutationClient,
  actor: string,
  job: string,
  operation: string,
  validated: ValidatedResume,
  prepared: Awaited<ReturnType<typeof prepareJobResume>>,
  retry = false,
) {
  if (prepared.state === "ready") return;
  const args = uploadArguments(actor, job, prepared.revision, operation);
  await uploadAndFinalize(
    client,
    actor,
    job,
    prepared.object_path,
    validated.bytes,
    args,
    retry,
  );
  await cleanupApplicationResume(actor, job);
}

function preparationCode(error: unknown): ResumePreparationErrorCode {
  const details = asRecord(error);
  if (details?.code === "23505") return "RESUME_UPLOAD_PENDING";
  if (details?.code !== "P0001") return "RESUME_UPLOAD_PREPARATION_FAILED";
  switch (details.message) {
    case "Job is not open for applications":
      return "RESUME_JOB_CLOSED";
    case "Application changed; reload before uploading":
    case "Editable saved draft required":
    case "Application changed; reload before saving":
      return "RESUME_APPLICATION_CHANGED";
    case "Upload operation cannot be reused":
      return "RESUME_UPLOAD_OPERATION_CONFLICT";
    default:
      return "RESUME_UPLOAD_PREPARATION_FAILED";
  }
}

function logPreparationFailure(
  reference: string,
  code: ResumePreparationErrorCode,
  error: unknown,
  category = "rpc_error",
) {
  const details = asRecord(error);
  const sqlState =
    typeof details?.code === "string" && /^[A-Z0-9]{5}$/.test(details.code)
      ? details.code
      : undefined;
  const status =
    typeof details?.status === "number" &&
    Number.isInteger(details.status) &&
    details.status >= 100 &&
    details.status <= 599
      ? details.status
      : undefined;
  console.error("resume_upload_prepare_failed", {
    reference,
    stage: "prepare_application_resume",
    code,
    category,
    ...(sqlState ? { sqlState } : {}),
    ...(status ? { upstreamStatus: status } : {}),
  });
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : null;
}
