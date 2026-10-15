import { afterEach, beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  validateResume: vi.fn(),
  rpc: vi.fn(),
  readyResult: { data: null as unknown, error: null as unknown },
  profileResult: { data: null as unknown, error: null as unknown },
  stateQueryFilters: [] as Array<Array<[string, string]>>,
  cleanupData: [] as unknown,
  storageBucket: null as unknown,
  client: null as unknown,
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/application-resumes", () => ({
  resumeMutationClient: () => mocks.client,
}));
vi.mock("@/lib/resume-input", () => ({ validateResume: mocks.validateResume }));

import { getProfileResume, uploadProfileResume } from "@/lib/profile-resumes";
import { resumeFailureStatus } from "@/lib/resume-errors";

const actor = "44000000-0000-4000-8000-000000000101";
const operation = "44000000-0000-4000-8000-000000000102";
const objectPath = `${actor}.pdf`;
const valid = {
  bytes: new Uint8Array([37, 80, 68, 70]),
  filename: "synthetic.pdf",
  sha256: "a".repeat(64),
};

function setReadyResult(data: unknown = null) {
  mocks.readyResult = { data, error: null };
}

beforeEach(() => {
  vi.clearAllMocks();
  const storage = {
    download: vi.fn(async () => ({ data: null, error: null })),
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
  };
  mocks.storageBucket = storage;
  const client = {
    rpc: mocks.rpc,
    storage: { from: vi.fn(() => storage) },
    from: vi.fn(() => {
      let fields = "";
      const filters: Array<[string, string]> = [];
      const builder = {
        select: vi.fn((selected: string) => {
          fields = selected;
          return builder;
        }),
        eq: vi.fn((column: string, value: string) => {
          filters.push([column, value]);
          return builder;
        }),
        maybeSingle: vi.fn(async () => {
          if (fields === "state") {
            mocks.stateQueryFilters.push(filters);
            return mocks.readyResult;
          }
          return mocks.profileResult;
        }),
      };
      return builder;
    }),
  };
  mocks.client = client;
  mocks.currentApplicant.mockResolvedValue({ client, user: { id: actor } });
  mocks.validateResume.mockResolvedValue(valid);
  mocks.profileResult = { data: null, error: null };
  setReadyResult();
  mocks.cleanupData = [];
  mocks.stateQueryFilters = [];
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_profile_resume")
      return { data: objectPath, error: null };
    if (name === "claim_profile_resume_cleanup")
      return { data: mocks.cleanupData, error: null };
    return { data: null, error: null };
  });
});

afterEach(() => vi.restoreAllMocks());

it("reconciles the same pending profile operation without retiring it", async () => {
  setReadyResult({ state: "pending" });

  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    null,
    true,
  );

  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "retire_profile_resume",
    expect.anything(),
  );
  expect(mocks.rpc).toHaveBeenCalledWith(
    "reserve_profile_resume",
    expect.objectContaining({ p_operation: operation, p_expected: null }),
  );
  expect(
    (mocks.storageBucket as { upload: ReturnType<typeof vi.fn> }).upload,
  ).toHaveBeenCalledOnce();
  expect(mocks.stateQueryFilters[0]).toContainEqual(["applicant_id", actor]);
});

it("reconciles a ready profile operation before checking the stale expected id", async () => {
  setReadyResult({ state: "ready" });

  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    "44000000-0000-4000-8000-000000000999",
    true,
  );

  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "retire_profile_resume",
    expect.anything(),
  );
  expect(mocks.rpc).toHaveBeenCalledWith(
    "reserve_profile_resume",
    expect.objectContaining({ p_operation: operation }),
  );
  expect(
    (mocks.storageBucket as { upload: ReturnType<typeof vi.fn> }).upload,
  ).not.toHaveBeenCalled();
});

it("reports a retired operation so the client can retry the selected file with a new id", async () => {
  setReadyResult({ state: "retired" });

  await expect(
    uploadProfileResume(
      actor,
      new File(["synthetic PDF"], "synthetic.pdf"),
      operation,
      null,
      true,
    ),
  ).rejects.toMatchObject({ code: "RESUME_UPLOAD_OPERATION_RETIRED" });
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "reserve_profile_resume",
    expect.anything(),
  );
});

it("classifies profile operation lookup outages as safe server failures", async () => {
  setReadyResult();
  mocks.readyResult = {
    data: null,
    error: { message: "private database detail" },
  };
  const log = vi.spyOn(console, "error").mockImplementation(() => {});

  let caught: unknown;
  try {
    await uploadProfileResume(
      actor,
      new File(["synthetic PDF"], "synthetic.pdf"),
      operation,
      null,
      true,
    );
  } catch (error) {
    caught = error;
  }

  expect(caught).toMatchObject({
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
    reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(resumeFailureStatus(caught)).toBe(503);
  expect(log).toHaveBeenCalledWith(
    "resume_upload_preparation_failed",
    expect.objectContaining({ stage: "profile_state_lookup" }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    "private database detail",
  );
});

it("returns a safe server failure when a new upload state lookup fails", async () => {
  mocks.readyResult = {
    data: null,
    error: { message: "private database detail" },
  };
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  let caught: unknown;
  try {
    await uploadProfileResume(
      actor,
      new File(["synthetic PDF"], "synthetic.pdf"),
      operation,
      null,
    );
  } catch (error) {
    caught = error;
  }

  expect(mocks.rpc).toHaveBeenCalledWith(
    "reserve_profile_resume",
    expect.objectContaining({ p_operation: operation }),
  );
  expect(resumeFailureStatus(caught)).toBe(503);
  expect(caught).toMatchObject({ code: "RESUME_UPLOAD_PREPARATION_FAILED" });
  expect(log).toHaveBeenCalledWith(
    "resume_upload_preparation_failed",
    expect.objectContaining({ stage: "profile_state_lookup" }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    "private database detail",
  );
});

it("classifies a failed current-profile lookup as a safe server failure", async () => {
  mocks.profileResult = {
    data: null,
    error: { message: "private database detail" },
  };
  const log = vi.spyOn(console, "error").mockImplementation(() => {});

  let caught: unknown;
  try {
    await getProfileResume();
  } catch (error) {
    caught = error;
  }

  expect(caught).toMatchObject({ code: "RESUME_UPLOAD_PREPARATION_FAILED" });
  expect(resumeFailureStatus(caught)).toBe(503);
  expect(log).toHaveBeenCalledWith(
    "resume_upload_preparation_failed",
    expect.objectContaining({ stage: "profile_metadata_lookup" }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    "private database detail",
  );
});

it("classifies profile Storage failures as safe server errors", async () => {
  const bucket = mocks.storageBucket as {
    upload: ReturnType<typeof vi.fn>;
  };
  bucket.upload.mockResolvedValueOnce({ error: { message: "private detail" } });

  await expect(
    uploadProfileResume(
      actor,
      new File(["synthetic PDF"], "synthetic.pdf"),
      operation,
      null,
    ),
  ).rejects.toMatchObject({ code: "RESUME_UPLOAD_PERSISTENCE_FAILED" });
  expect(mocks.rpc).toHaveBeenCalledWith("cancel_profile_resume", {
    p_actor: actor,
    p_operation: operation,
  });
});
