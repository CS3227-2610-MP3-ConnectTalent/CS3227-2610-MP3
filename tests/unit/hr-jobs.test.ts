import { describe, expect, it } from "vitest";

import {
  getHROperationalJobStatus,
  hrJobSchema,
  type HRJob,
} from "../../src/lib/hr-jobs";

function createJob(overrides: Partial<HRJob> = {}): HRJob {
  return hrJobSchema.parse({
    id: "20000000-0000-4000-8000-000000000b01",
    title: "Software Engineer",
    team: "Platform",
    category: "engineering",
    description: "Description",
    requirements: "Requirements",
    status: "draft",
    created_at: "2026-10-15T12:00:00.000Z",
    published_at: null,
    opens_at: null,
    closes_at: null,
    ...overrides,
  });
}

describe("HR Job schema", () => {
  it("parses opens_at and closes_at when present or null", () => {
    const jobWithDates = createJob({
      opens_at: "2026-10-16T12:00:00.000Z",
      closes_at: "2026-10-20T12:00:00.000Z",
    });
    expect(jobWithDates.opens_at).toBe("2026-10-16T12:00:00.000Z");
    expect(jobWithDates.closes_at).toBe("2026-10-20T12:00:00.000Z");
  });
});

describe("HR Job operational status - static states", () => {
  const now = new Date("2026-10-15T12:00:00.000Z");

  it("identifies draft and explicitly closed jobs", () => {
    expect(getHROperationalJobStatus(createJob({ status: "draft" }), now)).toBe(
      "draft",
    );
    expect(
      getHROperationalJobStatus(
        createJob({
          status: "closed",
          published_at: "2026-10-10T12:00:00.000Z",
        }),
        now,
      ),
    ).toBe("closed");
  });
});

describe("HR Job operational status - schedule time windows", () => {
  const now = new Date("2026-10-15T12:00:00.000Z");

  it("identifies scheduled jobs with future opens_at", () => {
    const job = createJob({
      status: "published",
      published_at: "2026-10-15T10:00:00.000Z",
      opens_at: "2026-10-16T12:00:00.000Z",
    });
    expect(getHROperationalJobStatus(job, now)).toBe("scheduled");
  });

  it("identifies current active window as 'published'", () => {
    expect(
      getHROperationalJobStatus(
        createJob({
          status: "published",
          published_at: "2026-10-15T10:00:00.000Z",
        }),
        now,
      ),
    ).toBe("published");

    const activeJob = createJob({
      status: "published",
      published_at: "2026-10-15T10:00:00.000Z",
      opens_at: "2026-10-15T11:00:00.000Z",
      closes_at: "2026-10-16T12:00:00.000Z",
    });
    expect(getHROperationalJobStatus(activeJob, now)).toBe("published");
  });

  it("identifies past closes_at as 'closed'", () => {
    const jobPastDeadline = createJob({
      status: "published",
      published_at: "2026-10-10T10:00:00.000Z",
      opens_at: "2026-10-10T10:00:00.000Z",
      closes_at: "2026-10-15T11:59:59.000Z",
    });
    expect(getHROperationalJobStatus(jobPastDeadline, now)).toBe("closed");
  });
});
