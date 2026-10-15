import { describe, expect, it } from "vitest";

import { parseHRJobFields, parseHRJobId } from "../../src/lib/hr-job-input";

function fields(overrides: Record<string, string> = {}) {
  const data = new FormData();
  for (const [key, value] of Object.entries({
    title: "Software engineer",
    team: "Platform",
    category: "engineering",
    description: "Build internal tools",
    requirements: "TypeScript",
    ...overrides,
  }))
    data.set(key, value);
  return data;
}

describe("HR job text fields", () => {
  it("accepts the shared required job fields and trims surrounding whitespace", () => {
    const parsed = parseHRJobFields(fields({ title: "  Software engineer  " }));
    expect(parsed.success).toBe(true);
    if (parsed.success) expect(parsed.value.title).toBe("Software engineer");
  });

  it("rejects invalid categories and empty or oversized fields", () => {
    expect(parseHRJobFields(fields({ category: "finance" })).success).toBe(
      false,
    );
    expect(parseHRJobFields(fields({ title: "  " })).success).toBe(false);
    expect(parseHRJobFields(fields({ title: "a".repeat(161) })).success).toBe(
      false,
    );
    expect(
      parseHRJobFields(fields({ description: "a".repeat(10001) })).success,
    ).toBe(false);
    expect(parseHRJobFields(fields({ requirements: "  " })).success).toBe(
      false,
    );
  });

  it("accepts only a UUID job identifier", () => {
    expect(parseHRJobId("20000000-0000-4000-8000-000000000b01").success).toBe(
      true,
    );
    expect(parseHRJobId("not-a-uuid").success).toBe(false);
    expect(parseHRJobId(null).success).toBe(false);
  });
});

describe("HR job valid schedule inputs", () => {
  it("accepts valid optional opensAt and closesAt datetime fields", () => {
    const parsed = parseHRJobFields(
      fields({ opensAt: "2026-10-20T10:00", closesAt: "2026-10-25T18:00" }),
    );
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.value.opens_at).toBeTruthy();
      expect(parsed.value.closes_at).toBeTruthy();
      expect(new Date(parsed.value.closes_at!).getTime()).toBeGreaterThan(
        new Date(parsed.value.opens_at!).getTime(),
      );
    }
  });

  it("allows omitting opensAt or closesAt or both", () => {
    const parsedNone = parseHRJobFields(fields());
    expect(parsedNone.success).toBe(true);
    if (parsedNone.success) {
      expect(parsedNone.value.opens_at).toBeNull();
      expect(parsedNone.value.closes_at).toBeNull();
    }

    const parsedOpens = parseHRJobFields(
      fields({ opensAt: "2026-10-20T10:00" }),
    );
    expect(parsedOpens.success).toBe(true);
    expect(parsedOpens.success && parsedOpens.value.opens_at).toBeTruthy();

    const parsedCloses = parseHRJobFields(
      fields({ closesAt: "2026-10-25T18:00" }),
    );
    expect(parsedCloses.success).toBe(true);
    expect(parsedCloses.success && parsedCloses.value.closes_at).toBeTruthy();
  });
});

describe("HR job invalid schedule inputs", () => {
  it("rejects invalid date strings and closesAt before or equal to opensAt", () => {
    expect(parseHRJobFields(fields({ opensAt: "not-a-date" })).success).toBe(
      false,
    );
    expect(parseHRJobFields(fields({ closesAt: "invalid" })).success).toBe(
      false,
    );
    expect(
      parseHRJobFields(
        fields({ opensAt: "2026-10-25T18:00", closesAt: "2026-10-20T10:00" }),
      ).success,
    ).toBe(false);
    expect(
      parseHRJobFields(
        fields({ opensAt: "2026-10-20T10:00", closesAt: "2026-10-20T10:00" }),
      ).success,
    ).toBe(false);
  });
});
