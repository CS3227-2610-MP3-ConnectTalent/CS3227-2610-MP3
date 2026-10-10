type ProviderRateLimit = { retryAfterSeconds?: number };

function retryAfterHeader(error: Record<string, unknown>) {
  const headers = error.headers;
  if (
    typeof headers !== "object" ||
    headers === null ||
    !("get" in headers) ||
    typeof headers.get !== "function"
  ) {
    return undefined;
  }
  const value = headers.get("retry-after");
  return typeof value === "string" ? value.trim() : undefined;
}

function parseRetryAfterSeconds(value: string | undefined): number | undefined {
  if (!value) return undefined;

  if (/^\d+$/.test(value)) {
    const seconds = Number(value);
    return Number.isSafeInteger(seconds) && seconds <= 86_400
      ? Math.max(1, seconds)
      : undefined;
  }

  const retryAt = Date.parse(value);
  if (!Number.isFinite(retryAt)) return undefined;
  const seconds = Math.ceil((retryAt - Date.now()) / 1_000);
  return seconds <= 86_400 ? Math.max(1, seconds) : undefined;
}

export function getProviderRateLimit(error: unknown): ProviderRateLimit | null {
  if (
    typeof error !== "object" ||
    error === null ||
    !("status" in error) ||
    error.status !== 429
  )
    return null;

  const retryAfterSeconds = parseRetryAfterSeconds(retryAfterHeader(error));
  return retryAfterSeconds === undefined ? {} : { retryAfterSeconds };
}
