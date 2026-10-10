import { z } from "zod";
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
  return uploadResume(request, context, revision, intent);
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
) {
  const operation = request.headers.get("x-resume-operation");
  if (!z.uuid().safeParse(operation).success)
    throw new Error("Choose the file again.");
  const file = await readUploadFile(request, intent);
  return uploadResumeForJob(
    context.actorId,
    context.jobId,
    revision,
    file,
    operation!,
    request.headers.get("x-resume-retry") === "true",
  );
}

async function readUploadFile(request: Request, intent: "upload" | "profile") {
  if (intent === "upload") return readResumeFile(request);
  const sourceId = request.headers.get("x-profile-resume");
  if (!z.uuid().safeParse(sourceId).success)
    throw new Error("Reload your profile résumé.");
  const source = await downloadProfileResume(sourceId!);
  if (!source) throw new Error("Reload your profile résumé before using it.");
  return new File([source.bytes], source.info.filename, {
    type: "application/pdf",
  });
}

async function failedResumeResponse(error: unknown, jobId: string) {
  const current = await currentResultSafely(jobId);
  return Response.json(
    { ...resumeFailure(error), ...current },
    { status: 400, headers: resumeHeaders },
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
