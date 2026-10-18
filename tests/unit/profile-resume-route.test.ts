import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  downloadProfileResume: vi.fn(),
  getProfileResume: vi.fn(),
  retireProfileResume: vi.fn(),
  uploadProfileResume: vi.fn(),
  readResumeFile: vi.fn(),
  resumeDownload: vi.fn(),
  resumeFailure: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/profile-resumes", () => ({
  downloadProfileResume: mocks.downloadProfileResume,
  getProfileResume: mocks.getProfileResume,
  retireProfileResume: mocks.retireProfileResume,
  uploadProfileResume: mocks.uploadProfileResume,
}));
vi.mock("@/lib/resume-request", () => ({
  readResumeFile: mocks.readResumeFile,
  resumeDownload: mocks.resumeDownload,
  resumeFailure: mocks.resumeFailure,
  resumeHeaders: { "Cache-Control": "private, no-store" },
}));

import { GET, POST } from "@/app/api/profile/resume/route";

const actor = "44000000-0000-4000-8000-000000000101";
const operation = "44000000-0000-4000-8000-000000000102";
const metadata = {
  id: operation,
  filename: "synthetic.pdf",
  byte_size: 8,
  object_path: `${actor}/synthetic.pdf`,
};

function post(headers: Record<string, string> = {}) {
  return new Request("https://careers.example.test/api/profile/resume", {
    method: "POST",
    headers: { origin: "https://careers.example.test", ...headers },
    body: "synthetic request body",
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mocks.currentApplicant.mockResolvedValue({ user: { id: actor }, client: {} });
  mocks.downloadProfileResume.mockResolvedValue(null);
  mocks.getProfileResume.mockResolvedValue(metadata);
  mocks.retireProfileResume.mockResolvedValue(undefined);
  mocks.uploadProfileResume.mockResolvedValue(undefined);
  mocks.readResumeFile.mockResolvedValue(
    new File(["synthetic"], "synthetic.pdf"),
  );
  mocks.resumeDownload.mockImplementation(
    (bytes: Blob, filename: string) =>
      new Response(bytes, { headers: { "x-filename": filename } }),
  );
  mocks.resumeFailure.mockImplementation((error: unknown) => ({
    error: error instanceof Error ? error.message : "safe error",
  }));
});

it("returns a private 404 when no profile résumé exists and a PDF when it does", async () => {
  const missing = await GET();
  expect(missing.status).toBe(404);
  expect(missing.headers.get("Cache-Control")).toBe("private, no-store");

  const bytes = new Blob(["synthetic pdf"]);
  mocks.downloadProfileResume.mockResolvedValue({ info: metadata, bytes });
  const downloaded = await GET();
  expect(downloaded.status).toBe(200);
  expect(downloaded.headers.get("x-filename")).toBe("synthetic.pdf");
  expect(mocks.resumeDownload).toHaveBeenCalledWith(bytes, "synthetic.pdf");
});

it("turns profile résumé read failures into a private service-unavailable response", async () => {
  mocks.downloadProfileResume.mockRejectedValue(
    new Error("synthetic storage failure"),
  );
  const response = await GET();
  expect(response.status).toBe(503);
  expect(response.headers.get("Cache-Control")).toBe("private, no-store");
});

it("rejects cross-origin and unauthenticated profile resume mutations", async () => {
  const crossOrigin = await POST(
    post({ origin: "https://attacker.example.test" }),
  );
  expect(crossOrigin.status).toBe(403);
  expect(mocks.currentApplicant).not.toHaveBeenCalled();

  mocks.currentApplicant.mockResolvedValueOnce(null);
  const unauthenticated = await POST(post({ "x-resume-intent": "remove" }));
  expect(unauthenticated.status).toBe(403);
  await expect(unauthenticated.json()).resolves.toMatchObject({
    error: "Applicant access required.",
  });
});

it("removes the expected profile résumé and returns the current metadata", async () => {
  const response = await POST(
    post({ "x-resume-intent": "remove", "x-profile-resume": operation }),
  );
  expect(response.status).toBe(200);
  expect(mocks.retireProfileResume).toHaveBeenCalledWith(actor, operation);
  await expect(response.json()).resolves.toMatchObject({
    ok: true,
    resume: metadata,
  });
});

it("rejects a malformed expected profile résumé identifier and unknown intent", async () => {
  const invalidResume = await POST(
    post({ "x-resume-intent": "remove", "x-profile-resume": "invalid" }),
  );
  expect(invalidResume.status).toBe(400);
  await expect(invalidResume.json()).resolves.toMatchObject({
    error: "Reload your profile.",
  });

  const unknown = await POST(post({ "x-resume-intent": "replace" }));
  expect(unknown.status).toBe(400);
  await expect(unknown.json()).resolves.toMatchObject({
    error: "Choose an upload action.",
  });
  expect(mocks.retireProfileResume).not.toHaveBeenCalled();
});

it("uploads a validated profile résumé with the operation, expected id, and retry flag", async () => {
  const response = await POST(
    post({
      "x-resume-intent": "upload",
      "x-profile-resume": operation,
      "x-resume-operation": actor,
      "x-resume-retry": "true",
    }),
  );
  expect(response.status).toBe(200);
  expect(mocks.readResumeFile).toHaveBeenCalledOnce();
  expect(mocks.uploadProfileResume).toHaveBeenCalledWith(
    actor,
    expect.any(File),
    actor,
    operation,
    true,
  );
});

it("returns a safe client error when upload operation metadata or the service is invalid", async () => {
  const invalidOperation = await POST(
    post({ "x-resume-intent": "upload", "x-resume-operation": "bad" }),
  );
  expect(invalidOperation.status).toBe(400);
  await expect(invalidOperation.json()).resolves.toMatchObject({
    error: "Choose the file again.",
  });
  expect(mocks.readResumeFile).not.toHaveBeenCalled();

  mocks.uploadProfileResume.mockRejectedValueOnce(
    new Error("Reload your profile."),
  );
  const failure = await POST(
    post({ "x-resume-intent": "upload", "x-resume-operation": actor }),
  );
  expect(failure.status).toBe(400);
  await expect(failure.json()).resolves.toMatchObject({
    error: "Reload your profile.",
    resume: metadata,
  });
});

it("omits resume payload safely if current metadata lookup fails during error handling", async () => {
  mocks.uploadProfileResume.mockRejectedValueOnce(
    new Error("Synthetic upload failure"),
  );
  mocks.getProfileResume.mockRejectedValueOnce(
    new Error("Synthetic lookup failure"),
  );
  const failure = await POST(
    post({ "x-resume-intent": "upload", "x-resume-operation": actor }),
  );
  expect(failure.status).toBe(400);
  const body = (await failure.json()) as Record<string, unknown>;
  expect(body.error).toBe("Synthetic upload failure");
  expect("resume" in body).toBe(false);
});
