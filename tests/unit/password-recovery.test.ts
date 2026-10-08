import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((destination: string) => { throw new Error(`REDIRECT:${destination}`); }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createSupabaseServerClient }));

import { requestPasswordReset, updatePassword } from "../../src/app/auth/actions";
import { GET as authCallback } from "../../src/app/auth/callback/route";

function emailForm(email = "applicant@example.test") {
  const form = new FormData();
  form.set("email", email);
  return form;
}

function passwordForm(password: string, confirmPassword = password) {
  const form = new FormData();
  form.set("password", password);
  form.set("confirmPassword", confirmPassword);
  form.set("userId", "attacker-chosen-id");
  return form;
}

beforeEach(() => {
  vi.clearAllMocks();
  for (const key of ["APP_SITE_URL", "VERCEL", "VERCEL_ENV", "VERCEL_URL", "VERCEL_PROJECT_PRODUCTION_URL"]) vi.stubEnv(key, "");
});
afterEach(() => vi.unstubAllEnvs());

describe("password recovery request", () => {
  it("uses the trusted preview callback and gives the same visible outcome for known and unknown email", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "feature-27.vercel.app");
    const resetPasswordForEmail = vi.fn().mockResolvedValueOnce({ error: null }).mockResolvedValueOnce({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { resetPasswordForEmail } });

    await expect(requestPasswordReset(emailForm())).rejects.toThrow("REDIRECT:/auth/reset-requested");
    await expect(requestPasswordReset(emailForm("unknown@example.test"))).rejects.toThrow("REDIRECT:/auth/reset-requested");
    expect(resetPasswordForEmail).toHaveBeenNthCalledWith(1, "applicant@example.test", {
      redirectTo: "https://feature-27.vercel.app/auth/callback?flow=recovery",
    });
    expect(resetPasswordForEmail).toHaveBeenCalledTimes(2);
  });

  it("does not call Supabase for an invalid email or reveal provider errors", async () => {
    const resetPasswordForEmail = vi.fn().mockResolvedValue({ error: new Error("rate limited") });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { resetPasswordForEmail } });
    await expect(requestPasswordReset(emailForm("bad-email"))).rejects.toThrow("REDIRECT:/auth/forgot-password?error=invalid");
    expect(resetPasswordForEmail).not.toHaveBeenCalled();
    await expect(requestPasswordReset(emailForm())).rejects.toThrow("REDIRECT:/auth/reset-requested");
  });

  it("keeps a thrown email transport failure on the same neutral retry page", async () => {
    const resetPasswordForEmail = vi.fn().mockRejectedValue(new Error("temporary transport outage"));
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { resetPasswordForEmail } });
    await expect(requestPasswordReset(emailForm())).rejects.toThrow("REDIRECT:/auth/reset-requested");
  });
});

describe("recovery callback", () => {
  it("exchanges a valid code and redirects only to the reset form", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
    const request = { nextUrl: { searchParams: new URLSearchParams("flow=recovery&code=one-time-code&next=https://attacker.example") } } as unknown as Parameters<typeof authCallback>[0];
    const response = await authCallback(request);
    expect(exchangeCodeForSession).toHaveBeenCalledWith("one-time-code");
    expect(response.headers.get("location")).toBe("http://localhost:3000/auth/reset-password");
  });

  it("rejects a missing or failed recovery code with a new-request path", async () => {
    const exchangeCodeForSession = vi.fn().mockResolvedValue({ error: new Error("expired") });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: { exchangeCodeForSession } });
    for (const query of ["flow=recovery", "flow=recovery&code=expired"]) {
      const request = { nextUrl: { searchParams: new URLSearchParams(query) } } as unknown as Parameters<typeof authCallback>[0];
      const response = await authCallback(request);
      expect(response.headers.get("location")).toBe("http://localhost:3000/auth/forgot-password?error=link");
    }
  });
});

describe("new password update", () => {
  it("updates only the verified current user and signs out", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    const signOut = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "current-user", email_confirmed_at: "2026-10-08" } }, error: null }),
      updateUser, signOut,
    } });
    await expect(updatePassword({ error: "" }, passwordForm("new-password-123"))).rejects.toThrow("REDIRECT:/auth/sign-in?reset=success");
    expect(updateUser).toHaveBeenCalledWith({ password: "new-password-123" });
    expect(signOut).toHaveBeenCalled();
  });

  it("refuses unauthenticated and mismatched updates without returning a password", async () => {
    const updateUser = vi.fn();
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }), updateUser,
    } });
    await expect(updatePassword({ error: "" }, passwordForm("new-password-123"))).rejects.toThrow("REDIRECT:/auth/forgot-password?error=link");
    expect(updateUser).not.toHaveBeenCalled();

    mocks.createSupabaseServerClient.mockResolvedValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "current-user", email_confirmed_at: "2026-10-08" } }, error: null }), updateUser,
    } });
    const result = await updatePassword({ error: "" }, passwordForm("new-password-123", "different-password-123"));
    expect(result).toEqual({ error: "Passwords do not match. Please try again." });
    expect(JSON.stringify(result)).not.toContain("new-password-123");
    expect(updateUser).not.toHaveBeenCalled();
  });

  it("reports a failed sign-out without claiming the recovery session ended", async () => {
    const updateUser = vi.fn().mockResolvedValue({ error: null });
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "current-user", email_confirmed_at: "2026-10-08" } }, error: null }),
      updateUser,
      signOut: vi.fn().mockResolvedValue({ error: new Error("sign-out unavailable") }),
    } });
    const result = await updatePassword({ error: "" }, passwordForm("new-password-123"));
    expect(result.error).toMatch(/password updated.*sign.out failed/i);
    expect(updateUser).toHaveBeenCalledOnce();
    expect(mocks.redirect).not.toHaveBeenCalledWith("/auth/sign-in?reset=success");
  });

  it("returns a safe error when the password provider rejects the update", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({ auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: "current-user", email_confirmed_at: "2026-10-08" } }, error: null }),
      updateUser: vi.fn().mockRejectedValue(new Error("provider unavailable")),
      signOut: vi.fn(),
    } });
    const result = await updatePassword({ error: "" }, passwordForm("new-password-123"));
    expect(result.error).toMatch(/could not update/i);
    expect(JSON.stringify(result)).not.toContain("new-password-123");
  });
});
