import { afterEach, expect, it, vi } from "vitest";
import {
  allowedProviderEndpoint,
  completeAssistantContent,
} from "@/lib/ai/provider-policy";

afterEach(() => vi.unstubAllEnvs());
it("allows the public gateway's default port and refuses loopback in production", () => {
  vi.stubEnv("NODE_ENV", "production");
  expect(
    allowedProviderEndpoint("https://soclaas-api.comp.nus.edu.sg:443/v1/"),
  ).toBe(true);
  expect(allowedProviderEndpoint("http://127.0.0.1:9999/v1")).toBe(false);
  vi.stubEnv("NODE_ENV", "test");
  expect(allowedProviderEndpoint("http://127.0.0.1:9999/v1")).toBe(true);
  expect(
    allowedProviderEndpoint(
      "https://soclaas-api.comp.nus.edu.sg.evil.example/v1",
    ),
  ).toBe(false);
});
it.each([
  "https://soclaas-api.comp.nus.edu.sg/v2",
  "not-a-url",
  "https://soclaas-api.comp.nus.edu.sg/v1#fragment",
])("rejects a misleading endpoint", (url) => {
  expect(allowedProviderEndpoint(url)).toBe(false);
});
it("refuses ambiguous multiple choices and legacy function calls", () => {
  const choice = {
    finish_reason: "stop",
    message: { role: "assistant", content: "{}" },
  };
  expect(() =>
    completeAssistantContent({ choices: [choice, choice] }),
  ).toThrow();
  expect(() =>
    completeAssistantContent({
      choices: [
        {
          ...choice,
          message: { ...choice.message, function_call: { name: "submit" } },
        },
      ],
    }),
  ).toThrow();
  expect(() => completeAssistantContent({ choices: [] })).toThrow();
});
