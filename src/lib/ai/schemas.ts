import { z } from "zod";

export const applicantDraftRequestSchema = z
  .object({
    jobId: z.uuid(),
    notes: z.string().trim().min(1).max(4000),
  })
  .strict();

export const applicantDraftResponseSchema = z
  .object({
    draft: z.string().trim().min(1).max(5000),
  })
  .strict();

export const hrSummaryRequestSchema = z
  .object({
    applicationId: z.uuid(),
  })
  .strict();

const summaryItemsSchema = z.array(z.string().trim().min(1).max(240)).max(5);

const sentenceIdsSchema = z
  .array(z.number().int().min(0))
  .max(5)
  .superRefine((ids, context) => {
    if (new Set(ids).size !== ids.length) {
      context.addIssue({
        code: "custom",
        message: "Sentence IDs must be distinct.",
      });
    }
  });

export const hrSummarySelectionSchema = z
  .object({
    evidence_sentence_ids: sentenceIdsSchema,
    requirements_not_addressed_ids: sentenceIdsSchema,
  })
  .strict();

export const hrSummaryResponseSchema = z
  .object({
    evidence_mentioned: summaryItemsSchema,
    requirements_not_addressed: summaryItemsSchema,
    follow_up_questions: summaryItemsSchema,
  })
  .strict();

export type ApplicantDraftRequest = z.infer<typeof applicantDraftRequestSchema>;
export type ApplicantDraftResponse = z.infer<
  typeof applicantDraftResponseSchema
>;
export type HrSummaryRequest = z.infer<typeof hrSummaryRequestSchema>;
export type HrSummarySelection = z.infer<typeof hrSummarySelectionSchema>;
export type HrSummaryResponse = z.infer<typeof hrSummaryResponseSchema>;
