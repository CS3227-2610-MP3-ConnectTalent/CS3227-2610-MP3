"use server";
import { revalidatePath } from "next/cache";
import { requireApplicant } from "@/lib/auth";
import { parseProfile } from "@/lib/profile-input";
import { phoneFromForm } from "@/lib/phone";
import { isProfileComplete } from "@/lib/profile-readiness";
import { redirect } from "next/navigation";
export type ProfileState = { values: Record<string, string>; errors: Record<string, string | undefined>; message?: string };
export async function saveProfile(_state: ProfileState, form: FormData): Promise<ProfileState> {
  const { client, user } = await requireApplicant({ allowIncomplete: true });
  const { data: before } = await client.from("applicant_profiles").select("full_name,phone").eq("user_id", user.id).maybeSingle();
  const values = Object.fromEntries(["full_name", "phone", "portfolio_url", "education", "work_experience"].map(key => [key, typeof form.get(key) === "string" ? form.get(key) as string : ""]));
  values.phone = phoneFromForm(form);
  const parsed = parseProfile(values);
  if (!parsed.success) return { values, errors: parsed.errors, message: "Check the highlighted fields. Your profile has not been saved." };
  try {
    const { error } = await client.rpc("save_applicant_profile", Object.fromEntries(Object.entries(parsed.data).map(([key, value]) => [`p_${key}`, value])));
    if (error) return { values, errors: {}, message: "We could not save your profile. Try again later." };
  } catch { return { values, errors: {}, message: "We could not save your profile. Try again later." }; }
  revalidatePath("/profile");
  revalidatePath("/", "layout");
  if (!isProfileComplete(before, user.email)) redirect("/");
  return { values, errors: {}, message: "Profile saved." };
}
