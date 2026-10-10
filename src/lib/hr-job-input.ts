import { z } from "zod";

import { JOB_CATEGORIES, type JobCategory } from "./job-categories";

const categories = JOB_CATEGORIES.map((category) => category.value) as [
  JobCategory,
  ...JobCategory[],
];
const text = (max: number) => z.string().trim().min(1).max(max);

const jobFieldsSchema = z.object({
  title: text(160),
  team: text(120),
  category: z.enum(categories),
  description: text(10000),
  requirements: text(10000),
});

type ParseResult<T> = { success: true; value: T } | { success: false };
export type HRJobFields = z.infer<typeof jobFieldsSchema>;

export function parseHRJobFields(formData: FormData): ParseResult<HRJobFields> {
  const parsed = jobFieldsSchema.safeParse({
    title: formData.get("title"),
    team: formData.get("team"),
    category: formData.get("category"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
  });
  return parsed.success
    ? { success: true, value: parsed.data }
    : { success: false };
}

export function parseHRJobId(value: unknown): ParseResult<string> {
  const parsed = z.uuid().safeParse(value);
  return parsed.success
    ? { success: true, value: parsed.data }
    : { success: false };
}
