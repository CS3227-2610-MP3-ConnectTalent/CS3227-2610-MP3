import { afterEach, expect, it, vi } from "vitest";
import { generateApplicantDraft } from "@/lib/ai/soclaas-client";

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});
it("suppresses ambient SDK debug logging of provider error bodies", async () => {
  vi.stubEnv("OPENAI_LOG", "debug");
  vi.stubEnv("SOCLAAS_AI_ENABLED", "true");
  vi.stubEnv("SOCLAAS_API_KEY", "synthetic-offline-token");
  vi.stubEnv("SOCLAAS_BASE_URL", "https://soclaas-api.comp.nus.edu.sg/v1");
  vi.stubEnv("SOCLAAS_MODEL", "synthetic");
  const logs = ["debug", "info", "warn", "error", "log"] as const;
  const spies = logs.map((method) =>
    vi.spyOn(console, method).mockImplementation(() => undefined),
  );
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response("SYNTHETIC_PRIVATE_ERROR_BODY", { status: 503 }),
      ),
  );
  await expect(
    generateApplicantDraft({
      notes: "Synthetic notes",
      jobTitle: "Role",
      requirements: "Testing",
    }),
  ).rejects.toThrow();
  expect(spies.flatMap((spy) => spy.mock.calls)).toEqual([]);
});
