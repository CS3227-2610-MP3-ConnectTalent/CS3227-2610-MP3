import { afterEach, expect, it, vi } from "vitest";
import { guardAiRequest } from "@/lib/ai/request-guard";
import { boundedProviderFetch } from "@/lib/ai/provider-transport";

afterEach(() => vi.unstubAllGlobals());

it("refuses a redirect without reading its body", async () => {
  const cancel = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(new ReadableStream({ cancel }), { status: 302 }),
      ),
  );
  await expect(
    boundedProviderFetch(
      "https://soclaas-api.comp.nus.edu.sg/v1/chat/completions",
    ),
  ).rejects.toThrow("redirect");
  expect(cancel).toHaveBeenCalledOnce();
});

it("propagates stream/abort failure rather than parsing partial JSON", async () => {
  const body = new ReadableStream({
    start(controller) {
      controller.error(new Error("synthetic stream failure"));
    },
  });
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response(body)));
  await expect(
    boundedProviderFetch(
      "https://soclaas-api.comp.nus.edu.sg/v1/chat/completions",
    ),
  ).rejects.toThrow("stream failure");
});

it.each([
  [{ origin: "https://evil.example" }, 403],
  [{ origin: "null" }, 403],
  [{ "sec-fetch-site": "cross-site" }, 403],
  [{ "content-type": "text/plain" }, 415],
])("rejects unsafe browser/media requests with no-store", (extra, status) => {
  const request = new Request("https://careers.example/api/ai", {
    headers: { "content-type": "application/json", ...extra },
  });
  const response = guardAiRequest(request);
  expect(response?.status).toBe(status);
  expect(response?.headers.get("cache-control")).toBe("no-store");
});

it.each([undefined, "https://careers.example"])(
  "allows JSON with same or absent Origin without authorizing it",
  (origin) => {
    const headers = new Headers({
      "content-type": "application/json; charset=utf-8",
    });
    if (origin) headers.set("origin", origin);
    expect(
      guardAiRequest(
        new Request("https://careers.example/api/ai", { headers }),
      ),
    ).toBeNull();
  },
);

it("bounds actual streamed provider bytes even with a lying header and cancels", async () => {
  const cancel = vi.fn();
  const body = new ReadableStream({
    start(controller) {
      controller.enqueue(new Uint8Array(65_537));
    },
    cancel,
  });
  const fetch = vi
    .fn()
    .mockResolvedValue(
      new Response(body, { headers: { "content-length": "2" } }),
    );
  vi.stubGlobal("fetch", fetch);
  await expect(
    boundedProviderFetch(
      "https://soclaas-api.comp.nus.edu.sg/v1/chat/completions",
    ),
  ).rejects.toThrow("response limit");
  expect(cancel).toHaveBeenCalledOnce();
  expect(fetch.mock.calls[0][1].redirect).toBe("error");
});

it("accepts the exact envelope boundary and returns its status", async () => {
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(new Response(new Uint8Array(65_536), { status: 429 })),
  );
  const response = await boundedProviderFetch(
    "https://soclaas-api.comp.nus.edu.sg/v1/chat/completions",
  );
  expect(response.status).toBe(429);
  expect((await response.arrayBuffer()).byteLength).toBe(65_536);
});
