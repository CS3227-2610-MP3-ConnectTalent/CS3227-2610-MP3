"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";

const credentialsSchema = z.object({ email: z.email().max(254), password: z.string().min(8).max(72) });

export type SignUpState = { email: string; error: string };

export async function signUp(_previousState: SignUpState, formData: FormData): Promise<SignUpState> {
  const email = formData.get("email");
  const retainedEmail = typeof email === "string" ? email.slice(0, 254) : "";
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { email: retainedEmail, error: "Check your details and try again." };
  if (parsed.data.password !== formData.get("confirmPassword")) {
    return { email: parsed.data.email, error: "Passwords do not match. Please try again." };
  }
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: new URL("/auth/callback", getAppSiteOrigin()).toString() },
  });
  if (error) return { email: parsed.data.email, error: "Check your details and try again." };
  redirect("/auth/check-email");
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/auth/sign-in?error=invalid");
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) redirect("/auth/sign-in?error=credentials");
  const { data: { user }, error: userError } = await client.auth.getUser();
  if (userError || !user?.email_confirmed_at) redirect("/auth/sign-in?error=credentials");
  const { data: profile, error: profileError } = await client.from("profiles")
    .select("role").eq("user_id", user.id).maybeSingle();
  if (profileError || !profile) redirect("/auth/sign-in?error=credentials");
  if (profile.role === "hr") redirect("/hr/applications");
  redirect("/applications");
}

export async function signOut() {
  const client = await createSupabaseServerClient();
  await client.auth.signOut();
  redirect("/");
}
