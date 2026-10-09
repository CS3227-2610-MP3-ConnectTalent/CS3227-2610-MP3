import { getApplicantContext, getPublishedJob } from "@/lib/ai/application-data";
import { applicantDraftRequestSchema, applicantDraftResponseSchema } from "@/lib/ai/schemas";
import { finalizeAiInvocation, reserveAiInvocation } from "@/lib/ai/quota-audit";
import { getProviderRateLimit } from "@/lib/ai/provider-errors";
import { generateApplicantDraft, isSoCLaaSReady } from "@/lib/ai/soclaas-client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxRequestBytes = 20_000;

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
    ? json({ error: "Sign in to use cover-letter drafting." }, 401)
    : json({ error: "Cover-letter drafting is available to Applicants only." }, 403);
}

export async function POST(request: Request) {
  try {
    const context = await getApplicantContext();
    if (context.status !== "authorized") return authorizationResponse(context.status);

    const read = await readJson(request);
    if (!read.ok) return json({ error: "Check the request and try again." }, 400);
    const parsed = applicantDraftRequestSchema.safeParse(read.value);
    if (!parsed.success) return json({ error: "Enter valid experience notes of at most 4,000 characters." }, 400);
    if (!isSoCLaaSReady()) return json({ error: "AI drafting is temporarily unavailable." }, 503);

    const job = await getPublishedJob(context.client, parsed.data.jobId);
    if (!job) return json({ error: "This published job is unavailable." }, 404);

    const reservation = await reserveAiInvocation(context.user.id, "applicant_draft", job.id);
    if (!reservation.ok) {
      if (reservation.retryAfterSeconds) {
        return json({ error: "AI usage limit reached. Try again shortly." }, 429, { "Retry-After": String(reservation.retryAfterSeconds) });
      }
      return json({ error: "AI drafting is temporarily unavailable." }, 503);
    }

    try {
      const output = await generateApplicantDraft({
        notes: parsed.data.notes,
        jobTitle: job.title,
        requirements: job.requirements,
      });
      const validated = applicantDraftResponseSchema.safeParse(output);
      if (!validated.success) {
        const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "failure");
        return finalized
          ? json({ error: "The generated draft could not be validated. Try again." }, 502)
          : json({ error: "AI drafting is temporarily unavailable." }, 503);
      }

      const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "success");
      return finalized
        ? json(validated.data, 200)
        : json({ error: "AI drafting is temporarily unavailable." }, 503);
    } catch (error) {
      const finalized = await finalizeAiInvocation(context.user.id, reservation.invocationId, "failure");
      if (!finalized) return json({ error: "AI drafting is temporarily unavailable." }, 503);

      const providerRateLimit = getProviderRateLimit(error);
      if (providerRateLimit) {
        const headers = providerRateLimit.retryAfterSeconds
          ? { "Retry-After": String(providerRateLimit.retryAfterSeconds) }
          : undefined;
        return json({ error: "AI drafting is temporarily busy. Try again later." }, 503, headers);
      }
      return json({ error: "AI drafting is temporarily unavailable. Try again later." }, 503);
    }
  } catch {
    return json({ error: "AI drafting is temporarily unavailable." }, 503);
  }
}
