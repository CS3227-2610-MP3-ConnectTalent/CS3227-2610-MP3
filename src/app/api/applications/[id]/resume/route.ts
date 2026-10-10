import { z } from "zod";
import { currentApplicant } from "@/lib/auth";
import { getOwnApplication } from "@/lib/applications";
import {
  cancelResumeUpload,
  downloadApplicationResume,
  removeApplicationResume,
  uploadApplicationResume,
} from "@/lib/application-resumes";
import { RESUME_MAX_BYTES } from "@/lib/resume-input";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Context = { params: Promise<{ id: string }> };
const headers = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success)
    return new Response(null, { status: 404, headers });
  try {
    const result = await downloadApplicationResume(id);
    if (!result) return new Response(null, { status: 404, headers });
    return new Response(result.bytes, {
      headers: {
        ...headers,
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(result.info.filename).replace(/'/g, "%27")}`,
      },
    });
  } catch {
    return new Response(null, { status: 503, headers });
  }
}

type AuthorizedRequest = { userId: string; jobId: string };

async function authorizeChange(
  request: Request,
  params: Context["params"],
): Promise<AuthorizedRequest | Response> {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "Request not allowed." },
      { status: 403, headers },
    );

  const account = await currentApplicant();
  if (!account)
    return Response.json(
      { error: "Applicant access required." },
      { status: 403, headers },
    );

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return unavailableApplicationResponse();
  const application = await getOwnApplication(id);
  if (!application) return unavailableApplicationResponse();
  return { userId: account.user.id, jobId: application.job_id };
}

function unavailableApplicationResponse() {
  return Response.json(
    { error: "Application unavailable." },
    { status: 404, headers },
  );
}

export async function POST(request: Request, { params }: Context) {
  const access = await authorizeChange(request, params);
  if (access instanceof Response) return access;

  try {
    await applyResumeIntent(request, access.userId, access.jobId);
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    return resumeChangeError(error);
  }
}

async function applyResumeIntent(
  request: Request,
  userId: string,
  jobId: string,
) {
  const intent = request.headers.get("x-resume-intent");
  if (intent === "cancel") return cancelResumeUpload(userId, jobId);

  const revision = readRevision(request);
  if (intent === "remove")
    return removeApplicationResume(userId, jobId, revision);
  if (intent === "upload")
    return uploadResume(request, userId, jobId, revision);
  throw new Error("Choose an upload action.");
}

function readRevision(request: Request) {
  const revision = Number(request.headers.get("x-application-revision"));
  if (!Number.isSafeInteger(revision) || revision < 1)
    throw new Error("Reload the saved draft before changing the résumé.");
  return revision;
}

async function uploadResume(
  request: Request,
  userId: string,
  jobId: string,
  revision: number,
) {
  const file = await readResumeFile(request);
  const operation = request.headers.get("x-resume-operation");
  const parsedOperation = z.uuid().safeParse(operation);
  if (!parsedOperation.success)
    throw new Error("Choose the file again before retrying the upload.");
  await uploadApplicationResume(
    userId,
    jobId,
    revision,
    file,
    parsedOperation.data,
  );
}

async function readResumeFile(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw chooseResumeError();

  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > RESUME_MAX_BYTES) {
        await reader.cancel();
        throw chooseResumeError();
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  return createResumeFile(request, chunks, size);
}

function chooseResumeError() {
  return new Error("Choose a PDF résumé of at most 1 MiB.");
}

function createResumeFile(
  request: Request,
  chunks: Uint8Array[],
  size: number,
) {
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  const filename = decodeURIComponent(
    request.headers.get("x-resume-filename") ?? "",
  );
  return new File([bytes], filename, {
    type: request.headers.get("content-type") ?? "",
  });
}

function resumeChangeError(error: unknown) {
  const message =
    error instanceof Error &&
    /^(Choose|Reload|Save the latest|We could not)/.test(error.message)
      ? error.message
      : "The résumé change could not be saved. Reload and try again.";
  return Response.json({ error: message }, { status: 400, headers });
}
