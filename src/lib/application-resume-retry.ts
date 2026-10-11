import "server-only";
import { z } from "zod";
import {
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";

type MutationClient = ReturnType<typeof resumeMutationClient>;

export async function resolveRetryRevision(
  client: MutationClient,
  actor: string,
  job: string,
  revision: number | null,
  retry: boolean,
) {
  if (!retry || revision !== null) return revision;
  const { data, error } = await client
    .from("applications")
    .select("revision")
    .eq("applicant_id", actor)
    .eq("job_id", job)
    .maybeSingle();
  const persisted = z
    .object({ revision: z.number().int().positive() })
    .safeParse(data);
  if (error || (data !== null && !persisted.success))
    throw new Error("We could not check the previous upload. Try again later.");
  return persisted.success ? persisted.data.revision : null;
}

export async function recoverPendingJobResume(
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
    throw new Error("Reload the application before retrying this upload.");
  await cleanupApplicationResume(actor, job);
}
