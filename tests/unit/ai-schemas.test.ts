import { describe, expect, it } from "vitest";

import {
  applicantDraftRequestSchema,
  applicantDraftResponseSchema,
  hrSummaryRequestSchema,
  hrSummaryResponseSchema,
} from "@/lib/ai/schemas";

const jobId = "00000000-0000-4000-8000-000000000101";
const applicationId = "00000000-0000-4000-8000-000000000a11";

describe("AI request contracts", () => {
  it("accepts bounded Applicant notes and rejects oversized or extra input", () => {
    expect(applicantDraftRequestSchema.safeParse({ jobId, notes: "Built a course project" }).success).toBe(true);
    expect(applicantDraftRequestSchema.safeParse({ jobId, notes: "x".repeat(4001) }).success).toBe(false);
    expect(applicantDraftRequestSchema.safeParse({ jobId, notes: "notes", applicationId }).success).toBe(false);
  });

  it("accepts only a selected HR application identifier", () => {
    expect(hrSummaryRequestSchema.safeParse({ applicationId }).success).toBe(true);
    expect(hrSummaryRequestSchema.safeParse({ applicationId, applicantId: jobId }).success).toBe(false);
  });
});

describe("AI response contracts", () => {
  it("rejects empty, oversized, or extra-field draft output", () => {
    expect(applicantDraftResponseSchema.safeParse({ draft: "A concise draft." }).success).toBe(true);
    expect(applicantDraftResponseSchema.safeParse({ draft: " " }).success).toBe(false);
    expect(applicantDraftResponseSchema.safeParse({ draft: "x".repeat(5001) }).success).toBe(false);
    expect(applicantDraftResponseSchema.safeParse({ draft: "Draft", status: "submitted" }).success).toBe(false);
  });

  it("requires exactly three short HR summary arrays", () => {
    const valid = {
      evidence_mentioned: ["Mentions a course project"],
      requirements_not_addressed: ["No deployment experience described"],
      follow_up_questions: ["Which deployment tools did you use?"],
    };
    expect(hrSummaryResponseSchema.safeParse(valid).success).toBe(true);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, recommendation: "Hire" }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, evidence_mentioned: ["Recommend hiring this applicant"] }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, follow_up_questions: ["Should we reject this applicant?"] }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, requirements_not_addressed: ["This is the top candidate"] }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, follow_up_questions: [] , extra: true }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, evidence_mentioned: Array(6).fill("Evidence") }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ ...valid, evidence_mentioned: ["x".repeat(241)] }).success).toBe(false);
    expect(hrSummaryResponseSchema.safeParse({ evidence_mentioned: [], requirements_not_addressed: [] }).success).toBe(false);
  });

  it("keeps script-like output as plain string data for escaped React rendering", () => {
    const markup = "<script>window.location='https://attacker.invalid'</script>";
    const parsed = applicantDraftResponseSchema.parse({ draft: markup });
    expect(parsed.draft).toBe(markup);
  });
});
