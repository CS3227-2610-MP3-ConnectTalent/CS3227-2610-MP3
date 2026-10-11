import "server-only";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { validateResume } from "./resume-input";
import {
  recoverPendingJobResume,
  resolveRetryRevision,
} from "./application-resume-retry";
import {
  applicationResumeBucket,
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";

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
  const validated = await validateResume(file);
  return uploadValidatedApplicationResume(
    actor,
    job,
    revision,
    validated,
    operation,
    retry,
  );
}

async function uploadValidatedApplicationResume(
  actor: string,
  job: string,
  revision: number,
  validated: ValidatedResume,
  operation: string,
  retry: boolean,
) {
  const client = resumeMutationClient();
  const args = uploadArguments(actor, job, revision, operation);
  const existing = await getExistingUpload(client, operation);
  if (existing?.state === "ready")
    return reconcileExistingUpload(client, existing, actor, validated, args);
  if (retry) await recoverPendingUpload(client, actor, job, revision);
  const objectPath = await reserveUpload(client, args, validated);
  await uploadAndFinalize(
    client,
    actor,
    job,
    objectPath,
    validated.bytes,
    operation,
    args,
  );
  await cleanupApplicationResume(actor, job);
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

async function getExistingUpload(client: MutationClient, operation: string) {
  const { data, error } = await client
    .from("application_resume_objects")
    .select("id,applicant_id,filename,sha256,byte_size,state")
    .eq("id", operation)
    .maybeSingle();
  if (error)
    throw new Error(
      "We could not check the previous upload. Reload and try again.",
    );
  return data;
}

async function reconcileExistingUpload(
  client: MutationClient,
  existing: NonNullable<Awaited<ReturnType<typeof getExistingUpload>>>,
  actor: string,
  validated: ValidatedResume,
  args: UploadArguments,
) {
  if (!matchesExistingUpload(existing, actor, validated))
    throw new Error(
      "Choose the same PDF to retry this operation, or choose a new file.",
    );
  const { error } = await client.rpc("finalize_application_resume", args);
  if (error)
    throw new Error(
      "We could not reconcile the upload. Reload to check the saved résumé.",
    );
}

function matchesExistingUpload(
  existing: NonNullable<Awaited<ReturnType<typeof getExistingUpload>>>,
  actor: string,
  validated: ValidatedResume,
) {
  return (
    existing.applicant_id === actor &&
    existing.sha256 === validated.sha256 &&
    existing.filename === validated.filename &&
    existing.byte_size === validated.bytes.length
  );
}

async function recoverPendingUpload(
  client: MutationClient,
  actor: string,
  job: string,
  revision: number,
) {
  const { error } = await client.rpc("recover_pending_application_resume", {
    p_actor: actor,
    p_job: job,
    p_revision: revision,
  });
  if (error)
    throw new Error("Reload the saved draft before retrying this upload.");
  await cleanupApplicationResume(actor, job);
}

async function reserveUpload(
  client: MutationClient,
  args: UploadArguments,
  validated: ValidatedResume,
) {
  const { data: objectPath, error } = await client.rpc(
    "reserve_application_resume",
    {
      ...args,
      p_filename: validated.filename,
      p_size: validated.bytes.length,
      p_sha256: validated.sha256,
    },
  );
  if (error || typeof objectPath !== "string")
    throw new Error(
      "Save the latest draft and use Retry upload if an earlier upload was interrupted.",
    );
  return objectPath;
}

async function uploadAndFinalize(
  client: MutationClient,
  actor: string,
  job: string,
  objectPath: string,
  bytes: Uint8Array,
  operation: string,
  args: UploadArguments,
) {
  try {
    await uploadObject(client, objectPath, bytes);
    await finalizeApplicationUpload(client, args);
  } catch {
    await client.rpc("cancel_application_resume", {
      p_actor: actor,
      p_job: job,
      p_operation: operation,
    });
    await cleanupApplicationResume(actor, job);
    throw new Error(
      "We could not confirm the upload. Reload to check which résumé was saved. Your application text has not been changed.",
    );
  }
}

async function uploadObject(
  client: MutationClient,
  objectPath: string,
  bytes: Uint8Array,
) {
  const { error } = await client.storage
    .from(applicationResumeBucket)
    .upload(objectPath, bytes, {
      contentType: "application/pdf",
      upsert: false,
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
  const validated = await validateResume(file);
  const client = resumeMutationClient();
  const expectedRevision = await resolveRetryRevision(
    client,
    actor,
    job,
    revision,
    retry,
  );
  if (retry && expectedRevision !== null)
    await recoverPendingJobResume(client, actor, job, expectedRevision);
  const prepared = await prepareJobResume(
    client,
    actor,
    job,
    expectedRevision,
    operation,
    validated,
  );
  if (prepared.state === "pending")
    await uploadValidatedApplicationResume(
      actor,
      job,
      prepared.revision,
      validated,
      operation,
      false,
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
      state: z.enum(["ready", "pending"]),
    })
    .safeParse(data);
  if (error || !prepared.success)
    throw new Error("Reload the application before retrying this upload.");
  return prepared.data;
}
