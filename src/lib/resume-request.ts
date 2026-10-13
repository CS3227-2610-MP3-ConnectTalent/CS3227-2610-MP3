import "server-only";
import { RESUME_MAX_BYTES } from "./resume-input";
import {
  ResumeValidationError,
  resumeValidationFailure,
} from "./resume-errors";
export const resumeHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
async function readBody(reader: ReadableStreamDefaultReader<Uint8Array>) {
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > RESUME_MAX_BYTES) {
        await reader.cancel().catch(() => undefined);
        throw new ResumeValidationError("RESUME_TOO_LARGE");
      }
      chunks.push(value);
    }
  } catch (error) {
    if (error instanceof ResumeValidationError) throw error;
    throw new ResumeValidationError("RESUME_READ_FAILED");
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return bytes;
}

function readFilename(request: Request) {
  try {
    return decodeURIComponent(request.headers.get("x-resume-filename") ?? "");
  } catch {
    throw new ResumeValidationError("RESUME_FILENAME_INVALID");
  }
}

export async function readResumeFile(request: Request) {
  let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
  try {
    reader = request.body?.getReader();
  } catch {
    throw new ResumeValidationError("RESUME_READ_FAILED");
  }
  if (!reader) throw new ResumeValidationError("RESUME_EMPTY");
  const bytes = await readBody(reader);
  if (bytes.length === 0) throw new ResumeValidationError("RESUME_EMPTY");
  return new File([bytes], readFilename(request), {
    type: request.headers.get("content-type") ?? "",
  });
}
export function resumeDownload(bytes: Blob, filename: string) {
  return new Response(bytes, {
    headers: {
      ...resumeHeaders,
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="resume.pdf"; filename*=UTF-8''${encodeURIComponent(filename).replace(/'/g, "%27")}`,
    },
  });
}
export function resumeFailure(error: unknown) {
  const validation = resumeValidationFailure(error);
  if (validation) return { error: validation.error, code: validation.code };
  const message =
    error instanceof Error &&
    /^(Choose|Reload|Save the latest|We could not|Résumé)/.test(error.message)
      ? error.message
      : "The résumé change could not be saved. Reload and try again.";
  return { error: message };
}
