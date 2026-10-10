import "server-only";
import { RESUME_MAX_BYTES } from "./resume-input";
export const resumeHeaders = {
  "Cache-Control": "private, no-store",
  "X-Content-Type-Options": "nosniff",
};
export async function readResumeFile(request: Request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error("Choose a PDF résumé of at most 1 MiB.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > RESUME_MAX_BYTES) {
        await reader.cancel();
        throw new Error("Choose a PDF résumé of at most 1 MiB.");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.length;
  }
  return new File(
    [bytes],
    decodeURIComponent(request.headers.get("x-resume-filename") ?? ""),
    { type: request.headers.get("content-type") ?? "" },
  );
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
  const message =
    error instanceof Error &&
    /^(Choose|Reload|Save the latest|We could not|Résumé)/.test(error.message)
      ? error.message
      : "The résumé change could not be saved. Reload and try again.";
  return { error: message };
}
