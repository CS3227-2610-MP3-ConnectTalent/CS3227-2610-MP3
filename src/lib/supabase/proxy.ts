import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isProfileComplete } from "@/lib/profile-readiness";

function createCookieSession(request: NextRequest, url: string, key: string) {
  let response = NextResponse.next({ request });
  const supabase = createServerClient(url, key, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });
  return { supabase, response: () => response };
}

type CookieSession = ReturnType<typeof createCookieSession>;
type ApplicantUser = NonNullable<
  Awaited<
    ReturnType<CookieSession["supabase"]["auth"]["getUser"]>
  >["data"]["user"]
>;

export async function updateSupabaseSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return NextResponse.next({ request });

  const session = createCookieSession(request, url, key);
  const {
    data: { user },
  } = await session.supabase.auth.getUser();
  const gated = user ? await profileGate(session, request, user) : null;
  return gated ?? session.response();
}

async function profileGate(
  session: CookieSession,
  request: NextRequest,
  user: ApplicantUser,
) {
  const path = request.nextUrl.pathname;
  if (!user.email_confirmed_at || isOnboardingPath(path)) return null;
  const { data: role, error: roleError } = await session.supabase
    .from("profiles")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();
  if (roleError || !role) return unavailableResponse(session.response());
  if (role.role !== "applicant") return null;
  return checkApplicantProfile(session, request, user);
}

function isOnboardingPath(path: string) {
  return (
    path === "/profile" ||
    path === "/api/profile/resume" ||
    path.startsWith("/auth/") ||
    path.startsWith("/_next/")
  );
}

async function checkApplicantProfile(
  session: CookieSession,
  request: NextRequest,
  user: ApplicantUser,
) {
  const { data, error } = await session.supabase
    .from("applicant_profiles")
    .select("full_name,phone")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!error && isProfileComplete(data, user.email)) return null;
  return incompleteProfileResponse(request, session.response());
}

function unavailableResponse(response: NextResponse) {
  const failed = NextResponse.json(
    { error: "Account access is temporarily unavailable." },
    { status: 503 },
  );
  copyCookies(response, failed);
  failed.headers.set("Cache-Control", "private, no-store");
  return failed;
}

function incompleteProfileResponse(
  request: NextRequest,
  response: NextResponse,
) {
  const blocked = request.nextUrl.pathname.startsWith("/api/")
    ? NextResponse.json(
        { error: "Complete your profile before continuing." },
        { status: 403 },
      )
    : NextResponse.redirect(new URL("/profile", request.url));
  copyCookies(response, blocked);
  copyResponseHeaders(response, blocked);
  blocked.headers.set("Cache-Control", "private, no-store");
  return blocked;
}

function copyCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => target.cookies.set(cookie));
}

function copyResponseHeaders(source: NextResponse, target: NextResponse) {
  for (const header of ["expires", "pragma"]) {
    const value = source.headers.get(header);
    if (value) target.headers.set(header, value);
  }
}
