import { isInternationalPhone } from "./phone";

export function isProfileComplete(
  profile: { full_name?: string | null; phone?: string | null } | null,
  email?: string | null,
) {
  const name = profile?.full_name;
  return Boolean(
    email &&
    name &&
    name.trim().length > 0 &&
    [...name].length <= 120 &&
    !/[\u0000-\u001f\u007f-\u009f]/.test(name) &&
    isInternationalPhone(profile?.phone),
  );
}
