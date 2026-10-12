import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  validateResume: vi.fn(),
  rpc: vi.fn(),
  readyResult: { data: null as unknown, error: null as unknown },
  profileResult: { data: null as unknown, error: null as unknown },
  cleanupData: [] as unknown,
  storageBucket: null as unknown,
  client: null as unknown,
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/application-resumes", () => ({
  resumeMutationClient: () => mocks.client,
}));
vi.mock("@/lib/resume-input", () => ({ validateResume: mocks.validateResume }));

import {
  downloadProfileResume,
  getProfileResume,
  retireProfileResume,
  uploadProfileResume,
} from "@/lib/profile-resumes";

const actor = "44000000-0000-4000-8000-000000000101";
const operation = "44000000-0000-4000-8000-000000000102";
const objectPath = `${actor}.pdf`;
const resumeInfo = {
  id: operation,
  filename: "synthetic.pdf",
  byte_size: 8,
  object_path: objectPath,
};
const valid = {
  bytes: new Uint8Array([37, 80, 68, 70]),
  filename: "synthetic.pdf",
  sha256: "a".repeat(64),
};

function setProfileResult(data: unknown, error: unknown = null) {
  mocks.profileResult = { data, error };
}

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
      const builder = {
        select: vi.fn((selected: string) => {
          fields = selected;
          return builder;
        }),
        eq: vi.fn(() => builder),
        maybeSingle: vi.fn(async () =>
          fields === "state" ? mocks.readyResult : mocks.profileResult,
        ),
      };
      return builder;
    }),
  };
  mocks.client = client;
  mocks.currentApplicant.mockResolvedValue({ client, user: { id: actor } });
  mocks.validateResume.mockResolvedValue(valid);
  setProfileResult(null);
  setReadyResult();
  mocks.cleanupData = [];
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_profile_resume")
      return { data: objectPath, error: null };
    if (name === "claim_profile_resume_cleanup")
      return { data: mocks.cleanupData, error: null };
    return { data: null, error: null };
  });
});

it("returns no profile résumé for a guest or missing row and validates a saved row", async () => {
  mocks.currentApplicant.mockResolvedValueOnce(null);
  await expect(getProfileResume()).resolves.toBeNull();
  await expect(getProfileResume()).resolves.toBeNull();
  setProfileResult(resumeInfo);
  await expect(getProfileResume()).resolves.toEqual(resumeInfo);
  expect(
    (mocks.client as { from: ReturnType<typeof vi.fn> }).from,
  ).toHaveBeenCalledWith("profile_resume_objects");
});

it("hides profile resume metadata lookup errors and invalid persisted metadata", async () => {
  setProfileResult(null, { message: "synthetic query error" });
  await expect(getProfileResume()).rejects.toThrow(
    "Résumé information is temporarily unavailable.",
  );
  setProfileResult({ ...resumeInfo, byte_size: 0 });
  await expect(getProfileResume()).rejects.toThrow();
});

it("downloads only the current expected profile attachment", async () => {
  mocks.currentApplicant.mockResolvedValueOnce(null);
  await expect(downloadProfileResume()).resolves.toBeNull();

  setProfileResult(resumeInfo);
  await expect(
    downloadProfileResume("44000000-0000-4000-8000-000000000999"),
  ).resolves.toBeNull();
  const bytes = new Blob(["synthetic resume"]);
  const bucket = mocks.storageBucket as {
    download: ReturnType<typeof vi.fn>;
  };
  bucket.download.mockResolvedValueOnce({ data: bytes, error: null });
  await expect(downloadProfileResume(operation)).resolves.toEqual({
    info: resumeInfo,
    bytes,
  });
});

it("returns null for missing storage objects and storage errors", async () => {
  setProfileResult(resumeInfo);
  const result = await downloadProfileResume();
  expect(result).toBeNull();
  const bucket = mocks.storageBucket as {
    download: ReturnType<typeof vi.fn>;
  };
  bucket.download.mockResolvedValueOnce({
    data: new Blob(),
    error: { message: "missing" },
  });
  await expect(downloadProfileResume()).resolves.toBeNull();
});

it("retires the expected profile résumé and cleans only valid owned storage paths", async () => {
  mocks.cleanupData = [
    { object_path: `${actor}.pdf` },
    { object_path: "../other-applicant.pdf" },
    null,
  ];
  await retireProfileResume(actor, operation, true);
  expect(mocks.rpc).toHaveBeenCalledWith("retire_profile_resume", {
    p_actor: actor,
    p_expected: operation,
    p_pending_only: true,
  });
  const bucket = mocks.storageBucket as { remove: ReturnType<typeof vi.fn> };
  expect(bucket.remove).toHaveBeenCalledWith([`${actor}.pdf`]);
  expect(bucket.remove).toHaveBeenCalledTimes(1);
});

