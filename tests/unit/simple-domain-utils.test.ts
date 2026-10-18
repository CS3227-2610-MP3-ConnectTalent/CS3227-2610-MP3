import { afterEach, expect, it, vi } from "vitest";
import {
  categoryLabel,
  isJobCategory,
  JOB_CATEGORIES,
} from "@/lib/job-categories";
import { usesLocalSupabase } from "@/lib/local-supabase";

afterEach(() => vi.unstubAllEnvs());

it("accepts every configured job category and labels unknown runtime values safely", () => {
  for (const category of JOB_CATEGORIES) {
    expect(isJobCategory(category.value)).toBe(true);
    expect(categoryLabel(category.value)).toBe(category.label);
  }
  expect(categoryLabel("unexpected-category" as never)).toBe(
    "unexpected-category",
  );
  expect(isJobCategory(undefined)).toBe(false);
});

it("recognizes only localhost Supabase URLs as local", () => {
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://localhost:54321");
  expect(usesLocalSupabase()).toBe(true);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://127.0.0.1:54321");
  expect(usesLocalSupabase()).toBe(true);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
  expect(usesLocalSupabase()).toBe(false);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "not a URL");
  expect(usesLocalSupabase()).toBe(false);
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "");
  expect(usesLocalSupabase()).toBe(false);
});
