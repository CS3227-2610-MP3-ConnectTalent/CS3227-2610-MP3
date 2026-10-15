import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  objectState: "pending",
}));

vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    storage: {
      from: () => ({ upload: mocks.upload, remove: mocks.remove }),
    },
  }),
}));
vi.mock("../../src/lib/resume-input", () => ({
  validateResume: async () => ({
    bytes: new Uint8Array([1]),
    filename: "synthetic.pdf",
    sha256: "a".repeat(64),
  }),
}));

import { uploadApplicationResume } from "../../src/lib/application-resumes";
import { resumeFailureStatus } from "../../src/lib/resume-errors";

const actor = "44000000-0000-4000-8000-000000000101";
const job = "44000000-0000-4000-8000-000000000102";
const application = "44000000-0000-4000-8000-000000000301";
const operation = "44000000-0000-4000-8000-000000000201";
const objectPath = `${application}/${operation}.pdf`;

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
  mocks.objectState = "pending";
  mocks.upload.mockResolvedValue({ error: null });
  mocks.remove.mockResolvedValue({ error: null });
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "prepare_application_resume")
      return {
        data: {
          id: application,
          revision: 1,
          object_path: objectPath,
          state: "pending",
        },
        error: null,
      };
    if (name === "finalize_application_resume")
      return {
        error: { code: "P0001", message: "Job is not open for applications" },
      };
    if (name === "cancel_application_resume") {
      mocks.objectState = "retired";
      return { error: null };
    }
    if (name === "claim_resume_cleanup")
      return {
        data:
          mocks.objectState === "retired"
            ? [{ id: operation, object_path: objectPath }]
            : [],
        error: null,
      };
    return { error: null };
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
});

it("retires and cleans its pending object after the job closes before finalization", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  let caught: unknown;
  try {
    await uploadApplicationResume(
      actor,
      job,
      1,
      new File(["synthetic PDF"], "synthetic.pdf"),
      operation,
    );
  } catch (error) {
    caught = error;
  }

  expect(caught).toMatchObject({
    code: "RESUME_JOB_CLOSED",
    reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(resumeFailureStatus(caught)).toBe(409);
  expect(mocks.rpc).toHaveBeenCalledWith("cancel_application_resume", {
    p_actor: actor,
    p_job: job,
    p_operation: operation,
  });
  const rpcNames = mocks.rpc.mock.calls.map(([name]) => name);
  expect(rpcNames.indexOf("cancel_application_resume")).toBeLessThan(
    rpcNames.indexOf("claim_resume_cleanup"),
  );
  expect(mocks.remove).toHaveBeenCalledWith([objectPath]);
  expect(log).toHaveBeenCalledWith(
    "resume_upload_finalize_rejected",
    expect.objectContaining({ code: "RESUME_JOB_CLOSED" }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    "Job is not open for applications",
  );
});
