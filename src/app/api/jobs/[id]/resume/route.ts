import { randomUUID } from "node:crypto";
import { z } from "zod";
import {
  ResumeUploadPreparationError,
  resumeFailureStatus,
} from "@/lib/resume-errors";
import { currentApplicant } from "@/lib/auth";
import { getOwnApplicationForJob } from "@/lib/applications";
import {
  getApplicationResume,
  removeApplicationResume,
  uploadResumeForJob,
} from "@/lib/application-resumes";
import { downloadProfileResume } from "@/lib/profile-resumes";
import {
  readResumeFile,
  resumeFailure,
  resumeHeaders,
} from "@/lib/resume-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
type UploadContext = { actorId: string; jobId: string };

async function currentResult(jobId: string) {
  const application = await getOwnApplicationForJob(jobId);
  return application
    ? {
        applicationId: application.id,
        revision: application.revision,
        resume: await getApplicationResume(application.id),
      }
    : {};
}

export async function POST(request: Request, { params }: Context) {
  const context = await getUploadContext(request, params);
  if (context instanceof Response) return context;
  try {
    await updateResume(request, context);
    return Response.json(
      { ok: true, ...(await currentResult(context.jobId)) },
      { headers: resumeHeaders },
    );
  } catch (error) {
    return failedResumeResponse(error, context.jobId);
  }
}

async function getUploadContext(
  request: Request,
  params: Context["params"],
): Promise<UploadContext | Response> {
  if (!sameOrigin(request)) return errorResponse("Request not allowed.", 403);
  const account = await currentApplicant();
  if (!account) return errorResponse("Applicant access required.", 403);
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return errorResponse("Job unavailable.", 404);
  return { actorId: account.user.id, jobId: id };
}

function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: resumeHeaders });
}

async function updateResume(request: Request, context: UploadContext) {
  const revision = readRevision(request);
  const intent = request.headers.get("x-resume-intent");
  if (intent === "remove") {
    if (revision === null) throw new Error("Reload the application.");
    return removeApplicationResume(context.actorId, context.jobId, revision);
  }
  if (intent !== "upload" && intent !== "profile")
    throw new Error("Choose an upload action.");
  const retry = request.headers.get("x-resume-retry") === "true";
  return uploadResume(request, context, revision, intent, retry);
}

function readRevision(request: Request) {
  const raw = request.headers.get("x-application-revision");
  const revision = raw ? Number(raw) : null;
  if (revision !== null && (!Number.isSafeInteger(revision) || revision < 1))
    throw new Error("Reload the application.");
  return revision;
}

async function uploadResume(
  request: Request,
  context: UploadContext,
  revision: number | null,
  intent: "upload" | "profile",
  retry: boolean,
) {
  const operation = request.headers.get("x-resume-operation");
  if (!z.uuid().safeParse(operation).success)
    throw new Error("Choose the file again.");
  const profileResumeId =
    intent === "profile" ? readProfileResumeId(request) : null;
  if (
    profileResumeId &&
    retry &&
    (await isCompletedProfileCopy(context.jobId, operation!))
  ) {
    return;
  }
  const file = profileResumeId
    ? await readProfileResume(profileResumeId)
    : await readResumeFile(request);
  return uploadResumeForJob(
    context.actorId,
    context.jobId,
    revision,
    file,
    operation!,
    retry,
  );
}

function readProfileResumeId(request: Request) {
  const sourceId = request.headers.get("x-profile-resume");
  if (!z.uuid().safeParse(sourceId).success)
    throw new Error("Reload your profile résumé.");
  return sourceId!;
}

async function readProfileResume(sourceId: string) {
  const source = await downloadProfileResume(sourceId);
  if (!source) throw new Error("Reload your profile résumé before using it.");
  return new File([source.bytes], source.info.filename, {
    type: "application/pdf",
  });
}

async function isCompletedProfileCopy(jobId: string, operation: string) {
  let current: Awaited<ReturnType<typeof currentResult>>;
  try {
    current = await currentResult(jobId);
  } catch (error) {
    if (error instanceof ResumeUploadPreparationError) throw error;
    const reference = randomUUID();
    console.error("resume_upload_prepare_failed", {
      reference,
      stage: "completed_operation_profile_copy",
      code: "RESUME_UPLOAD_PREPARATION_FAILED",
    });
    throw new ResumeUploadPreparationError(
      "RESUME_UPLOAD_PREPARATION_FAILED",
      reference,
    );
  }
  return current.resume?.id.toLowerCase() === operation.toLowerCase();
}

async function failedResumeResponse(error: unknown, jobId: string) {
  const current = await currentResultSafely(jobId);
  return Response.json(
    { ...resumeFailure(error), ...current },
    { status: resumeFailureStatus(error), headers: resumeHeaders },
  );
}

async function currentResultSafely(jobId: string) {
  try {
    return await currentResult(jobId);
  } catch {
    /* Safe error responses do not expose database details. */
    return {};
  }
}
