import "server-only";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import { validateResume } from "./resume-input";
import { createSupabaseServerClient } from "./supabase/server";
const bucket = "application-resumes";
const metadata = z.object({
  id: z.uuid(),
  filename: z.string(),
  byte_size: z.number().int().positive(),
  object_path: z.string(),
});
export type ResumeMetadata = z.infer<typeof metadata>;
// Only mutations/cleanup use this privileged client, after verified owner checks at the boundary.
function mutationClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("Résumé uploads are temporarily unavailable.");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export async function getApplicationResume(applicationId: string) {
  const client = await createSupabaseServerClient();
  const { data, error } = await client
    .from("application_resume_objects")
    .select("id,filename,byte_size,object_path")
    .eq("application_id", applicationId)
    .eq("state", "ready")
    .maybeSingle();
  if (error) throw new Error("Résumé information is temporarily unavailable.");
  return data ? metadata.parse(data) : null;
}
export async function downloadApplicationResume(applicationId: string) {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
    error: authError,
  } = await client.auth.getUser();
  if (authError || !user?.email_confirmed_at) return null;
  const info = await getApplicationResume(applicationId);
  if (!info) return null;
  const { data, error } = await client.storage
    .from(bucket)
    .download(info.object_path);
  if (error || !data) return null;
  return { info, bytes: data };
}
async function cleanup(actor: string, job: string) {
  const client = mutationClient();
  const { data, error } = await client.rpc("claim_resume_cleanup", {
    p_actor: actor,
    p_job: job,
  });
  if (error || !Array.isArray(data)) return; // Durable candidates remain for a later retry.
  for (const row of data) {
    const parsed = z
      .object({
        id: z.uuid(),
        object_path: z.string().regex(/^[0-9a-f-]{36}\/[0-9a-f-]{36}\.pdf$/),
      })
      .safeParse(row);
    if (!parsed.success) continue;
    // Retain the tombstone even after a successful DELETE: an earlier in-flight upload can finish later.
    // Later cancellation/finalization cleanup retries this exact unreferenced key; it cannot be resurrected.
    await client.storage.from(bucket).remove([parsed.data.object_path]);
  }
}
export async function uploadApplicationResume(
  actor: string,
  job: string,
  revision: number,
  file: File,
  operation: string = randomUUID(),
) {
  const validated = await validateResume(file);
  const client = mutationClient();
  const args = resumeOperationArgs(actor, job, revision, operation);
  if (await reconcileReadyUpload(client, actor, validated, operation, args))
    return;

  const objectPath = await reserveUpload(client, args, validated);
  await uploadAndFinalize(
    client,
    actor,
    job,
    operation,
    objectPath,
    args,
    validated,
  );
  await cleanup(actor, job);
}

function resumeOperationArgs(
  actor: string,
  job: string,
  revision: number,
  operation: string,
) {
  return {
    p_actor: actor,
    p_job: job,
    p_revision: revision,
    p_operation: operation,
  };
}

async function reconcileReadyUpload(
  client: ReturnType<typeof mutationClient>,
  actor: string,
  validated: Awaited<ReturnType<typeof validateResume>>,
  operation: string,
  args: ReturnType<typeof resumeOperationArgs>,
) {
  const { data: existing, error: existingError } = await client
    .from("application_resume_objects")
    .select("id,applicant_id,filename,sha256,byte_size,state")
    .eq("id", operation)
    .maybeSingle();
  if (existingError)
    throw new Error(
      "We could not check the previous upload. Reload and try again.",
    );
  if (existing?.state !== "ready") return false;
  assertSameReadyUpload(existing, actor, validated);
  const { error } = await client.rpc("finalize_application_resume", args);
  if (error)
    throw new Error(
      "We could not reconcile the upload. Reload to check the saved résumé.",
    );
  return true;
}

function assertSameReadyUpload(
  existing: {
    applicant_id: string;
    sha256: string;
    filename: string;
    byte_size: number;
  },
  actor: string,
  validated: Awaited<ReturnType<typeof validateResume>>,
) {
  if (
    existing.applicant_id !== actor ||
    existing.sha256 !== validated.sha256 ||
    existing.filename !== validated.filename ||
    existing.byte_size !== validated.bytes.length
  )
    throw new Error(
      "Choose the same PDF to retry this operation, or choose a new file.",
    );
}

async function reserveUpload(
  client: ReturnType<typeof mutationClient>,
  args: ReturnType<typeof resumeOperationArgs>,
  validated: Awaited<ReturnType<typeof validateResume>>,
) {
  const { data: objectPath, error: reserveError } = await client.rpc(
    "reserve_application_resume",
    {
      ...args,
      p_filename: validated.filename,
      p_size: validated.bytes.length,
      p_sha256: validated.sha256,
    },
  );
  if (reserveError || typeof objectPath !== "string")
    throw new Error(
      "Save the latest draft and finish or cancel any pending upload before trying again.",
    );
  return objectPath;
}

async function uploadAndFinalize(
  client: ReturnType<typeof mutationClient>,
  actor: string,
  job: string,
  operation: string,
  objectPath: string,
  args: ReturnType<typeof resumeOperationArgs>,
  validated: Awaited<ReturnType<typeof validateResume>>,
) {
  try {
    const { error: uploadError } = await client.storage
      .from(bucket)
      .upload(objectPath, validated.bytes, {
        contentType: "application/pdf",
        upsert: false,
      });
    if (uploadError) throw new Error("Upload failed.");
    // A single reconciliation retry uses the same operation ID; it never re-uploads/overwrites bytes.
    let { error } = await client.rpc("finalize_application_resume", args);
    if (error)
      ({ error } = await client.rpc("finalize_application_resume", args));
    if (error) throw new Error("Upload could not be finalized.");
  } catch {
    await client.rpc("cancel_application_resume", {
      p_actor: actor,
      p_job: job,
      p_operation: operation,
    });
    await cleanup(actor, job);
    throw new Error(
      "We could not confirm the upload. Reload to check which résumé was saved. Your application text has not been changed.",
    );
  }
}
export async function removeApplicationResume(
  actor: string,
  job: string,
  revision: number,
) {
  const client = mutationClient();
  const { error } = await client.rpc("remove_application_resume", {
    p_actor: actor,
    p_job: job,
    p_revision: revision,
  });
  if (error)
    throw new Error(
      "We could not remove the résumé. Reload for the latest draft and try again.",
    );
  await cleanup(actor, job);
}
export async function cancelResumeUpload(actor: string, job: string) {
  const client = mutationClient();
  const { error } = await client.rpc("cancel_application_resume", {
    p_actor: actor,
    p_job: job,
  });
  if (error)
    throw new Error("We could not cancel the upload. Try again later.");
  await cleanup(actor, job);
}
