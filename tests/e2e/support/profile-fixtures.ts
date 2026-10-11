import { createClient } from "@supabase/supabase-js";

export async function saveCompleteApplicantProfile(
  serviceRoleKey: string,
  email: string,
  password: string,
  fullName: string,
) {
  const applicant = createClient("http://127.0.0.1:54321", serviceRoleKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { error: signInError } = await applicant.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    throw new Error(
      `Could not sign in synthetic Applicant fixture: ${signInError.message}`,
    );
  }

  const { error: profileError } = await applicant.rpc(
    "save_applicant_profile",
    {
      p_full_name: fullName,
      p_phone: "+6591234567",
      p_portfolio_url: null,
      p_education: null,
      p_work_experience: null,
    },
  );
  await applicant.auth.signOut();
  if (profileError) {
    throw new Error(
      `Could not complete synthetic Applicant profile: ${profileError.message}`,
    );
  }
}
