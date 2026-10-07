import { describe, expect, it } from "vitest";

import { parseCoverLetter } from "../../src/lib/application-input";

describe("cover-letter input", () => {
  it("allows an empty saved draft but rejects an empty submission", () => {
    expect(parseCoverLetter("", "draft").success).toBe(true);
    expect(parseCoverLetter("   ", "submit").success).toBe(false);
  });

  it("enforces the approved 5,000-character limit", () => {
    expect(parseCoverLetter("a".repeat(5000), "submit").success).toBe(true);
    expect(parseCoverLetter("a".repeat(5001), "submit").success).toBe(false);
    expect(parseCoverLetter("a".repeat(5001), "draft").success).toBe(false);
  });

  it("rejects non-string form values", () => {
    expect(parseCoverLetter(null, "draft").success).toBe(false);
  });
});
