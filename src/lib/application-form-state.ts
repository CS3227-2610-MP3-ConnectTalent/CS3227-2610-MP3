import type { ApplicationFieldErrors } from "@/lib/application-details";

export type ApplicationFormValues = {
  full_name: string;
  phone: string;
  portfolio_url: string;
  cover_letter: string;
  education?: string;
  work_experience?: string;
};

export type ApplicationFormState = {
  values: ApplicationFormValues;
  errors: ApplicationFieldErrors;
  message?: string;
};

export type ApplicationStateDetails = {
  full_name: string | null;
  phone: string | null;
  portfolio_url: string | null;
  submitted_email: string | null;
  education?: string | null;
  work_experience?: string | null;
};

export function createInitialApplicationState(
  details: ApplicationStateDetails,
  coverLetter: string,
): ApplicationFormState {
  return {
    values: {
      education: details.education ?? "",
      work_experience: details.work_experience ?? "",
      full_name: details.full_name ?? "",
      phone: details.phone ?? "",
      portfolio_url: details.portfolio_url ?? "",
      cover_letter: coverLetter,
    },
    errors: {},
  };
}
