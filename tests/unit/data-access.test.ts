import { afterEach, beforeEach, expect, it, vi } from "vitest";

const auth = vi.hoisted(() => ({
  requireApplicant: vi.fn(),
  requireHR: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({ requireApplicant: auth.requireApplicant }));
vi.mock("@/lib/hr-auth", () => ({ requireHR: auth.requireHR }));

import { getApplicantProfile } from "@/lib/applicant-profile";
import {
  getOwnApplication,
  getOwnApplicationForJob,
  listOwnApplications,
} from "@/lib/applications";
import {
  getSubmittedApplication,
  listHRNotes,
  listHRStatusEvents,
  listSubmittedApplications,
} from "@/lib/hr-applications";
import { getHRJob, listHRJobs } from "@/lib/hr-jobs";

const applicantId = "44000000-0000-4000-8000-000000000101";
const jobId = "44000000-0000-4000-8000-000000000102";
const applicationId = "44000000-0000-4000-8000-000000000103";

let result: { data: unknown; error: { message: string } | null };
let query: {
  select: ReturnType<typeof vi.fn<(fields: string) => void>>;
  eq: ReturnType<typeof vi.fn<(field: string, expected: unknown) => void>>;
  order: ReturnType<typeof vi.fn<(field: string, options: unknown) => void>>;
  gt: ReturnType<typeof vi.fn<(field: string, value: string) => void>>;
  limit: ReturnType<typeof vi.fn<(count: number) => void>>;
};
let client: { from: ReturnType<typeof vi.fn> };

function configureQuery(value: typeof result) {
  result = value;
  query = {
    select: vi.fn(),
    eq: vi.fn(),
    order: vi.fn(),
    gt: vi.fn(),
    limit: vi.fn(),
  };
  const builder = () => ({
    select: (fields: string) => {
      query.select(fields);
      return builder();
    },
    eq: (field: string, expected: unknown) => {
      query.eq(field, expected);
      return builder();
    },
    order: (field: string, options: unknown) => {
      query.order(field, options);
      return builder();
    },
    gt: (field: string, value: string) => {
      query.gt(field, value);
      return builder();
    },
    limit: (count: number) => {
      query.limit(count);
      return Promise.resolve(result);
    },
    maybeSingle: () => Promise.resolve(result),
  });
  client = { from: vi.fn(() => builder()) };
  auth.requireApplicant.mockResolvedValue({
    client,
    user: { id: applicantId },
  });
  auth.requireHR.mockResolvedValue({ client, user: { id: applicantId } });
}

const application = {
  withdrawn_at: null,
  withdrawn_by: null,
  education: "Synthetic university",
  work_experience: null,
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  id: applicationId,
  job_id: jobId,
  job_title: "Software Engineer",
  submission_state: "submitted",
  cover_letter: "Synthetic submitted letter",
  original_submitted_letter: "Synthetic submitted letter",
  submitted_at: "2026-10-10T00:00:00Z",
  updated_at: "2026-10-10T00:00:00Z",
  revision: 1,
  review_status: "in_review",
};

const hrApplication = {
  withdrawn_at: null,
  withdrawn_by: null,
  id: applicationId,
  applicant_id: applicantId,
  job_id: jobId,
  job_title: "Software Engineer",
  submitted_at: "2026-10-10T00:00:00Z",
  review_status: "in_review",
  education: null,
  work_experience: null,
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  original_submitted_letter: "Original synthetic letter",
  cover_letter: "Current synthetic letter",
  review_revision: 1,
  revision: 1,
};

const job = {
  id: jobId,
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build synthetic tools.",
  requirements: "TypeScript and testing.",
  status: "published",
  created_at: "2026-10-10T00:00:00Z",
  published_at: "2026-10-10T00:00:00Z",
};

beforeEach(() => configureQuery({ data: null, error: null }));
afterEach(() => vi.clearAllMocks());

it("loads the current applicant profile or returns the empty profile", async () => {
  await expect(getApplicantProfile()).resolves.toEqual({
    full_name: null,
    phone: null,
    portfolio_url: null,
    education: null,
    work_experience: null,
  });
  configureQuery({
    data: {
      full_name: "Synthetic Applicant",
      phone: "+6591234567",
      portfolio_url: null,
      education: null,
      work_experience: null,
    },
    error: null,
  });
  await expect(getApplicantProfile()).resolves.toMatchObject({
    full_name: "Synthetic Applicant",
  });
  expect(client.from).toHaveBeenCalledWith("applicant_profiles");
});

it("fails closed when profile or application reads return database errors", async () => {
  configureQuery({
    data: null,
    error: { message: "synthetic database error" },
  });
  await expect(getApplicantProfile()).rejects.toThrow("Profile is unavailable");
  await expect(listOwnApplications()).rejects.toThrow(
    "Unable to load applications",
  );
  await expect(getOwnApplication(applicationId)).rejects.toThrow(
    "Unable to load application",
  );
  await expect(getOwnApplicationForJob(jobId)).rejects.toThrow(
    "Unable to load application",
  );
  await expect(listSubmittedApplications()).rejects.toThrow(
    "Review data is unavailable",
  );
  await expect(getSubmittedApplication(applicationId)).rejects.toThrow(
    "Review data is unavailable",
  );
  await expect(listHRNotes(applicationId)).rejects.toThrow(
    "Review data is unavailable",
  );
  await expect(listHRStatusEvents(applicationId)).rejects.toThrow(
    "Review data is unavailable",
  );
  await expect(listHRJobs()).rejects.toThrow(
    "Jobs are temporarily unavailable",
  );
  await expect(getHRJob(jobId)).rejects.toThrow(
    "Job is temporarily unavailable",
  );
});

it("returns validated Applicant application lists and owner-scoped details", async () => {
  configureQuery({ data: [application], error: null });
  await expect(listOwnApplications()).resolves.toEqual([application]);
  expect(query.eq).toHaveBeenCalledWith("applicant_id", applicantId);
  expect(query.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(query.limit).toHaveBeenCalledWith(500);

  configureQuery({ data: application, error: null });
  await expect(getOwnApplication(applicationId)).resolves.toEqual(application);
  await expect(getOwnApplicationForJob(jobId)).resolves.toEqual(application);
  expect(query.eq).toHaveBeenCalledWith("applicant_id", applicantId);
});

it("does not query Applicant application details for malformed identifiers", async () => {
  await expect(getOwnApplication("invalid-id")).resolves.toBeNull();
  await expect(getOwnApplicationForJob("invalid-id")).resolves.toBeNull();
  expect(auth.requireApplicant).not.toHaveBeenCalled();
});

it("returns no Applicant detail when no matching row exists", async () => {
  await expect(getOwnApplication(applicationId)).resolves.toBeNull();
  await expect(getOwnApplicationForJob(jobId)).resolves.toBeNull();
});

it("lists and validates submitted HR applications, notes, events, and details", async () => {
  configureQuery({ data: [hrApplication], error: null });
  await expect(listSubmittedApplications()).resolves.toEqual([
    expect.objectContaining({ id: applicationId, review_status: "in_review" }),
  ]);
  expect(query.eq).toHaveBeenCalledWith("submission_state", "submitted");
  expect(query.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(query.limit).toHaveBeenCalledWith(500);

  configureQuery({ data: hrApplication, error: null });
  await expect(getSubmittedApplication(applicationId)).resolves.toMatchObject({
    id: applicationId,
    original_submitted_letter: "Original synthetic letter",
  });

  configureQuery({
    data: [
      {
        id: "44000000-0000-4000-8000-000000000104",
        author_id: applicantId,
        body: "Synthetic private note",
        created_at: "2026-10-10T00:00:00Z",
      },
    ],
    error: null,
  });
  await expect(listHRNotes(applicationId)).resolves.toHaveLength(1);
  expect(query.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(query.limit).toHaveBeenCalledWith(500);

  configureQuery({
    data: [
      {
        id: "44000000-0000-4000-8000-000000000105",
        actor_id: applicantId,
        from_status: "in_review",
        to_status: "shortlisted",
        created_at: "2026-10-10T00:00:00Z",
      },
    ],
    error: null,
  });
  await expect(listHRStatusEvents(applicationId)).resolves.toHaveLength(1);
  expect(query.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(query.limit).toHaveBeenCalledWith(500);
});

it("does not query HR application details for malformed identifiers", async () => {
  await expect(getSubmittedApplication("invalid-id")).resolves.toBeNull();
  expect(auth.requireHR).not.toHaveBeenCalled();
});

it("returns validated HR jobs and returns null for invalid or absent jobs", async () => {
  configureQuery({ data: [job], error: null });
  await expect(listHRJobs()).resolves.toEqual([job]);
  expect(query.order).toHaveBeenCalledWith("id", { ascending: true });
  expect(query.limit).toHaveBeenCalledWith(500);

  configureQuery({ data: job, error: null });
  await expect(getHRJob(jobId)).resolves.toEqual(job);
  await expect(getHRJob("invalid-id")).resolves.toBeNull();
  configureQuery({ data: null, error: null });
  await expect(getHRJob(jobId)).resolves.toBeNull();
});
