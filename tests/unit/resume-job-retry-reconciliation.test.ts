import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  rpc: vi.fn(),
  validate: vi.fn(),
  readInput: vi.fn(),
  from: vi.fn(),
  lookup: vi.fn(),
  lookupFilters: [] as Array<{
    table: string;
    filters: Array<[string, string]>;
  }>,
  upload: vi.fn(),
  storageFrom: vi.fn(),
}));
vi.mock("@supabase/supabase-js", () => ({
  createClient: () => ({
    rpc: mocks.rpc,
    from: mocks.from,
    storage: { from: mocks.storageFrom },
  }),
}));
vi.mock("../../src/lib/auth", () => ({
  currentApplicant: mocks.currentApplicant,
}));
vi.mock("../../src/lib/resume-input", () => ({
  readResumeInput: mocks.readInput,
  validateResume: mocks.validate,
}));
import {
  uploadApplicationResume,
  uploadResumeForJob,
} from "../../src/lib/application-resumes";

const actor = "53000000-0000-4000-8000-000000000001";
const job = "53000000-0000-4000-8000-000000000101";
const operation = "53000000-0000-4000-8000-000000000201";
const file = new File(["synthetic"], "synthetic.pdf", {
  type: "application/pdf",
});
const input = {
  bytes: new Uint8Array([37, 80, 68, 70]),
  filename: "synthetic.pdf",
  sha256: "a".repeat(64),
};

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321");
  vi.stubEnv("SUPABASE_SECRET_KEY", "synthetic-unit-key");
  mocks.readInput.mockResolvedValue(input);
  mocks.validate.mockResolvedValue(input);
  mocks.currentApplicant.mockResolvedValue({
    user: { id: actor },
    client: { from: mocks.from },
  });
  mocks.lookupFilters = [];
  mocks.lookup.mockResolvedValue({ data: null, error: null });
  mocks.from.mockImplementation((table: string) => {
    const filters: Array<[string, string]> = [];
    const builder = {
      select: vi.fn(() => builder),
      eq: vi.fn((column: string, value: string) => {
        filters.push([column, value]);
        return builder;
      }),
      maybeSingle: vi.fn(async () => {
        mocks.lookupFilters.push({ table, filters });
        return mocks.lookup(table, filters);
      }),
    };
    return builder;
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

it.each([
  ["job uploads", uploadResumeForJob],
  ["saved-application uploads", uploadApplicationResume],
])(
  "reconciles a matching completed %s before running the PDF validator",
  async (_name, upload) => {
    mocks.lookup.mockImplementation(async (table: string) =>
      table === "applications"
        ? { data: { id: actor, resume_id: operation }, error: null }
        : { data: { id: operation }, error: null },
    );
    mocks.validate.mockRejectedValue(new Error("PDF validator unavailable"));
    mocks.rpc.mockImplementation(async (name: string) =>
      name === "prepare_application_resume"
        ? {
            data: {
              id: actor,
              revision: 4,
              object_path: `${actor}/${operation}.pdf`,
              state: "ready",
            },
            error: null,
          }
        : { data: [], error: null },
    );

    await upload(actor, job, 2, file, operation, true);

    expect(mocks.readInput).toHaveBeenCalledOnce();
    expect(mocks.validate).not.toHaveBeenCalled();
    expect(mocks.rpc).toHaveBeenCalledWith(
      "prepare_application_resume",
      expect.objectContaining({
        p_actor: actor,
        p_job: job,
        p_operation: operation,
        p_filename: input.filename,
        p_size: input.bytes.length,
        p_sha256: input.sha256,
      }),
    );
    expect(mocks.lookupFilters).toEqual([
      {
        table: "applications",
        filters: [
          ["applicant_id", actor],
          ["job_id", job],
        ],
      },
    ]);
    expect(mocks.upload).not.toHaveBeenCalled();
  },
);

it("maps retry reconciliation lookup failures to a safe server error", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  mocks.lookup.mockResolvedValueOnce({
    data: null,
    error: { message: "private database outage" },
  });

  await expect(
    uploadApplicationResume(actor, job, 2, file, operation, true),
  ).rejects.toMatchObject({ code: "RESUME_UPLOAD_PREPARATION_FAILED" });

  expect(mocks.validate).not.toHaveBeenCalled();
  expect(mocks.rpc).not.toHaveBeenCalled();
  expect(JSON.stringify(log.mock.calls)).not.toContain("private database");
});
