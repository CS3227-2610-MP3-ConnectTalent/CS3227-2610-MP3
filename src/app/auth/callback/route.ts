import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getAppSiteOrigin } from "@/lib/supabase/site-url";

export async function GET(request: NextRequest) {
  const siteOrigin = getAppSiteOrigin();
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/applications", siteOrigin));
  }
  return NextResponse.redirect(new URL("/auth/sign-in?error=confirmation", siteOrigin));
}
