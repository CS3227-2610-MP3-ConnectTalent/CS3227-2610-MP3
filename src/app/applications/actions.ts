"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { performWithdrawal } from "@/lib/application-withdrawal";

import { requireApplicant } from "@/lib/auth";
import { parseBackground } from "@/lib/profile-input";
import { parseCoverLetter } from "@/lib/application-input";
import { parseApplicationDetails } from "@/lib/application-details";
import { phoneFromForm } from "@/lib/phone";
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

export async function updateApplication(
  _previous: ApplicationFormState,
  formData: FormData,
): Promise<ApplicationFormState> {
  const jobId = getJobId(formData);
  if (!jobId) redirect("/applications?error=invalid");
  const { client, user } = await requireApplicant();
  const parsed = parseApplicationInput(formData);
  if (!parsed.ok) return parsed.state;
  const result = await saveApplication(client, user.id, jobId, parsed.data);
  if (!result.id)
    return failure(
      parsed.data.values,
      "We could not save your changes. Check that the job is open. Copy your changes before reloading for the latest version, then try again.",
    );
  revalidatePath("/applications");
  const notice = result.reconciled
    ? `?notice=${parsed.data.intent === "submit" ? "already-submitted" : "saved"}`
    : "";
  redirect(`/applications/${result.id}${notice}`);
}

type SaveInput = {
  intent: "save" | "submit";
  values: ApplicationFormValues;
  details: Extract<
    ReturnType<typeof parseApplicationDetails>,
    { success: true }
  >;
  background: Extract<ReturnType<typeof parseBackground>, { success: true }>;
  letter: Extract<ReturnType<typeof parseCoverLetter>, { success: true }>;
  revision: number | null;
};

type ParseResult =
  { ok: true; data: SaveInput } | { ok: false; state: ApplicationFormState };

function getJobId(formData: FormData) {
  const value = formData.get("jobId");
  return typeof value === "string" && z.uuid().safeParse(value).success
    ? value
    : null;
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
    phone: phoneFromForm(formData),
    portfolio_url: read("portfolio_url"),
    cover_letter: read("cover_letter"),
  };
}

function failure(
  values: ApplicationFormValues,
  message: string,
  errors: ApplicationFormState["errors"] = {},
): ApplicationFormState {
  return { values, errors, message };
}

function parseApplicationInput(formData: FormData): ParseResult {
  const values = readApplicationValues(formData);
  const intent = formData.get("intent");
  if (intent === "edit")
    return {
      ok: false,
      state: failure(
        values,
        "Submitted applications are locked. Contact HR if you need to request a correction.",
      ),
    };
  if (intent !== "save" && intent !== "submit")
    return {
      ok: false,
      state: failure(values, "Choose Save draft or Submit application."),
    };

  const mode = intent === "save" ? "draft" : "submit";
  const details = parseApplicationDetails(values, mode);
  const background = parseBackground(values);
  const letter = parseCoverLetter(formData.get("cover_letter"), mode);
  if (!details.success || !background.success || !letter.success)
    return parseFailure(values, details, background, letter);
  const revision = parseRevision(formData.get("revision"));
  if (!revision.ok)
    return {
      ok: false,
      state: failure(
        values,
        "The application version is invalid. Copy your changes, reload and try again.",
      ),
    };
  return {
    ok: true,
    data: {
      intent,
      values,
      details,
      background,
      letter,
      revision: revision.value,
    },
  };
}

function parseFailure(
  values: ApplicationFormValues,
  details: ReturnType<typeof parseApplicationDetails>,
  background: ReturnType<typeof parseBackground>,
  letter: ReturnType<typeof parseCoverLetter>,
): ParseResult {
  return {
    ok: false,
    state: failure(
      values,
      "Check the highlighted fields. Your changes have not been saved.",
      {
        ...(details.success ? {} : details.errors),
        ...(background.success ? {} : background.errors),
        ...(!letter.success
          ? {
              cover_letter:
                "Enter a cover letter of at most 5,000 characters before submitting; drafts may be empty.",
            }
          : {}),
      },
    ),
  };
}

function parseRevision(raw: FormDataEntryValue | null) {
  if (typeof raw !== "string") return { ok: false as const };
  const value = raw === "" ? null : Number(raw);
  if (value !== null && (!Number.isSafeInteger(value) || value < 1))
    return { ok: false as const };
  return { ok: true as const, value };
}

async function saveApplication(
  client: Awaited<ReturnType<typeof requireApplicant>>["client"],
  userId: string,
  jobId: string,
  input: SaveInput,
) {
  const id = await callApplicationWrite(client, jobId, input);
  if (id) return { id, reconciled: false };
  const reconciledId = await reconcileApplication(client, userId, jobId, input);
  return { id: reconciledId, reconciled: Boolean(reconciledId) };
}

async function callApplicationWrite(
  client: Awaited<ReturnType<typeof requireApplicant>>["client"],
  jobId: string,
  input: SaveInput,
) {
  const functionName =
    input.intent === "save"
      ? "save_application_details_v3"
      : "submit_application_details_v3";
  try {
    const { data, error } = await client.rpc(functionName, {
      p_job_id: jobId,
      p_cover_letter: input.letter.value,
      p_full_name: input.details.data.full_name,
      p_education: input.background.data.education,
      p_work_experience: input.background.data.work_experience,
      p_phone: input.details.data.phone,
      p_portfolio_url: input.details.data.portfolio_url,
      p_expected_revision: input.revision,
    });
    return !error && z.uuid().safeParse(data).success ? (data as string) : null;
  } catch {
    /* A lost response can follow a committed write; check only the owner's row. */
    return null;
  }
}

async function reconcileApplication(
  client: Awaited<ReturnType<typeof requireApplicant>>["client"],
  userId: string,
  jobId: string,
  input: SaveInput,
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
      input.intent,
      {
        ...input.details.data,
        ...input.background.data,
        cover_letter: input.letter.value,
      },
      input.revision,
      parsed?.success ? parsed.data : null,
    );
  } catch {
    /* Retain inputs and give generic feedback below. */
    return null;
  }
}

export async function withdrawApplication(
  _previous: { message: string | null },
  form: FormData,
): Promise<{ message: string | null }> {
  const { client, user } = await requireApplicant();
  const id = form.get("applicationId");
  if (
    typeof id !== "string" ||
    !z.uuid().safeParse(id).success ||
    form.get("confirmed") !== "true"
  ) {
    return {
      message:
        "Confirm withdrawal of a submitted application before continuing.",
    };
  }
  if (!(await performWithdrawal(client, user.id, id))) {
    return {
      message:
        "We could not confirm withdrawal. Reload to check the application before trying again.",
    };
  }
  for (const path of [
    "/applications",
    `/applications/${id}`,
    "/hr/applications",
    `/hr/applications/${id}`,
  ])
    revalidatePath(path);
  redirect(`/applications/${id}?notice=withdrawn`);
}
