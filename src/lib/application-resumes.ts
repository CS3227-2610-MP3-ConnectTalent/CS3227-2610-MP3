import "server-only";
import { z } from "zod";
import {
  applicationResumeBucket,
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";
import { createSupabaseServerClient } from "./supabase/server";

export { resumeMutationClient } from "./application-resume-storage";
export {
  uploadApplicationResume,
  uploadResumeForJob,
} from "./application-resume-uploads";

const metadata = z.object({
  id: z.uuid(),
  filename: z.string(),
  byte_size: z.number().int().positive(),
  object_path: z.string(),
});
export type ResumeMetadata = z.infer<typeof metadata>;

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
    .from(applicationResumeBucket)
    .download(info.object_path);
  if (error || !data) return null;
  return { info, bytes: data };
}

export async function removeApplicationResume(
  actor: string,
  job: string,
  revision: number,
) {
  const { error } = await resumeMutationClient().rpc(
    "remove_application_resume",
    { p_actor: actor, p_job: job, p_revision: revision },
  );
  if (error)
    throw new Error(
      "We could not remove the résumé. Reload for the latest draft and try again.",
    );
  await cleanupApplicationResume(actor, job);
}

export async function cancelResumeUpload(actor: string, job: string) {
  const { error } = await resumeMutationClient().rpc(
    "cancel_application_resume",
    { p_actor: actor, p_job: job },
  );
  if (error)
    throw new Error("We could not cancel the upload. Try again later.");
  await cleanupApplicationResume(actor, job);
}
