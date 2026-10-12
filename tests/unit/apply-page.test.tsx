import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  getApplicationResume: vi.fn(),
  getProfileResume: vi.fn(),
  getApplicantProfile: vi.fn(),
  getOwnApplicationForJob: vi.fn(),
  getPublishedJob: vi.fn(),
  requireApplicant: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/application-resumes", () => ({
  getApplicationResume: mocks.getApplicationResume,
}));
vi.mock("@/lib/profile-resumes", () => ({
  getProfileResume: mocks.getProfileResume,
}));
vi.mock("@/lib/applicant-profile", () => ({
  getApplicantProfile: mocks.getApplicantProfile,
}));
vi.mock("@/lib/applications", () => ({
  getOwnApplicationForJob: mocks.getOwnApplicationForJob,
}));
vi.mock("@/lib/jobs", () => ({ getPublishedJob: mocks.getPublishedJob }));
vi.mock("@/lib/auth", () => ({ requireApplicant: mocks.requireApplicant }));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
  };
});
vi.mock("@/components/application-form", () => ({
  ApplicationForm: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "application-form",
      "data-email": props.email,
      "data-submitted": String(props.submitted),
      "data-application-id": String(props.applicationId),
    }),
}));
vi.mock("@/components/resume-panel", () => ({
  ResumePanel: (props: Record<string, unknown>) =>
    createElement("div", {
      "data-testid": "resume-panel",
      "data-editable": String(props.editable),
    }),
}));

import ApplyPage from "@/app/jobs/[id]/apply/page";

const job = {
  id: "90000000-0000-4000-8000-000000000b01",
  title: "Synthetic engineer",
  team: "Synthetic team",
  category: "engineering",
  description: "Synthetic description",
  requirements: "Synthetic requirements",
};
const application = {
  id: "90000000-0000-4000-8000-000000000b02",
  job_id: job.id,
  job_title: job.title,
  applicant_id: "90000000-0000-4000-8000-000000000b03",
  full_name: "Synthetic Applicant",
  submitted_email: "applicant@example.test",
  phone: "+6591234567",
  portfolio_url: null,
  education: null,
  work_experience: null,
  submission_state: "draft",
  withdrawn_at: null,
  withdrawn_by: null,
  review_status: "submitted",
  cover_letter: "Synthetic letter",
  original_submitted_letter: "Synthetic original letter",
  revision: 4,
  submitted_at: null,
  updated_at: "2026-10-10T00:00:00Z",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.getPublishedJob.mockResolvedValue(job);
  mocks.requireApplicant.mockResolvedValue({
    user: { email: "applicant@example.test" },
  });
  mocks.getOwnApplicationForJob.mockResolvedValue(null);
  mocks.getApplicantProfile.mockResolvedValue({
    full_name: "Synthetic Applicant",
    phone: "+6591234567",
    portfolio_url: null,
    education: null,
    work_experience: null,
  });
  mocks.getApplicationResume.mockResolvedValue(null);
  mocks.getProfileResume.mockResolvedValue(null);
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
});

function renderPage(searchParams: Record<string, string> = {}) {
  return ApplyPage({
    params: Promise.resolve({ id: job.id }),
    searchParams: Promise.resolve(searchParams),
  });
}

it("stops at not-found before Applicant data reads when the job is unavailable", async () => {
  mocks.getPublishedJob.mockResolvedValue(null);
  await expect(renderPage()).rejects.toThrow("not-found");
  expect(mocks.requireApplicant).not.toHaveBeenCalled();
  expect(mocks.getOwnApplicationForJob).not.toHaveBeenCalled();
});

it("loads profile-backed application details and shows a save error without a résumé panel", async () => {
  const html = renderToStaticMarkup(await renderPage({ error: "save" }));
  expect(html).toContain("Apply for Synthetic engineer");
  expect(html).toContain("We could not save your change");
  expect(html).toContain('data-email="applicant@example.test"');
  expect(html).toContain('data-application-id="null"');
  expect(html).not.toContain("resume-panel");
  expect(mocks.getApplicantProfile).toHaveBeenCalledOnce();
  expect(mocks.getApplicationResume).not.toHaveBeenCalled();
});

it("renders an existing draft without replacing its saved profile details", async () => {
  mocks.getOwnApplicationForJob.mockResolvedValue(application);
  mocks.getApplicationResume.mockResolvedValue({ filename: "draft.pdf" });
  const html = renderToStaticMarkup(await renderPage());
  expect(html).toContain("Apply for Synthetic engineer");
  expect(html).toContain('data-submitted="false"');
  expect(html).toContain(`data-application-id="${application.id}"`);
  expect(mocks.getApplicantProfile).not.toHaveBeenCalled();
  expect(mocks.getApplicationResume).toHaveBeenCalledWith(application.id);
  expect(html).not.toContain("resume-panel");
});

it("locks a submitted application and displays its read-only résumé panel", async () => {
  mocks.getOwnApplicationForJob.mockResolvedValue({
    ...application,
    submission_state: "submitted",
  });
  const html = renderToStaticMarkup(await renderPage());
  expect(html).toContain("Application submitted");
  expect(html).toContain('data-submitted="true"');
  expect(html).toContain('data-testid="resume-panel"');
  expect(html).toContain('data-editable="false"');
});
