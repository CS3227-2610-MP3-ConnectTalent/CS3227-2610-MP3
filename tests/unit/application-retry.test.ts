import { describe, expect, it } from "vitest";

import { reconcileApplicationWrite } from "../../src/lib/application-retry";

const id = "00000000-0000-4000-8000-000000000a11";

describe("uncertain application write reconciliation", () => {
  it("shows the existing submitted application after a repeated submit", () => {
    expect(reconcileApplicationWrite("submit", "Attempted text", {
      id, submission_state: "submitted", cover_letter: "Already submitted text",
    })).toBe(id);
  });

  it("treats a matching saved draft or edited letter as completed", () => {
    expect(reconcileApplicationWrite("save", "Draft", {
      id, submission_state: "draft", cover_letter: "Draft",
    })).toBe(id);
    expect(reconcileApplicationWrite("edit", "Revision", {
      id, submission_state: "submitted", cover_letter: "Revision",
    })).toBe(id);
  });

  it("does not claim an unresolved or conflicting write succeeded", () => {
    expect(reconcileApplicationWrite("submit", "Letter", null)).toBeNull();
    expect(reconcileApplicationWrite("save", "New", {
      id, submission_state: "draft", cover_letter: "Other",
    })).toBeNull();
    expect(reconcileApplicationWrite("edit", "New", {
      id, submission_state: "submitted", cover_letter: "Other",
    })).toBeNull();
  });
});
