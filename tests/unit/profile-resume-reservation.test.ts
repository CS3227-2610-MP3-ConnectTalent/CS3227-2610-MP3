import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  validateResume: vi.fn(),
  rpc: vi.fn(),
  client: null as unknown,
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/application-resumes", () => ({
  resumeMutationClient: () => mocks.client,
}));
vi.mock("@/lib/resume-input", () => ({ validateResume: mocks.validateResume }));

import { uploadProfileResume } from "@/lib/profile-resumes";
import { resumeFailureStatus } from "@/lib/resume-errors";

const actor = "44000000-0000-4000-8000-000000000101";
const operation = "44000000-0000-4000-8000-000000000102";
const valid = {
  bytes: new Uint8Array([37, 80, 68, 70]),
  filename: "synthetic.pdf",
  sha256: "a".repeat(64),
};

beforeEach(() => {
  vi.clearAllMocks();
  const storage = {
    download: vi.fn(async () => ({ data: null, error: null })),
    upload: vi.fn(async () => ({ error: null })),
    remove: vi.fn(async () => ({ error: null })),
  };
  const client = {
    rpc: mocks.rpc,
    storage: { from: vi.fn(() => storage) },
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn(async () => ({ data: null, error: null })),
    })),
  };
  mocks.client = client;
  mocks.currentApplicant.mockResolvedValue({ client, user: { id: actor } });
  mocks.validateResume.mockResolvedValue(valid);
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_profile_resume") return { data: null, error: null };
    if (name === "claim_profile_resume_cleanup")
      return { data: [], error: null };
    return { data: null, error: null };
  });
});

it("reports an unexpected profile reservation outage as a safe server error", async () => {
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_profile_resume")
      return {
        data: null,
        error: { code: "57P01", message: "private database detail" },
      };
    return { data: [], error: null };
  });
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

  expect(caught).toMatchObject({
    code: "RESUME_UPLOAD_PREPARATION_FAILED",
    reference: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(resumeFailureStatus(caught)).toBe(503);
  expect(log).toHaveBeenCalledWith(
    "resume_upload_preparation_failed",
    expect.objectContaining({
      stage: "profile_reservation",
      sqlState: "57P01",
    }),
  );
  expect(JSON.stringify(log.mock.calls)).not.toContain(
    "private database detail",
  );
});

it("returns a conflict when the expected profile résumé has changed", async () => {
  mocks.rpc.mockImplementation(async (name: string) => {
    if (name === "reserve_profile_resume")
      return {
        data: null,
        error: {
          code: "P0001",
          message: "Profile resume changed; reload",
        },
      };
    return { data: [], error: null };
  });

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

  expect(caught).toMatchObject({ code: "RESUME_PROFILE_CHANGED" });
  expect(resumeFailureStatus(caught)).toBe(409);
});
