import { afterEach, expect, it, vi } from "vitest";

import { jsonNoStore, readJson } from "@/lib/ai/http";
import { getProviderRateLimit } from "@/lib/ai/provider-errors";

function request(body: BodyInit | null, headers?: HeadersInit) {
  return new Request("http://localhost/api/ai", {
    method: "POST",
    body,
    headers,
  });
}

afterEach(() => vi.useRealTimers());

it("rejects invalid, absent, and oversized request bodies before parsing JSON", async () => {
  expect(await readJson(request(null), 20)).toEqual({ ok: false });
  expect(await readJson(request("{}", { "content-length": "21" }), 20)).toEqual(
    { ok: false },
  );
  expect(
    await readJson(
      request("{ invalid", { "content-length": "not-a-number" }),
      20,
    ),
  ).toEqual({ ok: false });
  expect(await readJson(request("{}"), 20)).toEqual({ ok: true, value: {} });
});

it("bounds streamed bodies and cancels streams that exceed the configured size", async () => {
  const cancel = vi.fn();
  const oversizedStream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"payload":"too large"}'));
    },
    cancel,
  });
  const oversizedRequest = new Request("http://localhost/api/ai", {
    method: "POST",
    body: oversizedStream,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  expect(await readJson(oversizedRequest, 4)).toEqual({ ok: false });
  expect(cancel).toHaveBeenCalledOnce();

  const splitBody = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"ok":'));
      controller.enqueue(new TextEncoder().encode("true}"));
      controller.close();
    },
  });
  const streamedRequest = new Request("http://localhost/api/ai", {
    method: "POST",
    body: splitBody,
    duplex: "half",
  } as RequestInit & { duplex: "half" });
  expect(await readJson(streamedRequest, 20)).toEqual({
    ok: true,
    value: { ok: true },
  });
});

it("returns uncached JSON and allows additional response headers", async () => {
  const response = jsonNoStore({ ok: true }, 201, {
    "Retry-After": "3",
    "Cache-Control": "private, no-store",
  });
  expect(response.status).toBe(201);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(response.headers.get("Retry-After")).toBe("3");
  expect(await response.json()).toEqual({ ok: true });
});

it("ignores non-rate-limit provider failures and malformed retry headers", () => {
  expect(getProviderRateLimit(null)).toBeNull();
  expect(getProviderRateLimit("429")).toBeNull();
  expect(
    getProviderRateLimit({ status: 500, headers: new Headers() }),
  ).toBeNull();
  expect(getProviderRateLimit({ status: 429 })).toEqual({});
  expect(getProviderRateLimit({ status: 429, headers: null })).toEqual({});
  expect(
    getProviderRateLimit({ status: 429, headers: { get: "not a function" } }),
  ).toEqual({});
  expect(
    getProviderRateLimit({ status: 429, headers: { get: () => 12 } }),
  ).toEqual({});
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "not a date" }),
    }),
  ).toEqual({});
});

it("normalizes numeric retry limits and parses bounded HTTP-date values", () => {
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": " 12 " }),
    }),
  ).toEqual({ retryAfterSeconds: 12 });
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "0" }),
    }),
  ).toEqual({ retryAfterSeconds: 1 });
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "9007199254740992" }),
    }),
  ).toEqual({});
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "86401" }),
    }),
  ).toEqual({});

  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-01-01T00:00:00.000Z"));
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "Thu, 01 Jan 2026 00:00:03 GMT" }),
    }),
  ).toEqual({ retryAfterSeconds: 3 });
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "Wed, 31 Dec 2025 23:59:59 GMT" }),
    }),
  ).toEqual({ retryAfterSeconds: 1 });
  expect(
    getProviderRateLimit({
      status: 429,
      headers: new Headers({ "retry-after": "Fri, 02 Jan 2026 00:00:01 GMT" }),
    }),
  ).toEqual({});
});
