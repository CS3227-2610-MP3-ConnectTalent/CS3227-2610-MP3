import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createClient: vi.fn(),
  redirect: vi.fn(),
  notFound: vi.fn(),
  userResponse: {
    data: { user: null as null | Record<string, unknown> },
    error: null as unknown,
  },
  profiles: {} as Record<string, { data: unknown; error: unknown }>,
}));

vi.mock("@/lib/supabase/server", () => ({
  createSupabaseServerClient: mocks.createClient,
}));
vi.mock("next/navigation", () => ({
  redirect: mocks.redirect,
  notFound: mocks.notFound,
}));

import { currentApplicant, requireApplicant } from "@/lib/auth";
import { requireHR } from "@/lib/hr-auth";

function client() {
  return {
    auth: { getUser: vi.fn(async () => mocks.userResponse) },
    from: vi.fn((table: string) => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn(async () => mocks.profiles[table]),
        })),
      })),
    })),
  };
}

function setUser(user: Record<string, unknown> | null, error: unknown = null) {
  mocks.userResponse = { data: { user }, error };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.redirect.mockImplementation((path: string) => {
    throw new Error(`redirect:${path}`);
  });
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
  mocks.userResponse = { data: { user: null }, error: null };
  mocks.profiles = {
    profiles: { data: { role: "applicant" }, error: null },
    applicant_profiles: {
      data: { full_name: "Synthetic Applicant", phone: "+6591234567" },
      error: null,
    },
  };
  mocks.createClient.mockImplementation(async () => client());
});

it("returns no current Applicant when the provider, verification, or role check fails", async () => {
  setUser(null);
  await expect(currentApplicant()).resolves.toBeNull();
  setUser({
    id: "user-1",
    email: "applicant@example.test",
    email_confirmed_at: null,
  });
  await expect(currentApplicant()).resolves.toBeNull();
  setUser(
    {
      id: "user-1",
      email: "applicant@example.test",
      email_confirmed_at: "now",
    },
    { message: "synthetic auth failure" },
  );
  await expect(currentApplicant()).resolves.toBeNull();
  setUser({
    id: "user-1",
    email: "applicant@example.test",
    email_confirmed_at: "now",
  });
  mocks.profiles.profiles = { data: { role: "hr" }, error: null };
  await expect(currentApplicant()).resolves.toBeNull();
  mocks.profiles.profiles = {
    data: null,
    error: { message: "synthetic query failure" },
  };
  await expect(currentApplicant()).resolves.toBeNull();
});

it("returns a verified Applicant and requires a profile unless explicitly allowed incomplete", async () => {
  const user = {
    id: "user-1",
    email: "applicant@example.test",
    email_confirmed_at: "2026-10-10T00:00:00Z",
  };
  setUser(user);
  const current = await currentApplicant();
  expect(current?.user).toEqual(user);

  const incompleteClient = client();
  mocks.createClient.mockResolvedValue(incompleteClient);
  mocks.profiles.applicant_profiles = { data: null, error: null };
  await expect(requireApplicant()).rejects.toThrow("redirect:/profile");

  mocks.createClient.mockResolvedValue(client());
  await expect(
    requireApplicant({ allowIncomplete: true }),
  ).resolves.toMatchObject({
    user,
  });
});

it("redirects a missing Applicant session to sign in", async () => {
  await expect(requireApplicant()).rejects.toThrow("redirect:/auth/sign-in");
});

it("denies HR sessions until email and database role are confirmed", async () => {
  await expect(requireHR()).rejects.toThrow("redirect:/auth/sign-in");

  setUser({ id: "hr-1", email: "hr@example.test", email_confirmed_at: null });
  await expect(requireHR()).rejects.toThrow("not-found");

  setUser({
    id: "hr-1",
    email: "hr@example.test",
    email_confirmed_at: "2026-10-10T00:00:00Z",
  });
  mocks.profiles.profiles = { data: { role: "applicant" }, error: null };
  await expect(requireHR()).rejects.toThrow("not-found");
  mocks.profiles.profiles = {
    data: null,
    error: { message: "synthetic query failure" },
  };
  await expect(requireHR()).rejects.toThrow("not-found");
});

it("returns the verified HR session with the database role", async () => {
  const user = {
    id: "hr-1",
    email: "hr@example.test",
    email_confirmed_at: "2026-10-10T00:00:00Z",
  };
  setUser(user);
  mocks.profiles.profiles = { data: { role: "hr" }, error: null };

  await expect(requireHR()).resolves.toMatchObject({ user });
});
