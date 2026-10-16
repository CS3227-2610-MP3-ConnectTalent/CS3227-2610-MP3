import { expect, it } from "vitest";
import { buildHrSummaryResponse } from "@/lib/ai/hr-summary";

const selection = {
  evidence_sentence_ids: [0],
  requirements_not_addressed_ids: [0],
};
it.each([
  [[], ["Testing required."]],
  [["Synthetic evidence."], []],
])(
  "withholds summaries with no complete source pair",
  (letter, requirements) => {
    expect(buildHrSummaryResponse(selection, letter, requirements)).toBeNull();
  },
);

it("bounds long Unicode source excerpts without splitting characters or inventing claims", () => {
  const evidence = "a".repeat(238) + "🙂tail";
  const requirement = "Testing 🔬 ".repeat(50);
  const response = buildHrSummaryResponse(selection, [evidence], [requirement]);
  expect(response).not.toBeNull();
  const excerpt = response!.evidence_mentioned[0];
  expect(excerpt.length).toBeLessThanOrEqual(240);
  expect(excerpt.endsWith("…")).toBe(true);
  expect(excerpt).toBe("a".repeat(238) + "…");
  expect(evidence.startsWith(excerpt.slice(0, -1))).toBe(true);
  expect(response!.requirements_not_addressed[0].length).toBeLessThanOrEqual(
    240,
  );
  expect(response!.follow_up_questions[0].length).toBeLessThanOrEqual(240);
  for (const value of Object.values(response!).flat()) {
    expect(value).not.toMatch(
      /[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?<![\uD800-\uDBFF])[\uDC00-\uDFFF]/,
    );
  }
});

it("keeps a surrogate pair intact at the follow-up requirement cutoff", () => {
  const prefix = "Could you share an example related to this requirement: “";
  const suffix = "”?";
  const retained = "b".repeat(240 - prefix.length - suffix.length - 2);
  const response = buildHrSummaryResponse(
    selection,
    ["Synthetic evidence."],
    [retained + "🙂tail"],
  );
  expect(response!.follow_up_questions[0]).toBe(
    prefix + retained + "…" + suffix,
  );
});
