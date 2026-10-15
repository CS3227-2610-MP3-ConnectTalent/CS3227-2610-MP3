import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  currentApplicant: vi.fn(),
  download: vi.fn(),
  profileResult: { data: null as unknown, error: null as unknown },
}));

vi.mock("@/lib/auth", () => ({ currentApplicant: mocks.currentApplicant }));
vi.mock("@/lib/application-resumes", () => ({
  resumeMutationClient: vi.fn(),
}));
vi.mock("@/lib/resume-input", () => ({ validateResume: vi.fn() }));

import { downloadProfileResume } from "@/lib/profile-resumes";

const actor = "44000000-0000-4000-8000-000000000101";
const operation = "44000000-0000-4000-8000-000000000102";
const resumeInfo = {
  id: operation,
  filename: "synthetic.pdf",
  byte_size: 8,
  object_path: `${actor}.pdf`,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.profileResult = { data: resumeInfo, error: null };
  mocks.download.mockResolvedValue({ data: null, error: null });
  const client = {
    storage: { from: vi.fn(() => ({ download: mocks.download })) },
    from: vi.fn(() => {
      const query = {
        select: vi.fn(() => query),
        eq: vi.fn(() => query),
        maybeSingle: vi.fn(async () => mocks.profileResult),
      };
      return query;
    }),
  };
  mocks.currentApplicant.mockResolvedValue({
    client,
    user: { id: actor },
  });
});

it("downloads only the current expected profile attachment", async () => {
  mocks.currentApplicant.mockResolvedValueOnce(null);
  await expect(downloadProfileResume()).resolves.toBeNull();

  await expect(
    downloadProfileResume("44000000-0000-4000-8000-000000000999"),
  ).resolves.toBeNull();
  expect(mocks.download).not.toHaveBeenCalled();

  const bytes = new Blob(["synthetic resume"]);
  mocks.download.mockResolvedValueOnce({ data: bytes, error: null });
  await expect(downloadProfileResume(operation)).resolves.toEqual({
    info: resumeInfo,
    bytes,
  });
});

it("keeps missing storage objects distinct from storage download failures", async () => {
  const log = vi.spyOn(console, "error").mockImplementation(() => {});
  await expect(downloadProfileResume()).resolves.toBeNull();

  mocks.download.mockResolvedValueOnce({
    data: null,
    error: { message: "missing", status: 404, statusCode: "404" },
  });
  await expect(downloadProfileResume()).resolves.toBeNull();

  mocks.download.mockResolvedValueOnce({
    data: null,
    error: {
      message: "private storage detail",
      status: 503,
      statusCode: "503",
    },
  });
  await expect(downloadProfileResume()).rejects.toMatchObject({
    code: "RESUME_UPLOAD_PERSISTENCE_FAILED",
  });

  mocks.download.mockRejectedValueOnce(new Error("private network detail"));
  await expect(downloadProfileResume()).rejects.toMatchObject({
    code: "RESUME_UPLOAD_PERSISTENCE_FAILED",
  });
  expect(JSON.stringify(log.mock.calls)).not.toContain("private storage");
  expect(JSON.stringify(log.mock.calls)).not.toContain("private network");
});
