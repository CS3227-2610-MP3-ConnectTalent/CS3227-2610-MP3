import {
  getHrContext,
  getSubmittedApplication,
} from "@/lib/ai/application-data";
import { hrSummaryRequestSchema } from "@/lib/ai/schemas";
import {
  buildHrSummaryResponse,
  splitHrSummarySource,
} from "@/lib/ai/hr-summary";
import {
  finalizeAiInvocation,
  reserveAiInvocation,
} from "@/lib/ai/quota-audit";
import { getProviderRateLimit } from "@/lib/ai/provider-errors";
import { generateHrSummary, isSoCLaaSReady } from "@/lib/ai/soclaas-client";
import { jsonNoStore, readJson } from "@/lib/ai/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxRequestBytes = 2_000;

function authorizationResponse(status: "anonymous" | "forbidden") {
  return status === "anonymous"
    ? jsonNoStore({ error: "Sign in to use application summaries." }, 401)
    : jsonNoStore(
        { error: "Application summaries are available to HR only." },
        403,
      );
}

function unavailable(message = "AI summaries are temporarily unavailable.") {
  return jsonNoStore({ error: message }, 503);
}

async function createSummaryRequest(request: Request) {
  const context = await getHrContext();
  if (context.status !== "authorized")
    return authorizationResponse(context.status);

  const read = await readJson(request, maxRequestBytes);
  if (!read.ok)
    return jsonNoStore({ error: "Check the request and try again." }, 400);
  const parsed = hrSummaryRequestSchema.safeParse(read.value);
  if (!parsed.success)
    return jsonNoStore({ error: "Select one submitted application." }, 400);
  if (!isSoCLaaSReady()) return unavailable();

  return summarizeApplication(context, parsed.data.applicationId);
}

async function summarizeApplication(
  context: Extract<
    Awaited<ReturnType<typeof getHrContext>>,
    { status: "authorized" }
  >,
  applicationId: string,
) {
  const application = await getSubmittedApplication(
    context.client,
    applicationId,
  );
  if (!application)
    return jsonNoStore(
      { error: "This submitted application is unavailable." },
      404,
    );

  const letterSentences = splitHrSummarySource(application.coverLetter);
  const requirementSentences = splitHrSummarySource(application.requirements);
  if (letterSentences.length === 0 || requirementSentences.length === 0)
    return unavailable();

  const reservation = await reserveAiInvocation(
    context.user.id,
    "hr_summary",
    application.id,
  );
  if (!reservation.ok)
    return reservationResponse(reservation.retryAfterSeconds);

  return generateReservedSummary(
    context.user.id,
    reservation.invocationId,
    letterSentences,
    requirementSentences,
  );
}

function reservationResponse(retryAfterSeconds?: number) {
  return retryAfterSeconds
    ? jsonNoStore(
        { error: "AI usage limit reached. Try again shortly." },
        429,
        { "Retry-After": String(retryAfterSeconds) },
      )
    : unavailable();
}

async function generateReservedSummary(
  userId: string,
  invocationId: string,
  letterSentences: string[],
  requirementSentences: string[],
) {
  try {
    const output = await generateHrSummary({
      letterSentences,
      requirementSentences,
    });
    const response = buildHrSummaryResponse(
      output,
      letterSentences,
      requirementSentences,
    );
    if (!response) return finalizeInvalidSummary(userId, invocationId);
    return finalizeSuccessfulSummary(userId, invocationId, response);
  } catch (error) {
    return handleSummaryProviderFailure(userId, invocationId, error);
  }
}

async function finalizeInvalidSummary(userId: string, invocationId: string) {
  const finalized = await finalizeAiInvocation(userId, invocationId, "failure");
  return finalized
    ? jsonNoStore(
        { error: "The generated summary could not be validated. Try again." },
        502,
      )
    : unavailable();
}

async function finalizeSuccessfulSummary(
  userId: string,
  invocationId: string,
  response: NonNullable<ReturnType<typeof buildHrSummaryResponse>>,
) {
  const finalized = await finalizeAiInvocation(userId, invocationId, "success");
  return finalized ? jsonNoStore(response, 200) : unavailable();
}

async function handleSummaryProviderFailure(
  userId: string,
  invocationId: string,
  error: unknown,
) {
  const finalized = await finalizeAiInvocation(userId, invocationId, "failure");
  if (!finalized) return unavailable();
  const rateLimit = getProviderRateLimit(error);
  if (!rateLimit)
    return unavailable(
      "AI summaries are temporarily unavailable. Try again later.",
    );

  const headers = rateLimit.retryAfterSeconds
    ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
    : undefined;
  return jsonNoStore(
    { error: "AI summaries are temporarily busy. Try again later." },
    503,
    headers,
  );
}

export async function POST(request: Request) {
  try {
    return await createSummaryRequest(request);
  } catch {
    return unavailable();
  }
}
