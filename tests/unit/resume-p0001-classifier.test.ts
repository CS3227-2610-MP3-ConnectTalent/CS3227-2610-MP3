import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  lookup: vi.fn(),
  eq: vi.fn(),
  validate: vi.fn(),
  upload: vi.fn(),
  storageFrom: vi.fn(),
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
    from: () => {
      const query = {
        select: () => query,
        eq: mocks.eq,
        maybeSingle: mocks.lookup,
      };
      mocks.eq.mockReturnValue(query);
      return query;
    },
  }),
}));
vi.mock("../../src/lib/resume-input", () => ({
  validateResume: mocks.validate,
}));

import { uploadResumeForJob } from "../../src/lib/application-resumes";

const actor = "53000000-0000-4000-8000-000000000001";
const job = "53000000-0000-4000-8000-000000000101";
const operation = "53000000-0000-4000-8000-000000000201";
const file = new File(["synthetic"], "synthetic.pdf", {
  type: "application/pdf",
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
  mocks.validate.mockResolvedValue({
    bytes: new Uint8Array([1]),
    filename: "synthetic.pdf",
    sha256: "a".repeat(64),
  });
  mocks.storageFrom.mockReturnValue({ upload: mocks.upload });
  mocks.upload.mockResolvedValue({ error: null });
  mocks.lookup.mockResolvedValue({ data: { revision: 3 }, error: null });
  mocks.rpc.mockResolvedValue({ data: [], error: null });
});

it.each([
  [
    "Job is not open for applications",
    "RESUME_JOB_CLOSED",
    "This job is no longer accepting résumé uploads.",
  ],
  [
    "Application changed; reload before uploading",
    "RESUME_APPLICATION_CHANGED",
    "Your application changed. Refresh it before uploading the résumé.",
  ],
  [
    "Editable saved draft required",
    "RESUME_APPLICATION_CHANGED",
    "Your application changed. Refresh it before uploading the résumé.",
  ],
  [
    "Application changed; reload before saving",
    "RESUME_APPLICATION_CHANGED",
    "Your application changed. Refresh it before uploading the résumé.",
  ],
  [
    "Upload operation cannot be reused",
    "RESUME_UPLOAD_OPERATION_CONFLICT",
    "This upload could not be matched to the selected file. Select the file again and retry.",
  ],
])(
  "maps the allowlisted P0001 message %s to a safe failure",
  async (message, code, safeMessage) => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    mocks.rpc.mockImplementation(async (name: string) =>
      name === "prepare_application_resume"
        ? {
            data: null,
            error: {
              code: "P0001",
              message,
              details: "private database detail",
              hint: "private SQL hint",
            },
          }
        : { data: [], error: null },
    );

    await expect(
      uploadResumeForJob(actor, job, 3, file, operation),
    ).rejects.toMatchObject({ code, message: safeMessage });
  },
);
