import type { ApplicationDetails } from "./application-details";
export type ExistingApplication = ApplicationDetails & {
  id: string; submission_state: "draft" | "submitted"; cover_letter: string; revision: number;
};
export function reconcileApplicationWrite(
  intent: "save" | "submit", attempted: ApplicationDetails & { cover_letter: string },
  expectedRevision: number | null, existing: ExistingApplication | null,
): string | null {
  if (!existing) return null;
  if (intent === "submit" && existing.submission_state === "submitted") return existing.id;
  if (intent === "save" && existing.submission_state === "draft"
    && existing.revision === (expectedRevision ?? 0) + 1
    && existing.cover_letter === attempted.cover_letter
    && existing.full_name === attempted.full_name && existing.phone === attempted.phone
    && existing.portfolio_url === attempted.portfolio_url) return existing.id;
  return null;
}
