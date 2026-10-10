import countries from "./phone-countries.json";

// Checked-in labels avoid Node/browser ICU differences during hydration.
// Calling codes originate from libphonenumber-js 1.13.15; no runtime location lookup.
export const PHONE_COUNTRIES = countries;
const codes = [...new Set(PHONE_COUNTRIES.map(item => item.code))].sort((a, b) => b.length - a.length);
export function isInternationalPhone(value: unknown): value is string {
  return typeof value === "string" && /^\+[1-9][0-9]{6,14}$/.test(value);
}
export function splitPhone(value: string | null) {
  const code = codes.find(code => value?.startsWith(code)) ?? "+65";
  return { code, number: value?.startsWith(code) ? value.slice(code.length) : value ?? "" };
}
export function phoneFromForm(form: FormData) {
  if (!form.has("phone_country") && !form.has("phone_national")) return String(form.get("phone") ?? "");
  const code = PHONE_COUNTRIES.find(item => item.country === form.get("phone_country"))?.code ?? "";
  const number = String(form.get("phone_national") ?? "");
  return codes.includes(code) && number ? `${code}${number}` : "";
}
