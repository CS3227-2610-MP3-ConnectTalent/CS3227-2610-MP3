import { describe, expect, it } from "vitest";

import { parseHRNote, parseHRStatusChange } from "../../src/lib/hr-input";

describe("HR review input", () => {
  it("accepts a useful note of at most 2,000 characters", () => {
    expect(parseHRNote("A note").success).toBe(true);
    expect(parseHRNote("a".repeat(2000)).success).toBe(true);
    expect(parseHRNote("  ").success).toBe(false);
    expect(parseHRNote("a".repeat(2001)).success).toBe(false);
    expect(parseHRNote(null).success).toBe(false);
  });

  it("requires an allowed HR status and a positive expected revision", () => {
    expect(parseHRStatusChange("in_review", "1").success).toBe(true);
    expect(parseHRStatusChange("shortlisted", "2").success).toBe(true);
    expect(parseHRStatusChange("rejected", "3").success).toBe(true);
    expect(parseHRStatusChange("submitted", "1").success).toBe(false);
    expect(parseHRStatusChange("rejected", "0").success).toBe(false);
    expect(parseHRStatusChange("rejected", "1.5").success).toBe(false);
    expect(parseHRStatusChange("rejected", "NaN").success).toBe(false);
  });
});
