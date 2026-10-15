# Proposed APP-007 clarification — not yet canonical

Classification: MODIFIED failure feedback for APP-007, inherited by APP-006 profile
résumés. SEC-009 privacy and existing success/denial/storage rules unchanged.

Before: The interface MUST state the PDF/size limit and show safe upload errors
without losing text/profile fields or the previous attached file.

After: The interface MUST state the PDF/size limit and show safe upload errors
without losing text/profile fields or the previous attached file. Empty/missing,
invalid-name, unsupported-type, oversized, password-required and structurally unreadable
PDF rejections MUST have actionable messages. Temporary server validation failure
and validation timeout MUST be distinguished from invalid-file rejection, and MUST
NOT claim that the file is invalid. Upload endpoints MUST return allowlisted safe
codes/messages with input-rejection or server-failure HTTP statuses appropriate to
the category. They MUST NOT expose raw exception details, private document content,
credentials or server filesystem paths. Validation still fails closed before file
storage/finalization; retry MUST preserve the existing attachment and typed fields.

Scenarios:

- Given an oversized or password-required synthetic PDF, upload is rejected with its
  specific safe category, preserving the earlier attachment and form values.
- Given a structurally valid encrypted PDF that opens without a password, upload
  succeeds and stores the original bytes unchanged, under existing ownership rules.
- Given a valid PDF and unavailable/crashed parser worker, the result reports
  temporary validation service unavailability, without writing the new file.
- Given the worker deadline is exceeded, the result reports validation timeout;
  later worker events cannot change the settled result or finalize the upload.
- Given an invalid role/owner, existing authorization denial still applies; no
  classification response reveals another user's file or metadata.
- Given a parser exception with private/internal details, only the allowlisted
  category and user-facing message leave the server.
