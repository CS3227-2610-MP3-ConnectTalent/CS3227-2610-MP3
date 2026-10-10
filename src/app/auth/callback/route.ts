import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";
import { isProfileComplete } from "@/lib/profile-readiness";

const confirmationFailure = "/auth/sign-in?error=confirmation";

export async function GET(request: NextRequest) {
  const siteOrigin = getAppSiteOrigin();
  const isRecovery = request.nextUrl.searchParams.get("flow") === "recovery";
  const code = request.nextUrl.searchParams.get("code");
  if (!code) return failedCallback(siteOrigin, isRecovery);
  const client = await createSupabaseServerClient();
  const { error } = await client.auth.exchangeCodeForSession(code);
  if (error) return failedCallback(siteOrigin, isRecovery);
  if (isRecovery)
    return NextResponse.redirect(new URL("/auth/reset-password", siteOrigin));
  const destination = await confirmedDestination(client);
  return NextResponse.redirect(new URL(destination, siteOrigin));
}

function failedCallback(siteOrigin: string, isRecovery: boolean) {
  const destination = isRecovery
    ? "/auth/forgot-password?error=link"
    : confirmationFailure;
  return NextResponse.redirect(new URL(destination, siteOrigin));
}

async function confirmedDestination(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
) {
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user?.email_confirmed_at) return confirmationFailure;
  const { data: profile } = await client
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (profile?.role === "hr") return "/hr/applications";
  if (profile?.role !== "applicant") return confirmationFailure;
  return applicantDestination(client, user.id, user.email);
}

async function applicantDestination(
  client: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
  email?: string,
) {
  const { data, error } = await client
    .from("applicant_profiles")
    .select("full_name,phone")
    .eq("user_id", userId)
    .maybeSingle();
  return !error && isProfileComplete(data, email)
    ? "/applications"
    : "/profile";
}
