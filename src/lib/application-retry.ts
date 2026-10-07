export type ExistingApplication = {
  id: string;
  submission_state: "draft" | "submitted";
  cover_letter: string;
};

export function reconcileApplicationWrite(
  intent: "save" | "submit" | "edit",
  attemptedLetter: string,
  existing: ExistingApplication | null,
): string | null {
  if (!existing) return null;
  if (intent === "submit" && existing.submission_state === "submitted") return existing.id;
  if (intent === "save" && existing.submission_state === "draft"
    && existing.cover_letter === attemptedLetter) return existing.id;
  if (intent === "edit" && existing.submission_state === "submitted"
    && existing.cover_letter === attemptedLetter) return existing.id;
  return null;
}
