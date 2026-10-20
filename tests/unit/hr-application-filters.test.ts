import { describe, expect, it } from "vitest";

import {
  filterApplications,
  foldDiacritics,
  parseHRApplicationFilterParams,
  sortApplications,
  type HRApplicationListItem,
} from "@/lib/hr-application-search";

describe("HR application filter search text parsing", () => {
  it("parses empty query parameters to safe defaults", () => {
    const parsed = parseHRApplicationFilterParams({});
    expect(parsed).toEqual({
      q: "",
      invalidSearch: false,
      job: undefined,
      status: undefined,
      withdrawal: "all",
      sort: "newest",
      page: 1,
      pageSize: 10,
    });
  });

  it("parses and normalizes valid search text", () => {
    const parsed = parseHRApplicationFilterParams({ q: "  Jane   Doe  " });
    expect(parsed.q).toBe("Jane Doe");
    expect(parsed.invalidSearch).toBe(false);
  });

  it("detects invalid search queries with control characters or excessive length", () => {
    const withControl = parseHRApplicationFilterParams({ q: "Jane\u0000Doe" });
    expect(withControl.invalidSearch).toBe(true);
    expect(withControl.q).toBe("");

    const overlong = parseHRApplicationFilterParams({ q: "a".repeat(101) });
    expect(overlong.invalidSearch).toBe(true);
  });
});

describe("HR application filter parameter validation", () => {
  it("validates job UUID and falls back safely when invalid", () => {
    const validJobId = "11111111-1111-4111-8111-111111111111";
    expect(parseHRApplicationFilterParams({ job: validJobId }).job).toBe(
      validJobId,
    );
    expect(
      parseHRApplicationFilterParams({ job: "not-a-uuid" }).job,
    ).toBeUndefined();
  });

  it("validates review status and falls back safely when unrecognized", () => {
    expect(parseHRApplicationFilterParams({ status: "in_review" }).status).toBe(
      "in_review",
    );
    expect(
      parseHRApplicationFilterParams({ status: "shortlisted" }).status,
    ).toBe("shortlisted");
    expect(
      parseHRApplicationFilterParams({ status: "invalid_status" }).status,
    ).toBeUndefined();
  });

  it("validates withdrawal status and falls back to all", () => {
    expect(
      parseHRApplicationFilterParams({ withdrawal: "active" }).withdrawal,
    ).toBe("active");
    expect(
      parseHRApplicationFilterParams({ withdrawal: "withdrawn" }).withdrawal,
    ).toBe("withdrawn");
    expect(
      parseHRApplicationFilterParams({ withdrawal: "invalid" }).withdrawal,
    ).toBe("all");
  });
});

describe("HR application sort, page, and array parameters", () => {
  it("validates sort direction and page number", () => {
    expect(parseHRApplicationFilterParams({ sort: "oldest" }).sort).toBe(
      "oldest",
    );
    expect(parseHRApplicationFilterParams({ sort: "invalid" }).sort).toBe(
      "newest",
    );
    expect(parseHRApplicationFilterParams({ page: "3" }).page).toBe(3);
    expect(parseHRApplicationFilterParams({ page: "-1" }).page).toBe(1);
  });

  it("handles array query parameters gracefully across all filters", () => {
    const validJobId = "11111111-1111-4111-8111-111111111111";
    const res = parseHRApplicationFilterParams({
      q: ["Jane Doe", "Other"],
      job: [validJobId, "extra"],
      status: ["in_review", "rejected"],
      withdrawal: ["withdrawn", "active"],
      sort: ["oldest", "newest"],
      page: ["2", "1"],
    });
    expect(res).toMatchObject({
      q: "Jane Doe",
      job: validJobId,
      status: "in_review",
      withdrawal: "withdrawn",
      sort: "oldest",
      page: 1,
    });
  });
});

