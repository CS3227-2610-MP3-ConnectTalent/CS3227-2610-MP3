import { z } from "zod";

export const resultSchema = z
  .object({
    caseId: z.string().regex(/^(?:A|H|D|S)\d{2}$/),
    category: z.enum(["prompt-contract", "output-contract", "model-smoke"]),
    variant: z.enum(["baseline", "refined", "offline"]),
    outcome: z.enum(["passed", "failed", "blocked"]),
    check: z.enum([
      "boundary-contract",
      "strict-output",
      "schema-and-markers",
      "provider-unavailable",
      "provider-rate-limit",
    ]),
    elapsedMs: z.number().int().min(0),
    humanReview: z.literal("pending"),
  })
  .strict();
export type EvalResult = z.infer<typeof resultSchema>;

/** Reject unexpected fields rather than silently exporting raw model text. */
export function safeReport(mode: "offline" | "live", results: unknown[]) {
  return {
    version: "ai-security-v1",
    mode,
    results: results.map((row) => resultSchema.parse(row)),
  };
}
