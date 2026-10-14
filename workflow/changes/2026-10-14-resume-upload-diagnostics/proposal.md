# Proposal: résumé upload failure diagnostics and recovery

- Change ID: 2026-10-14-resume-upload-diagnostics
- Issues: [#76](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/76), [PR #77](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/77)
- Owner: Paul
- Status: approved and accepted by Paul in chat on 2026-10-14; T05 independent review is complete; focused revised-timeout tests pass under Bun; hosted upload verification remains pending
- Date: 2026-10-14
- Approval baseline: ProductSpec v1.10; current integrated canonical baseline: ProductSpec v1.11
- Affected capabilities: `workflow/specs/applications-and-review.md`, APP-006/APP-007; SEC-009 privacy boundary
- Classification: defect restoration follow-up; behavior and server diagnostics; no new product requirement

## Intent, problem, and motivation

Local uploads time out in the PDF worker with the existing 3-second budget. On the Preview, a successful `prepare_application_resume` RPC is followed by a denied direct read of `application_resume_objects` (Postgres 42501); later attempts encounter the one-pending-upload constraint (23505). The generic client error hides these distinct causes. The evidence is from the user-authorized Vercel and Supabase dashboard review on 2026-10-14; no private PDF bytes or database row values are included here.

## Goals, non-goals, and scope boundaries

- Goals: use a bounded 5-second PDF worker deadline and preserve the 64/16 MiB worker memory limits and 1 MiB file cap; reduce parser startup overhead and report safe timeout phase/elapsed data to server logs; complete job-application uploads using the validated object path returned by the existing security-definer RPC instead of directly selecting its private table; return safe, specific recovery feedback for a pending-upload conflict; add a reference ID and allowlisted diagnostics for other prepare RPC failures.
- Non-goals: removing the worker deadline or increasing the worker memory or file-size limits; changing SQL/RLS grants, storage policy, authentication, or secrets; exposing raw Postgres/PostgREST errors or applicant/document data; submitting a personal transcript; changing production configuration or deploying to production.
- Users/roles: Applicants uploading optional résumés. Existing server ownership checks, SECURITY DEFINER checks, private storage and immutable submitted snapshots remain.
- Scope boundaries: résumé upload library, PDF worker, safe error mapping, focused tests, and this issue packet. No unrelated Applicant/HR behavior.

## Alternatives and dependencies

| Alternative                                                       | Benefit / cost / risk                                                                       | Decision and reason                                                                                                     |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Grant service-role SELECT on `application_resume_objects`         | Quick change, but broadens direct table access and requires a database migration/deployment | Rejected; the existing authorized RPC already returns the needed object path and status                                 |
| Keep hiding every prepare failure behind “Reload the application” | Avoids raw error leakage but prevents diagnosis and recovery                                | Rejected; use allowlisted client codes and safe server logs                                                             |
| Remove the PDF timeout or make it substantially longer            | Avoids early rejection but permits prolonged parser work on untrusted input                 | Rejected; use a bounded 5-second deadline based on observed timeout sensitivity, preserving memory and file-size limits |

- Assumptions: Preview logs correspond to the user's failed requests; the approved `prepare_application_resume` RPC contract is the intended access boundary.
- Dependencies: Issue #76 and existing Supabase functions/migrations; no schema change.
- Risks: logging sensitive data; mitigated by static operation/stage labels, SQLSTATE/status allowlists, elapsed time and random reference only. Retrying must continue through the existing recovery RPC.
- Open decisions: none for the bounded implementation. T05 independent review and Paul's acceptance are recorded; a fresh hosted upload smoke and the post-fix full CI run remain pending.

## Acceptance evidence and artifacts

| Acceptance ID     | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                         | Required evidence and owner                                 |
| ----------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| UPLOAD-DIAG-AC-01 | #76; APP-007                                  | When supported synthetic PDFs are checked, parser startup is concurrent with a bounded 5-second deadline and unchanged memory/file limits; timeout logs safe phase and elapsed time | Focused worker/validator tests; implementer                 |
| UPLOAD-DIAG-AC-02 | #76; APP-007, SEC-009                         | When the prepare RPC returns pending/ready, the server uses its validated object path/status and does not directly select the private table                                         | First-upload tests; implementer and independent reviewer    |
| UPLOAD-DIAG-AC-03 | #76; APP-007, SEC-009                         | When preparation conflicts/fails, the client receives a safe allowlisted code/message/reference; raw upstream detail and document data never leave the server                       | Error and route tests; implementer and independent reviewer |

- Spec deltas: none; restores APP-007 behavior and keeps SEC-009 intact.
- Design: `design.md`.
- Plan and tasks: `plan.md`, `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, no-delta decision, design, and plan agreed before implementation.
- Approver: Paul
- Decision/date/source: Original scope approved in chat on 2026-10-14: “Sounds good, I approve. Please proceed.” The bounded timeout amendment was approved in chat on 2026-10-14: “Ok, then I accept the implementation. Please proceed.”
- Conditions: use a 5-second PDF worker deadline; preserve the 64/16 MiB worker memory limits and 1 MiB file cap; use synthetic test data; no hosted configuration or production deployment. The later code-path repair is an implementation choice responding to the observed 42501/23505 logs and remains within the user's explicit request to fix the hosted Preview failure.