const sampleApps: HRApplicationListItem[] = [
  {
    id: "a0000000-0000-4000-8000-000000000001",
    applicant_id: "u0000000-0000-4000-8000-000000000001",
    full_name: "Alice Smith",
    job_id: "j0000000-0000-4000-8000-000000000001",
    job_title: "Staff Engineer",
    submitted_at: "2026-10-10T10:00:00Z",
    review_status: "submitted",
    withdrawn_at: null,
    withdrawn_by: null,
  },
  {
    id: "a0000000-0000-4000-8000-000000000002",
    applicant_id: "u0000000-0000-4000-8000-000000000002",
    full_name: "Bob Jones",
    job_id: "j0000000-0000-4000-8000-000000000001",
    job_title: "Staff Engineer",
    submitted_at: "2026-10-11T12:00:00Z",
    review_status: "in_review",
    withdrawn_at: null,
    withdrawn_by: null,
  },
  {
    id: "a0000000-0000-4000-8000-000000000003",
    applicant_id: "u0000000-0000-4000-8000-000000000003",
    full_name: "Charlie Brown",
    job_id: "j0000000-0000-4000-8000-000000000002",
    job_title: "Product Designer",
    submitted_at: "2026-10-12T14:00:00Z",
    review_status: "shortlisted",
    withdrawn_at: "2026-10-13T09:00:00Z",
    withdrawn_by: "u0000000-0000-4000-8000-000000000003",
  },
  {
    id: "a0000000-0000-4000-8000-000000000004",
    applicant_id: "u0000000-0000-4000-8000-000000000004",
    full_name: null,
    job_id: "j0000000-0000-4000-8000-000000000002",
    job_title: "Product Designer",
    submitted_at: "2026-10-14T08:00:00Z",
    review_status: "rejected",
    withdrawn_at: null,
    withdrawn_by: null,
  },
];

describe("HR application filtering by withdrawal", () => {
  it("filters out withdrawn applications when withdrawal: active", () => {
    const filtered = filterApplications(sampleApps, {
      q: "",
      invalidSearch: false,
      withdrawal: "active",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(filtered.map((a) => a.id)).toEqual([
      sampleApps[0].id,
      sampleApps[1].id,
      sampleApps[3].id,
    ]);
  });

  it("filters only withdrawn applications when withdrawal: withdrawn", () => {
    const filtered = filterApplications(sampleApps, {
      q: "",
      invalidSearch: false,
      withdrawal: "withdrawn",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(filtered.map((a) => a.id)).toEqual([sampleApps[2].id]);
  });

  it("includes all applications when withdrawal: all", () => {
    const filtered = filterApplications(sampleApps, {
      q: "",
      invalidSearch: false,
      withdrawal: "all",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(filtered).toHaveLength(4);
  });
});

describe("HR application filtering by job and status", () => {
  it("filters by job ID and status", () => {
    const byJob = filterApplications(sampleApps, {
      q: "",
      invalidSearch: false,
      job: "j0000000-0000-4000-8000-000000000001",
      withdrawal: "all",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(byJob.map((a) => a.id)).toEqual([
      sampleApps[0].id,
      sampleApps[1].id,
    ]);

    const byStatus = filterApplications(sampleApps, {
      q: "",
      invalidSearch: false,
      status: "in_review",
      withdrawal: "all",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(byStatus.map((a) => a.id)).toEqual([sampleApps[1].id]);
  });
});

describe("HR application filtering by applicant name and diacritics", () => {
  it("filters by applicant name, folds diacritics, and handles invalid search", () => {
    expect(foldDiacritics("Hélène Müller")).toBe("Helene Muller");
    const accentApps = [{ ...sampleApps[0], full_name: "René François" }];
    expect(
      filterApplications(accentApps, {
        q: "rene",
        invalidSearch: false,
        withdrawal: "all",
        page: 1,
        pageSize: 10,
        sort: "newest",
      }),
    ).toHaveLength(1);

    const filtered = filterApplications(sampleApps, {
      q: "alice",
      invalidSearch: false,
      withdrawal: "all",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(filtered.map((a) => a.id)).toEqual([sampleApps[0].id]);

    const invalid = filterApplications(sampleApps, {
      q: "",
      invalidSearch: true,
      withdrawal: "all",
      page: 1,
      pageSize: 10,
      sort: "newest",
    });
    expect(invalid).toEqual([]);
  });
});

describe("HR application sorting", () => {
  it("sorts newest first (DESC) and oldest first (ASC)", () => {
    const list = [sampleApps[0], sampleApps[1]];
    const desc = sortApplications(list, "newest");
    expect(desc[0].id).toBe(list[1].id);
    expect(desc[1].id).toBe(list[0].id);

    const asc = sortApplications(list, "oldest");
    expect(asc[0].id).toBe(list[0].id);
    expect(asc[1].id).toBe(list[1].id);
  });
});
