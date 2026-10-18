import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  getOwnApplication: vi.fn(),
  cancelResumeUpload: vi.fn(),
  downloadApplicationResume: vi.fn(),
  removeApplicationResume: vi.fn(),
  uploadApplicationResume: vi.fn(),
  readResumeFile: vi.fn(),
  resumeDownload: vi.fn(),
  resumeFailure: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/applications", () => ({
  getOwnApplication: mocks.getOwnApplication,
}));
vi.mock("@/lib/application-resumes", () => ({
  cancelResumeUpload: mocks.cancelResumeUpload,
  downloadApplicationResume: mocks.downloadApplicationResume,
  removeApplicationResume: mocks.removeApplicationResume,
  uploadApplicationResume: mocks.uploadApplicationResume,
}));
vi.mock("@/lib/resume-request", () => ({
  readResumeFile: mocks.readResumeFile,
  resumeDownload: mocks.resumeDownload,
  resumeFailure: mocks.resumeFailure,
  resumeHeaders: { "Cache-Control": "private, no-store" },
}));

import { GET, POST } from "@/app/api/applications/[id]/resume/route";

const actor = "44000000-0000-4000-8000-000000000101";
const applicationId = "44000000-0000-4000-8000-000000000102";
const jobId = "44000000-0000-4000-8000-000000000103";
const operation = "44000000-0000-4000-8000-000000000104";
const application = { id: applicationId, job_id: jobId };
const metadata = { id: operation, filename: "synthetic.pdf", byte_size: 8 };

function post(headers: Record<string, string> = {}) {
  return new Request(
    `https://careers.example.test/api/applications/${applicationId}/resume`,
    {
      method: "POST",
      headers: { origin: "https://careers.example.test", ...headers },
      body: "synthetic PDF bytes",
    },
  );
}

function context(id = applicationId) {
  return { params: Promise.resolve({ id }) };
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentApplicant.mockResolvedValue({ user: { id: actor }, client: {} });
  mocks.getOwnApplication.mockResolvedValue(application);
  mocks.cancelResumeUpload.mockResolvedValue(undefined);
  mocks.downloadApplicationResume.mockResolvedValue(null);
  mocks.removeApplicationResume.mockResolvedValue(undefined);
  mocks.uploadApplicationResume.mockResolvedValue(undefined);
  mocks.readResumeFile.mockResolvedValue(new File(["synthetic"], "upload.pdf"));
  mocks.resumeDownload.mockImplementation(
    (bytes: Blob, filename: string) =>
      new Response(bytes, { headers: { "x-filename": filename } }),
  );
  mocks.resumeFailure.mockImplementation((error: unknown) => ({
    error: error instanceof Error ? error.message : "safe error",
  }));
});

it("returns 404 for invalid or absent résumé and serves available résumé bytes", async () => {
  expect(
    (await GET(new Request("https://careers.example.test"), context("bad")))
      .status,
  ).toBe(404);
  expect(mocks.downloadApplicationResume).not.toHaveBeenCalled();

  expect(
    (await GET(new Request("https://careers.example.test"), context())).status,
  ).toBe(404);
  const bytes = new Blob(["synthetic pdf"]);
  mocks.downloadApplicationResume.mockResolvedValueOnce({
    info: metadata,
    bytes,
  });
  const response = await GET(
    new Request("https://careers.example.test"),
    context(),
  );
  expect(response.status).toBe(200);
  expect(response.headers.get("x-filename")).toBe("synthetic.pdf");
  expect(mocks.resumeDownload).toHaveBeenCalledWith(bytes, "synthetic.pdf");
});

it("returns private service-unavailable status for storage download failures", async () => {
  mocks.downloadApplicationResume.mockRejectedValue(
    new Error("synthetic storage failure"),
  );
  const response = await GET(
    new Request("https://careers.example.test"),
    context(),
  );
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});

it("rejects cross-origin, unauthenticated, malformed, and unavailable application mutations", async () => {
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
  expect((await POST(post({}), context())).status).toBe(403);

  expect((await POST(post({}), context("bad"))).status).toBe(404);
  mocks.getOwnApplication.mockResolvedValueOnce(null);
  expect((await POST(post({}), context())).status).toBe(404);
});

it("cancels an upload and removes an existing attachment with the current revision", async () => {
  const cancelled = await POST(
    post({ "x-resume-intent": "cancel" }),
    context(),
  );
  expect(cancelled.status).toBe(200);
  expect(mocks.cancelResumeUpload).toHaveBeenCalledWith(actor, jobId);

  const removed = await POST(
    post({ "x-resume-intent": "remove", "x-application-revision": "3" }),
    context(),
  );
  expect(removed.status).toBe(200);
  expect(mocks.removeApplicationResume).toHaveBeenCalledWith(actor, jobId, 3);
});

it("rejects invalid revisions and unknown resume intents", async () => {
  const invalid = await POST(
    post({ "x-application-revision": "0", "x-resume-intent": "remove" }),
    context(),
  );
  expect(invalid.status).toBe(400);
  await expect(invalid.json()).resolves.toMatchObject({
    error: "Reload the saved draft before changing the résumé.",
  });

  const unknown = await POST(
    post({ "x-application-revision": "3", "x-resume-intent": "profile" }),
    context(),
  );
  expect(unknown.status).toBe(400);
  await expect(unknown.json()).resolves.toMatchObject({
    error: "Choose an upload action.",
  });
});

it("validates operation metadata and uploads the request file only for an Applicant-owned application", async () => {
  const invalidOperation = await POST(
    post({
      "x-application-revision": "3",
      "x-resume-intent": "upload",
      "x-resume-operation": "invalid",
    }),
    context(),
  );
  expect(invalidOperation.status).toBe(400);
  await expect(invalidOperation.json()).resolves.toMatchObject({
    error: "Choose the file again before retrying the upload.",
  });
  expect(mocks.readResumeFile).toHaveBeenCalledOnce();

  const uploaded = await POST(
    post({
      "x-application-revision": "3",
      "x-resume-intent": "upload",
      "x-resume-operation": operation,
      "x-resume-retry": "true",
    }),
    context(),
  );
  expect(uploaded.status).toBe(200);
  expect(mocks.uploadApplicationResume).toHaveBeenCalledWith(
    actor,
    jobId,
    3,
    expect.any(File),
    operation,
    true,
  );
});

it("returns a sanitized client response after upload errors", async () => {
  mocks.uploadApplicationResume.mockRejectedValue(
    new Error("synthetic database detail"),
  );
  const response = await POST(
    post({
      "x-application-revision": "3",
      "x-resume-intent": "upload",
      "x-resume-operation": operation,
    }),
    context(),
  );
  expect(response.status).toBe(400);
  await expect(response.json()).resolves.toEqual({
    error: "synthetic database detail",
  });
});
