import { afterEach, beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  requireApplicant: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApplicant: auth.requireApplicant }));

import {
  getOwnApplication,
  getOwnApplicationForJob,
  listOwnApplications,
} from "@/lib/applications";

const applicantId = "11111111-1111-4111-8111-111111111111";
const jobId = "22222222-2222-4222-8222-222222222222";
const withdrawnAppId = "33333333-3333-4333-8333-333333333331";
const activeAppId = "33333333-3333-4333-8333-333333333332";

const withdrawnApplication = {
  id: withdrawnAppId,
  job_id: jobId,
  job_title: "Software Engineer",
  full_name: "Original Name",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  education: "University A",
  work_experience: "Company A",
  submission_state: "submitted",
  cover_letter: "First application letter",
  original_submitted_letter: "First application letter",
  withdrawn_at: "2026-10-11T12:00:00Z",
  withdrawn_by: applicantId,
  submitted_at: "2026-10-10T12:00:00Z",
  updated_at: "2026-10-11T12:00:00Z",
  revision: 2,
  review_status: null,
};

const activeApplication = {
  id: activeAppId,
  job_id: jobId,
  job_title: "Software Engineer",
  full_name: "Original Name",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  education: "University A",
  work_experience: "Company B",
  submission_state: "submitted",
  cover_letter: "Second application letter after reapplication",
  original_submitted_letter: "Second application letter after reapplication",
  withdrawn_at: null,
  withdrawn_by: null,
  submitted_at: "2026-10-16T12:00:00Z",
  updated_at: "2026-10-16T12:00:00Z",
  revision: 1,
  review_status: null,
};

let capturedQuery: {
  filters: { type: string; column: string; value: unknown }[];
};
let mockResult: { data: unknown; error: unknown };

function createMockClient() {
  capturedQuery = { filters: [] };
  const builder = () => ({
    select: () => builder(),
    eq: (column: string, value: unknown) => {
      capturedQuery.filters.push({ type: "eq", column, value });
      return builder();
    },
    is: (column: string, value: unknown) => {
      capturedQuery.filters.push({ type: "is", column, value });
      return builder();
    },
    gt: (column: string, value: unknown) => {
      capturedQuery.filters.push({ type: "gt", column, value });
      return builder();
    },
    order: () => builder(),
    limit: () => Promise.resolve(mockResult),
    maybeSingle: () => Promise.resolve(mockResult),
  });
  return {
    from: vi.fn(() => builder()),
  };
}

beforeEach(() => {
  mockResult = { data: null, error: null };
  const client = createMockClient();
  auth.requireApplicant.mockResolvedValue({
    client,
    user: { id: applicantId },
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

it("getOwnApplicationForJob filters for active (withdrawn_at IS NULL) application", async () => {
  mockResult = { data: activeApplication, error: null };
  const app = await getOwnApplicationForJob(jobId);
  expect(app).toEqual(activeApplication);
  expect(capturedQuery.filters).toContainEqual({
    type: "eq",
    column: "applicant_id",
    value: applicantId,
  });
  expect(capturedQuery.filters).toContainEqual({
    type: "eq",
    column: "job_id",
    value: jobId,
  });
  expect(capturedQuery.filters).toContainEqual({
    type: "is",
    column: "withdrawn_at",
    value: null,
  });
});

it("getOwnApplicationForJob returns null when only a withdrawn application exists", async () => {
  mockResult = { data: null, error: null };
  const app = await getOwnApplicationForJob(jobId);
  expect(app).toBeNull();
});

it("getOwnApplication allows reading a historical withdrawn application by ID", async () => {
  mockResult = { data: withdrawnApplication, error: null };
  const app = await getOwnApplication(withdrawnAppId);
  expect(app).toEqual(withdrawnApplication);
  expect(capturedQuery.filters).toContainEqual({
    type: "eq",
    column: "id",
    value: withdrawnAppId,
  });
  // Does NOT filter out withdrawn_at when retrieving directly by ID
  expect(capturedQuery.filters).not.toContainEqual({
    type: "is",
    column: "withdrawn_at",
    value: null,
  });
});

it("listOwnApplications returns both active and withdrawn applications in history", async () => {
  mockResult = {
    data: [withdrawnApplication, activeApplication],
    error: null,
  };
  const list = await listOwnApplications();
  expect(list).toHaveLength(2);
  expect(list.some((a) => a.id === withdrawnAppId)).toBe(true);
  expect(list.some((a) => a.id === activeAppId)).toBe(true);
});
