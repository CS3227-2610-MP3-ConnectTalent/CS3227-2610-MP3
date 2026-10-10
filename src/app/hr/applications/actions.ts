"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireHR } from "@/lib/hr-auth";
import { parseHRNote, parseHRStatusChange } from "@/lib/hr-input";

function reviewPath(id: string) {
  return `/hr/applications/${id}`;
}

function audit(actor: string, operation: "note" | "status", target: string, outcome: "changed" | "denied") {
  console.info(JSON.stringify({ actor, operation, target, at: new Date().toISOString(), outcome }));
}

export async function addHRNote(formData: FormData) {
  const { client, user } = await requireHR();
  const id = formData.get("applicationId");
  const parsed = parseHRNote(formData.get("body"));
  if (typeof id !== "string" || !z.uuid().safeParse(id).success) redirect("/hr/applications?error=invalid");
  if (!parsed.success) redirect(`${reviewPath(id)}?error=note`);
  const { data: active, error: activeError } = await client.from("applications").select("id").eq("id", id)
    .eq("submission_state", "submitted").is("withdrawn_at", null).maybeSingle();
  if (activeError || !active) { audit(user.id, "note", id, "denied"); redirect(`${reviewPath(id)}?error=withdrawn`); }
  const { error } = await client.rpc("append_hr_application_note", {
    p_application_id: id, p_body: parsed.value,
  });
  audit(user.id, "note", id, error ? "denied" : "changed");
  if (error) redirect(`${reviewPath(id)}?error=note`);
  revalidatePath(reviewPath(id));
  redirect(`${reviewPath(id)}?notice=note-added`);
}

export async function changeHRStatus(formData: FormData) {
  const { client, user } = await requireHR();
  const id = formData.get("applicationId");
  const parsed = parseHRStatusChange(formData.get("status"), formData.get("expectedRevision"));
  if (typeof id !== "string" || !z.uuid().safeParse(id).success) redirect("/hr/applications?error=invalid");
  if (!parsed.success) redirect(`${reviewPath(id)}?error=status`);
  const { data: active, error: activeError } = await client.from("applications").select("id").eq("id", id)
    .eq("submission_state", "submitted").is("withdrawn_at", null).maybeSingle();
  if (activeError || !active) { audit(user.id, "status", id, "denied"); redirect(`${reviewPath(id)}?error=withdrawn`); }
  const { error } = await client.rpc("change_hr_application_status", {
    p_application_id: id,
    p_status: parsed.value.status,
    p_expected_revision: parsed.value.expectedRevision,
  });
  audit(user.id, "status", id, error ? "denied" : "changed");
  if (error) redirect(`${reviewPath(id)}?error=status`);
  revalidatePath(reviewPath(id));
  revalidatePath("/hr/applications");
  redirect(`${reviewPath(id)}?notice=status-changed`);
}
