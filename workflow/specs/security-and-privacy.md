# Security and privacy

Baseline: ProductSpec v1.8, 10 October 2026 (accepted #53 private profile file boundaries; prior security rules retained).

## SEC-001: Access boundaries

Access MUST follow these boundaries. Additional profile, background-snapshot and attachment permissions have their canonical home in SEC-009 below:

| Data/action                                                              | Applicant access                                                        | HR access                                                                |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| This company's published jobs, categories and requirements               | Read                                                                    | Read/close                                                               |
| Draft jobs                                                               | None                                                                    | Read/write/publish                                                       |
| Closed jobs                                                              | Title of a job on their existing application                            | Read                                                                     |
| Saved draft application and cover letter                                 | Own draft read/write while its job is published; own read after closure | None                                                                     |
| Submitted application, original/current letter and current review status | Own read; no submitted-letter or status write                           | Read for review; status write through a separate authorized human action |
| HR notes and status-change history                                       | None                                                                    | Read; append notes and status events through authorized actions          |
| Role assignment                                                          | Cannot set or change                                                    | Controlled administration only                                           |
| Audit events                                                             | None                                                                    | Read as authorized                                                       |

Creating jobs, editing job drafts, publishing and closing MUST be restricted to HR. An Applicant MUST NOT edit another Applicant's draft or submission, change any submitted letter, change HR status or invoke the HR summary. Applicant A MUST NOT read Applicant B's application, status or AI draft, or see HR notes/history. Anonymous users MUST NOT read any protected application, note or status event or access AI endpoints. HR MUST NOT read unsubmitted drafts, including a draft owned before an account's controlled promotion from Applicant to HR. HR write actions MUST check a verified user's current HR role on the server and in the database. Status events and logs MUST exclude letter and note text. Closing a job MUST NOT broaden or revoke these existing-record read boundaries. [APP-004](applications-and-review.md) owns save/submit/edit lifecycle and job-close behavior. Public published-job browsing remains available under [JOB-001](public-job-listings.md).

Scenario: Given a submitted application, when its owner and authorized HR open it, then each sees their permitted fields; the owner sees current status but not notes/history.

Denial scenario: Given anonymous access, another Applicant or an HR user requesting a saved draft, when the record is fetched by direct ID, then server checks and RLS return no protected data. Given an Applicant sending an HR write request, when authorization runs, then the operation is denied.

APP-008 withdrawal is the only new Applicant lifecycle write: a verified owner MAY withdraw their submitted record, including after closure, via the controlled operation only. HR cannot withdraw. Existing submitted read/download and notes privacy boundaries MUST remain after withdrawal; subsequent HR note/status writes and summary requests MUST be denied. Neither withdrawal nor retry grants general row UPDATE/DELETE or public Storage access.

## SEC-002: Server and database enforcement

The database MUST enforce row-level security in addition to server-side authorization. Each AI endpoint MUST authenticate and authorize before loading data or making a model call. The browser MUST never receive a key that bypasses row-level security or the SoC LLM key.

Scenario: Given an unauthorized AI request, when the endpoint receives it, then it is denied before data loading or a model call. Protected-record access is subject to both server authorization and database RLS, and browser-delivered content contains neither privileged key.

## SEC-003: Untrusted text and no model authority

Applicant notes and cover letters MUST be treated as untrusted data, including text impersonating system messages or asking the model to ignore instructions. The model MUST NOT receive tools or database access. AI endpoints MUST return only text/structured data and MUST NOT mutate application status.

Scenario: Given an adversarial note or letter, when the endpoint processes it, then the text remains untrusted model input, no tools/database authority is supplied, and application status cannot be changed by the model or endpoint.

## SEC-004: Validation and rendering

Input lengths and structured output MUST be validated with Zod. Malformed AI output MUST be rejected safely. Model text MUST be rendered as escaped text, never raw HTML.

Scenario: Given malformed structured output, when it is validated, then it is safely rejected. Given script-like model text, when displayed, then it appears as text rather than executing as HTML.

## SEC-005: Job scoping and data minimization

AI requests MUST load only the selected application's job details and requirements (for drafting, the selected published job under [AID-001](applicant-ai-draft.md)). Model requests MUST exclude HR notes, other applications, secrets and unrelated personal data. Structured application full name, verified email, phone and portfolio fields MUST NOT be selected for AI payload assembly or appended to prompts. This exclusion does not claim to redact personal information an Applicant independently types into allowed notes/letter text. [AID-001](applicant-ai-draft.md) and [AIS-001](hr-ai-summary.md) define the narrower allowed input sets for each feature.

Scenario: Given a selected application/job, when an AI request is assembled, then unrelated job data and excluded data are absent. A summary contains only the selected letter and that job's published requirements; adversarial text cannot expose HR notes.

## SEC-006: Bounded AI usage and failure handling

Both AI endpoints MUST validate request sizes before a provider call and MUST enforce durable, atomic limits of at most three requests per user in any rolling minute across both features and at most 24 provider requests per deployment in any rolling minute. Limits MUST be enforced across server instances using database RPCs callable only by trusted server code. Those RPCs MUST check the confirmed actor profile, role and selected target; Applicant and HR content reads MUST continue using the signed-in user's RLS-scoped session. The Applicant notes limit is 4,000 characters; submitted letters remain limited to the existing 5,000 characters; job requirements remain limited to the existing 10,000 characters. The draft output is capped at 500 provider tokens and 5,000 characters. The summary output is capped at 350 provider tokens and its three arrays are each limited to five strings of at most 240 characters. Each provider request MUST time out after 20 seconds. Each user request MUST make at most one provider call; provider calls MUST NOT be automatically retried.

Invalid input MUST return a clear validation error without a provider call. Authentication and role denials MUST occur before protected data loads or provider calls. User quota exhaustion MUST return a recoverable rate-limit state with a retry interval and no provider call. SoCLaaS 429 responses MUST return a safe retry-later response with a sanitized `Retry-After` value when valid; other provider errors and timeouts MUST return safe retry-later states without exposing provider bodies, secrets or prompt text. Empty, malformed, over-limit or schema-invalid model output MUST be discarded and MUST NOT be partially displayed. An audit reservation failure MUST prevent the provider call; a final audit-write failure MUST discard the result and return an error. The Applicant's typed text and HR's source application/status MUST remain unchanged in every failure case.

Scenario: Given oversized input, user/global quota exhaustion or an invalid role, when an endpoint is called, then the request is rejected before SoCLaaS and the interface retains the user's state. Given a provider 429/5xx, timeout, malformed JSON, Zod failure or audit failure, when generation fails, then no partial output or database mutation occurs, a safe error is shown, the outcome is recorded when possible and no automatic provider retry occurs.

## SEC-007: Privacy-preserving audit logging

Metadata-only audit events MUST record application submission, each HR status change and each provider invocation's actor, operation, target, timestamp and outcome. Application submission metadata MUST be written in the same database transaction as submission. Existing application_status_events remain the record of HR status changes. An AI invocation MUST have a metadata-only start record before the external call and a terminal outcome after it. If start/reservation cannot be recorded, no provider call may occur. If terminal recording fails, the output MUST be withheld and any fallback server log MUST contain metadata only. Logs MUST NOT contain Applicant notes, letter text, prompts, model output, authentication tokens or provider keys. HR read access follows SEC-001; Applicants cannot read audit events. Audit events and server logs MUST NOT include structured application full name, verified email, phone or portfolio values. Validation feedback MAY name the invalid field without logging or echoing sensitive values into URLs. Submitted contact snapshots remain protected application data, not audit metadata. See [OPS-002](deployment-and-operations.md) for operational evidence.

Scenario: Given a successful or failed provider invocation, when authorized audit evidence is inspected, then actor, operation, target, time and outcome are present without notes, letter text, prompt, output or key. Given audit storage is unavailable before invocation, the model is not called; if terminal audit finalization fails, the response is withheld.

Contact privacy scenario (form39-AC-08): Given stored contact fields, submissions or invalid/retried writes, when AI payloads and audit/log output are inspected, then structured contact values are absent and required actor/operation/target/time/outcome metadata remains.

## SEC-008: Synthetic development and test records

Development and security tests MUST use synthetic applicant records.

Scenario: Given applicant fixtures used for development or security testing, when reviewed, then they are synthetic records.

## SEC-009: Profile and attachment privacy

Server authorization and database/Storage RLS MUST enforce:

| Data/action                       | Verified Applicant                                                                          | Authorized verified HR                       | Anonymous |
| --------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- | --------- |
| Mutable Applicant profile         | Own read/write only                                                                         | None                                         | None      |
| Application background snapshots  | Own read; draft write while published                                                       | Submitted read only                          | None      |
| Finalized résumé bytes/metadata   | Own draft/submitted read; draft mutation while published via validated server workflow only | Submitted read only, including after closure | None      |
| Upload reservation/staged objects | Own operation state through authorized server workflow; no arbitrary object access          | None                                         | None      |

The bucket MUST be private and MUST NOT expose public object URLs. Browser credentials MUST NOT allow direct object upload/overwrite/delete bypassing server validation or frozen state. Download MUST authenticate and authorize the current user for the selected finalized attachment on every request, then return an attachment response with private/no-store caching; guessed paths or foreign/draft-HR access MUST reveal no bytes. Server credential use for staging MUST remain server-only, narrowly scoped to authorized generated object paths and never replace user-scoped private-record read authorization. Referenced submitted files MUST be protected from deletion/overwrite in permitted client/service interfaces. A privileged project administrator remains outside the normal product role boundary.

Paths MUST use generated identifiers without email or original filenames. Filenames MUST be bounded/escaped and never trusted as paths or raw HTTP headers. Files MUST NOT be rendered inline, executed, parsed for autofill or sent to AI. New profile values, education/work experience, filename, bytes and file-access tokens MUST NOT be logged or included in AI requests; existing SEC-005/007 restrictions remain. Metadata-only operational logs MAY identify actor, application, generated operation ID, outcome and cleanup state. Stored profile/application fields remain private product data, not logs. Tests MUST use synthetic PDFs and profiles under SEC-008.

Scenario: Given another Applicant, guest or HR requesting a draft file/profile, direct API/Storage/download access returns no private data. Direct browser object writes and stale finalization after submit/closure fail unchanged. Authorized submitted downloads remain available after closure; responses force attachment/no-store and new profile/file content stays out of AI inputs/logs.

Finalized profile resume bytes/metadata MUST be readable/mutable only by their current verified Applicant owner through a validated server workflow; HR and anonymous/unverified/foreign users MUST have no access. Profile storage MUST be private with the same no-public-URL, generated-path, forced-download/no-store, byte-validation and no direct browser writes guarantees. Profile uploads MUST be permitted before completion of required text, but only after verified Auth/role checks; they MUST NOT change the user's role or mark onboarding complete. Pending profile objects MUST not be downloadable as finalized files. File operations MUST not implicitly persist unsaved profile/application fields.

Explicit owner reuse MUST create an application-owned snapshot that is independently retained and subject to application RLS/closure/freeze/withdrawal rules. Later profile replacement/removal MUST NOT delete or overwrite an application snapshot. Copying MUST authorize the selected current owner source, protect or reconcile its version during transfer and prevent substitution by a foreign/stale operation. Cleanup MUST remain tracked and bounded to unreferenced generated keys; no sweeper or malware-scanning guarantee is introduced. New profile file metadata/bytes/access tokens MUST remain excluded from AI/logs as above.

Denial scenario: Given HR, another Applicant or an unverified/anonymous caller requesting profile PDF/API/Storage objects, no private metadata/bytes or mutation occurs. Given profile replacement/removal after application submission or withdrawal, the submitted snapshot and permitted existing download remain unchanged.
