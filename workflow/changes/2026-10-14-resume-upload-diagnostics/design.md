# Design: résumé upload failure diagnostics and recovery

- Change ID/issues: `2026-10-14-resume-upload-diagnostics`; #76 and PR #77
- Owner/status/date: Paul; original scope accepted; 2026-10-15 upload-action UX approved; latest review fixes implemented and under final verification; hosted upload verification pending; 2026-10-14 onward
- Inputs: approved follow-up proposal; no canonical delta; approved against ProductSpec v1.10 and integrated in v1.11; APP-006/APP-007, SEC-009
- Scope and components: `src/lib/resume-pdf-check.ts`, `src/lib/application-resume-uploads.ts`, `src/lib/resume-errors.ts`, `src/lib/resume-request.ts`, and focused unit tests.

## Approved résumé-panel interaction refinement

Render one “Upload résumé” button for both an initial upload and replacement. When the selected file's previous request failed or its outcome is unclear, pressing that same button retries with the same file and operation UUID; selecting another file resets the retry state and creates a new operation. Render “Delete résumé” only when an attachment exists. Confirm with the user before submitting the existing remove intent. Keep profile-copy actions separate because they copy an existing profile object and retain their own operation snapshot/retry behavior. No route contract, storage model, or authorization changes are introduced by this UI refinement.

## Decisions and alternatives

| Decision                                                                                                                                                                                                                | Considered alternatives                                                             | Reason and tradeoffs                                                                                                                                                                                                                          | Human approval reference                                                               |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Continue job uploads from the validated `prepare_application_resume` response (`id`, `revision`, `object_path`, `state`)                                                                                                | Grant direct SELECT to `service_role`; add another broad table reader               | The RPC already validates actor/job/revision/file identity and returns the storage path. Avoiding direct reads preserves the table's closed privilege boundary and removes the observed 42501 failure.                                        | Paul, chat approval 2026-10-14; implementation adjustment based on hosted log evidence |
| Before parsing a retried file, use the authenticated Applicant's own `applications.resume_id` as a possible completed-operation hint; call `prepare_application_resume` to validate the fingerprint and confirm `ready` | Read `application_resume_objects` with a privileged client; add a new RPC/migration | The RLS-scoped application read selects one pointer only. The existing service-only prepare RPC remains authoritative for actor/job/file identity and the ready result, preserving the private object-table boundary without a schema change. | Paul, review-fix authorization in chat 2026-10-15                                      |
| Emit structured, data-minimized failure logs with random reference IDs                                                                                                                                                  | Return/log upstream message/details/hint                                            | SQLSTATE, HTTP status, fixed stage/category and elapsed time are sufficient for support correlation without leaking private or dynamic content.                                                                                               | Paul, chat approval 2026-10-14                                                         |
| Keep one 5-second worker deadline, preserve 64/16 MiB worker memory limits, and optimize independent imports with `Promise.all`                                                                                         | Remove deadline or increase memory/file limits                                      | A bounded increase addresses observed timeout sensitivity under local resource contention while still terminating prolonged parser work on untrusted files. Memory and input bounds remain unchanged.                                         | Paul, chat approval of bounded revision 2026-10-14                                     |

## Interfaces and data flow

Applicant → authenticated job résumé route → for an explicit retry, bounded file read and hash plus an RLS-scoped read of the Applicant's own `applications.resume_id`; if it matches the operation UUID, call `prepare_application_resume` before fallible PDF parsing. That existing SECURITY DEFINER RPC validates the exact file fingerprint and returns `ready` only for the finalized operation; otherwise normal structural validation runs before reservation. `pending` supplies the validated application/object path; the server uploads bytes to private Storage and finalizes by RPC. The application upload path never selects `application_resume_objects` directly.

PDF worker sends only phase markers (`parser-import`, `document-load`, `page-structure`) and its existing allowlisted final result. A timeout log contains a fixed event name, current phase, and rounded elapsed milliseconds. It never contains bytes, filename, page count, hash, parser message or path.

For prepare failures, server logs contain a random UUID reference, fixed stage, allowlisted five-character SQLSTATE (if present), numeric upstream HTTP status (if present), and a fixed failure category. Client JSON contains a safe code, fixed user message and reference UUID. No raw database message/details/hint are exposed.

## Authorization and privacy impact

No authorization policy or RLS changes. The retry hint reads only `resume_id` from the authenticated Applicant's own application through the existing user-scoped Supabase client; the service-only prepare RPC remains authoritative and no private résumé object metadata or path is returned by that hint. Object paths are validated before Storage use. Logs and responses exclude actor/job/application IDs, filenames, hashes, file bytes, tokens, SQL text and raw exceptions. No AI path is involved.

## Failure behavior

| Failure / input                                                              | Observable outcome / state guarantees                                                                                                      | Verification         |
| ---------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | -------------------- |
| Parser startup, PDF loading, or page iteration exceeds the 5-second deadline | Existing safe timeout message/status; server log records fixed phase and elapsed time; worker is terminated                                | UPLOAD-DIAG-AC-01    |
| Prepare RPC returns `23505` for the one-pending constraint                   | Safe 409 code/message directs the Applicant to the available retry action for a file upload or profile copy; internal log uses a reference | UPLOAD-DIAG-AC-03    |
| Other RPC error or malformed response                                        | Safe temporary preparation failure with reference and 503; raw upstream data remains private                                               | UPLOAD-DIAG-AC-03    |
| Applicant-scoped application lookup fails during retry reconciliation        | Safe preparation failure with reference and 503 before PDF parsing or mutation                                                             | UPLOAD-DIAG-AC-03    |
| RPC returns `ready`                                                          | No duplicate Storage write; the operation is already finalized                                                                             | UPLOAD-DIAG-AC-02    |
| RPC returns `pending` with malformed path/shape                              | Fail closed before Storage, log only a safe invalid-response category and reference                                                        | UPLOAD-DIAG-AC-02/03 |

## Migration and backward compatibility

No database migration, environment change, grant or RLS policy change. The retry hint uses the Applicant's existing row access and consumes the current prepare-RPC contract; private table privileges remain unchanged. Existing routes and file/status limits stay.

## Rollout and rollback

No production deployment. A Vercel Preview deployment is Ready, but a synthetic upload smoke was skipped and upload success remains unverified. Rollback is reverting the scoped source change; no data migration is involved. Any existing stale pending object is handled by the existing retry recovery flow and cleanup RPC.

## Review and unresolved decisions

- [x] Interface, requirement, privacy, failure and no-migration impacts assessed.
- Findings/owner/resolution: T05 independent review completed; no blocking source defect was found, and the reviewer confirmed the added RPC-level tests cover the P0001 classifier mappings. The three later PR review comments were addressed in this follow-up; no independent re-review of these latest corrections is recorded.
- Human approval: Paul approved the original scope and the 5-second bounded timeout revision in chat on 2026-10-14, then accepted the implementation in chat on 2026-10-14. The focused revised-timeout tests pass under Bun; the hosted upload smoke remains unverified.
- UX approval: Paul approved the single Upload / confirmed Delete flow in chat on 2026-10-15 before implementation. Its focused regression tests now cover the displayed actions, same-operation retry, and confirmation behavior.
- Post-submission review fixes: Paul authorized addressing the newest PR #77 comments in chat on 2026-10-15. The completed-application retry now consults only the authenticated Applicant's current application pointer before calling the existing fingerprint-validating RPC; profile-source Storage failures map to a correlated 503, and persistence failures preserve the original profile-copy retry snapshot. Focused tests pass; full checks and repository-thread closeout are tracked in T20/T21.
