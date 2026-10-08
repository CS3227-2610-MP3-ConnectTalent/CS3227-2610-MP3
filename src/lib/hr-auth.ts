import { notFound, redirect } from "next/navigation";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function requireHR() {
  const client = await createSupabaseServerClient();
  const { data: { user }, error } = await client.auth.getUser();
  if (error || !user) redirect("/auth/sign-in");
  if (!user.email_confirmed_at) notFound();
  const { data: profile, error: profileError } = await client.from("profiles")
    .select("role").eq("user_id", user.id).maybeSingle();
  if (profileError || profile?.role !== "hr") notFound();
  return { client, user };
}
