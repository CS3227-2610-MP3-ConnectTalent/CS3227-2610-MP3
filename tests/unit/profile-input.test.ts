import { describe, expect, it } from "vitest";
import { parseBackground } from "../../src/lib/profile-input";
describe("private profile/application background validation", () => {
  it("normalizes optional text and preserves ordinary line breaks", () => {
    expect(
      parseBackground({
        education: "  Synthetic university\nComputing  ",
        work_experience: " ",
      }),
    ).toMatchObject({
      success: true,
      data: {
        education: "Synthetic university\nComputing",
        work_experience: null,
      },
    });
  });
  it.each(["x".repeat(2001), "Synthetic\u0000injected", 42])(
    "rejects invalid background without exposing its value",
    (education) => {
      const result = parseBackground({ education });
      expect(result.success).toBe(false);
      expect(JSON.stringify(result.errors)).not.toContain(String(education));
    },
  );
  it("counts Unicode characters and accepts the exact limit", () => {
    expect(parseBackground({ education: "😀".repeat(2000) }).success).toBe(
      true,
    );
  });
});
