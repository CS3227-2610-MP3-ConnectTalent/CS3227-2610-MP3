import { afterEach, expect, it, vi } from "vitest";
import { generateApplicantDraft } from "@/lib/ai/soclaas-client";

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});
it("keeps the twenty-second deadline active while reading the response body, with no retry", async () => {
  vi.useFakeTimers();
  vi.stubEnv("SOCLAAS_AI_ENABLED", "true");
  vi.stubEnv("SOCLAAS_API_KEY", "synthetic-offline");
  vi.stubEnv("SOCLAAS_BASE_URL", "https://soclaas-api.comp.nus.edu.sg/v1");
  vi.stubEnv("SOCLAAS_MODEL", "synthetic");
  const fetch = vi.fn().mockImplementation((_url, init: RequestInit) => {
    const body = new ReadableStream({
      start(controller) {
        init.signal?.addEventListener(
          "abort",
          () => controller.error(new DOMException("Aborted", "AbortError")),
          { once: true },
        );
      },
    });
    return Promise.resolve(
      new Response(body, { headers: { "content-type": "application/json" } }),
    );
  });
  vi.stubGlobal("fetch", fetch);
  const pending = generateApplicantDraft({
    notes: "Synthetic",
    jobTitle: "Role",
    requirements: "Testing",
  });
  const assertion = expect(pending).rejects.toThrow();
  await vi.advanceTimersByTimeAsync(20_000);
  await assertion;
  expect(fetch).toHaveBeenCalledOnce();
});
