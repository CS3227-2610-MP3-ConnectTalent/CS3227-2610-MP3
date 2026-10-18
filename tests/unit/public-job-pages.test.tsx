import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listPublishedJobs: vi.fn(),
  getPublishedJob: vi.fn(),
  getAccountNavigation: vi.fn(),
  notFound: vi.fn(),
  linkPending: false,
}));

vi.mock("@/lib/jobs", () => ({
  listPublishedJobs: mocks.listPublishedJobs,
  getPublishedJob: mocks.getPublishedJob,
}));
vi.mock("@/lib/account-navigation", () => ({
  getAccountNavigation: mocks.getAccountNavigation,
}));
vi.mock("next/navigation", () => ({
  notFound: mocks.notFound,
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: mocks.linkPending }),
  };
});

import Home from "@/app/page";
import JobDetail from "@/app/jobs/[id]/page";

const job = {
  id: "44000000-0000-4000-8000-000000000101",
  title: "Software Engineer",
  team: "Digital Products",
  category: "engineering",
  description: "Build synthetic accessible tools.",
  requirements: "TypeScript and testing experience.",
};

beforeEach(() => {
  vi.clearAllMocks();
  mocks.listPublishedJobs.mockResolvedValue([job]);
  mocks.getPublishedJob.mockResolvedValue(job);
  mocks.getAccountNavigation.mockResolvedValue({ kind: "guest" });
  mocks.linkPending = false;
  mocks.notFound.mockImplementation(() => {
    throw new Error("not-found");
  });
});

async function home(searchParams: Record<string, unknown>) {
  return renderToStaticMarkup(
    await Home({ searchParams: Promise.resolve(searchParams) as never }),
  );
}

it("renders filtered jobs, selected category, singular counts, and sign-out feedback", async () => {
  const html = await home({ category: "engineering", authError: "sign-out" });
  expect(html).toContain("Sign out could not be completed");
  expect(html).toContain("1 role available");
  expect(html).toContain("Software Engineer");
  expect(html).toContain("Digital Products");
  expect(html).toContain('href="/?category=engineering" aria-current="page"');
  expect(mocks.listPublishedJobs).toHaveBeenCalledWith("engineering", "");
});

it("renders empty results, plural counts, and clears the selected category", async () => {
  mocks.listPublishedJobs.mockResolvedValue([]);
  const empty = await home({});
  expect(empty).toContain("0 roles available");
  expect(empty).toContain("No open roles in this category");
  expect(empty).toContain('href="/" aria-current="page"');

  mocks.listPublishedJobs.mockResolvedValue([
    job,
    { ...job, id: "other-job", title: "Designer" },
  ]);
  const multiple = await home({ category: "engineering" });
  expect(multiple).toContain("2 roles available");
  expect(multiple).toContain("Designer");
});

it.each(["unknown", ["engineering"]])(
  "does not query with malformed category input %j",
  async (category) => {
    const html = await home({ category });
    expect(html).toContain("Choose a valid category.");
    expect(html).toContain("Unknown category");
    expect(mocks.listPublishedJobs).not.toHaveBeenCalled();
  },
);

it.each([
  { q: ["software", "sales"] },
  { q: "a".repeat(101) },
  { q: "bad\u0000query" },
])("does not read jobs for invalid search %j", async ({ q }) => {
  const html = await home({ q });
  expect(html).toContain("Use one search phrase of at most 100 characters");
  expect(mocks.listPublishedJobs).not.toHaveBeenCalled();
});

it("renders an unavailable public job as not found", async () => {
  mocks.getPublishedJob.mockResolvedValue(null);
  await expect(
    JobDetail({ params: Promise.resolve({ id: "missing" }) }),
  ).rejects.toThrow("not-found");
  expect(mocks.getAccountNavigation).not.toHaveBeenCalled();
});

it("shows the public closing deadline with a timezone-explicit UTC fallback", async () => {
  mocks.getPublishedJob.mockResolvedValueOnce({
    ...job,
    closes_at: "2026-01-15T01:00:00.000Z",
  });

  const element = await JobDetail({ params: Promise.resolve({ id: job.id }) });
  const html = renderToStaticMarkup(element);

  expect(html).toContain("Applications close on");
  expect(html).toContain("Jan 15, 2026, 1:00 AM UTC");
  expect(html).toContain('dateTime="2026-01-15T01:00:00.000Z"');
});

it.each([
  [{ kind: "guest" }, true],
  [{ kind: "signed-in", role: "applicant", incomplete: false }, true],
  [{ kind: "signed-in", role: "hr" }, false],
  [{ kind: "unavailable" }, false],
])(
  "shows the Apply action only to guests and Applicants (%j)",
  async (account, canApply) => {
    mocks.getAccountNavigation.mockResolvedValue(account);
    const element = await JobDetail({
      params: Promise.resolve({ id: job.id }),
    });
    const html = renderToStaticMarkup(element);
    expect(html.includes("Apply for this role")).toBe(canApply);
    expect(html).toContain("Requirements");
    expect(html).toContain("TypeScript and testing experience.");
  },
);

it("announces a waiting Apply navigation for a guest", async () => {
  mocks.linkPending = true;
  const element = await JobDetail({ params: Promise.resolve({ id: job.id }) });
  const html = renderToStaticMarkup(element);

  expect(html).toContain(`href="/jobs/${job.id}/apply"`);
  expect(html).toContain("Apply for this role");
  expect(html).toContain("Opening application…");
  expect(html).toContain('role="status"');
});
