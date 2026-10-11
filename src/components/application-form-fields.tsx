"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/phone-input";
import type { ApplicationFormState } from "@/lib/application-form-state";

type Values = ApplicationFormState["values"];
type Errors = ApplicationFormState["errors"];

export function ApplicantContactFields({
  values,
  errors,
  email,
}: {
  values: Values;
  errors: Errors;
  email: string;
}) {
  return (
    <>
      <FullNameField value={values.full_name} error={errors.full_name} />
      <VerifiedEmailField email={email} />
      <PhoneInput value={values.phone} error={errors.phone} />
      <PortfolioField
        value={values.portfolio_url}
        error={errors.portfolio_url}
      />
    </>
  );
}

function FullNameField({ value, error }: { value: string; error?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="full_name">Full name</Label>
      <input
        id="full_name"
        name="full_name"
        required
        maxLength={120}
        autoComplete="name"
        defaultValue={value}
        aria-invalid={Boolean(error)}
        aria-describedby="name-help"
        className="w-full rounded-lg border p-3"
      />
      <p id="name-help" className="text-sm text-muted-foreground">
        {error ?? "Required when submitting. Maximum 120 characters."}
      </p>
    </div>
  );
}

function VerifiedEmailField({ email }: { email: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="verified_email">Verified email</Label>
      <input
        id="verified_email"
        type="email"
        readOnly
        value={email}
        className="w-full rounded-lg border bg-muted p-3"
        aria-describedby="email-help"
      />
      <p id="email-help" className="text-sm text-muted-foreground">
        From your verified account. This address is recorded when you submit.
      </p>
    </div>
  );
}

function PortfolioField({ value, error }: { value: string; error?: string }) {
  return (
    <div className="space-y-2">
      <Label htmlFor="portfolio_url">Portfolio URL (optional)</Label>
      <input
        id="portfolio_url"
        name="portfolio_url"
        inputMode="url"
        maxLength={2048}
        defaultValue={value}
        aria-invalid={Boolean(error)}
        aria-describedby="portfolio-help"
        className="w-full rounded-lg border p-3"
      />
      <p id="portfolio-help" className="text-sm text-muted-foreground">
        {error ??
          "Use an http:// or https:// address without embedded credentials. Maximum 2,048 characters."}
      </p>
    </div>
  );
}

export function ApplicationBackgroundFields({
  values,
  errors,
}: {
  values: Values;
  errors: Errors;
}) {
  return (
    <>
      <BackgroundField
        name="education"
        label="Education (optional)"
        value={values.education}
        error={errors.education}
      />
      <BackgroundField
        name="work_experience"
        label="Work experience (optional)"
        value={values.work_experience}
        error={errors.work_experience}
      />
    </>
  );
}

function BackgroundField({
  name,
  label,
  value,
  error,
}: {
  name: "education" | "work_experience";
  label: string;
  value?: string;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name}>{label}</Label>
      <Textarea
        id={name}
        name={name}
        rows={5}
        maxLength={2000}
        defaultValue={value}
        aria-invalid={Boolean(error)}
        aria-describedby={`${name}-help`}
      />
      <p id={`${name}-help`} className="text-sm text-muted-foreground">
        {error ??
          "Optional. Maximum 2,000 characters. Submitted details are locked."}
      </p>
    </div>
  );
}

export function CoverLetterField({
  value,
  error,
  onChange,
}: {
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor="cover_letter">Cover letter</Label>
      <Textarea
        id="cover_letter"
        name="cover_letter"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={5000}
        rows={12}
        aria-invalid={Boolean(error)}
        aria-describedby="letter-help"
      />
      <p id="letter-help" className="text-sm text-muted-foreground">
        {error ??
          "Maximum 5,000 characters. Drafts are private; submission shares your details and letter with HR and locks them."}
      </p>
    </div>
  );
}

export function ApplicationFormActions() {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="submit"
        name="intent"
        value="save"
        formNoValidate
        className="rounded-lg border px-4 py-2"
      >
        Save draft
      </button>
      <button
        type="submit"
        name="intent"
        value="submit"
        className="rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Submit application
      </button>
    </div>
  );
}
