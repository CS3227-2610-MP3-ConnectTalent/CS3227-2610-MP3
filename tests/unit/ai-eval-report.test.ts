import { expect, it } from "vitest";
import { safeReport } from "../evals/report";
import { promptCases, invalidDrafts, invalidSelections } from "../evals/corpus";
import liveResult from "../evals/results/2026-10-16-live-report.json";

const row = {
  caseId: "A01",
  category: "model-smoke",
  variant: "refined",
  outcome: "passed",
  check: "schema-and-markers",
  elapsedMs: 20,
  humanReview: "pending",
};

it("keeps published live evidence allowlisted with every failure and pending review", () => {
  const report = safeReport("live", liveResult.results);
  expect(report.results).toHaveLength(24);
  expect(
    report.results.filter((item) => item.outcome === "failed"),
  ).toHaveLength(7);
  expect(report.results.every((item) => item.humanReview === "pending")).toBe(
    true,
  );
  expect(
    new Set(report.results.map((item) => `${item.caseId}:${item.variant}`))
      .size,
  ).toBe(24);
});
it("keeps the fixed live dataset to twelve synthetic cases and 48 offline cases", () => {
  expect(promptCases.filter((item) => item.live)).toHaveLength(12);
  expect(
    promptCases.length + invalidDrafts.length + invalidSelections.length,
  ).toBe(48);
  expect(new Set(promptCases.map((item) => item.id)).size).toBe(
    promptCases.length,
  );
});
it.each(["response", "prompt", "apiKey", "error", "approved"])(
  "refuses report field %s",
  (field) => {
    expect(() =>
      safeReport("live", [{ ...row, [field]: "private or model-authored" }]),
    ).toThrow();
  },
);
it("does not accept a model-authored verdict as human approval", () => {
  expect(() =>
    safeReport("live", [{ ...row, humanReview: "approved" }]),
  ).toThrow();
  expect(safeReport("live", [row]).results[0].humanReview).toBe("pending");
});
