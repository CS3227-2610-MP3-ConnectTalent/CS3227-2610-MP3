"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireApplicant } from "@/lib/auth";
import { parseCoverLetter } from "@/lib/application-input";
import { parseApplicationDetails } from "@/lib/application-details";
import type { ApplicationFormState, ApplicationFormValues } from "@/lib/application-form-state";
import { reconcileApplicationWrite } from "@/lib/application-retry";

const writeResultSchema = z.object({
  id: z.uuid(), submission_state: z.enum(["draft", "submitted"]), cover_letter: z.string(),
  full_name: z.string().nullable().transform((value) => value ?? ""),
  phone: z.string().nullable(), portfolio_url: z.string().nullable(), revision: z.number().int().positive(),
});

export async function updateApplication(_previous: ApplicationFormState, formData: FormData): Promise<ApplicationFormState> {
  const rawJobId = formData.get("jobId");
  const jobId = typeof rawJobId === "string" ? rawJobId : "";
  if (!z.uuid().safeParse(jobId).success) redirect("/applications?error=invalid");
  const { client, user } = await requireApplicant();
  const read = (name: string) => typeof formData.get(name) === "string" ? formData.get(name) as string : "";
  const values: ApplicationFormValues = {
    full_name: read("full_name"), phone: read("phone"), portfolio_url: read("portfolio_url"), cover_letter: read("cover_letter"),
  };
  const failure = (message: string, errors: ApplicationFormState["errors"] = {}): ApplicationFormState => ({ values, errors, message });
  const intent = formData.get("intent");
  if (intent === "edit") return failure("Submitted applications are locked. Contact HR if you need to request a correction.");
  if (intent !== "save" && intent !== "submit") return failure("Choose Save draft or Submit application.");
  const details = parseApplicationDetails(values, intent === "save" ? "draft" : "submit");
  const letter = parseCoverLetter(formData.get("cover_letter"), intent === "save" ? "draft" : "submit");
  if (!details.success || !letter.success) return failure("Check the highlighted fields. Your changes have not been saved.", {
    ...details.errors, ...(!letter.success ? { cover_letter: "Enter a cover letter of at most 5,000 characters before submitting; drafts may be empty." } : {}),
  });
  const rawRevision = formData.get("revision");
  const revision = rawRevision === "" ? null : Number(rawRevision);
  if (typeof rawRevision !== "string" || (revision !== null && (!Number.isSafeInteger(revision) || revision < 1))) {
    return failure("The application version is invalid. Copy your changes, reload and try again.");
  }
  const functionName = intent === "save" ? "save_application_details_v2" : "submit_application_details_v2";
  let resultId: string | null = null;
  let reconciled = false;
  try {
    const { data, error } = await client.rpc(functionName, {
      p_job_id: jobId, p_cover_letter: letter.value, p_full_name: details.data.full_name,
      p_phone: details.data.phone, p_portfolio_url: details.data.portfolio_url, p_expected_revision: revision,
    });
    if (!error && z.uuid().safeParse(data).success) resultId = data as string;
  } catch { /* A lost response can follow a committed write; check only the owner's row. */ }
  if (!resultId) {
    try {
      const { data: current, error } = await client.from("applications")
        .select("id,submission_state,cover_letter,full_name,phone,portfolio_url,revision")
        .eq("applicant_id", user.id).eq("job_id", jobId).maybeSingle();
      const parsed = error ? null : writeResultSchema.safeParse(current);
      resultId = reconcileApplicationWrite(intent, { ...details.data, cover_letter: letter.value }, revision, parsed?.success ? parsed.data : null);
      reconciled = Boolean(resultId);
    } catch { /* Retain inputs and give generic feedback below. */ }
  }
  if (!resultId) return failure("We could not save your changes. Check that the job is open. Copy your changes before reloading for the latest version, then try again.");
  revalidatePath("/applications");
  const notice = reconciled ? `?notice=${intent === "submit" ? "already-submitted" : "saved"}` : "";
  redirect(`/applications/${resultId}${notice}`);
}
