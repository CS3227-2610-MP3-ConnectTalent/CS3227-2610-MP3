"use server";
import { revalidatePath } from "next/cache";
import { requireApplicant } from "@/lib/auth";
import { parseProfile } from "@/lib/profile-input";
export type ProfileState = {
  values: Record<string, string>;
  errors: Record<string, string | undefined>;
  message?: string;
};
export async function saveProfile(
  _state: ProfileState,
  form: FormData,
): Promise<ProfileState> {
  const { client } = await requireApplicant();
  const values = Object.fromEntries(
    ["full_name", "phone", "portfolio_url", "education", "work_experience"].map(
      (key) => [
        key,
        typeof form.get(key) === "string" ? (form.get(key) as string) : "",
      ],
    ),
  );
  const parsed = parseProfile(values);
  if (!parsed.success)
    return {
      values,
      errors: parsed.errors,
      message: "Check the highlighted fields. Your profile has not been saved.",
    };
  try {
    const { error } = await client.rpc(
      "save_applicant_profile",
      Object.fromEntries(
        Object.entries(parsed.data).map(([key, value]) => [`p_${key}`, value]),
      ),
    );
    if (error)
      return {
        values,
        errors: {},
        message: "We could not save your profile. Try again later.",
      };
  } catch {
    return {
      values,
      errors: {},
      message: "We could not save your profile. Try again later.",
    };
  }
  revalidatePath("/profile");
  return {
    values,
    errors: {},
    message: "Profile saved. Existing applications are unchanged.",
  };
}
