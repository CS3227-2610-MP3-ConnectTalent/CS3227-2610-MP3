"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";

const credentialsSchema = z.object({ email: z.email().max(254), password: z.string().min(8).max(72) });

export async function signUp(formData: FormData) {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/auth/sign-up?error=invalid");
  if (parsed.data.password !== formData.get("confirmPassword")) {
    redirect("/auth/sign-up?error=password-mismatch");
  }
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signUp({
    ...parsed.data,
    options: { emailRedirectTo: new URL("/auth/callback", getAppSiteOrigin()).toString() },
  });
  if (error) redirect("/auth/sign-up?error=signup");
  redirect("/auth/check-email");
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) redirect("/auth/sign-in?error=invalid");
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) redirect("/auth/sign-in?error=credentials");
  redirect("/applications");
}

export async function signOut() {
  const client = await createSupabaseServerClient();
  await client.auth.signOut();
  redirect("/");
}
