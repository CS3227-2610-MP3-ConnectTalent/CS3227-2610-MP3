import { renderToStaticMarkup } from "react-dom/server";
import { beforeEach, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  searchPending: false,
  linkPending: false,
  filtersOverride: null as null | {
    query: string;
    category?: string;
    historyPending?: boolean;
  },
}));

vi.mock("next/link", async () => {
  const React = await import("react");
  return {
    default: ({ href, children, ...props }: Record<string, unknown>) =>
      React.createElement("a", { href, ...props }, children as React.ReactNode),
    useLinkStatus: () => ({ pending: mocks.linkPending }),
  };
});

vi.mock("@/components/use-job-listing-filters", () => ({
  useJobListingFilters: (initial: { query: string; category?: string }) => ({
    filters: mocks.filtersOverride ?? initial,
    pending: mocks.searchPending,
    controller: {
      edit: vi.fn(),
      go: vi.fn(),
      clear: vi.fn(),
      category: vi.fn(),
      composition: vi.fn(),
    },
  }),
}));

import { JobListingFilters } from "@/components/job-listing-filters";
import { BackToOpenRoles } from "@/components/back-to-open-roles";
import { AuthFrame } from "@/components/auth-frame";

beforeEach(() => {
  mocks.searchPending = false;
  mocks.linkPending = false;
  mocks.filtersOverride = null;
});

it("shows and disables only the Search submit during a route request", () => {
  mocks.searchPending = true;
  const html = renderToStaticMarkup(
    <JobListingFilters initial={{ query: "" }} invalidCategory={false}>
      <p>Results</p>
    </JobListingFilters>,
  );

  expect(html).toContain("Searching…");
  expect(html).toMatch(/<button[^>]+type="submit"[^>]*disabled=""/);
  expect(html).toContain('name="q"');
  expect(html).toContain("Clear search");
});

it("keeps an idle Search available and preserves the selected category", () => {
  const html = renderToStaticMarkup(
    <JobListingFilters
      initial={{ query: "typescript", category: "engineering" }}
      invalidCategory={false}
    >
      <p>Engineering results</p>
    </JobListingFilters>,
  );

  expect(html).toContain("Engineering results");
  expect(html).toContain('name="category" value="engineering"');
  expect(html).toContain('href="/?category=engineering"');
  expect(html).toContain('aria-current="page"');
  expect(html).toMatch(/<button[^>]+type="submit"[^>]*>[\s\S]*Search<\/button>/);
  expect(html).not.toContain("Searching…");
});

it("withholds stale cards and announces a restored history request", () => {
  mocks.filtersOverride = {
    query: "typescript",
    category: "engineering",
    historyPending: true,
  };
  const html = renderToStaticMarkup(
    <JobListingFilters initial={{ query: "" }} invalidCategory={false}>
      <p>Old results</p>
    </JobListingFilters>,
  );

  expect(html).toContain("Updating roles…");
  expect(html).toContain("Searching…");
  expect(html).not.toContain("Old results");
});

it("shows invalid query guidance instead of result cards", () => {
  const html = renderToStaticMarkup(
    <JobListingFilters
      initial={{ query: "x".repeat(101) }}
      invalidCategory={false}
    >
      <p>Results must be hidden</p>
    </JobListingFilters>,
  );

  expect(html).toContain('role="alert"');
  expect(html).toContain('aria-invalid="true"');
  expect(html).not.toContain("Results must be hidden");
});

it("announces a waiting Back to open roles link without losing its href", () => {
  mocks.linkPending = true;
  const html = renderToStaticMarkup(<BackToOpenRoles />);

  expect(html).toContain('href="/"');
  expect(html).toContain("Back to open roles");
  expect(html).toContain("Opening roles…");
  expect(html).toContain('role="status"');
});

it("announces a waiting Careers return link in the auth frame", () => {
  mocks.linkPending = true;
  const html = renderToStaticMarkup(
    <AuthFrame>
      <p>Sign in</p>
    </AuthFrame>,
  );

  expect(html).toContain('href="/"');
  expect(html).toContain("Opening roles…");
});
