import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  validate: vi.fn(),
  upload: vi.fn(),
  storageFrom: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    storage: { from: mocks.storageFrom },
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
});

it("recovers a different pending operation and retries the same revision and operation", async () => {
  let preparation = 0;
  mocks.rpc.mockImplementation(
    async (name: string, args: { p_operation?: string } = {}) => {
      if (name === "prepare_application_resume") {
        preparation += 1;
        if (preparation === 1)
          return { data: null, error: { code: "23505", message: "pending" } };
        return {
          data: {
            id: actor,
            revision: 3,
            object_path: `${actor}/${args.p_operation}.pdf`,
            state: "pending",
          },
          error: null,
        };
      }
      if (name === "claim_resume_cleanup") return { data: [], error: null };
      return { data: null, error: null };
    },
  );

  await uploadResumeForJob(actor, job, 3, file, operation, true);

  const calls = mocks.rpc.mock.calls;
  const names = calls.map(([name]) => name);
  const prepareCalls = calls.filter(
    ([name]) => name === "prepare_application_resume",
  );
  expect(prepareCalls).toHaveLength(2);
  expect(prepareCalls.map(([, args]) => args)).toEqual([
    expect.objectContaining({ p_revision: 3, p_operation: operation }),
    expect.objectContaining({ p_revision: 3, p_operation: operation }),
  ]);
  expect(names.indexOf("prepare_application_resume")).toBeLessThan(
    names.indexOf("recover_pending_application_resume"),
  );
  expect(names.lastIndexOf("prepare_application_resume")).toBeGreaterThan(
    names.indexOf("recover_pending_application_resume"),
  );
  expect(mocks.upload).toHaveBeenCalledWith(
    `${actor}/${operation}.pdf`,
    expect.any(Uint8Array),
    { contentType: "application/pdf", upsert: true },
  );
});

it("does not recover another pending operation when the revision is missing", async () => {
  mocks.rpc.mockImplementation(async (name: string) =>
    name === "prepare_application_resume"
      ? { data: null, error: { code: "23505", message: "pending" } }
      : { data: [], error: null },
  );

  await expect(
    uploadResumeForJob(actor, job, null, file, operation, true),
  ).rejects.toMatchObject({ code: "RESUME_UPLOAD_PENDING" });
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "recover_pending_application_resume",
    expect.anything(),
  );
});

it("reconciles a completed operation before checking the stale revision", async () => {
  mocks.rpc.mockImplementation(async (name: string) =>
    name === "prepare_application_resume"
      ? {
          data: {
            id: actor,
            revision: 3,
            object_path: `${actor}/${operation}.pdf`,
            state: "ready",
          },
          error: null,
        }
      : { data: [], error: null },
  );

  await uploadResumeForJob(actor, job, 2, file, operation, true);

  expect(mocks.rpc).toHaveBeenCalledWith(
    "prepare_application_resume",
    expect.objectContaining({ p_revision: 2, p_operation: operation }),
  );
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "recover_pending_application_resume",
    expect.anything(),
  );
  expect(mocks.upload).not.toHaveBeenCalled();
});
