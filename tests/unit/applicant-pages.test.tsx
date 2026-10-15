import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listOwnApplications: vi.fn(),
  requireApplicant: vi.fn(),
  getOwnApplication: vi.fn(),
  getApplicationResume: vi.fn(),
  getProfileResume: vi.fn(),
  getPublishedJob: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/applications", () => ({
  listOwnApplications: mocks.listOwnApplications,
  getOwnApplication: mocks.getOwnApplication,
}));
vi.mock("@/lib/auth", () => ({ requireApplicant: mocks.requireApplicant }));
vi.mock("@/lib/application-resumes", () => ({
  getApplicationResume: mocks.getApplicationResume,
}));
vi.mock("@/lib/profile-resumes", () => ({
  getProfileResume: mocks.getProfileResume,
}));
vi.mock("@/lib/jobs", () => ({ getPublishedJob: mocks.getPublishedJob }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: false }),
  };
});
vi.mock("@/components/application-contact-details", () => ({
  ApplicationContactDetails: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "contact-details",
      "data-email": props.submitted_email,
    }),
}));
vi.mock("@/components/application-form", () => ({
  ApplicationForm: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "application-form",
      "data-submitted": String(props.submitted),
    }),
}));
vi.mock("@/components/resume-panel", () => ({
  ResumePanel: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "resume-panel",
      "data-editable": String(props.editable),
    }),
}));
vi.mock("@/components/withdrawal-control", () => ({
  WithdrawalControl: () =>
    createElement("div", { "data-testid": "withdrawal-control" }),
}));

import ApplicationsPage from "@/app/applications/page";
import ApplicationDetail from "@/app/applications/[id]/page";

const application = {
  id: "44000000-0000-4000-8000-000000000101",
  job_id: "44000000-0000-4000-8000-000000000102",
  job_title: "Software Engineer",
  applicant_id: "44000000-0000-4000-8000-000000000103",
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  education: null,
  work_experience: null,
  submission_state: "submitted",
  withdrawn_at: null,
  withdrawn_by: null,
  review_status: "in_review",
  cover_letter: "Current synthetic letter",
  original_submitted_letter: "Original synthetic letter",
  revision: 3,
  submitted_at: "2026-10-10T00:00:00Z",
  updated_at: "2026-10-10T00:00:00Z",
};
const job = {
  id: application.job_id,
  title: application.job_title,
  team: "Digital Products",
  category: "engineering",
  description: "Synthetic role description",
  requirements: "Synthetic requirements",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listOwnApplications.mockResolvedValue([]);
  mocks.requireApplicant.mockResolvedValue({
    user: { email: "applicant@example.test" },
  });
  mocks.getOwnApplication.mockResolvedValue(application);
  mocks.getApplicationResume.mockResolvedValue({ filename: "synthetic.pdf" });
  mocks.getProfileResume.mockResolvedValue({ filename: "profile.pdf" });
  mocks.getPublishedJob.mockResolvedValue(job);
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
});

it("shows empty application state and separates correction from generic save errors", async () => {
  const empty = renderToStaticMarkup(
    await ApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(empty).toContain("No applications yet.");

  const correction = renderToStaticMarkup(
    await ApplicationsPage({
      searchParams: Promise.resolve({ error: "correction" }),
    }),
  );
  expect(correction).toContain("Submitted applications are locked");

  const generic = renderToStaticMarkup(
    await ApplicationsPage({
      searchParams: Promise.resolve({ error: "save" }),
    }),
  );
  expect(generic).toContain("Your change was not saved");
});

it("labels withdrawn, draft, submitted, and reviewed Applicant application rows", async () => {
  mocks.listOwnApplications.mockResolvedValue([
    { ...application, withdrawn_at: "2026-10-11T00:00:00Z" },
    {
      ...application,
      id: "draft-id",
      submission_state: "draft",
      review_status: null,
    },
    {
      ...application,
      id: "submitted-id",
      submission_state: "submitted",
      review_status: null,
    },
    {
      ...application,
      id: "reviewed-id",
      submission_state: "submitted",
      review_status: "shortlisted",
    },
  ]);
  const html = renderToStaticMarkup(
    await ApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain("Withdrawn");
  expect(html).toContain("Saved draft");
  expect(html).toContain("Submitted");
  expect(html).toContain("Shortlisted");
  expect(html).toContain('href="/applications/draft-id"');
});

it("returns not found when the Applicant does not own an application", async () => {
  mocks.getOwnApplication.mockResolvedValue(null);
  await expect(
    ApplicationDetail({
      params: Promise.resolve({ id: "missing" }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("not-found");
});

it("renders submitted letter, status, withdrawal, and already-submitted notice", async () => {
  const element = await ApplicationDetail({
    params: Promise.resolve({ id: application.id }),
    searchParams: Promise.resolve({ notice: "already-submitted" }),
  });
  const html = renderToStaticMarkup(element);
  expect(html).toContain("This application was already submitted");
  expect(html).toContain("Submitted application");
  expect(html).toContain("In review");
  expect(html).toContain('data-testid="withdrawal-control"');
  expect(html).toContain("Original submission");
  expect(html).toContain("Original synthetic letter");
  expect(html).toContain('data-testid="contact-details"');
  expect(html).toContain('data-testid="resume-panel"');
});

it("renders a withdrawn submitted application with no further Applicant action", async () => {
  mocks.getOwnApplication.mockResolvedValue({
    ...application,
    withdrawn_at: "2026-10-11T00:00:00Z",
  });
  mocks.getPublishedJob.mockResolvedValue(null);
  const element = await ApplicationDetail({
    params: Promise.resolve({ id: application.id }),
    searchParams: Promise.resolve({ notice: "saved" }),
  });
  const html = renderToStaticMarkup(element);
  expect(html).toContain("Your change was already saved");
  expect(html).toContain("Withdrawn — this application is retained");
  expect(html).toContain("This job is no longer open");
  expect(html).not.toContain('data-testid="withdrawal-control"');
  expect(html).toContain('data-testid="contact-details"');
  expect(mocks.getProfileResume).not.toHaveBeenCalled();
});

it("renders an editable draft form while its job is open", async () => {
  mocks.getOwnApplication.mockResolvedValue({
    ...application,
    submission_state: "draft",
    review_status: null,
  });
  const element = await ApplicationDetail({
    params: Promise.resolve({ id: application.id }),
    searchParams: Promise.resolve({}),
  });
  const html = renderToStaticMarkup(element);
  expect(html).toContain("Saved draft");
  expect(html).toContain(
    'data-testid="application-form" data-submitted="false"',
  );
  expect(html).not.toContain('data-testid="contact-details"');
  expect(html).not.toContain('data-testid="resume-panel"');
  expect(mocks.getProfileResume).toHaveBeenCalledOnce();
});

it("keeps a draft readable without its job and displays an empty saved letter", async () => {
  mocks.getOwnApplication.mockResolvedValue({
    ...application,
    submission_state: "draft",
    cover_letter: "",
    review_status: null,
  });
  mocks.getPublishedJob.mockResolvedValue(null);
  const html = renderToStaticMarkup(
    await ApplicationDetail({
      params: Promise.resolve({ id: application.id }),
      searchParams: Promise.resolve({}),
    }),
  );
  expect(html).toContain("This job is no longer open");
  expect(html).toContain("Saved letter");
  expect(html).toContain("(empty draft)");
  expect(html).toContain('data-testid="resume-panel"');
  expect(html).toContain('data-testid="contact-details"');
});
