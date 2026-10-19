import { describe, expect, it } from "vitest";

import { parseHRApplicationFilterParams } from "@/lib/hr-application-search";
import {
  mergeHRApplicationFilterParams,
  shouldSyncHRApplicationFilterParams,
} from "@/lib/hr-application-filter-state";

describe("HR application filter navigation state", () => {
  const roleId = "11111111-1111-4111-8111-111111111111";
  const defaults = parseHRApplicationFilterParams({});

  it("preserves successive role, status, and debounced search changes", () => {
    const withRole = mergeHRApplicationFilterParams(defaults, {
      job: roleId,
    });
    const withStatus = mergeHRApplicationFilterParams(withRole, {
      status: "in_review",
    });
    const withSearch = mergeHRApplicationFilterParams(withStatus, {
      q: "Jane Doe",
    });

    expect(withSearch).toMatchObject({
      job: roleId,
      status: "in_review",
      q: "Jane Doe",
      page: 1,
    });
  });

  it("syncs server props only when idle and they match the current URL", () => {
    const current = parseHRApplicationFilterParams({
      job: roleId,
      status: "in_review",
    });
    const stale = parseHRApplicationFilterParams({ job: roleId });

    expect(shouldSyncHRApplicationFilterParams(stale, current, false)).toBe(
      false,
    );
    expect(shouldSyncHRApplicationFilterParams(current, current, true)).toBe(
      false,
    );
    expect(shouldSyncHRApplicationFilterParams(current, null, false)).toBe(
      false,
    );
    expect(shouldSyncHRApplicationFilterParams(current, current, false)).toBe(
      true,
    );
  });
});
