import "server-only";
import { z } from "zod";
import { requireApplicant } from "./auth";
const schema = z.object({
  full_name: z.string().nullable(),
  phone: z.string().nullable(),
  portfolio_url: z.string().nullable(),
  education: z.string().nullable(),
  work_experience: z.string().nullable(),
});
export type ApplicantProfile = z.infer<typeof schema>;
export const emptyProfile: ApplicantProfile = {
  full_name: null,
  phone: null,
  portfolio_url: null,
  education: null,
  work_experience: null,
};
export async function getApplicantProfile() {
  const { client, user } = await requireApplicant({ allowIncomplete: true });
  const { data, error } = await client
    .from("applicant_profiles")
    .select("full_name,phone,portfolio_url,education,work_experience")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw new Error("Profile is unavailable. Try again later.");
  return data ? schema.parse(data) : emptyProfile;
}
