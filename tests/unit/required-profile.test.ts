import { expect, it } from "vitest";
import { parseProfile } from "../../src/lib/profile-input";
import { parseApplicationDetails } from "../../src/lib/application-details";
import { phoneFromForm, splitPhone } from "../../src/lib/phone";
import { isProfileComplete } from "../../src/lib/profile-readiness";
const fields = {
  full_name: "Synthetic Applicant",
  phone: "+6591234567",
  portfolio_url: null,
  education: null,
  work_experience: null,
};
it("derives readiness from persisted details and trusted email", () => {
  expect(isProfileComplete(fields, "verified@example.test")).toBe(true);
  expect(isProfileComplete(fields, null)).toBe(false);
  expect(
    isProfileComplete({ ...fields, full_name: "\t" }, "verified@example.test"),
  ).toBe(false);
  expect(
    isProfileComplete(
      { ...fields, phone: "91234567" },
      "verified@example.test",
    ),
  ).toBe(false);
});
it("composes phone from an allowed country and keeps malformed input invalid", () => {
  const form = new FormData();
  form.set("phone_country", "SG");
  form.set("phone_national", "91234567");
  form.set("dial_code", "+999"); // Untrusted extra fields cannot override the country.
  expect(phoneFromForm(form)).toBe("+6591234567");
  form.set("phone_country", "GB");
  expect(phoneFromForm(form)).toBe("+4491234567");
  form.set("phone_national", "abc");
  expect(parseProfile({ ...fields, phone: phoneFromForm(form) }).success).toBe(
    false,
  );
  form.set("phone_country", "invalid");
  expect(phoneFromForm(form)).toBe("");
  expect(splitPhone("+6591234567")).toEqual({
    code: "+65",
    number: "91234567",
  });
});
it("rejects missing name and phone instead of saving an incomplete profile", () => {
  expect(parseProfile({ ...fields, full_name: " " }).success).toBe(false);
  expect(parseProfile({ ...fields, phone: "" }).success).toBe(false);
});
it("requires a normalized international phone", () => {
  for (const phone of ["91234567", "+65 abc", "+123", "+1234567890123456"]) {
    expect(parseProfile({ ...fields, phone }).success).toBe(false);
  }
  expect(parseProfile(fields).success).toBe(true);
});
it("requires phone on application submission while keeping incomplete drafts possible", () => {
  expect(
    parseApplicationDetails({ ...fields, phone: null }, "submit").success,
  ).toBe(false);
  expect(
    parseApplicationDetails({ ...fields, phone: null }, "draft").success,
  ).toBe(true);
});
