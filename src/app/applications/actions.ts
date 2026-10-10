"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireApplicant } from "@/lib/auth";
import { parseBackground } from "@/lib/profile-input";
import { parseCoverLetter } from "@/lib/application-input";
import { parseApplicationDetails } from "@/lib/application-details";
import type {
  ApplicationFormState,
  ApplicationFormValues,
} from "@/lib/application-form-state";
import { reconcileApplicationWrite } from "@/lib/application-retry";

const writeResultSchema = z.object({
  education: z.string().nullable(),
  work_experience: z.string().nullable(),
  id: z.uuid(),
  submission_state: z.enum(["draft", "submitted"]),
  cover_letter: z.string(),
  full_name: z
    .string()
    .nullable()
    .transform((value) => value ?? ""),
  phone: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  revision: z.number().int().positive(),
});

type UpdateIntent = "save" | "submit";
type ValidDetails = Extract<
  ReturnType<typeof parseApplicationDetails>,
  { success: true }
>["data"];
type ValidBackground = Extract<
  ReturnType<typeof parseBackground>,
  { success: true }
>["data"];
type ValidLetter = Extract<
  ReturnType<typeof parseCoverLetter>,
  { success: true }
>;
type ValidatedUpdate = {
  intent: UpdateIntent;
  details: ValidDetails;
  background: ValidBackground;
  letter: ValidLetter;
  revision: number | null;
};
type UpdateValidation =
  | { valid: true; data: ValidatedUpdate }
  | { valid: false; state: ApplicationFormState };
type ActionClient = Awaited<ReturnType<typeof requireApplicant>>["client"];

export async function updateApplication(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const jobId = readJobId(formData);
  if (!z.uuid().safeParse(jobId).success)
    redirect("/applications?error=invalid");
  const { client, user } = await requireApplicant();
  const values = readApplicationValues(formData);
  const validation = validateUpdate(formData, values);
  if (!validation.valid) return validation.state;

  const resultId = await saveApplicationUpdate(
    client,
    user.id,
    jobId,
    values,
    validation.data,
  );
  if (!resultId)
    return createFailure(
      values,
      "We could not save your changes. Check that the job is open. Copy your changes before reloading for the latest version, then try again.",
    );

  revalidatePath("/applications");
  redirect(`/applications/${resultId.path}${resultId.notice}`);
}

function readJobId(formData: FormData) {
  const value = formData.get("jobId");
  return typeof value === "string" ? value : "";
}

function readApplicationValues(formData: FormData): ApplicationFormValues {
  const read = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : "";
  };
  return {
    education: read("education"),
    work_experience: read("work_experience"),
    full_name: read("full_name"),
    phone: read("phone"),
    portfolio_url: read("portfolio_url"),
    cover_letter: read("cover_letter"),
  };
}

function createFailure(
  values: ApplicationFormValues,
  message: string,
  errors: ApplicationFormState["errors"] = {},
): ApplicationFormState {
  return { values, errors, message };
}

function invalidUpdate(
  values: ApplicationFormValues,
  message: string,
  errors: ApplicationFormState["errors"] = {},
): UpdateValidation {
  return { valid: false, state: createFailure(values, message, errors) };
}

function validateUpdate(
  formData: FormData,
  values: ApplicationFormValues,
): UpdateValidation {
  const intent = formData.get("intent");
  if (intent === "edit")
    return invalidUpdate(
      values,
      "Submitted applications are locked. Contact HR if you need to request a correction.",
    );
  if (intent !== "save" && intent !== "submit")
    return invalidUpdate(values, "Choose Save draft or Submit application.");
  return validateUpdateContent(formData, values, intent);
}

function validateUpdateContent(
  formData: FormData,
  values: ApplicationFormValues,
  intent: UpdateIntent,
): UpdateValidation {
  const mode = intent === "save" ? "draft" : "submit";
  const details = parseApplicationDetails(values, mode);
  const background = parseBackground(values);
  const letter = parseCoverLetter(formData.get("cover_letter"), mode);
  if (!details.success || !letter.success || !background.success)
    return invalidUpdate(
      values,
      "Check the highlighted fields. Your changes have not been saved.",
      {
        ...details.errors,
        ...background.errors,
        ...(!letter.success
          ? {
              cover_letter:
                "Enter a cover letter of at most 5,000 characters before submitting; drafts may be empty.",
            }
          : {}),
      },
    );
  return validateRevision(
    formData,
    values,
    intent,
    details.data,
    background.data,
    letter,
  );
}

function validateRevision(
  formData: FormData,
  values: ApplicationFormValues,
  intent: UpdateIntent,
  details: ValidDetails,
  background: ValidBackground,
  letter: ValidLetter,
): UpdateValidation {
  const rawRevision = formData.get("revision");
  const revision = rawRevision === "" ? null : Number(rawRevision);
  if (
    typeof rawRevision !== "string" ||
    (revision !== null && (!Number.isSafeInteger(revision) || revision < 1))
  )
    return invalidUpdate(
      values,
      "The application version is invalid. Copy your changes, reload and try again.",
    );
  return {
    valid: true,
    data: { intent, details, background, letter, revision },
  };
}

async function saveApplicationUpdate(
  client: ActionClient,
  userId: string,
  jobId: string,
  values: ApplicationFormValues,
  update: ValidatedUpdate,
) {
  const resultId = await callApplicationWrite(client, jobId, update);
  const reconciledId = resultId
    ? null
    : await reconcileLostWrite(client, userId, jobId, update);
  const committedId = resultId ?? reconciledId;
  if (!committedId) return null;
  return {
    path: committedId,
    notice: reconciledId
      ? `?notice=${update.intent === "submit" ? "already-submitted" : "saved"}`
      : "",
  };
}

async function callApplicationWrite(
  client: ActionClient,
  jobId: string,
  update: ValidatedUpdate,
) {
  const functionName =
    update.intent === "save"
      ? "save_application_details_v3"
      : "submit_application_details_v3";
  try {
    const { data, error } = await client.rpc(functionName, {
      p_job_id: jobId,
      p_cover_letter: update.letter.value,
      p_full_name: update.details.full_name,
      p_education: update.background.education,
      p_work_experience: update.background.work_experience,
      p_phone: update.details.phone,
      p_portfolio_url: update.details.portfolio_url,
      p_expected_revision: update.revision,
    });
    return !error && z.uuid().safeParse(data).success ? (data as string) : null;
  } catch {
    /* A lost response can follow a committed write; reconcile the owner's row. */
    return null;
  }
}

async function reconcileLostWrite(
  client: ActionClient,
  userId: string,
  jobId: string,
  update: ValidatedUpdate,
) {
  try {
    const { data, error } = await client
      .from("applications")
      .select(
        "id,submission_state,cover_letter,full_name,phone,portfolio_url,education,work_experience,revision",
      )
      .eq("applicant_id", userId)
      .eq("job_id", jobId)
      .maybeSingle();
    const parsed = error ? null : writeResultSchema.safeParse(data);
    return reconcileApplicationWrite(
      update.intent,
      {
        ...update.details,
        ...update.background,
        cover_letter: update.letter.value,
      },
      update.revision,
      parsed?.success ? parsed.data : null,
    );
  } catch {
    /* Retain inputs and show the generic failure state. */
    return null;
  }
}
