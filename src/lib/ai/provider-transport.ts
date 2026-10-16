import "server-only";

export const maxProviderBytes = 65_536;

/** Buffer only a bounded response before the SDK can parse any JSON. */
export async function boundedProviderFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const response = await fetch(input, { ...init, redirect: "error" });
  if (response.status >= 300 && response.status < 400) {
    await response.body?.cancel();
    throw new Error("SoCLaaS redirect is not allowed.");
  }
  const reader = response.body?.getReader();
  if (!reader) throw new Error("SoCLaaS returned no response body.");
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    while (true) {
      init?.signal?.throwIfAborted();
      const { value, done } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxProviderBytes)
        throw new Error("SoCLaaS response limit exceeded.");
      chunks.push(value);
    }
  } catch (error) {
    await reader.cancel().catch(() => undefined);
    throw error;
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const headers = new Headers(response.headers);
  headers.delete("content-encoding");
  headers.set("content-length", String(total));
  return new Response(bytes, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
