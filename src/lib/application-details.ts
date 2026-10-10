import { z } from "zod";
import { isInternationalPhone } from "./phone";

export type ApplicationDetails = { full_name: string; phone: string | null; portfolio_url: string | null };
export type ApplicationFieldErrors = Partial<Record<keyof ApplicationDetails | "cover_letter" | "education" | "work_experience", string>>;
const controls = /[\u0000-\u001f\u007f-\u009f]/;
const characters = (value: string) => [...value].length;

export function isPortfolioUrl(value: string): boolean {
  if (/[\s\\]/u.test(value) || controls.test(value) || !/^https?:\/\//i.test(value)) return false;
  const authority = value.replace(/^https?:\/\//i, "").split(/[/?#]/, 1)[0];
  if (!/^(?:[\p{L}\p{N}_.-]+|\[[0-9a-f:]+\])(?::[0-9]{0,5})?$/iu.test(authority)) return false;
  const host = authority.startsWith("[") ? authority.slice(1, authority.indexOf("]")) : authority.split(":", 1)[0].replace(/\.+$/, "");
  if (!authority.startsWith("[") && /^(?:[0-9]+|0x[0-9a-f]+)$/i.test(host.split(".").at(-1) ?? "")) {
    if (!/^(?:(?:0|[1-9][0-9]{0,2})\.){3}(?:0|[1-9][0-9]{0,2})$/.test(host)
      || host.split(".").some((part) => Number(part) > 255)) return false;
  }
  try {
    const url = new URL(value);
    return (url.protocol === "https:" || url.protocol === "http:") && Boolean(url.hostname)
      && !url.username && !url.password;
  } catch { return false; }
}

const optionalText = (limit: number, message: string) => z.string().nullable()
  .refine((value) => value === null || !controls.test(value), message)
  .transform((value) => value?.trim() || null)
  .refine((value) => value === null || characters(value) <= limit, message);

export function parseApplicationDetails(values: unknown, mode: "draft" | "submit") {
  const schema = z.object({
    full_name: z.string().refine((value) => !controls.test(value), "Enter a name without control characters.")
      .transform((value) => value.trim())
      .refine((value) => characters(value) <= 120, "Use at most 120 characters for your name.")
      .refine((value) => mode === "draft" || value.length > 0, "Enter your full name before submitting."),
    phone: optionalText(40, "Enter a phone number without control characters.")
      .refine(value => mode === "draft" && value === null || isInternationalPhone(value), "Choose a country code and enter a phone number of 7–15 digits including the code."),
    portfolio_url: optionalText(2048, "Use at most 2,048 characters for your portfolio URL.")
      .refine((value) => value === null || isPortfolioUrl(value), "Enter an HTTP(S) portfolio URL without embedded credentials."),
  });
  const parsed = schema.safeParse(values);
  if (parsed.success) return { success: true as const, data: parsed.data, errors: {} };
  const errors: ApplicationFieldErrors = {};
  for (const issue of parsed.error.issues) {
    const field = issue.path[0] as keyof ApplicationDetails;
    errors[field] ??= issue.message;
  }
  return { success: false as const, data: undefined, errors };
}
