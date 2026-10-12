import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  usesLocalSupabase: vi.fn(),
  redirect: vi.fn((path: string): never => {
    throw new Error(`REDIRECT:${path}`);
  }),
}));

vi.mock("@/app/auth/actions", () => ({
  signIn: vi.fn(),
  requestPasswordReset: vi.fn(),
}));
vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createSupabaseServerClient,
}));
vi.mock("@/lib/local-supabase", () => ({
  usesLocalSupabase: mocks.usesLocalSupabase,
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
  };
});
vi.mock("@/components/password-input", async () => {
  const React = await import("react");
  return {
    PasswordInput: (props: React.InputHTMLAttributes<HTMLInputElement>) =>
      React.createElement("input", props),
  };
});
vi.mock("@/app/auth/reset-password/reset-password-form", async () => {
  const React = await import("react");
  return {
    ResetPasswordForm: () => React.createElement("form", null, "Reset form"),
  };
});

import SignIn from "@/app/auth/sign-in/page";
import ForgotPassword from "@/app/auth/forgot-password/page";
import ResetPassword from "@/app/auth/reset-password/page";
import CheckEmail from "@/app/auth/check-email/page";
import ResetRequested from "@/app/auth/reset-requested/page";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.usesLocalSupabase.mockReturnValue(false);
});

it("shows safe sign-in notices only when their query values are present", async () => {
  const defaultPage = renderToStaticMarkup(
    await SignIn({ searchParams: Promise.resolve({}) }),
  );
  expect(defaultPage).toContain("Sign in");
  expect(defaultPage).not.toContain('role="alert"');
  expect(defaultPage).not.toContain('role="status"');

  const notices = renderToStaticMarkup(
    await SignIn({
      searchParams: Promise.resolve({ error: "anything", reset: "success" }),
    }),
  );
  expect(notices).toContain("Password updated.");
  expect(notices).toContain("Sign in failed.");
  expect(notices).toContain('href="/auth/forgot-password"');
  expect(notices).toContain('href="/auth/sign-up"');
});

it("shows only the matching forgot-password error and keeps the response generic", async () => {
  const empty = renderToStaticMarkup(
    await ForgotPassword({ searchParams: Promise.resolve({}) }),
  );
  expect(empty).toContain("if the account exists");
  expect(empty).not.toContain('role="alert"');

  const invalid = renderToStaticMarkup(
    await ForgotPassword({
      searchParams: Promise.resolve({ error: "invalid" }),
    }),
  );
  expect(invalid).toContain("Enter a valid email address.");
  expect(invalid).not.toContain("invalid or expired");

  const expired = renderToStaticMarkup(
    await ForgotPassword({ searchParams: Promise.resolve({ error: "link" }) }),
  );
  expect(expired).toContain("invalid or expired");
});

it("requires a confirmed session to set a new password", async () => {
  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
    },
  });
  await expect(ResetPassword()).rejects.toThrow(
    "REDIRECT:/auth/forgot-password?error=link",
  );

  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { email_confirmed_at: null } },
        error: null,
      }),
    },
  });
  await expect(ResetPassword()).rejects.toThrow(
    "REDIRECT:/auth/forgot-password?error=link",
  );

  mocks.createSupabaseServerClient.mockResolvedValue({
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: { email_confirmed_at: "2026-01-01T00:00:00Z" } },
        error: null,
      }),
    },
  });
  const allowed = renderToStaticMarkup(await ResetPassword());
  expect(allowed).toContain("Set a new password");
  expect(allowed).toContain("Reset form");
});

it("provides local-only email instructions only for a local Supabase setup", () => {
  mocks.usesLocalSupabase.mockReturnValue(true);
  const local = renderToStaticMarkup(CheckEmail());
  expect(local).toContain("local mail viewer");
  expect(local).toContain("will not arrive in Gmail");

  mocks.usesLocalSupabase.mockReturnValue(false);
  const hosted = renderToStaticMarkup(CheckEmail());
  expect(hosted).toContain("verification link sent to your email");
  expect(hosted).not.toContain("local mail viewer");
});

it("renders the privacy-preserving reset confirmation and retry link", () => {
  const html = renderToStaticMarkup(ResetRequested());
  expect(html).toContain("If an account exists for that address");
  expect(html).toContain('href="/auth/forgot-password"');
});
