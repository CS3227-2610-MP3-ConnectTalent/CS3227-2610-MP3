"use client";
import { useState } from "react";
import { PHONE_COUNTRIES, splitPhone } from "@/lib/phone";

export function PhoneInput({ value, error }: { value: string | null; error?: string }) {
  const initial = splitPhone(value);
  const [country, setCountry] = useState(PHONE_COUNTRIES.find(item => item.code === initial.code)?.country ?? "SG");
  return <fieldset className="space-y-2">
    <legend className="font-medium">Phone number</legend>
    <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div><label htmlFor="phone-country">Country code</label><select id="phone-country" name="phone_country" value={country} onChange={event => setCountry(event.target.value as typeof country)}
        className="mt-2 w-full rounded-lg border p-3">
        {PHONE_COUNTRIES.map(item => <option key={item.country} value={item.country}>{item.label} ({item.code})</option>)}
      </select></div>
      <label>Phone number<input name="phone_national" type="tel" inputMode="numeric" autoComplete="tel-national" required
        pattern="[0-9]+" maxLength={14} defaultValue={initial.number} aria-invalid={Boolean(error)} aria-describedby={error ? "phone-error" : undefined}
        className="mt-2 w-full rounded-lg border p-3" /></label>
    </div>
    {error && <p id="phone-error" className="text-sm text-destructive">{error}</p>}
  </fieldset>;
}
