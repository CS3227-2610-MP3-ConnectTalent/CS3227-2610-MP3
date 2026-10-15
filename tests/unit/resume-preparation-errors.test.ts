import { expect, it } from "vitest";
import {
  ResumeUploadPreparationError,
  resumeFailureStatus,
} from "@/lib/resume-errors";
import { resumeFailure } from "@/lib/resume-request";

const reference = "84000000-0000-4000-8000-000000000101";

it("returns a safe recovery conflict with a reference and HTTP 409", () => {
  const error = new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PENDING",
    reference,
  );

  expect(resumeFailureStatus(error)).toBe(409);
  expect(resumeFailure(error)).toEqual({
    code: "RESUME_UPLOAD_PENDING",
    error:
      "A previous résumé change is still pending. Press Upload résumé again to recover it.",
    reference,
  });
});

it("returns a safe server failure without serializing upstream error details", () => {
  const error = new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PREPARATION_FAILED",
    reference,
  );
  error.message = "private SQL detail, actor id, filename and database path";

  expect(resumeFailureStatus(error)).toBe(503);
  const result = resumeFailure(error);
  expect(result).toEqual({
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
    error:
      "We could not prepare this résumé upload. Try again later and share the reference code if the problem continues.",
    reference,
  });
  expect(JSON.stringify(result)).not.toContain("private SQL detail");
  expect(JSON.stringify(result)).not.toContain("database path");
});
