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
import { resumeUploadPreparationFailure } from "@/lib/resume-errors";

const actor = "44000000-0000-4000-8000-000000000101";
const jobId = "44000000-0000-4000-8000-000000000102";
const operation = "44000000-0000-4000-8000-000000000103";
const sourceId = "44000000-0000-4000-8000-000000000104";
const application = {
  id: "44000000-0000-4000-8000-000000000105",
  revision: 3,
};
const attachment = {
  id: operation,
  filename: "synthetic.pdf",
  byte_size: 8,
};

function retryProfileCopy() {
  return new Request(`https://careers.example.test/api/jobs/${jobId}/resume`, {
    method: "POST",
    headers: {
      origin: "https://careers.example.test",
      "x-resume-intent": "profile",
      "x-resume-operation": operation,
      "x-profile-resume": sourceId,
      "x-application-revision": "2",
      "x-resume-retry": "true",
    },
    body: "synthetic upload bytes",
  });
}

function context() {
  return { params: Promise.resolve({ id: jobId }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentApplicant.mockResolvedValue({ user: { id: actor }, client: {} });
  mocks.getOwnApplicationForJob.mockResolvedValue(application);
  mocks.getApplicationResume.mockResolvedValue(attachment);
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
          error: error instanceof Error ? error.message : "Upload failed.",
        };
  });
});

it("reconciles a completed retry after its selected profile source was replaced", async () => {
  const response = await POST(retryProfileCopy(), context());

  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    resume: attachment,
  });
  expect(mocks.downloadProfileResume).not.toHaveBeenCalled();
  expect(mocks.uploadResumeForJob).not.toHaveBeenCalled();
});

it("forwards the snapshot revision when an explicit profile-copy retry is pending", async () => {
  mocks.getApplicationResume.mockResolvedValue({
    ...attachment,
    id: "44000000-0000-4000-8000-000000000106",
  });
  mocks.downloadProfileResume.mockResolvedValueOnce({
    info: { filename: "profile.pdf" },
    bytes: new Blob(["synthetic profile PDF"]),
  });

  const response = await POST(retryProfileCopy(), context());

  expect(response.status).toBe(200);
  expect(mocks.uploadResumeForJob).toHaveBeenLastCalledWith(
    actor,
    jobId,
    2,
    expect.any(File),
    operation,
    true,
  );
});

it("surfaces a typed 503 preparation failure when completed-operation lookup fails", async () => {
  mocks.getApplicationResume.mockRejectedValueOnce(
    new Error("Database connection timeout"),
  );
  const log = vi.spyOn(console, "error").mockImplementation(() => {});

  const response = await POST(retryProfileCopy(), context());

  expect(response.status).toBe(503);
  await expect(response.json()).resolves.toMatchObject({
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
    reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(log).toHaveBeenCalledWith(
    "resume_upload_prepare_failed",
    expect.objectContaining({
      stage: "completed_operation_profile_copy",
      code: "RESUME_UPLOAD_PREPARATION_FAILED",
    }),
  );
});
