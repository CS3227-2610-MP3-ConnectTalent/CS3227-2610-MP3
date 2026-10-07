"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireApplicant } from "@/lib/auth";
import { parseCoverLetter } from "@/lib/application-input";

export async function updateApplication(jobId: string, formData: FormData) {
  if (!z.uuid().safeParse(jobId).success) redirect("/applications?error=invalid");
  const intent = formData.get("intent");
  if (intent !== "save" && intent !== "submit" && intent !== "edit") {
    redirect(`/jobs/${jobId}/apply?error=invalid`);
  }
  const parsedLetter = parseCoverLetter(formData.get("cover_letter"), intent === "save" ? "draft" : "submit");
  if (!parsedLetter.success) redirect(`/jobs/${jobId}/apply?error=letter`);
  const rawRevision = formData.get("revision");
  const revision = rawRevision === "" ? null : Number(rawRevision);
  if (typeof rawRevision !== "string" || (revision !== null && (!Number.isSafeInteger(revision) || revision < 1))) {
    redirect(`/jobs/${jobId}/apply?error=stale`);
  }

  const { client } = await requireApplicant();
  const functionName = intent === "save" ? "save_application_draft"
    : intent === "submit" ? "submit_application" : "edit_submitted_letter";
  const { data, error } = await client.rpc(functionName, {
    p_job_id: jobId,
    p_cover_letter: parsedLetter.value,
    p_expected_revision: revision,
  });
  if (error || !z.uuid().safeParse(data).success) {
    // Do not return provider errors or applicant text to the browser.
    redirect(intent === "edit" ? "/applications?error=update" : `/jobs/${jobId}/apply?error=update`);
  }
  revalidatePath("/applications");
  redirect(`/applications/${data}`);
}
