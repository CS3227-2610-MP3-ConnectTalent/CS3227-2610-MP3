# Design: résumé upload failure diagnostics and recovery

- Change ID/issues: `2026-10-14-resume-upload-diagnostics`; #76 and PR #77
- Owner/status/date: Paul; approved; 5-second timeout revision implemented, verification pending; 2026-10-14
- Inputs: approved follow-up proposal; no canonical delta; ProductSpec v1.10, APP-006/APP-007, SEC-009
- Scope and components: `src/lib/resume-pdf-check.ts`, `src/lib/application-resume-uploads.ts`, `src/lib/resume-errors.ts`, `src/lib/resume-request.ts`, and focused unit tests.

## Decisions and alternatives

| Decision                                                                                                                        | Considered alternatives                                               | Reason and tradeoffs                                                                                                                                                                                   | Human approval reference                                                               |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| Continue job uploads from the validated `prepare_application_resume` response (`id`, `revision`, `object_path`, `state`)        | Grant direct SELECT to `service_role`; add another broad table reader | The RPC already validates actor/job/revision/file identity and returns the storage path. Avoiding direct reads preserves the table's closed privilege boundary and removes the observed 42501 failure. | Paul, chat approval 2026-10-14; implementation adjustment based on hosted log evidence |
| Emit structured, data-minimized failure logs with random reference IDs                                                          | Return/log upstream message/details/hint                              | SQLSTATE, HTTP status, fixed stage/category and elapsed time are sufficient for support correlation without leaking private or dynamic content.                                                        | Paul, chat approval 2026-10-14                                                         |
| Keep one 5-second worker deadline, preserve 64/16 MiB worker memory limits, and optimize independent imports with `Promise.all` | Remove deadline or increase memory/file limits                        | A bounded increase addresses observed timeout sensitivity under local resource contention while still terminating prolonged parser work on untrusted files. Memory and input bounds remain unchanged.  | Paul, chat approval of bounded revision 2026-10-14                                     |

## Interfaces and data flow

Applicant → authenticated job résumé route → existing file validation → `prepare_application_resume` SECURITY DEFINER RPC → zod-validated response. `ready` means the exact operation is already finalized and the route can return success. `pending` supplies a validated application/object path; the server uploads bytes to private Storage and finalizes by RPC. No direct select from `application_resume_objects` is needed in this job path.

PDF worker sends only phase markers (`parser-import`, `document-load`, `page-structure`) and its existing allowlisted final result. A timeout log contains a fixed event name, current phase, and rounded elapsed milliseconds. It never contains bytes, filename, page count, hash, parser message or path.

For prepare failures, server logs contain a random UUID reference, fixed stage, allowlisted five-character SQLSTATE (if present), numeric upstream HTTP status (if present), and a fixed failure category. Client JSON contains a safe code, fixed user message and reference UUID. No raw database message/details/hint are exposed.

## Authorization and privacy impact

No authorization policy or RLS changes. The existing service-only security-definer functions remain the database access boundary. Object paths are validated before Storage use. Logs and responses exclude actor/job/application IDs, filenames, hashes, file bytes, tokens, SQL text and raw exceptions. No AI path is involved.

## Failure behavior

| Failure / input                                                              | Observable outcome / state guarantees                                                                                             | Verification         |
| ---------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Parser startup, PDF loading, or page iteration exceeds the 5-second deadline | Existing safe timeout message/status; server log records fixed phase and elapsed time; worker is terminated                       | UPLOAD-DIAG-AC-01    |
| Prepare RPC returns `23505` for the one-pending constraint                   | Safe 409 code/message directs the Applicant to the existing Retry upload recovery action; internal log is correlated by reference | UPLOAD-DIAG-AC-03    |
| Other RPC error or malformed response                                        | Safe temporary preparation failure with reference and 503; raw upstream data remains private                                      | UPLOAD-DIAG-AC-03    |
| RPC returns `ready`                                                          | No duplicate Storage write; the operation is already finalized                                                                    | UPLOAD-DIAG-AC-02    |
| RPC returns `pending` with malformed path/shape                              | Fail closed before Storage, log only a safe invalid-response category and reference                                               | UPLOAD-DIAG-AC-02/03 |

## Migration and backward compatibility

No database migration or environment change. This consumes the current RPC JSON contract and keeps private table privileges unchanged. Existing routes and file/status limits stay.

## Rollout and rollback

No production deployment. PR Preview verification needs a fresh deployment after separate review/acceptance and publication gates. Rollback is reverting the scoped source change; no data migration is involved. Any existing stale pending object is handled by the existing Retry recovery flow and cleanup RPC.

## Review and unresolved decisions

- [x] Interface, requirement, privacy, failure and no-migration impacts assessed.
- Findings/owner/resolution: independent review pending.
- Human approval: Paul approved the original scope and the 5-second bounded timeout revision in chat on 2026-10-14, then accepted the implementation in chat on 2026-10-14. Independent review and runtime verification remain pending.
