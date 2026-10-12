import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  listHRJobs: vi.fn(),
  listSubmittedApplications: vi.fn(),
}));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));
vi.mock("@/lib/hr-jobs", () => ({ listHRJobs: mocks.listHRJobs }));
vi.mock("@/lib/hr-applications", () => ({
  listSubmittedApplications: mocks.listSubmittedApplications,
}));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
  };
});

import HRDashboardPage from "@/app/hr/page";

const jobs = [
  {
    id: "44000000-0000-4000-8000-000000000101",
    title: "Synthetic dashboard role",
    status: "published",
  },
];
const applications = [
  {
    job_id: jobs[0].id,
    job_title: jobs[0].title,
    review_status: "submitted",
    withdrawn_at: null,
    applicant_id: "44000000-0000-4000-8000-000000000111",
    submitted_email: "private-applicant@example.test",
    full_name: "Private Synthetic Applicant",
    cover_letter: "Private synthetic letter",
    notes: "Private synthetic HR note",
    resume_filename: "private-resume.pdf",
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHR.mockResolvedValue({ user: { id: "hr-user" }, client: {} });
  mocks.listHRJobs.mockResolvedValue(jobs);
  mocks.listSubmittedApplications.mockResolvedValue(applications);
});

it("renders aggregate counts and existing HR links without applicant data", async () => {
  const html = renderToStaticMarkup(await HRDashboardPage());

  expect(html).toContain("HR dashboard");
  expect(html).toContain("Draft jobs");
  expect(html).toContain("Application review");
  const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  expect(visibleText).toContain("Published jobs 1");
  expect(visibleText).toContain("Submitted 1");
  expect(visibleText).toContain("Synthetic dashboard role");
  expect(html).toContain('href="/hr/jobs"');
  expect(html).toContain('href="/hr/applications"');
  expect(html).toContain(`href="/hr/jobs/${jobs[0].id}"`);
  expect(html).not.toContain("private-applicant@example.test");
  expect(html).not.toContain("Private Synthetic Applicant");
  expect(html).not.toContain("Private synthetic letter");
  expect(html).not.toContain("Private synthetic HR note");
  expect(html).not.toContain("private-resume.pdf");
});

it("renders zero totals and clear guidance when HR has no jobs or applications", async () => {
  mocks.listHRJobs.mockResolvedValueOnce([]);
  mocks.listSubmittedApplications.mockResolvedValueOnce([]);

  const html = renderToStaticMarkup(await HRDashboardPage());
  const visibleText = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");

  expect(visibleText).toContain("Draft jobs 0 Published jobs 0 Closed jobs 0");
  expect(visibleText).toContain(
    "Submitted 0 In review 0 Shortlisted 0 Rejected 0 Withdrawn 0",
  );
  expect(html).toContain("No jobs yet. Create a draft to begin.");
});
it.each(["jobs", "applications"] as const)(
  "shows no partial data or query details when the %s read fails",
  async (failedRead) => {
    const failure = new Error("synthetic database query details");
    if (failedRead === "jobs") mocks.listHRJobs.mockRejectedValueOnce(failure);
    else mocks.listSubmittedApplications.mockRejectedValueOnce(failure);

    const html = renderToStaticMarkup(await HRDashboardPage());

    expect(html).toContain("Recruitment overview is temporarily unavailable");
    expect(html).not.toContain("Draft jobs");
    expect(html).not.toContain("Synthetic dashboard role");
    expect(html).not.toContain("synthetic database query details");
  },
);

it("lets the existing HR authorization denial escape before either read", async () => {
  mocks.requireHR.mockRejectedValueOnce(new Error("not-found"));

  await expect(HRDashboardPage()).rejects.toThrow("not-found");
  expect(mocks.listHRJobs).not.toHaveBeenCalled();
  expect(mocks.listSubmittedApplications).not.toHaveBeenCalled();
});
