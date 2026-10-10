import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseServerClient: vi.fn(),
  redirect: vi.fn((destination: string) => { throw new Error(`REDIRECT:${destination}`); }),
}));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("@/lib/supabase/server", () => ({ createSupabaseServerClient: mocks.createSupabaseServerClient }));

import { signIn } from "../../src/app/auth/actions";

function credentials() {
  const form = new FormData();
  form.set("email", "hr@example.test");
  form.set("password", "correct-horse-battery-staple");
  return form;
}

beforeEach(() => vi.clearAllMocks());

describe("role-aware sign-in", () => {
  it("sends verified HR to the HR review area", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "hr-id", email_confirmed_at: "2026-10-08" } }, error: null }),
      },
      from: vi.fn().mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: "hr" }, error: null }) }) }) }),
    });
    await expect(signIn(credentials())).rejects.toThrow("REDIRECT:/hr/applications");
  });

  it("sends incomplete verified Applicants to profile completion", async () => {
    mocks.createSupabaseServerClient.mockResolvedValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        getUser: vi.fn().mockResolvedValue({ data: { user: { id: "applicant-id", email_confirmed_at: "2026-10-08" } }, error: null }),
      },
      from: vi.fn().mockReturnValue({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { role: "applicant" }, error: null }) }) }) }),
    });
    await expect(signIn(credentials())).rejects.toThrow("REDIRECT:/profile");
  });
});
