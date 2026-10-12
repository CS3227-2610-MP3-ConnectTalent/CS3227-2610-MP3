import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({ requireHR: vi.fn() }));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));

import { listSubmittedApplications } from "@/lib/hr-applications";

beforeEach(() => {
  vi.clearAllMocks();
});

it("returns job IDs from the authorized submitted-application list query", async () => {
  const jobId = "44000000-0000-4000-8000-000000000103";
  const row = {
    id: "44000000-0000-4000-8000-000000000101",
    applicant_id: "44000000-0000-4000-8000-000000000102",
    job_id: jobId,
    job_title: "Synthetic role",
    submitted_at: "2026-10-10T00:00:00Z",
    withdrawn_at: null,
    withdrawn_by: null,
    review_status: "submitted",
  };
  const order = vi.fn().mockResolvedValue({ data: [row], error: null });
  const eq = vi.fn().mockReturnValue({ order });
  const select = vi.fn().mockReturnValue({ eq });
  mocks.requireHR.mockResolvedValue({
    client: { from: () => ({ select }) },
  });

  const applications = await listSubmittedApplications();

  expect(select).toHaveBeenCalledWith(expect.stringContaining("job_id"));
  expect(applications[0]).toMatchObject({ job_id: jobId });
});
