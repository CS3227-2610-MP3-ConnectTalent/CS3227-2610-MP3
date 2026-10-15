## Problem

Paul reports a valid PDF uploads locally but is rejected on Vercel with HTTP 400
and a generic invalid/unencrypted/1 MiB message. Current validator maps worker
errors/timeouts to that same message; all upload routes return 400 for caught
failures. The known file passes local validation; hosted root cause is unconfirmed.

## Requested outcome

Distinguish safe, actionable file errors from server validation failures across
profile, fresh-application and existing-application uploads. Return stable safe
error codes and suitable HTTP statuses. Keep the existing PDF/type/size limits,
worker resource limits, permissions, attachment preservation and text retention.

## Acceptance

- Distinct messages for empty/missing file, invalid filename, over 1 MiB,
  unsupported type, encrypted PDF and damaged/unparseable/zero-page PDF.
- Worker/module startup failures and crashes produce a temporary validation-service
  message; a worker timeout produces a separate retry-later message, never a claim
  that the user's PDF is invalid.
- HTTP status distinguishes input rejection from server unavailability/timeout;
  UI presents the safe response message without losing typed fields/old files.
- Tests cover every classification, parser success, worker races/cleanup, route
  mapping and absence of raw parser details, stack traces or private file content.

Owner: Paul. Requirements: APP-006/007, SEC-009. No hosted configuration/deployment,
file-limit relaxation, parser replacement or unrelated UI change. Vercel root-cause
diagnosis remains open until deployed evidence is available.
