import { describe, expect, it } from "vitest";
import { reconcileApplicationWrite } from "../../src/lib/application-retry";
const attempted = {
  full_name: "Synthetic Applicant",
  phone: null,
  portfolio_url: null,
  cover_letter: "Draft",
};
const existing = {
  ...attempted,
  id: "00000000-0000-4000-8000-000000000a11",
  submission_state: "draft" as const,
  revision: 2,
};
describe("complete-field uncertain write reconciliation", () => {
  it("recognizes exactly the expected saved field set and revision", () => {
    expect(reconcileApplicationWrite("save", attempted, 1, existing)).toBe(
      existing.id,
    );
  });
  it.each([
    { full_name: "Other" },
    { phone: "+65 1234" },
    { portfolio_url: "https://example.test" },
    { cover_letter: "Other" },
    { revision: 3 },
  ])("does not falsely report a mismatched save %j", (change) => {
    expect(
      reconcileApplicationWrite("save", attempted, 1, {
        ...existing,
        ...change,
      }),
    ).toBeNull();
  });
  it("shows an existing frozen submission without claiming the attempted fields were saved", () => {
    expect(
      reconcileApplicationWrite("submit", attempted, 1, {
        ...existing,
        full_name: "Original",
        submission_state: "submitted",
      }),
    ).toBe(existing.id);
  });
  it("does not mistake a draft or failed read for submission", () => {
    expect(
      reconcileApplicationWrite("submit", attempted, 1, existing),
    ).toBeNull();
    expect(reconcileApplicationWrite("save", attempted, 1, null)).toBeNull();
  });
});
