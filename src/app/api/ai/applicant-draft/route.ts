import {
  getApplicantContext,
  getPublishedJob,
} from "@/lib/ai/application-data";
import {
  applicantDraftRequestSchema,
  applicantDraftResponseSchema,
} from "@/lib/ai/schemas";
import {
  finalizeAiInvocation,
  reserveAiInvocation,
} from "@/lib/ai/quota-audit";
import { getProviderRateLimit } from "@/lib/ai/provider-errors";
import {
  generateApplicantDraft,
  isSoCLaaSReady,
} from "@/lib/ai/soclaas-client";
import { jsonNoStore, readJson } from "@/lib/ai/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const maxRequestBytes = 20_000;

function authorizationResponse(status: "anonymous" | "forbidden") {
  return status === "anonymous"
    ? jsonNoStore({ error: "Sign in to use cover-letter drafting." }, 401)
    : jsonNoStore(
        { error: "Cover-letter drafting is available to Applicants only." },
        403,
      );
}

function unavailable() {
  return jsonNoStore({ error: "AI drafting is temporarily unavailable." }, 503);
}

async function createDraftRequest(request: Request) {
  const context = await getApplicantContext();
  if (context.status !== "authorized")
    return authorizationResponse(context.status);

  const read = await readJson(request, maxRequestBytes);
  if (!read.ok)
    return jsonNoStore({ error: "Check the request and try again." }, 400);
  const parsed = applicantDraftRequestSchema.safeParse(read.value);
  if (!parsed.success)
    return jsonNoStore(
      { error: "Enter valid experience notes of at most 4,000 characters." },
      400,
    );

  return generateForJob(context, parsed.data.jobId, parsed.data.notes);
}

async function generateForJob(
  context: Extract<
    Awaited<ReturnType<typeof getApplicantContext>>,
    { status: "authorized" }
  >,
  jobId: string,
  notes: string,
) {
  if (!isSoCLaaSReady()) return unavailable();
  const job = await getPublishedJob(context.client, jobId);
  if (!job)
    return jsonNoStore({ error: "This published job is unavailable." }, 404);

  const reservation = await reserveAiInvocation(
    context.user.id,
    "applicant_draft",
    job.id,
  );
  if (!reservation.ok) {
    if (reservation.retryAfterSeconds)
      return jsonNoStore(
        { error: "AI usage limit reached. Try again shortly." },
        429,
        { "Retry-After": String(reservation.retryAfterSeconds) },
      );
    return unavailable();
  }

  return generateReservedDraft(
    context.user.id,
    reservation.invocationId,
    notes,
    job.title,
    job.requirements,
  );
}

async function generateReservedDraft(
  userId: string,
  invocationId: string,
  notes: string,
  jobTitle: string,
  requirements: string,
) {
  try {
    const output = await generateApplicantDraft({
      notes,
      jobTitle,
      requirements,
    });
    const validated = applicantDraftResponseSchema.safeParse(output);
    if (!validated.success) return finalizeInvalidDraft(userId, invocationId);

    const finalized = await finalizeAiInvocation(
      userId,
      invocationId,
      "success",
    );
    return finalized ? jsonNoStore(validated.data, 200) : unavailable();
  } catch (error) {
    return handleDraftProviderFailure(userId, invocationId, error);
  }
}

async function finalizeInvalidDraft(userId: string, invocationId: string) {
  const finalized = await finalizeAiInvocation(userId, invocationId, "failure");
  return finalized
    ? jsonNoStore(
        { error: "The generated draft could not be validated. Try again." },
        502,
      )
    : unavailable();
}

async function handleDraftProviderFailure(
  userId: string,
  invocationId: string,
  error: unknown,
) {
  const finalized = await finalizeAiInvocation(userId, invocationId, "failure");
  if (!finalized) return unavailable();

  const rateLimit = getProviderRateLimit(error);
  if (!rateLimit)
    return jsonNoStore(
      { error: "AI drafting is temporarily unavailable. Try again later." },
      503,
    );

  const headers = rateLimit.retryAfterSeconds
    ? { "Retry-After": String(rateLimit.retryAfterSeconds) }
    : undefined;
  return jsonNoStore(
    { error: "AI drafting is temporarily busy. Try again later." },
    503,
    headers,
  );
}

export async function POST(request: Request) {
  try {
    return await createDraftRequest(request);
  } catch {
    return unavailable();
  }
}
