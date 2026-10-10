import { z } from "zod";
import { currentApplicant } from "@/lib/auth";
import { getOwnApplication } from "@/lib/applications";
import {
  cancelResumeUpload,
  downloadApplicationResume,
  removeApplicationResume,
  uploadApplicationResume,
} from "@/lib/application-resumes";
import {
  readResumeFile,
  resumeDownload,
  resumeFailure,
  resumeHeaders,
} from "@/lib/resume-request";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
type UploadContext = { actorId: string; jobId: string };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!isUuid(id))
    return new Response(null, { status: 404, headers: resumeHeaders });
  try {
    const result = await downloadApplicationResume(id);
    return result
      ? resumeDownload(result.bytes, result.info.filename)
      : new Response(null, { status: 404, headers: resumeHeaders });
  } catch {
    return new Response(null, { status: 503, headers: resumeHeaders });
  }
}

export async function POST(request: Request, { params }: Context) {
  const context = await getUploadContext(request, params);
  if (context instanceof Response) return context;
  try {
    await updateResume(request, context);
    return Response.json({ ok: true }, { headers: resumeHeaders });
  } catch (error) {
    return Response.json(resumeFailure(error), {
      status: 400,
      headers: resumeHeaders,
    });
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
  if (!isUuid(id)) return errorResponse("Application unavailable.", 404);
  const application = await getOwnApplication(id);
  return application
    ? { actorId: account.user.id, jobId: application.job_id }
    : errorResponse("Application unavailable.", 404);
}

function sameOrigin(request: Request) {
  return request.headers.get("origin") === new URL(request.url).origin;
}

function isUuid(value: string | null): value is string {
  return value !== null && z.uuid().safeParse(value).success;
}

function errorResponse(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: resumeHeaders });
}

async function updateResume(request: Request, context: UploadContext) {
  const intent = request.headers.get("x-resume-intent");
  if (intent === "cancel")
    return cancelResumeUpload(context.actorId, context.jobId);
  const revision = readRevision(request);
  if (intent === "remove")
    return removeApplicationResume(context.actorId, context.jobId, revision);
  if (intent !== "upload") throw new Error("Choose an upload action.");
  return uploadResume(request, context, revision);
}

function readRevision(request: Request) {
  const revision = Number(request.headers.get("x-application-revision"));
  if (!Number.isSafeInteger(revision) || revision < 1)
    throw new Error("Reload the saved draft before changing the résumé.");
  return revision;
}

async function uploadResume(
  request: Request,
  context: UploadContext,
  revision: number,
) {
  const file = await readResumeFile(request);
  const operation = request.headers.get("x-resume-operation");
  if (!isUuid(operation))
    throw new Error("Choose the file again before retrying the upload.");
  return uploadApplicationResume(
    context.actorId,
    context.jobId,
    revision,
    file,
    operation,
    request.headers.get("x-resume-retry") === "true",
  );
}
