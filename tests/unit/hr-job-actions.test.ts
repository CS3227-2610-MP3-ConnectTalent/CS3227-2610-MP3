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
