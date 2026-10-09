import { z } from "zod";

export const applicantDraftRequestSchema = z.object({
  jobId: z.uuid(),
  notes: z.string().trim().min(1).max(4000),
}).strict();

export const applicantDraftResponseSchema = z.object({
  draft: z.string().trim().min(1).max(5000),
}).strict();

export const hrSummaryRequestSchema = z.object({
  applicationId: z.uuid(),
}).strict();

const hiringDecisionLanguage = /\b(?:hire(?:d|s|ing)?|reject(?:ed|ion)?|rank(?:ed|ing)?|recommend(?:ed|ation)?|shortlist(?:ed)?|scor(?:e|ed|ing)|top candidate|best candidate|best fit|advance(?:d)? (?:the applicant|this candidate|to (?:the )?(?:next|final) (?:round|stage))|move forward with|select(?:ed|ion)?)\b/i;

const summaryItemsSchema = z.array(z.string().trim().min(1).max(240).refine(
  (item) => !hiringDecisionLanguage.test(item),
  "Summary text must not recommend or rank applicants.",
)).max(5);

export const hrSummaryResponseSchema = z.object({
  evidence_mentioned: summaryItemsSchema,
  requirements_not_addressed: summaryItemsSchema,
  follow_up_questions: summaryItemsSchema,
}).strict();

export type ApplicantDraftRequest = z.infer<typeof applicantDraftRequestSchema>;
export type ApplicantDraftResponse = z.infer<typeof applicantDraftResponseSchema>;
export type HrSummaryRequest = z.infer<typeof hrSummaryRequestSchema>;
export type HrSummaryResponse = z.infer<typeof hrSummaryResponseSchema>;
