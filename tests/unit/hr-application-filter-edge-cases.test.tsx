import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  requireHR: vi.fn(),
  listSubmittedApplications: vi.fn(),
  listDistinctApplicationJobs: vi.fn(),
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
}));
vi.mock("next/navigation", () => ({
  useRouter: mocks.useRouter,
  useSearchParams: () => new URLSearchParams(),
  notFound: vi.fn(),
}));
vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: false }),
  };
});

import HRApplicationsPage from "@/app/hr/applications/page";
import { HRApplicationFilters } from "@/components/hr-application-filters";

beforeEach(() => {
  vi.clearAllMocks();
  mocks.requireHR.mockResolvedValue({ user: { id: "hr-user" }, client: {} });
  mocks.listSubmittedApplications.mockResolvedValue([]);
  mocks.listDistinctApplicationJobs.mockResolvedValue([
    { id: "job-1", title: "Software Engineer" },
  ]);
});

it("displays no matching filters message when database filter query returns 0 items", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ status: "rejected" }),
    }),
  );
  expect(html).toContain("No applications match your selected filters.");
  expect(html).not.toContain("No submitted applications yet.");
  expect(mocks.listDistinctApplicationJobs).toHaveBeenCalled();
});

it("skips listDistinctApplicationJobs when no filters are active", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({ searchParams: Promise.resolve({}) }),
  );
  expect(html).toContain("No submitted applications yet.");
  expect(mocks.listDistinctApplicationJobs).not.toHaveBeenCalled();
});

it("shows invalid search error even when total application count is 0", async () => {
  mocks.listSubmittedApplications.mockResolvedValue([]);
  const html = renderToStaticMarkup(
    await HRApplicationsPage({
      searchParams: Promise.resolve({ q: "Jane\u0000Doe" }),
    }),
  );
  expect(html).toContain("Use a search phrase of at most 100 characters");
  expect(html).not.toContain("No submitted applications yet.");
});

it("renders Clear filters button when search query is invalid", () => {
  const html = renderToStaticMarkup(
    createElement(HRApplicationFilters, {
      initialParams: {
        q: "",
        invalidSearch: true,
        withdrawal: "all",
        sort: "newest",
        page: 1,
        pageSize: 10,
      },
      jobs: [],
    }),
  );
  expect(html).toContain("Clear filters");
});
