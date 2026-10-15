import { z } from "zod";

import { JOB_CATEGORIES, type JobCategory } from "./job-categories";

const categories = JOB_CATEGORIES.map((category) => category.value) as [
  JobCategory,
  ...JobCategory[],
];
const text = (max: number) => z.string().trim().min(1).max(max);

function parseOptionalDatetime(val: unknown): string | null | undefined {
  if (val === null || val === undefined) return null;
  if (typeof val !== "string") return undefined;
  const trimmed = val.trim();
  if (trimmed === "") return null;
  const d = new Date(trimmed);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString();
}

const optionalDatetimeSchema = z.custom<string | null>(
  (val) =>
    val === null ||
    (typeof val === "string" && !Number.isNaN(new Date(val).getTime())),
);

const jobFieldsSchema = z
  .object({
    title: text(160),
    team: text(120),
    category: z.enum(categories),
    description: text(10000),
    requirements: text(10000),
    opens_at: optionalDatetimeSchema,
    closes_at: optionalDatetimeSchema,
  })
  .refine(
    (data) => {
      if (data.opens_at && data.closes_at) {
        return (
          new Date(data.closes_at).getTime() > new Date(data.opens_at).getTime()
        );
      }
      return true;
    },
    { message: "Closing time must be after opening time" },
  );

type ParseResult<T> = { success: true; value: T } | { success: false };
export type HRJobFields = z.infer<typeof jobFieldsSchema>;

export function parseHRJobFields(formData: FormData): ParseResult<HRJobFields> {
  const opensAtRaw = formData.get("opensAt") ?? formData.get("opens_at");
  const closesAtRaw = formData.get("closesAt") ?? formData.get("closes_at");

  const opensAt = parseOptionalDatetime(opensAtRaw);
  const closesAt = parseOptionalDatetime(closesAtRaw);

  if (opensAt === undefined || closesAt === undefined) {
    return { success: false };
  }

  const parsed = jobFieldsSchema.safeParse({
    title: formData.get("title"),
    team: formData.get("team"),
    category: formData.get("category"),
    description: formData.get("description"),
    requirements: formData.get("requirements"),
    opens_at: opensAt,
    closes_at: closesAt,
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
