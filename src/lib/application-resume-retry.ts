import "server-only";
import { applicationResumeIdentity } from "./application-resume-client";
import { ResumeUploadPreparationError } from "./resume-errors";
import {
  cleanupApplicationResume,
  resumeMutationClient,
} from "./application-resume-storage";

type MutationClient = ReturnType<typeof resumeMutationClient>;

export async function prepareWithPendingRecovery<T>(
  client: MutationClient,
  actor: string,
  job: string,
  revision: number | null,
  retry: boolean,
  prepare: () => Promise<T>,
): Promise<T> {
  try {
    return await prepare();
  } catch (error) {
    if (
      !retry ||
      revision === null ||
      !(error instanceof ResumeUploadPreparationError) ||
      error.code !== "RESUME_UPLOAD_PENDING"
    ) {
      throw error;
    }
    await recoverPendingJobResume(client, actor, job, revision);
    return prepare();
  }
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
  await cleanupApplicationResume(actor, job, applicationResumeIdentity(client));
}
