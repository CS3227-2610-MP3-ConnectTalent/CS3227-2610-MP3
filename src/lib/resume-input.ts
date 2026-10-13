import "server-only";
import { createHash } from "node:crypto";
import { ResumeValidationError } from "./resume-errors";
import { checkPdf } from "./resume-pdf-check";

export const RESUME_MAX_BYTES = 1_048_576;
function validateFileMetadata(file: File) {
  if (!(file instanceof File) || file.size < 1)
    throw new ResumeValidationError("RESUME_EMPTY");
  if (file.size > RESUME_MAX_BYTES)
    throw new ResumeValidationError("RESUME_TOO_LARGE");
  if (
    !file.name ||
    [...file.name].length > 120 ||
    /[\u0000-\u001f\u007f-\u009f/\\]/u.test(file.name)
  )
    throw new ResumeValidationError("RESUME_FILENAME_INVALID");
  if (!/\.pdf$/i.test(file.name) || file.type !== "application/pdf")
    throw new ResumeValidationError("RESUME_TYPE_UNSUPPORTED");
}

async function readFileBytes(file: File) {
  try {
    return new Uint8Array(
      await file.slice(0, RESUME_MAX_BYTES + 1).arrayBuffer(),
    );
  } catch {
    throw new ResumeValidationError("RESUME_READ_FAILED");
  }
}

export async function validateResume(file: File) {
  validateFileMetadata(file);
  const bytes = await readFileBytes(file);
  if (bytes.length > RESUME_MAX_BYTES)
    throw new ResumeValidationError("RESUME_TOO_LARGE");
  if (bytes.length !== file.size)
    throw new ResumeValidationError("RESUME_READ_FAILED");
  if (
    !/^%PDF-1\.[0-9]|^%PDF-2\.0/.test(
      new TextDecoder().decode(bytes.slice(0, 9)),
    ) ||
    !new TextDecoder().decode(bytes.slice(-1024)).includes("%%EOF")
  )
    throw new ResumeValidationError("RESUME_INVALID");
  await checkPdf(bytes);
  return {
    bytes,
    filename: file.name,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  };
}
