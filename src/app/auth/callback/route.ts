import { NextResponse, type NextRequest } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const siteUrl = process.env.APP_SITE_URL ?? "http://localhost:3000";
  const code = request.nextUrl.searchParams.get("code");
  if (code) {
    const client = await createSupabaseServerClient();
    const { error } = await client.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL("/applications", siteUrl));
  }
  return NextResponse.redirect(new URL("/auth/sign-in?error=confirmation", siteUrl));
}
