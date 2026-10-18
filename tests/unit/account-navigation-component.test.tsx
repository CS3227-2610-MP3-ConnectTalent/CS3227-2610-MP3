import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ navigation: vi.fn() }));

vi.mock("@/lib/account-navigation", () => ({
  getAccountNavigation: mocks.navigation,
}));
vi.mock("@/app/auth/actions", () => ({ signOut: "/sign-out" }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
  };
});

import { AccountNavigation } from "@/components/account-navigation";

beforeEach(() => vi.clearAllMocks());

async function markup(state: unknown) {
  mocks.navigation.mockResolvedValue(state);
  return renderToStaticMarkup(await AccountNavigation());
}

it("shows guest sign-in and sign-up routes", async () => {
  const html = await markup({ kind: "guest" });
  expect(html).toContain('aria-label="Account"');
  expect(html).toContain('href="/auth/sign-in"');
  expect(html).toContain('href="/auth/sign-up"');
  expect(html).toContain('href="/"');
});

it("shows a safe status message when account lookup is unavailable", async () => {
  const html = await markup({ kind: "unavailable" });
  expect(html).toContain('role="status"');
  expect(html).toContain("Account access is unavailable");
  expect(html).not.toContain("/applications");
  expect(html).not.toContain("/hr/");
});

it("keeps unverified accounts on generic navigation", async () => {
  const html = await markup({ kind: "signed-in", role: null });
  expect(html).toContain("Signed in");
  expect(html).toContain("Sign out");
  expect(html).not.toContain("Application review");
  expect(html).not.toContain("My applications");
});

it("shows Applicant profile and complete applications navigation", async () => {
  const html = await markup({
    kind: "signed-in",
    role: "applicant",
    incomplete: false,
  });
  expect(html).toContain("Applicant");
  expect(html).toContain('href="/applications"');
  expect(html).toContain('href="/profile"');
  expect(html).not.toContain("Manage jobs");
});

it("keeps incomplete Applicants on profile navigation", async () => {
  const html = await markup({
    kind: "signed-in",
    role: "applicant",
    incomplete: true,
  });
  expect(html).toContain('href="/profile"');
  expect(html).not.toContain('href="/applications"');
  expect(html).toContain('href="/profile"');
});

it("shows HR review and job management without Applicant-only links", async () => {
  const html = await markup({ kind: "signed-in", role: "hr" });
  expect(html).toContain("HR");
  expect(html).toContain('href="/hr/applications"');
  expect(html).toContain('href="/hr/jobs"');
  expect(html).not.toContain("My applications");
});
