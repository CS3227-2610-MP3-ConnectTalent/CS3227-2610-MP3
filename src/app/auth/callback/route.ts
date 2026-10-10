import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";
import { isProfileComplete } from "@/lib/profile-readiness";

export async function GET(request: NextRequest) {
  const siteOrigin = getAppSiteOrigin();
  const code = request.nextUrl.searchParams.get("code");
  const isRecovery = request.nextUrl.searchParams.get("flow") === "recovery";
  if (code) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) {
      if (isRecovery) return NextResponse.redirect(new URL("/auth/reset-password", siteOrigin));
      const { data: { user } } = await client.auth.getUser();
      const { data: role } = await client.from("profiles").select("role").eq("user_id", user?.id ?? "").maybeSingle();
      let destination = "/auth/sign-in?error=confirmation";
      if (user?.email_confirmed_at && role?.role === "hr") destination = "/hr/applications";
      else if (user?.email_confirmed_at && role?.role === "applicant") {
        const { data, error } = await client.from("applicant_profiles").select("full_name,phone").eq("user_id", user.id).maybeSingle();
        destination = !error && isProfileComplete(data, user.email) ? "/applications" : "/profile";
      }
      return NextResponse.redirect(new URL(destination, siteOrigin));
    }
  }
  return NextResponse.redirect(new URL(isRecovery ? "/auth/forgot-password?error=link" : "/auth/sign-in?error=confirmation", siteOrigin));
}
