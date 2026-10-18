import { afterEach, expect, it } from "vitest";

import {
  formatBrowserLocalDateTime,
  formatUtcDateTime,
  getBrowserTimeZone,
  isoToLocalDateTime,
  localDateTimeToIso,
} from "../../src/lib/local-date-time";

const initialTimeZone = process.env.TZ;

afterEach(() => {
  if (initialTimeZone === undefined) {
    delete process.env.TZ;
  } else {
    process.env.TZ = initialTimeZone;
  }
});

it("converts and displays schedules in the active browser timezone", () => {
  process.env.TZ = "America/Los_Angeles";
  expect(localDateTimeToIso("2026-01-15T09:00")).toBe(
    "2026-01-15T17:00:00.000Z",
  );
  expect(formatUtcDateTime("2026-01-15T01:00:00.000Z")).toBe(
    "Jan 15, 2026, 1:00 AM UTC",
  );

  process.env.TZ = "Asia/Singapore";
  expect(localDateTimeToIso("2026-01-15T09:00")).toBe(
    "2026-01-15T01:00:00.000Z",
  );
  expect(isoToLocalDateTime("2026-01-15T17:00:00.000Z")).toBe(
    "2026-01-16T01:00",
  );
  const instant = "2026-01-15T01:00:00.000Z";
  const local = new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(instant));
  expect(getBrowserTimeZone()).toBe("Asia/Singapore");
  expect(formatBrowserLocalDateTime(instant)).toBe(`${local} (Asia/Singapore)`);

  process.env.TZ = "America/New_York";
  expect(localDateTimeToIso("2026-02-30T09:00")).toBeNull();
  expect(localDateTimeToIso("2026-03-08T02:30")).toBeNull();
  expect(localDateTimeToIso("2026-11-01T01:30")).toBe(
    "2026-11-01T05:30:00.000Z",
  );

  const utcFallback = formatUtcDateTime(instant);
  process.env.TZ = "Asia/Singapore";
  expect(formatUtcDateTime(instant)).toBe(utcFallback);
});
