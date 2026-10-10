import { z } from "zod";
import { currentApplicant } from "@/lib/auth";
import { getOwnApplication } from "@/lib/applications";
import { cancelResumeUpload, downloadApplicationResume, removeApplicationResume, uploadApplicationResume } from "@/lib/application-resumes";
import { RESUME_MAX_BYTES } from "@/lib/resume-input";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
type Context = { params: Promise<{ id: string }> };
const headers = { "Cache-Control": "private, no-store", "X-Content-Type-Options": "nosniff" };
export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return new Response(null, { status: 404, headers });
  try {
    const result = await downloadApplicationResume(id);
    if (!result) return new Response(null, { status: 404, headers });
    return new Response(result.bytes, { headers: { ...headers, "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(result.info.filename).replace(/'/g, "%27")}` } });
  } catch { return new Response(null, { status: 503, headers }); }
}
export async function POST(request: Request, { params }: Context) {
  if (request.headers.get("origin") !== new URL(request.url).origin) return Response.json({ error: "Request not allowed." }, { status: 403, headers });
  const account = await currentApplicant();
  if (!account) return Response.json({ error: "Applicant access required." }, { status: 403, headers });
  const { id } = await params;
  if (!z.uuid().safeParse(id).success) return Response.json({ error: "Application unavailable." }, { status: 404, headers });
  const app = await getOwnApplication(id);
  if (!app) return Response.json({ error: "Application unavailable." }, { status: 404, headers });
  try {
    const intent = request.headers.get("x-resume-intent");
    const revision = Number(request.headers.get("x-application-revision"));
    if (intent === "cancel") await cancelResumeUpload(account.user.id, app.job_id);
    else {
      if (!Number.isSafeInteger(revision) || revision < 1) throw new Error("Reload the saved draft before changing the résumé.");
      if (intent === "remove") await removeApplicationResume(account.user.id, app.job_id, revision);
      else if (intent === "upload") {
        const reader = request.body?.getReader();
        if (!reader) throw new Error("Choose a PDF résumé of at most 1 MiB.");
        const chunks: Uint8Array[] = []; let size = 0;
        try {
          while (true) { const { done, value } = await reader.read(); if (done) break;
            size += value.length; if (size > RESUME_MAX_BYTES) { await reader.cancel(); throw new Error("Choose a PDF résumé of at most 1 MiB."); } chunks.push(value); }
        } finally { reader.releaseLock(); }
        const filename = decodeURIComponent(request.headers.get("x-resume-filename") ?? "");
        const bytes = new Uint8Array(size); let offset = 0; for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
        const file = new File([bytes], filename, { type: request.headers.get("content-type") ?? "" });
        const operation = request.headers.get("x-resume-operation");
        if (!z.uuid().safeParse(operation).success) throw new Error("Choose the file again before retrying the upload.");
        await uploadApplicationResume(account.user.id, app.job_id, revision, file, operation!, request.headers.get("x-resume-retry") === "true");
      } else throw new Error("Choose an upload action.");
    }
    return Response.json({ ok: true }, { headers });
  } catch (error) {
    // Only fixed, server-authored messages from the focused service are exposed; no provider/DB bodies.
    const message = error instanceof Error && /^(Choose|Reload|Save the latest|We could not)/.test(error.message)
      ? error.message : "The résumé change could not be saved. Reload and try again.";
    return Response.json({ error: message }, { status: 400, headers });
  }
}
