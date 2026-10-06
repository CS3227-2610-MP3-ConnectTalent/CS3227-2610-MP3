export const JOB_CATEGORIES = [
  { value: "engineering", label: "Engineering" },
  { value: "human_resources", label: "Human Resources" },
  { value: "legal", label: "Legal" },
  { value: "sales", label: "Sales" },
  { value: "other", label: "Other" },
] as const;

export type JobCategory = (typeof JOB_CATEGORIES)[number]["value"];

export function isJobCategory(value: unknown): value is JobCategory {
  return typeof value === "string" && JOB_CATEGORIES.some((category) => category.value === value);
}

export function categoryLabel(value: JobCategory): string {
  return JOB_CATEGORIES.find((category) => category.value === value)?.label ?? value;
}
