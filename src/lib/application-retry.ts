import type { ApplicationDetails } from "./application-details";
export type ExistingApplication = ApplicationDetails & {
  education?: string | null; work_experience?: string | null; id: string; submission_state: "draft" | "submitted"; cover_letter: string; revision: number;
};
export function reconcileApplicationWrite(
  intent: "save" | "submit", attempted: ApplicationDetails & { cover_letter: string; education?: string | null; work_experience?: string | null },
  expectedRevision: number | null, existing: ExistingApplication | null,
): string | null {
  if (!existing) return null;
  if (intent === "submit" && existing.submission_state === "submitted") return existing.id;
  if (intent === "save" && existing.submission_state === "draft"
    && existing.revision === (expectedRevision ?? 0) + 1
    && existing.cover_letter === attempted.cover_letter
    && existing.full_name === attempted.full_name && existing.phone === attempted.phone
    && existing.portfolio_url === attempted.portfolio_url
    && (attempted.education === undefined || existing.education === attempted.education)
    && (attempted.work_experience === undefined || existing.work_experience === attempted.work_experience)) return existing.id;
  return null;
}
