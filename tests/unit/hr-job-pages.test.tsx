import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  listHRJobs: vi.fn(),
  getHRJob: vi.fn(),
  notFound: vi.fn(),
}));

vi.mock("@/lib/hr-auth", () => ({ requireHR: mocks.requireHR }));
vi.mock("@/lib/hr-jobs", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/hr-jobs")>();
  return {
    ...actual,
    listHRJobs: mocks.listHRJobs,
    getHRJob: mocks.getHRJob,
  };
});
vi.mock("@/app/hr/jobs/actions", () => ({
  createHRJobDraft: "/create-job",
  closeHRJob: "/close-job",
  editHRJobDraft: "/edit-job",
  publishHRJob: "/publish-job",
  unpublishHRJob: "/unpublish-job",
}));
vi.mock("next/navigation", () => ({ notFound: mocks.notFound }));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: false }),
  };
});

import HRJobDetail from "@/app/hr/jobs/[id]/page";
import NewHRJobPage from "@/app/hr/jobs/new/page";
import HRJobsPage from "@/app/hr/jobs/page";

const job = {
  id: "44000000-0000-4000-8000-000000000101",
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build synthetic tools.",
  requirements: "TypeScript and testing.",
  status: "draft",
  created_at: "2026-10-10T00:00:00Z",
  published_at: null,
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHR.mockResolvedValue({ user: { id: "hr-user" }, client: {} });
  mocks.listHRJobs.mockResolvedValue([]);
  mocks.getHRJob.mockResolvedValue(job);
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
});

it("renders empty and unavailable HR job lists", async () => {
  const empty = renderToStaticMarkup(await HRJobsPage());
  expect(empty).toContain("No jobs yet");
  expect(empty).toContain('href="/hr/jobs/new"');

  mocks.listHRJobs.mockRejectedValue(new Error("synthetic database detail"));
  const unavailable = renderToStaticMarkup(await HRJobsPage());
  expect(unavailable).toContain("Jobs are temporarily unavailable");
  expect(unavailable).not.toContain("synthetic database detail");
});

it("labels each HR job state in the management list", async () => {
  mocks.listHRJobs.mockResolvedValue([
    job,
    {
      ...job,
      id: "scheduled-id",
      title: "Scheduled role",
      status: "published",
      opens_at: "2099-01-01T00:00:00Z",
    },
    {
      ...job,
      id: "published-id",
      title: "Published role",
      status: "published",
    },
    { ...job, id: "closed-id", title: "Closed role", status: "closed" },
  ]);
  const html = renderToStaticMarkup(await HRJobsPage());
  expect(html).toContain("Draft");
  expect(html).toContain("Scheduled");
  expect(html).toContain("Published");
  expect(html).toContain("Closed");
  expect(html).toContain('href="/hr/jobs/scheduled-id"');
  expect(html).toContain('href="/hr/jobs/published-id"');
});

it("renders a new job editor with all categories and an optional validation notice", async () => {
  const newPage = renderToStaticMarkup(
    await NewHRJobPage({ searchParams: Promise.resolve({}) }),
  );
  expect(newPage).toContain("Create job draft");
  expect(newPage).toContain(
    "This job stays private until you publish it separately.",
  );
  expect(newPage).not.toContain('role="alert"');
  expect(newPage).toContain('name="title"');
  expect(newPage).toContain('name="team"');
  expect(newPage).toContain('name="category"');
  expect(newPage).toContain('value="engineering"');
  expect(newPage).toContain('value="human_resources"');
  expect(newPage).toContain('name="description"');
  expect(newPage).toContain('name="requirements"');

  const errorPage = renderToStaticMarkup(
    await NewHRJobPage({ searchParams: Promise.resolve({ error: "invalid" }) }),
  );
  expect(errorPage).toContain("The draft was not saved");
});

it("renders a safe unavailable state and not found for HR job details", async () => {
  mocks.getHRJob.mockRejectedValueOnce(new Error("synthetic query detail"));
  const unavailable = await HRJobDetail({
    params: Promise.resolve({ id: job.id }),
    searchParams: Promise.resolve({}),
  });
  expect(renderToStaticMarkup(unavailable)).toContain(
    "Job is temporarily unavailable",
  );

  mocks.getHRJob.mockResolvedValueOnce(null);
  await expect(
    HRJobDetail({
      params: Promise.resolve({ id: job.id }),
      searchParams: Promise.resolve({}),
    }),
  ).rejects.toThrow("not-found");
});

it("renders editable draft controls and save or publish feedback", async () => {
  mocks.getHRJob.mockResolvedValueOnce({
    ...job,
    opens_at: "2026-01-15T01:00:00.000Z",
  });
  const html = renderToStaticMarkup(
    await HRJobDetail({
      params: Promise.resolve({ id: job.id }),
      searchParams: Promise.resolve({ error: "invalid", notice: "created" }),
    }),
  );
  expect(html).toContain("Draft");
  expect(html).toContain("The change was not saved");
  expect(html).toContain("The change was saved");
  expect(html).toContain("Edit draft");
  expect(html).toContain("Publish job");
  expect(html).toContain(`value="${job.id}"`);
  expect(html).toContain('type="datetime-local"');
  expect(html).toContain('name="opensAt"');
  expect(html).toContain('value="2026-01-15T01:00:00.000Z"');
  expect(html).toContain("Uses your browser timezone");
});

it("renders published job text and closing controls but no close action for a closed job", async () => {
  mocks.getHRJob.mockResolvedValueOnce({ ...job, status: "published" });
  const published = renderToStaticMarkup(
    await HRJobDetail({
      params: Promise.resolve({ id: job.id }),
      searchParams: Promise.resolve({}),
    }),
  );
  expect(published).toContain("Published");
  expect(published).toContain("Description");
  expect(published).toContain("Requirements");
  expect(published).toContain("Close job");

  mocks.getHRJob.mockResolvedValueOnce({ ...job, status: "closed" });
  const closed = renderToStaticMarkup(
    await HRJobDetail({
      params: Promise.resolve({ id: job.id }),
      searchParams: Promise.resolve({}),
    }),
  );
  expect(closed).toContain("Closed");
  expect(closed).not.toContain("Close job");
});

it("renders scheduled job controls with revert to draft action", async () => {
  mocks.getHRJob.mockResolvedValueOnce({
    ...job,
    status: "published",
    opens_at: "2099-01-01T00:00:00Z",
    closes_at: "2099-02-01T00:00:00Z",
  });
  const scheduled = renderToStaticMarkup(
    await HRJobDetail({
      params: Promise.resolve({ id: job.id }),
      searchParams: Promise.resolve({ notice: "unpublished" }),
    }),
  );
  expect(scheduled).toContain("Scheduled");
  expect(scheduled).toContain("Scheduled to open on");
  expect(scheduled).toContain("UTC");
  expect(scheduled).toContain('dateTime="2099-01-01T00:00:00Z"');
  expect(scheduled).toContain("Revert to draft");
  expect(scheduled).toContain('action="/unpublish-job"');
  expect(scheduled).toContain("The job was reverted to draft");
});
