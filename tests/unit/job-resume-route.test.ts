import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  getOwnApplicationForJob: vi.fn(),
  getApplicationResume: vi.fn(),
  removeApplicationResume: vi.fn(),
  uploadResumeForJob: vi.fn(),
  downloadProfileResume: vi.fn(),
  readResumeFile: vi.fn(),
  resumeFailure: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/applications", () => ({
  getOwnApplicationForJob: mocks.getOwnApplicationForJob,
}));
vi.mock("@/lib/application-resumes", () => ({
  getApplicationResume: mocks.getApplicationResume,
  removeApplicationResume: mocks.removeApplicationResume,
  uploadResumeForJob: mocks.uploadResumeForJob,
}));
vi.mock("@/lib/profile-resumes", () => ({
  downloadProfileResume: mocks.downloadProfileResume,
}));
vi.mock("@/lib/resume-request", () => ({
  readResumeFile: mocks.readResumeFile,
  resumeFailure: mocks.resumeFailure,
  resumeHeaders: { "Cache-Control": "private, no-store" },
}));

import { POST } from "@/app/api/jobs/[id]/resume/route";
import {
  ResumeUploadPreparationError,
  resumeUploadPreparationFailure,
} from "@/lib/resume-errors";

const actor = "44000000-0000-4000-8000-000000000101";
const jobId = "44000000-0000-4000-8000-000000000102";
const operation = "44000000-0000-4000-8000-000000000103";
const sourceId = "44000000-0000-4000-8000-000000000104";
const application = {
  id: "44000000-0000-4000-8000-000000000105",
  revision: 3,
};
const metadata = { id: operation, filename: "synthetic.pdf", byte_size: 8 };

function post(headers: Record<string, string> = {}, id = jobId) {
  return new Request(`https://careers.example.test/api/jobs/${id}/resume`, {
    method: "POST",
    headers: { origin: "https://careers.example.test", ...headers },
    body: "synthetic upload bytes",
  });
}

function useProfileResume(profileResumeId = sourceId) {
  return post({
    "x-resume-intent": "profile",
    "x-resume-operation": operation,
    "x-profile-resume": profileResumeId,
  });
}

function context(id = jobId) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentApplicant.mockResolvedValue({ user: { id: actor }, client: {} });
  mocks.getOwnApplicationForJob.mockResolvedValue(application);
  mocks.getApplicationResume.mockResolvedValue(metadata);
  mocks.removeApplicationResume.mockResolvedValue(undefined);
  mocks.uploadResumeForJob.mockResolvedValue(undefined);
  mocks.downloadProfileResume.mockResolvedValue(null);
  mocks.readResumeFile.mockResolvedValue(new File(["synthetic"], "upload.pdf"));
  mocks.resumeFailure.mockImplementation((error: unknown) => {
    const preparation = resumeUploadPreparationFailure(error);
    return preparation
      ? {
          error: preparation.error,
          code: preparation.code,
          reference: preparation.reference,
        }
      : {
          error:
            error instanceof Error &&
            /^(Choose|Reload|Save the latest|We could not|Résumé)/.test(
              error.message,
            )
              ? error.message
              : "The résumé change could not be saved. Reload and try again.",
        };
  });
});

it("rejects cross-origin, unauthenticated, and malformed job identifiers", async () => {
  const crossOrigin = await POST(
    post({
      origin: "https://attacker.example.test",
      "x-resume-intent": "remove",
    }),
    context(),
  );
  expect(crossOrigin.status).toBe(403);
  expect(mocks.currentApplicant).not.toHaveBeenCalled();

  mocks.currentApplicant.mockResolvedValueOnce(null);
  const unauthenticated = await POST(
    post({ "x-resume-intent": "remove" }),
    context(),
  );
  expect(unauthenticated.status).toBe(403);

  const invalidJob = await POST(
    post({ "x-resume-intent": "remove" }, "not-a-uuid"),
    context("not-a-uuid"),
  );
  expect(invalidJob.status).toBe(404);
  expect(mocks.getOwnApplicationForJob).not.toHaveBeenCalled();
});

it("allows removing an application résumé only with a valid revision", async () => {
  const invalid = await POST(post({ "x-resume-intent": "remove" }), context());
  expect(invalid.status).toBe(400);
  await expect(invalid.json()).resolves.toMatchObject({
    error: "Reload the application.",
  });
  expect(mocks.removeApplicationResume).not.toHaveBeenCalled();

  const removed = await POST(
    post({ "x-resume-intent": "remove", "x-application-revision": "3" }),
    context(),
  );
  expect(removed.status).toBe(200);
  expect(mocks.removeApplicationResume).toHaveBeenCalledWith(actor, jobId, 3);
  await expect(removed.json()).resolves.toMatchObject({
    ok: true,
    applicationId: application.id,
    revision: 3,
    resume: metadata,
  });
});

