import { expect, it } from "vitest";
import {
  readResumeFile,
  resumeDownload,
  resumeFailure,
  resumeHeaders,
} from "@/lib/resume-request";
import { RESUME_MAX_BYTES } from "@/lib/resume-input";
import {
  ResumeUploadOperationRetiredError,
  ResumeUploadPreparationError,
  resumeFailureStatus,
} from "@/lib/resume-errors";

function request(bytes: Uint8Array, filename = "synthetic%20resume.pdf") {
  return new Request("https://careers.example.test/api/resume", {
    method: "POST",
    headers: {
      "x-resume-filename": filename,
      "content-type": "application/pdf",
    },
    body: new Blob([new Uint8Array(bytes).buffer]),
  });
}

it("reads the streamed PDF request into a decoded filename File", async () => {
  const file = await readResumeFile(request(new Uint8Array([37, 80, 68, 70])));

  expect(file.name).toBe("synthetic resume.pdf");
  expect(file.type).toBe("application/pdf");
  expect(new Uint8Array(await file.arrayBuffer())).toEqual(
    new Uint8Array([37, 80, 68, 70]),
  );
});

it("rejects a request without a body and cancels a stream once it exceeds the byte cap", async () => {
  const empty = new Request("https://careers.example.test/api/resume", {
    method: "POST",
  });
  await expect(readResumeFile(empty)).rejects.toMatchObject({
    code: "RESUME_EMPTY",
  });

  const tooLarge = request(new Uint8Array(RESUME_MAX_BYTES + 1));
  await expect(readResumeFile(tooLarge)).rejects.toMatchObject({
    code: "RESUME_TOO_LARGE",
  });
});

it("uses private no-store download headers and encodes non-ASCII filenames", async () => {
  const response = resumeDownload(
    new Blob([new Uint8Array([1, 2, 3])]),
    "résumé 2026.pdf",
  );

  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
  expect(response.headers.get("X-Content-Type-Options")).toBe("nosniff");
  expect(response.headers.get("Content-Type")).toBe("application/pdf");
  expect(response.headers.get("Content-Disposition")).toContain(
    "filename*=UTF-8''r%C3%A9sum%C3%A9%202026.pdf",
  );
  await expect(response.arrayBuffer()).resolves.toEqual(
    new Uint8Array([1, 2, 3]).buffer,
  );
  expect(resumeHeaders).toEqual({
    "Cache-Control": "private, no-store",
    "X-Content-Type-Options": "nosniff",
  });
});

it("preserves only recognized user-facing errors and hides unexpected messages", () => {
  for (const message of [
    "Choose a PDF résumé.",
    "Reload your profile.",
    "Save the latest version first.",
    "We could not confirm the change.",
    "Résumé change could not be saved.",
  ]) {
    expect(resumeFailure(new Error(message))).toEqual({ error: message });
  }
  expect(resumeFailure(new Error("database password leaked"))).toEqual({
    error: "The résumé change could not be saved. Reload and try again.",
  });
  expect(resumeFailure("unexpected string")).toEqual({
    error: "The résumé change could not be saved. Reload and try again.",
  });
});

it("returns a safe conflict code when a profile upload operation was retired", () => {
  const error = new ResumeUploadOperationRetiredError();

  expect(resumeFailure(error)).toEqual({
    error:
      "This upload attempt ended. Press Upload résumé again to retry this selected file.",
    code: "RESUME_UPLOAD_OPERATION_RETIRED",
  });
  expect(resumeFailureStatus(error)).toBe(409);
});

it("returns a safe server failure for storage and finalization outages", () => {
  const error = new ResumeUploadPreparationError(
    "RESUME_UPLOAD_PERSISTENCE_FAILED",
    "84000000-0000-4000-8000-000000000102",
  );

  expect(resumeFailureStatus(error)).toBe(503);
  expect(resumeFailure(error)).toEqual({
    error:
      "We could not save this résumé. Try again later and share the reference code if the problem continues.",
    code: "RESUME_UPLOAD_PERSISTENCE_FAILED",
    reference: "84000000-0000-4000-8000-000000000102",
  });
});

it("reports an interrupted stream without exposing its exception", async () => {
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      controller.error(new Error("private stream failure"));
    },
  });
  const interrupted = new Request("http://localhost/api/resume", {
    method: "POST",
    body,
    duplex: "half",
  } as RequestInit);
  await expect(readResumeFile(interrupted)).rejects.toMatchObject({
    code: "RESUME_READ_FAILED",
  });
});
