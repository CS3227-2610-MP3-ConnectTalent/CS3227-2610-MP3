import { expect, it } from "vitest";

import {
  applicantDraftRequestSchema,
  applicantDraftResponseSchema,
  hrSummaryRequestSchema,
  hrSummaryResponseSchema,
  hrSummarySelectionSchema,
} from "@/lib/ai/schemas";
import { splitHrSummarySource } from "@/lib/ai/hr-summary";

const jobId = "00000000-0000-4000-8000-000000000101";
const applicationId = "00000000-0000-4000-8000-000000000a11";

it("accepts bounded Applicant notes and rejects oversized or extra input", () => {
  expect(
    applicantDraftRequestSchema.safeParse({
      jobId,
      notes: "Built a course project",
    }).success,
  ).toBe(true);
  expect(
    applicantDraftRequestSchema.safeParse({ jobId, notes: "x".repeat(4001) })
      .success,
  ).toBe(false);
  expect(
    applicantDraftRequestSchema.safeParse({
      jobId,
      notes: "notes",
      applicationId,
    }).success,
  ).toBe(false);
});

it("accepts only a selected HR application identifier", () => {
  expect(hrSummaryRequestSchema.safeParse({ applicationId }).success).toBe(
    true,
  );
  expect(
    hrSummaryRequestSchema.safeParse({ applicationId, applicantId: jobId })
      .success,
  ).toBe(false);
});

it("rejects empty, oversized, or extra-field draft output", () => {
  expect(
    applicantDraftResponseSchema.safeParse({ draft: "A concise draft." })
      .success,
  ).toBe(true);
  expect(applicantDraftResponseSchema.safeParse({ draft: " " }).success).toBe(
    false,
  );
  expect(
    applicantDraftResponseSchema.safeParse({ draft: "x".repeat(5001) }).success,
  ).toBe(false);
  expect(
    applicantDraftResponseSchema.safeParse({
      draft: "Draft",
      status: "submitted",
    }).success,
  ).toBe(false);
});

it("requires exactly three short HR display arrays and permits source wording", () => {
  const valid = {
    evidence_mentioned: ["Previous employer hired five team members."],
    requirements_not_addressed: ["Cloud deployment experience."],
    follow_up_questions: [
      "Could you share an example related to this requirement?",
    ],
  };
  expect(hrSummaryResponseSchema.safeParse(valid).success).toBe(true);
  expect(
    hrSummaryResponseSchema.safeParse({ ...valid, recommendation: "Hire" })
      .success,
  ).toBe(false);
  expect(
    hrSummaryResponseSchema.safeParse({
      ...valid,
      follow_up_questions: [],
      extra: true,
    }).success,
  ).toBe(false);
  expect(
    hrSummaryResponseSchema.safeParse({
      ...valid,
      evidence_mentioned: Array(6).fill("Evidence"),
    }).success,
  ).toBe(false);
  expect(
    hrSummaryResponseSchema.safeParse({
      ...valid,
      evidence_mentioned: ["x".repeat(241)],
    }).success,
  ).toBe(false);
  expect(
    hrSummaryResponseSchema.safeParse({
      evidence_mentioned: [],
      requirements_not_addressed: [],
    }).success,
  ).toBe(false);
});

it("accepts only distinct bounded source sentence IDs from the model", () => {
  const valid = {
    evidence_sentence_ids: [0, 2],
    requirements_not_addressed_ids: [1],
  };
  expect(hrSummarySelectionSchema.safeParse(valid).success).toBe(true);
  expect(
    hrSummarySelectionSchema.safeParse({
      ...valid,
      follow_up_questions: ["Question"],
    }).success,
  ).toBe(false);
  expect(
    hrSummarySelectionSchema.safeParse({
      ...valid,
      evidence_sentence_ids: [0, 0],
    }).success,
  ).toBe(false);
  expect(
    hrSummarySelectionSchema.safeParse({
      ...valid,
      evidence_sentence_ids: [-1],
    }).success,
  ).toBe(false);
  expect(
    hrSummarySelectionSchema.safeParse({
      ...valid,
      evidence_sentence_ids: [0, 1, 2, 3, 4, 5],
    }).success,
  ).toBe(false);
  expect(
    hrSummarySelectionSchema.safeParse({
      evidence_sentence_ids: [
        "This applicant is the strongest candidate to advance",
      ],
      requirements_not_addressed_ids: [],
    }).success,
  ).toBe(false);
});

it("keeps script-like output as plain string data for escaped React rendering", () => {
  const markup = "<script>window.location='https://attacker.invalid'</script>";
  const parsed = applicantDraftResponseSchema.parse({ draft: markup });
  expect(parsed.draft).toBe(markup);
});

it("splits source text into stable sentences while preserving abbreviations and line boundaries", () => {
  expect(
    splitHrSummarySource(
      "Dr. Ada built version 2.1 tools.\r\nCloud deployment experience",
    ),
  ).toEqual([
    "Dr. Ada built version 2.1 tools.",
    "Cloud deployment experience",
  ]);
});
