import { z } from "zod";
import { currentApplicant } from "@/lib/auth";
import {
  downloadProfileResume,
  getProfileResume,
  retireProfileResume,
  uploadProfileResume,
} from "@/lib/profile-resumes";
import {
  readResumeFile,
  resumeDownload,
  resumeFailure,
  resumeHeaders,
} from "@/lib/resume-request";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const result = await downloadProfileResume();
    return result
      ? resumeDownload(result.bytes, result.info.filename)
      : new Response(null, { status: 404, headers: resumeHeaders });
  } catch {
    return new Response(null, { status: 503, headers: resumeHeaders });
  }
}
export async function POST(request: Request) {
  if (request.headers.get("origin") !== new URL(request.url).origin)
    return Response.json(
      { error: "Request not allowed." },
      { status: 403, headers: resumeHeaders },
    );
  const account = await currentApplicant();
  if (!account)
    return Response.json(
      { error: "Applicant access required." },
      { status: 403, headers: resumeHeaders },
    );
  try {
    const expected = request.headers.get("x-profile-resume") || null;
    if (expected && !z.uuid().safeParse(expected).success)
      throw new Error("Reload your profile.");
    const intent = request.headers.get("x-resume-intent");
    if (intent === "remove")
      await retireProfileResume(account.user.id, expected);
    else if (intent === "upload") {
      const operation = request.headers.get("x-resume-operation");
      if (!z.uuid().safeParse(operation).success)
        throw new Error("Choose the file again.");
      await uploadProfileResume(
        account.user.id,
        await readResumeFile(request),
        operation!,
        expected,
        request.headers.get("x-resume-retry") === "true",
      );
    } else throw new Error("Choose an upload action.");
    return Response.json(
      { ok: true, resume: await getProfileResume() },
      { headers: resumeHeaders },
    );
  } catch (error) {
    return Response.json(resumeFailure(error), {
      status: 400,
      headers: resumeHeaders,
    });
  }
}
