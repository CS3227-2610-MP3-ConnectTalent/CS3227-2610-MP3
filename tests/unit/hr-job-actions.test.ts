import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  redirect: vi.fn((destination: string) => {
    throw new Error(`REDIRECT:${destination}`);
  }),
  revalidatePath: vi.fn(),
}));
vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));
vi.mock("next/navigation", () => ({ redirect: mocks.redirect }));
vi.mock("next/cache", () => ({ revalidatePath: mocks.revalidatePath }));

import {
  closeHRJob,
  createHRJobDraft,
  editHRJobDraft,
  publishHRJob,
  unpublishHRJob,
} from "../../src/app/hr/jobs/actions";

const jobId = "20000000-0000-4000-8000-000000000b01";
function form(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    jobId,
    title: "Software engineer",
    team: "Platform",
    category: "engineering",
    description: "Build internal tools",
    requirements: "TypeScript",
    ...overrides,
  }))
    data.set(key, value);
  return data;
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(console, "info").mockImplementation(() => {});
});

it("checks HR before creating and sends only validated fields to the narrow RPC", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: jobId, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(createHRJobDraft(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=created`,
  );
  expect(mocks.requireHR).toHaveBeenCalledTimes(1);
  expect(rpc).toHaveBeenCalledWith("create_hr_job_draft", {
    p_title: "Software engineer",
    p_team: "Platform",
    p_category: "engineering",
    p_description: "Build internal tools",
    p_requirements: "TypeScript",
    p_opens_at: null,
    p_closes_at: null,
  });
});

it("denies invalid fields before the RPC and reports a generic failure", async () => {
  const rpc = vi.fn();
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(createHRJobDraft(form({ category: "unknown" }))).rejects.toThrow(
    "REDIRECT:/hr/jobs/new?error=invalid",
  );
  expect(rpc).not.toHaveBeenCalled();
  expect(
    JSON.parse(String(vi.mocked(console.info).mock.calls[0]?.[0])),
  ).toMatchObject({
    actor: jobId,
    operation: "create",
    target: "new",
    outcome: "denied",
  });
});

it("denies an enhanced schedule without a UTC conversion before the RPC", async () => {
  const rpc = vi.fn();
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(
    createHRJobDraft(
      form({
        opensAt: "",
        opensAtLocal: "2026-03-08T02:30",
        opensAtMode: "browser",
      }),
    ),
  ).rejects.toThrow("REDIRECT:/hr/jobs/new?error=invalid");
  expect(rpc).not.toHaveBeenCalled();
});

it("persists native no-JavaScript schedules as explicit UTC instants", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: jobId, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(
    createHRJobDraft(
      form({
        opensAt: "",
        opensAtLocal: "2026-10-20T10:00",
        opensAtMode: "",
      }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/jobs/${jobId}?notice=created`);
  expect(rpc).toHaveBeenCalledWith(
    "create_hr_job_draft",
    expect.objectContaining({ p_opens_at: "2026-10-20T10:00:00.000Z" }),
  );
});

