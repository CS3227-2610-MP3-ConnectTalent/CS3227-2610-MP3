import { redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function currentApplicant() {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await client.auth.getUser();
  if (error || !user || !user.email_confirmed_at) return null;
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError || profile?.role !== "applicant") return null;
  return { client, user };
}

export async function requireApplicant() {
  const applicant = await currentApplicant();
  if (!applicant) redirect("/auth/sign-in");
  return applicant;
}
