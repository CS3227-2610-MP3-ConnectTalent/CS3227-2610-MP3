import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
  upload: vi.fn(),
  remove: vi.fn(),
  update: vi.fn(),
  existing: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    storage: { from: () => ({ upload: mocks.upload, remove: mocks.remove }) },
    from: () => ({
      select: () => ({ eq: () => ({ maybeSingle: mocks.existing }) }),
      update: mocks.update,
    }),
  }),
}));
vi.mock("../../src/lib/resume-input", () => ({
  validateResume: async () => ({
    bytes: new Uint8Array([1]),
    filename: "synthetic.pdf",
    sha256: "a".repeat(64),
  }),
}));
import {
  cancelResumeUpload,
  uploadApplicationResume,
} from "../../src/lib/application-resumes";
beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
  mocks.existing.mockResolvedValue({ data: null, error: null });
  mocks.remove.mockResolvedValue({ error: null });
  mocks.upload.mockResolvedValue({ error: null });
  mocks.update.mockReturnValue({
    eq: () => ({ eq: () => Promise.resolve({ error: null }) }),
  });
  mocks.rpc.mockImplementation(
    async (name: string, args: { p_operation?: string } = {}) =>
      name === "prepare_application_resume"
        ? {
            data: {
              id: "44000000-0000-4000-8000-000000000301",
              revision: 1,
              object_path: `44000000-0000-4000-8000-000000000301/${args.p_operation}.pdf`,
              state: "pending",
            },
            error: null,
          }
        : name === "claim_resume_cleanup"
          ? { data: [], error: null }
          : { error: null },
  );
});
it("keeps cleanup tombstones retryable when cancel/delete happens before upload completes", async () => {
  let resolveUpload!: (value: { error: null }) => void;
  mocks.upload.mockImplementation(
    () =>
      new Promise((resolve) => {
        resolveUpload = resolve;
      }),
  );
  let key = "";
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "prepare_application_resume") {
      const operation = mocks.rpc.mock.calls.at(-1)?.[1].p_operation;
      key = `44000000-0000-4000-8000-000000000301/${operation}.pdf`;
      return {
        data: {
          id: "44000000-0000-4000-8000-000000000301",
          revision: 1,
          object_path: key,
          state: "pending",
        },
        error: null,
      };
    }
    if (name === "finalize_application_resume")
      return { error: { message: "canceled" } };
    if (name === "claim_resume_cleanup")
      return {
        data: [
          { id: "44000000-0000-4000-8000-000000000201", object_path: key },
        ],
        error: null,
      };
    return { error: null };
  });
  const uploading = uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
  );
  await vi.waitFor(() => expect(mocks.upload).toHaveBeenCalled());
  await cancelResumeUpload("actor", "job");
  resolveUpload({ error: null });
  await expect(uploading).rejects.toThrow("could not confirm");
  expect(mocks.remove).toHaveBeenCalledTimes(2);
  expect(mocks.update).not.toHaveBeenCalledWith({ state: "deleted" });
});
it("reconciles a repeated HTTP operation without another Storage upload", async () => {
  const operation = "44000000-0000-4000-8000-000000000201";
  mocks.rpc.mockImplementation(async (name: string) =>
    name === "prepare_application_resume"
      ? {
          data: {
            id: "44000000-0000-4000-8000-000000000301",
            revision: 1,
            object_path: `44000000-0000-4000-8000-000000000301/${operation}.pdf`,
            state: "ready",
          },
          error: null,
        }
      : { error: null },
  );
  await uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
    operation,
  );
  expect(mocks.upload).not.toHaveBeenCalled();
  expect(mocks.rpc).toHaveBeenCalledWith(
    "prepare_application_resume",
    expect.objectContaining({ p_operation: operation }),
  );
  expect(mocks.existing).not.toHaveBeenCalled();
});
it("checks a completed retry before pending recovery when the revision is stale", async () => {
  const operation = "44000000-0000-4000-8000-000000000201";
  mocks.rpc.mockImplementation(
    async (name: string, args: { p_operation?: string } = {}) =>
      name === "prepare_application_resume"
        ? {
            data: {
              id: "44000000-0000-4000-8000-000000000301",
              revision: 2,
              object_path: `44000000-0000-4000-8000-000000000301/${args.p_operation}.pdf`,
              state: "ready",
            },
            error: null,
          }
        : name === "claim_resume_cleanup"
          ? { data: [], error: null }
          : { error: null },
  );

  await uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
    operation,
    true,
  );

  const calls = mocks.rpc.mock.calls.map((call) => call[0]);
  expect(calls[0]).toBe("prepare_application_resume");
  expect(calls).not.toContain("recover_pending_application_resume");
  expect(mocks.upload).not.toHaveBeenCalled();
});
it("recovers an owned stale pending upload only on explicit retry", async () => {
  let prepareAttempts = 0;
  mocks.rpc.mockImplementation(async (name: string) =>
    name === "prepare_application_resume" && prepareAttempts++ === 0
      ? { data: null, error: { code: "23505", message: "pending conflict" } }
      : name === "prepare_application_resume"
        ? {
            data: {
              id: "44000000-0000-4000-8000-000000000301",
              revision: 1,
              object_path:
                "44000000-0000-4000-8000-000000000301/44000000-0000-4000-8000-000000000201.pdf",
              state: "pending",
            },
            error: null,
          }
        : name === "claim_resume_cleanup"
          ? { data: [], error: null }
          : { error: null },
  );
  await uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
    "44000000-0000-4000-8000-000000000201",
    true,
  );
  expect(mocks.rpc).toHaveBeenCalledWith("recover_pending_application_resume", {
    p_actor: "actor",
    p_job: "job",
    p_revision: 1,
  });
  expect(mocks.upload).toHaveBeenCalledTimes(1);
});

it("classifies Storage upload failures as safe server errors", async () => {
  const operation = "44000000-0000-4000-8000-000000000201";
  mocks.upload.mockResolvedValueOnce({ error: { message: "private detail" } });

  await expect(
    uploadApplicationResume(
      "actor",
      "job",
      1,
      new File(["synthetic"], "synthetic.pdf"),
      operation,
    ),
  ).rejects.toMatchObject({ code: "RESUME_UPLOAD_PERSISTENCE_FAILED" });

  await uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
    operation,
    true,
  );
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "cancel_application_resume",
    expect.anything(),
  );
  expect(
    mocks.rpc.mock.calls.filter(
      (call) => call[0] === "prepare_application_resume",
    ),
  ).toHaveLength(2);
  expect(mocks.upload.mock.calls.map((call) => call[2].upsert)).toEqual([
    false,
    true,
  ]);
});

it("does not select résumé-object rows during application upload preparation", async () => {
  const operation = "44000000-0000-4000-8000-000000000201";
  await uploadApplicationResume(
    "actor",
    "job",
    1,
    new File(["synthetic"], "synthetic.pdf"),
    operation,
  );
  expect(mocks.existing).not.toHaveBeenCalled();
});