it("edits and clears no-JavaScript schedule fields through the edit RPC", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: null, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });

  await expect(
    editHRJobDraft(
      form({
        opensAt: "",
        opensAtLocal: "2026-10-20T10:00",
        opensAtMode: "",
        closesAt: "",
        closesAtLocal: "2026-10-25T18:00",
        closesAtMode: "",
      }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/jobs/${jobId}?notice=saved`);
  expect(rpc).toHaveBeenLastCalledWith(
    "edit_hr_job_draft",
    expect.objectContaining({
      p_opens_at: "2026-10-20T10:00:00.000Z",
      p_closes_at: "2026-10-25T18:00:00.000Z",
    }),
  );

  rpc.mockClear();
  await expect(
    editHRJobDraft(
      form({
        opensAt: "",
        opensAtLocal: "",
        opensAtMode: "",
        closesAt: "",
        closesAtLocal: "",
        closesAtMode: "",
      }),
    ),
  ).rejects.toThrow(`REDIRECT:/hr/jobs/${jobId}?notice=saved`);
  expect(rpc).toHaveBeenLastCalledWith(
    "edit_hr_job_draft",
    expect.objectContaining({ p_opens_at: null, p_closes_at: null }),
  );
});

it("uses distinct edit, publish and close RPCs", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: jobId, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(editHRJobDraft(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=saved`,
  );
  await expect(publishHRJob(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=published`,
  );
  await expect(closeHRJob(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=closed`,
  );
  expect(rpc.mock.calls.map(([name]) => name)).toEqual([
    "edit_hr_job_draft",
    "publish_hr_job",
    "close_hr_job",
  ]);
});

it("fails closed when creating a draft throws, returns an error, or returns an invalid id", async () => {
  const rpc = vi
    .fn()
    .mockRejectedValueOnce(new Error("private transport detail"));
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(createHRJobDraft(form())).rejects.toThrow(
    "REDIRECT:/hr/jobs/new?error=save",
  );

  rpc.mockResolvedValueOnce({
    data: jobId,
    error: { message: "private db detail" },
  });
  await expect(createHRJobDraft(form())).rejects.toThrow(
    "REDIRECT:/hr/jobs/new?error=save",
  );

  rpc.mockResolvedValueOnce({ data: null, error: null });
  await expect(createHRJobDraft(form())).rejects.toThrow(
    "REDIRECT:/hr/jobs/new?error=save",
  );
  expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain(
    "private transport detail",
  );
});

it("validates the job id and fields before editing", async () => {
  const rpc = vi.fn();
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(editHRJobDraft(form({ jobId: "invalid" }))).rejects.toThrow(
    "REDIRECT:/hr/jobs?error=invalid",
  );
  await expect(
    editHRJobDraft(form({ title: "", description: "Build tools" })),
  ).rejects.toThrow(`REDIRECT:/hr/jobs/${jobId}?error=invalid`);
  expect(rpc).not.toHaveBeenCalled();
});

it("reports edit and transition RPC failures with a safe route-specific error", async () => {
  const rpc = vi
    .fn()
    .mockResolvedValueOnce({ error: { message: "private edit detail" } })
    .mockRejectedValueOnce(new Error("private publish detail"))
    .mockResolvedValueOnce({ error: { message: "private close detail" } });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });

  await expect(editHRJobDraft(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?error=save`,
  );
  await expect(publishHRJob(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?error=transition`,
  );
  await expect(closeHRJob(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?error=transition`,
  );
  expect(JSON.stringify(vi.mocked(console.info).mock.calls)).not.toContain(
    "private publish detail",
  );
});

it("rejects invalid identifiers before publish or close RPC calls", async () => {
  const rpc = vi.fn();
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(publishHRJob(form({ jobId: "invalid" }))).rejects.toThrow(
    "REDIRECT:/hr/jobs?error=invalid",
  );
  await expect(closeHRJob(form({ jobId: "invalid" }))).rejects.toThrow(
    "REDIRECT:/hr/jobs?error=invalid",
  );
  expect(rpc).not.toHaveBeenCalled();
});

it("supports unpublishing a scheduled job back to draft", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: jobId, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  await expect(unpublishHRJob(form())).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=unpublished`,
  );
  expect(rpc).toHaveBeenCalledWith("unpublish_hr_job", { p_job_id: jobId });
});

it("passes opens_at and closes_at to create and edit RPCs", async () => {
  const rpc = vi.fn().mockResolvedValue({ data: jobId, error: null });
  mocks.requireHR.mockResolvedValue({ client: { rpc }, user: { id: jobId } });
  const scheduledForm = form({
    opensAt: "2026-10-20T10:00:00.000Z",
    closesAt: "2026-10-25T18:00:00.000Z",
  });
  await expect(createHRJobDraft(scheduledForm)).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=created`,
  );
  expect(rpc).toHaveBeenCalledWith(
    "create_hr_job_draft",
    expect.objectContaining({
      p_opens_at: expect.any(String),
      p_closes_at: expect.any(String),
    }),
  );

  rpc.mockClear();
  await expect(editHRJobDraft(scheduledForm)).rejects.toThrow(
    `REDIRECT:/hr/jobs/${jobId}?notice=saved`,
  );
  expect(rpc).toHaveBeenCalledWith(
    "edit_hr_job_draft",
    expect.objectContaining({
      p_opens_at: expect.any(String),
      p_closes_at: expect.any(String),
    }),
  );
});
