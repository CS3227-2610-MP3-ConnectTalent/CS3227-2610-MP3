import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/profile-readiness";

export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });
  const { data: { user } } = await supabase.auth.getUser();
  const path = request.nextUrl.pathname;
  const onboardingRoute = path === "/profile" || path === "/api/profile/resume" || path.startsWith("/auth/") || path.startsWith("/_next/");
  if (user?.email_confirmed_at && !onboardingRoute) {
    const { data: role, error: roleError } = await supabase.from("profiles").select("role").eq("user_id", user.id).maybeSingle();
    if (roleError || !role) {
      const failed = NextResponse.json({ error: "Account access is temporarily unavailable." }, { status: 503 });
      response.cookies.getAll().forEach(cookie => failed.cookies.set(cookie));
      failed.headers.set("Cache-Control", "private, no-store");
      return failed;
    }
    if (role.role === "applicant") {
      const { data, error } = await supabase.from("applicant_profiles").select("full_name,phone").eq("user_id", user.id).maybeSingle();
      if (error || !isProfileComplete(data, user.email)) {
        const blocked = path.startsWith("/api/")
          ? NextResponse.json({ error: "Complete your profile before continuing." }, { status: 403 })
          : NextResponse.redirect(new URL("/profile", request.url));
        response.cookies.getAll().forEach(cookie => blocked.cookies.set(cookie));
        for (const header of ["expires", "pragma"]) {
          const value = response.headers.get(header); if (value) blocked.headers.set(header, value);
        }
        blocked.headers.set("Cache-Control", "private, no-store");
        return blocked;
      }
    }
  }
  return response;
}
