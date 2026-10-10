export type JsonRead = { ok: true; value: unknown } | { ok: false };

export async function readJson(
  request: Request,
  maxRequestBytes: number,
): Promise<JsonRead> {
  const contentLength = request.headers.get("content-length");
  if (
    contentLength &&
    /^\d+$/.test(contentLength) &&
    Number(contentLength) > maxRequestBytes
  ) {
    return { ok: false };
  }

  const reader = request.body?.getReader();
  if (!reader) return { ok: false };

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxRequestBytes) {
        await reader.cancel();
        return { ok: false };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false };
  }

  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  try {
    return {
      ok: true,
      value: JSON.parse(new TextDecoder().decode(bytes)) as unknown,
    };
  } catch {
    return { ok: false };
  }
}

export function jsonNoStore(
  body: unknown,
  status: number,
  headers?: HeadersInit,
) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}
