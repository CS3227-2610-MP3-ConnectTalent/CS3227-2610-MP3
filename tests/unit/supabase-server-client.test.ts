import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  createServerClient: vi.fn(),
  cookies: vi.fn(),
  cookieStore: {
    getAll: vi.fn(),
    set: vi.fn(),
  },
}));

vi.mock("@supabase/ssr", () => ({
  createServerClient: mocks.createServerClient,
}));
vi.mock("next/headers", () => ({ cookies: mocks.cookies }));

import { createSupabaseServerClient } from "@/lib/supabase/server";

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "sb_publishable_test");
  mocks.cookieStore.getAll.mockReturnValue([
    { name: "session", value: "synthetic" },
  ]);
  mocks.cookieStore.set.mockImplementation(() => undefined);
  mocks.cookies.mockResolvedValue(mocks.cookieStore);
  mocks.createServerClient.mockReturnValue({ auth: {} });
});

it("requires both public Supabase connection values", async () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  await expect(createSupabaseServerClient()).rejects.toThrow(
    "Supabase URL and publishable key are required.",
  );
  expect(mocks.cookies).not.toHaveBeenCalled();

  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://supabase.example.test");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", "");
  await expect(createSupabaseServerClient()).rejects.toThrow(
    "Supabase URL and publishable key are required.",
  );
});

it("passes cookies through the SSR adapter and attempts cookie refresh writes", async () => {
  const result = await createSupabaseServerClient();
  expect(result).toEqual({ auth: {} });
  expect(mocks.createServerClient).toHaveBeenCalledWith(
    "https://supabase.example.test",
    "sb_publishable_test",
    { cookies: expect.any(Object) },
  );
  const options = mocks.createServerClient.mock.calls[0]?.[2] as {
    cookies: { getAll: () => unknown; setAll: (values: unknown[]) => void };
  };
  expect(options.cookies.getAll()).toEqual([
    { name: "session", value: "synthetic" },
  ]);
  options.cookies.setAll([
    {
      name: "refresh",
      value: "synthetic-refresh",
      options: { httpOnly: true },
    },
  ]);
  expect(mocks.cookieStore.set).toHaveBeenCalledWith(
    "refresh",
    "synthetic-refresh",
    { httpOnly: true },
  );
});

it("ignores cookie writes from Server Components where the cookie store is read only", async () => {
  mocks.cookieStore.set.mockImplementation(() => {
    throw new Error("cookies are read only");
  });
  await createSupabaseServerClient();
  const options = mocks.createServerClient.mock.calls[0]?.[2] as {
    cookies: { setAll: (values: unknown[]) => void };
  };
  expect(() =>
    options.cookies.setAll([
      { name: "refresh", value: "synthetic-refresh", options: {} },
    ]),
  ).not.toThrow();
});
