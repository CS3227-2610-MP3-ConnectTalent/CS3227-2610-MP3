import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  listSubmittedApplications: vi.fn(),
  listDistinctApplicationJobs: vi.fn(),
  getSubmittedApplication: vi.fn(),
  listHRNotes: vi.fn(),
  listHRStatusEvents: vi.fn(),
  getApplicationResume: vi.fn(),
  notFound: vi.fn(),
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
  })),
}));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));
vi.mock("@/lib/hr-applications", () => ({
  listSubmittedApplications: mocks.listSubmittedApplications,
  listDistinctApplicationJobs: mocks.listDistinctApplicationJobs,
  getSubmittedApplication: mocks.getSubmittedApplication,
  listHRNotes: mocks.listHRNotes,
  listHRStatusEvents: mocks.listHRStatusEvents,
}));
vi.mock("@/lib/application-resumes", () => ({
  getApplicationResume: mocks.getApplicationResume,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: mocks.useRouter,
  useSearchParams: () => new URLSearchParams(),
}));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: false }),
  };
});
vi.mock("@/components/application-contact-details", () => ({
  ApplicationContactDetails: () =>
    createElement("div", { "data-testid": "contact" }),
}));
vi.mock("@/components/resume-panel", () => ({
  ResumePanel: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "resume",
      "data-editable": String(props.editable),
    }),
}));
vi.mock("@/components/hr-application-actions", () => ({
  HRApplicationActions: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "actions",
      "data-editable": String(props.editable),
    }),
}));
vi.mock("@/components/hr-ai-summary", () => ({
  HrAiSummary: () => createElement("div", { "data-testid": "ai-summary" }),
}));

import HRApplicationsPage from "@/app/hr/applications/page";
import HRApplicationDetail from "@/app/hr/applications/[id]/page";

const applicationId = "44000000-0000-4000-8000-000000000101";
const applicantId = "44000000-0000-4000-8000-000000000102";
const application = {
  id: applicationId,
  applicant_id: applicantId,
  job_id: "44000000-0000-4000-8000-000000000103",
  job_title: "Software Engineer",
  submitted_at: "2026-10-10T00:00:00Z",
  withdrawn_at: null,
  withdrawn_by: null,
  review_status: "in_review",
  education: "Synthetic university",
  work_experience: null,
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  original_submitted_letter: "Original synthetic letter",
  cover_letter: "Current synthetic letter",
  review_revision: 2,
  revision: 3,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHR.mockResolvedValue({ user: { id: "hr-user" }, client: {} });
  mocks.listSubmittedApplications.mockResolvedValue([]);
  mocks.listDistinctApplicationJobs.mockResolvedValue([]);
  mocks.getSubmittedApplication.mockResolvedValue(application);
  mocks.listHRNotes.mockResolvedValue([]);
  mocks.listHRStatusEvents.mockResolvedValue([]);
  mocks.getApplicationResume.mockResolvedValue({ filename: "synthetic.pdf" });
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
});

