import "server-only";
import {
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";

type MutationClient = ReturnType<typeof resumeMutationClient>;

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
