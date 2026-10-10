import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
}));

vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createSupabaseServerClient }));

import { signUp } from "../../src/app/auth/actions";
import { GET as authCallback } from "../../src/app/auth/callback/route";

const siteUrlEnvironmentVariables = [
  "APP_SITE_URL",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

beforeEach(() => {
  vi.clearAllMocks();
  mocks.createSupabaseServerClient.mockReset();
  for (const variable of siteUrlEnvironmentVariables) vi.stubEnv(variable, "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("Supabase Auth redirect origins", () => {
  it("returns the email without creating an account when signup passwords differ", async () => {
    const formData = new FormData();
    formData.set("email", "applicant@example.test");
    formData.set("password", "correct-horse-battery-staple");
    formData.set("confirmPassword", "different-horse-battery-staple");

    await expect(signUp({ email: "", error: "" }, formData)).resolves.toEqual({
      email: "applicant@example.test",
      error: "Passwords do not match. Please try again.",
    });
    expect(mocks.createSupabaseServerClient).not.toHaveBeenCalled();
  });

  it("sends signup confirmation to the current preview callback", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "feature-123.vercel.app");
    const signUpWithSupabase = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { signUp: signUpWithSupabase } });

    const formData = new FormData();
    formData.set("email", "applicant@example.test");
    formData.set("password", "correct-horse-battery-staple");
    formData.set("confirmPassword", "correct-horse-battery-staple");

    await expect(signUp({ email: "", error: "" }, formData)).rejects.toThrow("REDIRECT:/auth/check-email");
    expect(signUpWithSupabase).toHaveBeenCalledWith({
      email: "applicant@example.test",
      password: "correct-horse-battery-staple",
      options: { emailRedirectTo: "https://feature-123.vercel.app/auth/callback" },
    });
  });

  it("sends signup confirmation to the production callback despite a preview URL", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "careers.example.com");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");
    const signUpWithSupabase = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { signUp: signUpWithSupabase } });

    const formData = new FormData();
    formData.set("email", "applicant@example.test");
    formData.set("password", "correct-horse-battery-staple");
    formData.set("confirmPassword", "correct-horse-battery-staple");

    await expect(signUp({ email: "", error: "" }, formData)).rejects.toThrow("REDIRECT:/auth/check-email");
    expect(signUpWithSupabase).toHaveBeenCalledWith({
      email: "applicant@example.test",
      password: "correct-horse-battery-staple",
      options: { emailRedirectTo: "https://careers.example.com/auth/callback" },
    });
  });

  it("redirects a successful confirmation to the configured site origin", async () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "careers.example.com");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: { exchangeCodeForSession, getUser: async () => ({ data: { user: { id: "synthetic", email: "synthetic@example.test", email_confirmed_at: "2026-10-10" } } }) },
      from: (table: string) => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({
        data: table === "profiles" ? { role: "applicant" } : null, error: null,
      }) }) }) }),
    });
    const request = {
      nextUrl: {
        searchParams: new URLSearchParams("code=confirmation-code"),
        origin: "https://attacker.example",
      },
    } as unknown as Parameters<typeof authCallback>[0];

    const response = await authCallback(request);

    expect(exchangeCodeForSession).toHaveBeenCalledWith("confirmation-code");
    expect(response.headers.get("location")).toBe("https://careers.example.com/profile");
  });

  it("uses the configured site origin for failed confirmation redirects too", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "feature-123.vercel.app");
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: new Error("expired code") });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
    const request = {
      nextUrl: {
        searchParams: new URLSearchParams("code=expired-code"),
        origin: "https://attacker.example",
      },
    } as unknown as Parameters<typeof authCallback>[0];

    const response = await authCallback(request);

    expect(response.headers.get("location")).toBe(
      "https://feature-123.vercel.app/auth/sign-in?error=confirmation",
    );
  });
});
