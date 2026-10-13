import { beforeEach, expect, it, vi } from "vitest";
import {
  ResumeValidationError,
  type ResumeErrorCode,
} from "@/lib/resume-errors";

const mocks = vi.hoisted(() => ({ upload: vi.fn(), applicant: vi.fn() }));
vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.applicant }));
vi.mock("@/lib/applications", () => ({
  getOwnApplication: vi.fn(async () => ({
    job_id: "44000000-0000-4000-8000-000000000102",
  })),
  getOwnApplicationForJob: vi.fn(async () => ({
    id: "saved-draft",
    revision: 3,
  })),
}));
vi.mock("@/lib/application-resumes", () => ({
  uploadApplicationResume: mocks.upload,
  uploadResumeForJob: mocks.upload,
  getApplicationResume: vi.fn(async () => ({ filename: "previous.pdf" })),
}));
vi.mock("@/lib/profile-resumes", () => ({ uploadProfileResume: mocks.upload }));
import { POST as profile } from "@/app/api/profile/resume/route";
import { POST as application } from "@/app/api/applications/[id]/resume/route";
import { POST as job } from "@/app/api/jobs/[id]/resume/route";

const id = "44000000-0000-4000-8000-000000000101";
const context = { params: Promise.resolve({ id }) };
function request() {
  return new Request("http://localhost/api/resume", {
    method: "POST",
    headers: {
      origin: "http://localhost",
      "content-type": "application/pdf",
      "x-resume-filename": "synthetic.pdf",
      "x-resume-intent": "upload",
      "x-resume-operation": id,
      "x-application-revision": "3",
    },
    body: "synthetic",
  });
}
beforeEach(() => {
  vi.clearAllMocks();
  mocks.applicant.mockResolvedValue({ user: { id } });
});

const failures: [ResumeErrorCode, number][] = [
  ["RESUME_EMPTY", 400],
  ["RESUME_FILENAME_INVALID", 400],
  ["RESUME_TOO_LARGE", 413],
  ["RESUME_TYPE_UNSUPPORTED", 415],
  ["RESUME_PASSWORD_REQUIRED", 422],
  ["RESUME_INVALID", 422],
  ["RESUME_READ_FAILED", 400],
  ["RESUME_VALIDATOR_UNAVAILABLE", 503],
  ["RESUME_VALIDATION_TIMEOUT", 504],
];
for (const [name, post] of [
  ["profile", profile],
  ["application", application],
  ["job", job],
] as const) {
  it.each(failures)(
    `${name}: returns safe %s with HTTP %s`,
    async (code, status) => {
      const error = new ResumeValidationError(code);
      const safeMessage = error.message;
      error.message = "private document text and runtime path";
      mocks.upload.mockRejectedValueOnce(error);
      const response = await post(request(), context);
      expect(response.status).toBe(status);
      expect(response.headers.get("Cache-Control")).toBe("private, no-store");
      const body = await response.json();
      expect(body).toMatchObject({ code, error: safeMessage });
      expect(JSON.stringify(body)).not.toContain("private document");
      if (name === "job")
        expect(body).toMatchObject({
          applicationId: "saved-draft",
          revision: 3,
          resume: { filename: "previous.pdf" },
        });
    },
  );
}
