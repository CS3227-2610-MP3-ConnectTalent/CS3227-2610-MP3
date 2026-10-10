import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";

export async function GET(request: NextRequest) {
  const siteOrigin = getAppSiteOrigin();
  const code = request.nextUrl.searchParams.get("code");
  const isRecovery = request.nextUrl.searchParams.get("flow") === "recovery";
  if (code) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error)
      return NextResponse.redirect(
        new URL(
          isRecovery ? "/auth/reset-password" : "/applications",
          siteOrigin,
        ),
      );
  }
  return NextResponse.redirect(
    new URL(
      isRecovery
        ? "/auth/forgot-password?error=link"
        : "/auth/sign-in?error=confirmation",
      siteOrigin,
    ),
  );
}
