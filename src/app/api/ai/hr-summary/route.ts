import { getHrContext, getSubmittedApplication } from "@/lib/ai/application-data";
import { hrSummaryRequestSchema, hrSummaryResponseSchema } from "@/lib/ai/schemas";
import { finalizeAiInvocation, reserveAiInvocation } from "@/lib/ai/quota-audit";
import { getProviderRateLimit } from "@/lib/ai/provider-errors";
import { generateHrSummary, isSoCLaaSReady } from "@/lib/ai/soclaas-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxRequestBytes = 2_000;

type JsonRead = { ok: true; value: unknown } | { ok: false };

async function readJson(request: Request): Promise<JsonRead> {
  const contentLength = request.headers.get("content-length");
  if (contentLength && /^\d+$/.test(contentLength) && Number(contentLength) > maxRequestBytes) return { ok: false };
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
    return { ok: true, value: JSON.parse(new TextDecoder().decode(bytes)) as unknown };
  } catch {
    return { ok: false };
  }
}

function json(body: unknown, status: number, headers?: HeadersInit) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

function authorizationResponse(status: "anonymous" | "forbidden") {
  return status === "anonymous"
    ? json({ error: "Sign in to use application summaries." }, 401)
    : json({ error: "Application summaries are available to HR only." }, 403);
}

export async function POST(request: Request) {
  try {
    const context = await getHrContext();
    if (context.status !== "authorized") return authorizationResponse(context.status);

    const read = await readJson(request);
    if (!read.ok) return json({ error: "Check the request and try again." }, 400);
    const parsed = hrSummaryRequestSchema.safeParse(read.value);
    if (!parsed.success) return json({ error: "Select one submitted application." }, 400);
    if (!isSoCLaaSReady()) return json({ error: "AI summaries are temporarily unavailable." }, 503);

    const application = await getSubmittedApplication(context.client, parsed.data.applicationId);
    if (!application) return json({ error: "This submitted application is unavailable." }, 404);

    const reservation = await reserveAiInvocation(context.user.id, "hr_summary", application.id);
    if (!reservation.ok) {
      if (reservation.retryAfterSeconds) {
        return json({ error: "AI usage limit reached. Try again shortly." }, 429, { "Retry-After": String(reservation.retryAfterSeconds) });
      }
      return json({ error: "AI summaries are temporarily unavailable." }, 503);
    }

    try {
      const output = await generateHrSummary({
        coverLetter: application.coverLetter,
        requirements: application.requirements,
      });
      const validated = hrSummaryResponseSchema.safeParse(output);
      if (!validated.success) {
        const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "failure");
        return finalized
          ? json({ error: "The generated summary could not be validated. Try again." }, 502)
          : json({ error: "AI summaries are temporarily unavailable." }, 503);
      }

      const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "success");
      return finalized
        ? json(validated.data, 200)
        : json({ error: "AI summaries are temporarily unavailable." }, 503);
    } catch (error) {
      const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "failure");
      if (!finalized) return json({ error: "AI summaries are temporarily unavailable." }, 503);

      const providerRateLimit = getProviderRateLimit(error);
      if (providerRateLimit) {
        const headers = providerRateLimit.retryAfterSeconds
          ? { "Retry-After": String(providerRateLimit.retryAfterSeconds) }
          : undefined;
        return json({ error: "AI summaries are temporarily busy. Try again later." }, 503, headers);
      }
      return json({ error: "AI summaries are temporarily unavailable. Try again later." }, 503);
    }
  } catch {
    return json({ error: "AI summaries are temporarily unavailable." }, 503);
  }
}