it("renders an empty HR review list, submitted rows, and a withdrawn status", async () => {
  const empty = renderToStaticMarkup(
    await HRApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(empty).toContain("No submitted applications yet.");

  mocks.listSubmittedApplications.mockResolvedValue([
    application,
    {
      ...application,
      id: "withdrawn-id",
      withdrawn_at: "2026-10-11T00:00:00Z",
    },
  ]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain("In review");
  expect(html).toContain("Withdrawn");
  expect(html).toContain(`Applicant ${applicantId}`);
  expect(html).toContain(`href="/hr/applications/${applicationId}"`);
});

it("shows a safe error when the HR application list is unavailable", async () => {
  mocks.listSubmittedApplications.mockRejectedValue(
    new Error("synthetic query detail"),
  );
  const html = renderToStaticMarkup(
    await HRApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain("Review data is temporarily unavailable");
  expect(html).not.toContain("synthetic query detail");
});

it("returns not found for an absent submitted application", async () => {
  mocks.getSubmittedApplication.mockResolvedValue(null);
  await expect(
    HRApplicationDetail({
      params: Promise.resolve({ id: applicationId }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("not-found");
  expect(mocks.listHRNotes).not.toHaveBeenCalled();
});

it("shows an unavailable message when application, notes, or history cannot load", async () => {
  mocks.getSubmittedApplication.mockRejectedValueOnce(
    new Error("synthetic query detail"),
  );
  const failedApplication = await HRApplicationDetail({
    params: Promise.resolve({ id: applicationId }),
    searchParams: Promise.resolve({}),
  });
  expect(renderToStaticMarkup(failedApplication)).toContain(
    "Review data is temporarily unavailable",
  );

  mocks.listHRNotes.mockRejectedValueOnce(new Error("synthetic notes detail"));
  const failedNotes = await HRApplicationDetail({
    params: Promise.resolve({ id: applicationId }),
    searchParams: Promise.resolve({}),
  });
  expect(renderToStaticMarkup(failedNotes)).toContain(
    "Review data is temporarily unavailable",
  );
});

it("renders active HR review details, review actions, and save feedback", async () => {
  const element = await HRApplicationDetail({
    params: Promise.resolve({ id: applicationId }),
    searchParams: Promise.resolve({ error: "status", notice: "saved" }),
  });
  const html = renderToStaticMarkup(element);
  expect(html).toContain("The change was not saved");
  expect(html).toContain("The change was saved");
  expect(html).toContain("Original cover letter");
  expect(html).toContain("Current cover letter");
  expect(html).toContain('data-testid="ai-summary"');
  expect(html).toContain('data-testid="actions" data-editable="true"');
  expect(html).toContain('data-testid="contact"');
  expect(html).toContain('data-testid="resume" data-editable="false"');
});

it("keeps withdrawn Applicant history visible and disables HR actions and AI summary", async () => {
  mocks.getSubmittedApplication.mockResolvedValue({
    ...application,
    withdrawn_at: "2026-10-11T00:00:00Z",
  });
  const html = renderToStaticMarkup(
    await HRApplicationDetail({
      params: Promise.resolve({ id: applicationId }),
      searchParams: Promise.resolve({}),
    }),
  );
  expect(html).toContain("Withdrawn by the Applicant");
  expect(html).toContain('data-testid="actions" data-editable="false"');
  expect(html).not.toContain('data-testid="ai-summary"');
  expect(html).toContain("Original synthetic letter");
});

it("filters applications by search query on applicant name", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([
    {
      ...application,
      id: "app-1",
      full_name: "Alice Adams",
    },
    {
      ...application,
      id: "app-2",
      full_name: "Bob Baker",
    },
  ]);

  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ q: "alice" }),
    }),
  );
  expect(html).toContain("Alice Adams");
  expect(html).not.toContain("Bob Baker");
});

it("filters applications by job ID and status", async () => {
  const otherJobId = "55000000-0000-4000-8000-000000000105";
  mocks.listSubmittedApplications.mockResolvedValue([
    {
      ...application,
      id: "app-1",
      full_name: "Alice Adams",
      review_status: "submitted",
    },
    {
      ...application,
      id: "app-2",
      job_id: otherJobId,
      full_name: "Bob Baker",
      review_status: "in_review",
    },
  ]);

  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ status: "in_review" }),
    }),
  );
  expect(html).toContain("Bob Baker");
  expect(html).not.toContain("Alice Adams");
});

it("displays safe error feedback for invalid search queries", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([application]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ q: "Jane\u0000Doe" }),
    }),
  );
  expect(html).toContain("Use a search phrase of at most 100 characters");
});

it("displays message when no applications match filters", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([application]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ q: "Nonexistent Person" }),
    }),
  );
  expect(html).toContain("No applications match your selected filters.");
});

it("renders pagination controls when application count exceeds page size", async () => {
  const manyApps = Array.from({ length: 15 }, (_, i) => ({
    ...application,
    id: `44000000-0000-4000-8000-${String(i + 1).padStart(12, "0")}`,
    full_name: `Applicant ${i + 1}`,
  }));
  mocks.listSubmittedApplications.mockResolvedValue(manyApps);

  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ page: "1", sort: "oldest" }),
    }),
  );
  expect(html).toMatch(/Showing.*1.*to.*10.*of.*15.*applications/);
  expect(html).toContain("Page 1 of 2");
  expect(html).toContain(">Applicant 1<");
  expect(html).not.toContain(">Applicant 15<");
});
