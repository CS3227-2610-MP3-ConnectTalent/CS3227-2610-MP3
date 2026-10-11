"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireHR } from "@/lib/hr-auth";
import { parseHRJobFields, parseHRJobId } from "@/lib/hr-job-input";

type Operation = "create" | "edit" | "publish" | "close";
function audit(
  actor: string,
  operation: Operation,
  target: string,
  outcome: "changed" | "denied",
) {
  console.info(
    JSON.stringify({
      actor,
      operation,
      target,
      at: new Date().toISOString(),
      outcome,
    }),
  );
}

function refreshJobs(id?: string) {
  revalidatePath("/hr/jobs");
  if (id) revalidatePath(`/hr/jobs/${id}`);
  revalidatePath("/");
  if (id) revalidatePath(`/jobs/${id}`);
}

export async function createHRJobDraft(formData: FormData) {
  const { client, user } = await requireHR();
  const parsed = parseHRJobFields(formData);
  if (!parsed.success) {
    audit(user.id, "create", "new", "denied");
    redirect("/hr/jobs/new?error=invalid");
  }
  const fields = parsed.value;
  let result: { data: unknown; error: unknown };
  try {
    result = await client.rpc("create_hr_job_draft", {
      p_title: fields.title,
      p_team: fields.team,
      p_category: fields.category,
      p_description: fields.description,
      p_requirements: fields.requirements,
    });
  } catch {
    audit(user.id, "create", "new", "denied");
    redirect("/hr/jobs/new?error=save");
  }
  const id = parseHRJobId(result.data);
  audit(
    user.id,
    "create",
    id.success ? id.value : "new",
    result.error || !id.success ? "denied" : "changed",
  );
  if (result.error || !id.success) redirect("/hr/jobs/new?error=save");
  refreshJobs(id.value);
  redirect(`/hr/jobs/${id.value}?notice=created`);
}

export async function editHRJobDraft(formData: FormData) {
  const { client, user } = await requireHR();
  const id = parseHRJobId(formData.get("jobId"));
  if (!id.success) {
    audit(user.id, "edit", "invalid", "denied");
    redirect("/hr/jobs?error=invalid");
  }
  const fields = parseHRJobFields(formData);
  if (!fields.success) {
    audit(user.id, "edit", id.value, "denied");
    redirect(`/hr/jobs/${id.value}?error=invalid`);
  }
  let error: unknown;
  try {
    ({ error } = await client.rpc("edit_hr_job_draft", {
      p_job_id: id.value,
      p_title: fields.value.title,
      p_team: fields.value.team,
      p_category: fields.value.category,
      p_description: fields.value.description,
      p_requirements: fields.value.requirements,
    }));
  } catch {
    error = true;
  }
  audit(user.id, "edit", id.value, error ? "denied" : "changed");
  if (error) redirect(`/hr/jobs/${id.value}?error=save`);
  refreshJobs(id.value);
  redirect(`/hr/jobs/${id.value}?notice=saved`);
}

async function transitionHRJob(
  formData: FormData,
  operation: "publish" | "close",
) {
  const { client, user } = await requireHR();
  const id = parseHRJobId(formData.get("jobId"));
  if (!id.success) {
    audit(user.id, operation, "invalid", "denied");
    redirect("/hr/jobs?error=invalid");
  }
  let error: unknown;
  try {
    ({ error } = await client.rpc(
      operation === "publish" ? "publish_hr_job" : "close_hr_job",
      { p_job_id: id.value },
    ));
  } catch {
    error = true;
  }
  audit(user.id, operation, id.value, error ? "denied" : "changed");
  if (error) redirect(`/hr/jobs/${id.value}?error=transition`);
  refreshJobs(id.value);
  redirect(
    `/hr/jobs/${id.value}?notice=${operation === "publish" ? "published" : "closed"}`,
  );
}

export async function publishHRJob(formData: FormData) {
  await transitionHRJob(formData, "publish");
}

export async function closeHRJob(formData: FormData) {
  await transitionHRJob(formData, "close");
}