it("allows first upload without an application revision but rejects malformed operation IDs", async () => {
  const invalid = await POST(
    post({ "x-resume-intent": "upload", "x-resume-operation": "bad" }),
    context(),
  );
  expect(invalid.status).toBe(400);
  await expect(invalid.json()).resolves.toMatchObject({
    error: "Choose the file again.",
  });
  expect(mocks.readResumeFile).not.toHaveBeenCalled();

  const uploaded = await POST(
    post({
      "x-resume-intent": "upload",
      "x-resume-operation": operation,
      "x-resume-retry": "true",
    }),
    context(),
  );
  expect(uploaded.status).toBe(200);
  expect(mocks.uploadResumeForJob).toHaveBeenCalledWith(
    actor,
    jobId,
    null,
    expect.any(File),
    operation,
    true,
  );
});

it("validates the selected profile résumé identifier before downloading", async () => {
  const invalidId = await POST(useProfileResume("bad"), context());
  expect(invalidId.status).toBe(400);
  await expect(invalidId.json()).resolves.toMatchObject({
    error: "Reload your profile résumé.",
  });
  expect(mocks.downloadProfileResume).not.toHaveBeenCalled();
});

it("rejects a profile résumé that is no longer available", async () => {
  mocks.downloadProfileResume.mockResolvedValueOnce(null);
  const missing = await POST(useProfileResume(), context());
  expect(missing.status).toBe(400);
  await expect(missing.json()).resolves.toMatchObject({
    error: "Reload your profile résumé before using it.",
  });
  expect(mocks.uploadResumeForJob).not.toHaveBeenCalled();
});

it("copies the Applicant's selected profile résumé into the selected job draft", async () => {
  mocks.downloadProfileResume.mockResolvedValueOnce({
    info: { filename: "profile.pdf" },
    bytes: new Blob(["synthetic profile PDF"]),
  });
  const copied = await POST(useProfileResume(), context());
  expect(copied.status).toBe(200);
  expect(mocks.downloadProfileResume).toHaveBeenCalledWith(sourceId);
  expect(mocks.uploadResumeForJob).toHaveBeenLastCalledWith(
    actor,
    jobId,
    null,
    expect.any(File),
    operation,
    false,
  );
});

it("preserves the supplied revision for an explicit profile-copy retry", async () => {
  mocks.downloadProfileResume.mockResolvedValueOnce({
    info: { filename: "profile.pdf" },
    bytes: new Blob(["synthetic profile PDF"]),
  });
  const retried = await POST(
    post({
      "x-resume-intent": "profile",
      "x-resume-operation": operation,
      "x-profile-resume": sourceId,
      "x-application-revision": "2",
      "x-resume-retry": "true",
    }),
    context(),
  );

  expect(retried.status).toBe(200);
  expect(mocks.uploadResumeForJob).toHaveBeenLastCalledWith(
    actor,
    jobId,
    2,
    expect.any(File),
    operation,
    true,
  );
});

it("rejects unknown intents and invalid non-empty revisions", async () => {
  const invalidRevision = await POST(
    post({ "x-application-revision": "2.5", "x-resume-intent": "remove" }),
    context(),
  );
  expect(invalidRevision.status).toBe(400);
  await expect(invalidRevision.json()).resolves.toMatchObject({
    error: "Reload the application.",
  });

  const unknown = await POST(post({ "x-resume-intent": "cancel" }), context());
  expect(unknown.status).toBe(400);
  await expect(unknown.json()).resolves.toMatchObject({
    error: "Choose an upload action.",
  });
});

it("keeps storage and database details out of failed upload responses", async () => {
  mocks.uploadResumeForJob.mockRejectedValueOnce(
    new Error("synthetic storage detail"),
  );
  mocks.getOwnApplicationForJob.mockRejectedValueOnce(
    new Error("synthetic query detail"),
  );
  const response = await POST(
    post({
      "x-resume-intent": "upload",
      "x-resume-operation": operation,
    }),
    context(),
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    error: "The résumé change could not be saved. Reload and try again.",
  });
});

it("returns the safe preparation code and reference to the Applicant client", async () => {
  const reference = "84000000-0000-4000-8000-000000000101";
  mocks.uploadResumeForJob.mockRejectedValueOnce(
    new ResumeUploadPreparationError(
      "RESUME_UPLOAD_PREPARATION_FAILED",
      reference,
    ),
  );
  const response = await POST(
    post({
      "x-resume-intent": "upload",
      "x-resume-operation": operation,
    }),
    context(),
  );

  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toMatchObject({
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
    error:
      "We could not prepare this résumé upload. Try again later and share the reference code if the problem continues.",
    reference,
  });
});
