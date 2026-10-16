import { describe, expect, it } from "vitest";

import {
  buildHRApplicationsUrl,
  paginateApplications,
} from "@/lib/hr-application-search";

const samplePaginationItems = Array.from({ length: 25 }, (_, i) => ({
  id: `id-${i + 1}`,
  applicant_id: `user-${i + 1}`,
  full_name: `Applicant ${i + 1}`,
  job_id: "job-1",
  job_title: "Job",
  submitted_at: "2026-10-10T00:00:00Z",
  review_status: "submitted" as const,
  withdrawn_at: null,
  withdrawn_by: null,
}));

describe("HR application pagination page slicing", () => {
  it("slices first page correctly", () => {
    const result = paginateApplications(samplePaginationItems, 1, 10);
    expect(result.items).toHaveLength(10);
    expect(result.items[0].id).toBe("id-1");
    expect(result.items[9].id).toBe("id-10");
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(3);
    expect(result.totalCount).toBe(25);
    expect(result.hasPrev).toBe(false);
    expect(result.hasNext).toBe(true);
    expect(result.startIndex).toBe(1);
    expect(result.endIndex).toBe(10);
  });

  it("slices middle and last pages correctly", () => {
    const page2 = paginateApplications(samplePaginationItems, 2, 10);
    expect(page2.items).toHaveLength(10);
    expect(page2.currentPage).toBe(2);
    expect(page2.hasPrev).toBe(true);
    expect(page2.hasNext).toBe(true);

    const page3 = paginateApplications(samplePaginationItems, 3, 10);
    expect(page3.items).toHaveLength(5);
    expect(page3.currentPage).toBe(3);
    expect(page3.hasNext).toBe(false);
  });
});

describe("HR application pagination edge cases", () => {
  it("handles empty items array gracefully", () => {
    const result = paginateApplications([], 1, 10);
    expect(result.items).toEqual([]);
    expect(result.currentPage).toBe(1);
    expect(result.totalPages).toBe(1);
    expect(result.totalCount).toBe(0);
  });

  it("clamps out-of-bounds page requests", () => {
    const result = paginateApplications(samplePaginationItems, 999, 10);
    expect(result.currentPage).toBe(3);
    expect(result.items).toHaveLength(5);
  });
});

describe("buildHRApplicationsUrl", () => {
  it("generates clean URL omitting default values", () => {
    const url = buildHRApplicationsUrl({
      q: "",
      invalidSearch: false,
      withdrawal: "all",
      sort: "newest",
      page: 1,
      pageSize: 10,
    });
    expect(url).toBe("/hr/applications");
  });

  it("serializes non-default filters into query string", () => {
    const url = buildHRApplicationsUrl({
      q: "Jane",
      invalidSearch: false,
      job: "11111111-1111-4111-8111-111111111111",
      status: "in_review",
      withdrawal: "withdrawn",
      sort: "oldest",
      page: 2,
      pageSize: 10,
    });
    expect(url).toContain("q=Jane");
    expect(url).toContain("job=11111111-1111-4111-8111-111111111111");
    expect(url).toContain("status=in_review");
    expect(url).toContain("withdrawal=withdrawn");
    expect(url).toContain("sort=oldest");
    expect(url).toContain("page=2");
  });

  it("omits whitespace-only search query from URL", () => {
    const url = buildHRApplicationsUrl({
      q: "   ",
      invalidSearch: false,
      withdrawal: "all",
      sort: "newest",
      page: 1,
      pageSize: 10,
    });
    expect(url).toBe("/hr/applications");
  });
});
