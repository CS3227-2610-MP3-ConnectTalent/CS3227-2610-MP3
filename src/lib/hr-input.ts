import { z } from "zod";

export const hrReviewStatusSchema = z.enum(["submitted", "in_review", "shortlisted", "rejected"]);
export type HRReviewStatus = z.infer<typeof hrReviewStatusSchema>;

const hrActionStatusSchema = z.enum(["in_review", "shortlisted", "rejected"]);
const hrNoteSchema = z.string().max(2000).refine((value) => value.trim().length > 0);
const revisionSchema = z.coerce.number<number>().int().positive();

export function parseHRNote(value: unknown) {
  const parsed = hrNoteSchema.safeParse(value);
  return parsed.success
    ? { success: true as const, value: parsed.data }
    : { success: false as const, error: "Enter a note of at most 2,000 characters." };
}

export function parseHRStatusChange(status: unknown, expectedRevision: unknown) {
  const parsed = z.object({ status: hrActionStatusSchema, expectedRevision: revisionSchema })
    .safeParse({ status, expectedRevision });
  return parsed.success
    ? { success: true as const, value: parsed.data }
    : { success: false as const, error: "Choose a valid status and reload before trying again." };
}

export function reviewStatusLabel(status: HRReviewStatus) {
  return {
    submitted: "Submitted",
    in_review: "In review",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
  }[status];
}
