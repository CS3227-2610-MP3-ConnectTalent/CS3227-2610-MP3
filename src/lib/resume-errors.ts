import "server-only";

const failures = {
  RESUME_EMPTY: {
    status: 400,
    message: "Choose a PDF file containing at least one page.",
  },
  RESUME_FILENAME_INVALID: {
    status: 400,
    message:
      "Rename your PDF using a filename of at most 120 characters and try again.",
  },
  RESUME_TOO_LARGE: {
    status: 413,
    message: "This file exceeds 1 MiB. Choose a smaller PDF.",
  },
  RESUME_TYPE_UNSUPPORTED: {
    status: 415,
    message:
      "Choose a PDF file (.pdf). This upload was not recognised as a PDF.",
  },
  RESUME_PASSWORD_REQUIRED: {
    status: 422,
    message:
      "This PDF requires a password to open. Upload a copy that opens without a password.",
  },
  RESUME_INVALID: {
    status: 422,
    message: "This PDF could not be read. Export a new PDF and try again.",
  },
  RESUME_READ_FAILED: {
    status: 400,
    message:
      "The file could not be received completely. Select it again and retry.",
  },
  RESUME_VALIDATOR_UNAVAILABLE: {
    status: 503,
    message:
      "PDF checking is temporarily unavailable. Your file has not been saved. Try again later.",
  },
  RESUME_VALIDATION_TIMEOUT: {
    status: 504,
    message:
      "PDF checking took too long. Your file has not been saved. Try again.",
  },
} as const;

const preparationFailures = {
  RESUME_UPLOAD_PENDING: {
    status: 409,
    message:
      "A previous résumé change is still pending. Use Retry below to recover it.",
  },
  RESUME_JOB_CLOSED: {
    status: 409,
    message: "This job is no longer accepting résumé uploads.",
  },
  RESUME_APPLICATION_CHANGED: {
    status: 409,
    message:
      "Your application changed. Refresh it before uploading the résumé.",
  },
  RESUME_UPLOAD_OPERATION_CONFLICT: {
    status: 409,
    message:
      "This upload could not be matched to the selected file. Select the file again and retry.",
  },
  RESUME_UPLOAD_PREPARATION_FAILED: {
    status: 503,
    message:
      "We could not prepare this résumé upload. Try again later and share the reference code if the problem continues.",
  },
} as const;

export type ResumePreparationErrorCode = keyof typeof preparationFailures;

export type ResumeErrorCode = keyof typeof failures;

export class ResumeValidationError extends Error {
  constructor(readonly code: ResumeErrorCode) {
    super(failures[code].message);
    this.name = "ResumeValidationError";
  }
}

export class ResumeUploadPreparationError extends Error {
  constructor(
    readonly code: ResumePreparationErrorCode,
    readonly reference: string,
  ) {
    super(preparationFailures[code].message);
    this.name = "ResumeUploadPreparationError";
  }
}

// Re-read the allowlist rather than returning a possibly modified Error.message.
export function resumeValidationFailure(error: unknown) {
  if (!(error instanceof ResumeValidationError)) return null;
  const failure = failures[error.code];
  return { code: error.code, error: failure.message, status: failure.status };
}

export function resumeUploadPreparationFailure(error: unknown) {
  if (!(error instanceof ResumeUploadPreparationError)) return null;
  const failure = preparationFailures[error.code];
  return {
    code: error.code,
    error: failure.message,
    reference: error.reference,
    status: failure.status,
  };
}

export function resumeFailureStatus(error: unknown) {
  return (
    resumeValidationFailure(error)?.status ??
    resumeUploadPreparationFailure(error)?.status ??
    400
  );
}
