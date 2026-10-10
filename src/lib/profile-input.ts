import { z } from "zod";
import { parseApplicationDetails } from "./application-details";

export type Background = { education: string | null; work_experience: string | null };
const multiline = z.string().nullable().optional()
  .refine((value) => value == null || !/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f-\u009f]/u.test(value), "Use ordinary text without control characters.")
  .transform((value) => value?.trim() || null)
  .refine((value) => value === null || [...value].length <= 2000, "Use at most 2,000 characters.");
export function parseBackground(values: unknown) {
  const result = z.object({ education: multiline, work_experience: multiline }).safeParse(values);
  if (result.success) return { success: true as const, data: result.data, errors: {} };
  const errors: Partial<Record<keyof Background, string>> = {};
  for (const issue of result.error.issues) errors[issue.path[0] as keyof Background] ??= issue.message;
  return { success: false as const, errors };
}
export function parseProfile(values: unknown) {
  const details = parseApplicationDetails(values, "draft");
  const background = parseBackground(values);
  if (!details.success || !background.success) return { success: false as const, errors: { ...details.errors, ...background.errors } };
  return { success: true as const, data: { ...details.data, ...background.data }, errors: {} };
}
