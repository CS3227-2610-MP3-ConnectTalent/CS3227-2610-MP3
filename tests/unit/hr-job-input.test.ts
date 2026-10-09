import { describe, expect, it } from "vitest";

import { parseHRJobFields, parseHRJobId } from "../../src/lib/hr-job-input";

function fields(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    title: "Software engineer", team: "Platform", category: "engineering",
    description: "Build internal tools", requirements: "TypeScript", ...overrides,
  })) data.set(key, value);
  return data;
}

describe("HR job input", () => {
  it("accepts the shared required job fields and trims surrounding whitespace", () => {
    const parsed = parseHRJobFields(fields({ title: "  Software engineer  " }));
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.value.title).toBe("Software engineer");
  });

  it("rejects invalid categories and empty or oversized fields", () => {
    expect(parseHRJobFields(fields({ category: "finance" })).success).toBe(false);
    expect(parseHRJobFields(fields({ title: "  " })).success).toBe(false);
    expect(parseHRJobFields(fields({ title: "a".repeat(161) })).success).toBe(false);
    expect(parseHRJobFields(fields({ description: "a".repeat(10001) })).success).toBe(false);
    expect(parseHRJobFields(fields({ requirements: "  " })).success).toBe(false);
  });

  it("accepts only a UUID job identifier", () => {
    expect(parseHRJobId("20000000-0000-4000-8000-000000000b01").success).toBe(true);
    expect(parseHRJobId("not-a-uuid").success).toBe(false);
    expect(parseHRJobId(null).success).toBe(false);
  });
});
