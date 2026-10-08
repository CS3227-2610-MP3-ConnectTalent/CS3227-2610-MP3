import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getAppSiteOrigin } from "../../src/lib/supabase/site-url";

const siteUrlEnvironmentVariables = [
  "APP_SITE_URL",
  "VERCEL",
  "VERCEL_ENV",
  "VERCEL_PROJECT_PRODUCTION_URL",
  "VERCEL_URL",
] as const;

beforeEach(() => {
  for (const variable of siteUrlEnvironmentVariables) vi.stubEnv(variable, "");
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("getAppSiteOrigin", () => {
  it("defaults to localhost for local development without an override", () => {
    expect(getAppSiteOrigin()).toBe("http://localhost:3000");
  });

  it("normalizes a configured local origin", () => {
    vi.stubEnv("APP_SITE_URL", "http://localhost:3001/");

    expect(getAppSiteOrigin()).toBe("http://localhost:3001");
  });

  it("rejects an insecure non-local override", () => {
    vi.stubEnv("APP_SITE_URL", "http://careers.example.com");

    expect(() => getAppSiteOrigin()).toThrow("APP_SITE_URL must be an HTTPS origin");
  });

  it("uses the Vercel production project URL ahead of preview or manual overrides", () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "careers.example.com/");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");
    vi.stubEnv("APP_SITE_URL", "https://manual.example.com");

    expect(getAppSiteOrigin()).toBe("https://careers.example.com");
  });

  it("allows a valid HTTPS override when the production system URL is unavailable", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    vi.stubEnv("APP_SITE_URL", "https://careers.example.com");

    expect(getAppSiteOrigin()).toBe("https://careers.example.com");
  });

  it("fails closed when production has no system URL or override", () => {
    vi.stubEnv("VERCEL_ENV", "production");

    expect(() => getAppSiteOrigin()).toThrow("VERCEL_PROJECT_PRODUCTION_URL is required");
  });

  it("uses the deployment-specific Vercel preview URL", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_PROJECT_PRODUCTION_URL", "careers.example.com");
    vi.stubEnv("VERCEL_URL", "preview-123.vercel.app");

    expect(getAppSiteOrigin()).toBe("https://preview-123.vercel.app");
  });

  it("fails closed when a preview URL and override are missing", () => {
    vi.stubEnv("VERCEL_ENV", "preview");

    expect(() => getAppSiteOrigin()).toThrow("VERCEL_URL is required");
  });

  it("rejects an insecure Vercel preview URL", () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("VERCEL_URL", "http://preview.example.com");

    expect(() => getAppSiteOrigin()).toThrow("VERCEL_URL must be an HTTPS origin");
  });

  it("requires VERCEL_ENV when running on Vercel outside development", () => {
    vi.stubEnv("VERCEL", "1");

    expect(() => getAppSiteOrigin()).toThrow("VERCEL_ENV is required");
  });
});
