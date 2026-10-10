"use server";

import { redirect } from "next/navigation";
import { z } from "zod";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";

const credentialsSchema = z.object({
  email: z.email().max(254),
  password: z.string().min(8).max(72),
});

export type SignUpState = { email: string; error: string };

export async function signUp(
  _previousState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email = formData.get("email");
  const retainedEmail = typeof email === "string" ? email.slice(0, 254) : "";
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success)
    return { email: retainedEmail, error: "Check your details and try again." };
  if (parsed.data.password !== formData.get("confirmPassword")) {
    return {
      email: parsed.data.email,
      error: "Passwords do not match. Please try again.",
    };
  }
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signUp({
    ...parsed.data,
    options: {
      emailRedirectTo: new URL("/auth/callback", getAppSiteOrigin()).toString(),
    },
  });
  if (error)
    return {
      email: parsed.data.email,
      error: "Check your details and try again.",
    };
  redirect("/auth/check-email");
}

export async function signIn(formData: FormData) {
  const parsed = credentialsSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/auth/sign-in?error=invalid");
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.signInWithPassword(parsed.data);
  if (error) redirect("/auth/sign-in?error=credentials");
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user?.email_confirmed_at)
    redirect("/auth/sign-in?error=credentials");
  const { data: profile, error: profileError } = await client
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profileError || !profile) redirect("/auth/sign-in?error=credentials");
  if (profile.role === "hr") redirect("/hr/applications");
  redirect("/applications");
}

export async function signOut() {
  let failed = false;
  try {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.signOut();
    failed = Boolean(error);
  } catch {
    failed = true;
  }
  redirect(failed ? "/?authError=sign-out" : "/");
}

export async function requestPasswordReset(formData: FormData) {
  const parsed = z.email().max(254).safeParse(formData.get("email"));
  if (!parsed.success) redirect("/auth/forgot-password?error=invalid");

  const client = await createSupabaseServerClient();
  // Both a provider error and an unknown address get the same neutral retry page.
  try {
    await client.auth.resetPasswordForEmail(parsed.data, {
      redirectTo: new URL(
        "/auth/callback?flow=recovery",
        getAppSiteOrigin(),
      ).toString(),
    });
  } catch {
    // A transport failure must not expose account existence or turn into a server error.
  }
  redirect("/auth/reset-requested");
}

export type ResetPasswordState = { error: string };

export async function updatePassword(
  _previousState: ResetPasswordState,
  formData: FormData,
): Promise<ResetPasswordState> {
  const client = await createSupabaseServerClient();
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();
  if (userError || !user?.email_confirmed_at)
    redirect("/auth/forgot-password?error=link");

  const parsed = z.string().min(8).max(72).safeParse(formData.get("password"));
  if (!parsed.success)
    return { error: "Use a password with 8 to 72 characters." };
  if (parsed.data !== formData.get("confirmPassword")) {
    return { error: "Passwords do not match. Please try again." };
  }

  try {
    const { error } = await client.auth.updateUser({ password: parsed.data });
    if (error)
      return {
        error:
          "Could not update your password. Please try again or request a new link.",
      };
  } catch {
    return {
      error:
        "Could not update your password. Please try again or request a new link.",
    };
  }

  let signOutFailed = false;
  try {
    const { error } = await client.auth.signOut();
    signOutFailed = Boolean(error);
  } catch {
    signOutFailed = true;
  }
  if (signOutFailed) {
    return {
      error:
        "Password updated, but automatic sign-out failed. Close this browser before using a shared device.",
    };
  }
  redirect("/auth/sign-in?reset=success");
}
