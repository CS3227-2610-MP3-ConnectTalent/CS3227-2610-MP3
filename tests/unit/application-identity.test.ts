import { expect, it } from "vitest";
import { reconcileApplicationWrite } from "@/lib/application-retry";

const oldId = "12500000-0000-4000-8000-000000000001";
const newId = "12500000-0000-4000-8000-000000000002";
const fields = {
  full_name: "Synthetic Applicant",
  phone: "+6591234567",
  portfolio_url: null,
  cover_letter: "Original draft",
};

it.each(["save", "submit"] as const)(
  "does not reconcile %s against a different reapplication with matching fields/revision",
  (intent) => {
    expect(
      reconcileApplicationWrite(
        intent,
        fields,
        1,
        {
          ...fields,
          id: newId,
          revision: 2,
          submission_state: intent === "save" ? "draft" : "submitted",
        },
        oldId,
      ),
    ).toBeNull();
  },
);

it("still reconciles a lost save response for the original application", () => {
  expect(
    reconcileApplicationWrite(
      "save",
      fields,
      1,
      {
        ...fields,
        id: oldId,
        revision: 2,
        submission_state: "draft",
      },
      oldId,
    ),
  ).toBe(oldId);
});
