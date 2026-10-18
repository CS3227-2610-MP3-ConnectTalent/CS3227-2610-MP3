import { z } from "zod";

const letterSchema = z.string().max(5000);

export function parseCoverLetter(value: unknown, mode: "draft" | "submit") {
  const result = letterSchema.safeParse(value);
  if (!result.success) {
    return {
      success: false as const,
      error: "Cover letter must be text of at most 5,000 characters.",
    };
  }
  if (mode === "submit" && result.data.trim().length === 0) {
    return {
      success: false as const,
      error: "Enter a cover letter before submitting.",
    };
  }
  return { success: true as const, value: result.data };
}