it("keeps a failed retirement from starting cleanup", async () => {
  mocks.rpc.mockResolvedValueOnce({ error: { message: "revision changed" } });
  await expect(retireProfileResume(actor, operation)).rejects.toThrow(
    "Reload your profile before changing the résumé.",
  );
  expect(mocks.rpc).toHaveBeenCalledTimes(1);
});

it("reserves, uploads, finalizes, and cleans an ordinary profile résumé", async () => {
  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    null,
  );
  expect(mocks.validateResume).toHaveBeenCalledOnce();
  expect(mocks.rpc).toHaveBeenCalledWith("reserve_profile_resume", {
    p_actor: actor,
    p_operation: operation,
    p_filename: valid.filename,
    p_size: valid.bytes.length,
    p_sha256: valid.sha256,
    p_expected: null,
  });
  expect(mocks.rpc).toHaveBeenCalledWith("finalize_profile_resume", {
    p_actor: actor,
    p_operation: operation,
  });
  const bucket = mocks.storageBucket as { upload: ReturnType<typeof vi.fn> };
  expect(bucket.upload).toHaveBeenCalledWith(objectPath, valid.bytes, {
    contentType: "application/pdf",
    upsert: false,
  });
});

it("uses explicit retry to retire pending profile state before reserving again", async () => {
  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    operation,
    true,
  );
  expect(mocks.rpc).toHaveBeenCalledWith("retire_profile_resume", {
    p_actor: actor,
    p_expected: operation,
    p_pending_only: true,
  });
  expect(mocks.rpc).toHaveBeenCalledWith(
    "reserve_profile_resume",
    expect.objectContaining({ p_expected: operation }),
  );
});

it("does not upload a repeated operation already marked ready", async () => {
  setReadyResult({ state: "ready" });
  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    null,
  );
  const bucket = mocks.storageBucket as { upload: ReturnType<typeof vi.fn> };
  expect(bucket.upload).not.toHaveBeenCalled();
  expect(mocks.rpc).not.toHaveBeenCalledWith(
    "finalize_profile_resume",
    expect.anything(),
  );
});

it("verifies an existing storage object before finalizing and retries one transient finalize", async () => {
  const bucket = (mocks.storageBucket as { download: ReturnType<typeof vi.fn> })
    .download;
  bucket.mockResolvedValueOnce({
    data: new Blob(["stored synthetic PDF"]),
    error: null,
  });
  mocks.validateResume
    .mockResolvedValueOnce(valid)
    .mockResolvedValueOnce(valid);
  mocks.rpc
    .mockResolvedValueOnce({ data: objectPath, error: null })
    .mockResolvedValueOnce({ data: null, error: { message: "transient" } })
    .mockResolvedValueOnce({ data: null, error: null })
    .mockImplementation(async (name: string) =>
      name === "claim_profile_resume_cleanup"
        ? { data: [], error: null }
        : { data: null, error: null },
    );

  await uploadProfileResume(
    actor,
    new File(["synthetic PDF"], "synthetic.pdf"),
    operation,
    null,
  );
  expect(mocks.validateResume).toHaveBeenCalledTimes(2);
  expect(mocks.rpc).toHaveBeenCalledWith("finalize_profile_resume", {
    p_actor: actor,
    p_operation: operation,
  });
});

it("rejects mismatched stored bytes and cancels upload state after storage/finalization failures", async () => {
  const bucket = (mocks.storageBucket as { download: ReturnType<typeof vi.fn> })
    .download;
  bucket.mockResolvedValueOnce({ data: new Blob(["other PDF"]), error: null });
  mocks.validateResume
    .mockResolvedValueOnce(valid)
    .mockResolvedValueOnce({ ...valid, sha256: "b".repeat(64) });
  await expect(
    uploadProfileResume(
      actor,
      new File(["source"], "synthetic.pdf"),
      operation,
      null,
    ),
  ).rejects.toThrow("We could not confirm the upload.");
  expect(mocks.rpc).toHaveBeenCalledWith("cancel_profile_resume", {
    p_actor: actor,
    p_operation: operation,
  });

  mocks.rpc.mockResolvedValueOnce({
    data: null,
    error: { message: "unavailable" },
  });
  await expect(
    uploadProfileResume(
      actor,
      new File(["source"], "synthetic.pdf"),
      operation,
      null,
    ),
  ).rejects.toThrow("Reload your profile or use Retry upload");
});
