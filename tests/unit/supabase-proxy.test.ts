import { NextRequest } from "next/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  user: null as null | Record<string, unknown>,
  authError: null as unknown,
  roleResult: {
    data: null as null | { role: string },
    error: null as unknown,
  },
  profileResult: {
    data: null as null | { full_name: string; phone: string },
    error: null as unknown,
  },
  refreshCookies: [] as Array<{
    name: string;
    value: string;
    options?: Record<string, unknown>;
  }>,
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: (...args: unknown[]) => mocks.createServerClient(...args),
}));

import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { proxy } from "@/proxy";

const user = {
  id: "44000000-0000-4000-8000-000000000101",
  email: "applicant@example.test",
  email_confirmed_at: "2026-10-10T00:00:00Z",
};

function request(path = "/applications") {
  return new NextRequest(`https://careers.example.test${path}`);
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  mocks.user = user;
  mocks.authError = null;
  mocks.roleResult = { data: { role: "applicant" }, error: null };
  mocks.profileResult = {
    data: { full_name: "Synthetic Applicant", phone: "+6591234567" },
    error: null,
  };
  mocks.refreshCookies = [];
  mocks.createServerClient.mockImplementation((_url, _key, options) => {
    options.cookies.getAll();
    if (mocks.refreshCookies.length)
      options.cookies.setAll(mocks.refreshCookies);
    return {
      auth: {
        getUser: async () => ({
          data: { user: mocks.user },
          error: mocks.authError,
        }),
      },
      from: (table: string) => ({
        select: () => ({
          eq: () => ({
            maybeSingle: async () =>
              table === "profiles" ? mocks.roleResult : mocks.profileResult,
          }),
        }),
      }),
    };
  });
});

it("passes through without creating a Supabase client when public config is incomplete", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  const response = await updateSupabaseSession(request());
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-next")).toBe("1");
  expect(mocks.createServerClient).not.toHaveBeenCalled();
});

it("passes through guests, unconfirmed accounts, and non-Applicant roles", async () => {
  mocks.user = null;
  expect((await updateSupabaseSession(request())).status).toBe(200);

  mocks.user = { ...user, email_confirmed_at: null };
  expect((await updateSupabaseSession(request())).status).toBe(200);

  mocks.user = user;
  mocks.roleResult = { data: { role: "hr" }, error: null };
  expect((await updateSupabaseSession(request())).status).toBe(200);
});

it("does not apply Applicant profile gating on profile, resume, auth, or Next asset paths", async () => {
  for (const path of [
    "/profile",
    "/api/profile/resume",
    "/auth/sign-in",
    "/auth/callback",
    "/_next/static/app.js",
  ]) {
    mocks.roleResult = { data: { role: "applicant" }, error: null };
    const response = await updateSupabaseSession(request(path));
    expect(response.status, path).toBe(200);
  }
  expect(mocks.createServerClient).toHaveBeenCalledTimes(5);
});

it("returns a private unavailable response when the database role cannot be read", async () => {
  mocks.refreshCookies = [
    { name: "session", value: "rotated-token", options: { httpOnly: true } },
  ];
  mocks.roleResult = {
    data: null,
    error: { message: "synthetic query error" },
  };
  const response = await updateSupabaseSession(request());
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(response.headers.get("set-cookie")).toContain("session=rotated-token");
  await expect(response.json()).resolves.toEqual({
    error: "Account access is temporarily unavailable.",
  });
});

it("allows complete Applicant profiles and redirects incomplete web requests", async () => {
  const complete = await updateSupabaseSession(request());
  expect(complete.status).toBe(200);
  expect(complete.headers.get("x-middleware-next")).toBe("1");

  mocks.refreshCookies = [{ name: "session", value: "refreshed" }];
  mocks.profileResult = { data: null, error: null };
  const incomplete = await updateSupabaseSession(request("/applications"));
  expect(incomplete.status).toBe(307);
  expect(incomplete.headers.get("location")).toBe(
    "https://careers.example.test/profile",
  );
  expect(incomplete.headers.get("Cache-Control")).toBe("private, no-store");
  expect(incomplete.headers.get("set-cookie")).toContain("session=refreshed");
});

it("blocks incomplete Applicant API requests and database failures without leaking details", async () => {
  mocks.profileResult = { data: null, error: null };
  const incomplete = await updateSupabaseSession(request("/api/applications"));
  expect(incomplete.status).toBe(403);
  expect(incomplete.headers.get("Cache-Control")).toBe("private, no-store");
  await expect(incomplete.json()).resolves.toEqual({
    error: "Complete your profile before continuing.",
  });

  mocks.profileResult = {
    data: null,
    error: { message: "synthetic database detail" },
  };
  const queryError = await updateSupabaseSession(request("/api/applications"));
  expect(queryError.status).toBe(403);
  expect(await queryError.text()).not.toContain("synthetic database detail");
});

it("exports the App Router proxy entry point as the session updater", async () => {
  const response = await proxy(request("/auth/sign-in"));
  expect(response.status).toBe(200);
  expect(response.headers.get("x-middleware-next")).toBe("1");
});
