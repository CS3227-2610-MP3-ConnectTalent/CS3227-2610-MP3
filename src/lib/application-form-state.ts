import type { ApplicationFieldErrors } from "@/lib/application-details";
export type ApplicationFormValues = { full_name: string; phone: string; portfolio_url: string; cover_letter: string };
export type ApplicationFormState = { values: ApplicationFormValues; errors: ApplicationFieldErrors; message?: string };
