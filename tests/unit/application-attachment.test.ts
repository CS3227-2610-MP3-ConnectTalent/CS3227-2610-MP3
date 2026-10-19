import { describe, expect, it } from "vitest";

import { reconcileApplicationAttachment } from "@/lib/application-attachment";

describe("application attachment revision reconciliation", () => {
  it("adopts a refreshed revision for the same application", () => {
    expect(
      reconcileApplicationAttachment(
        { applicationId: "application-1", revision: 2 },
        { applicationId: "application-1", revision: 3 },
      ),
    ).toEqual({ applicationId: "application-1", revision: 3 });
  });

  it("does not lower a newer local revision from stale server props", () => {
    const current = { applicationId: "application-1", revision: 3 };

    expect(
      reconcileApplicationAttachment(current, {
        applicationId: "application-1",
        revision: 2,
      }),
    ).toBe(current);
    expect(
      reconcileApplicationAttachment(current, {
        applicationId: "application-1",
        revision: null,
      }),
    ).toBe(current);
  });

  it("adopts a different application identity", () => {
    expect(
      reconcileApplicationAttachment(
        { applicationId: "application-1", revision: 3 },
        { applicationId: "application-2", revision: 1 },
      ),
    ).toEqual({ applicationId: "application-2", revision: 1 });
  });
});
