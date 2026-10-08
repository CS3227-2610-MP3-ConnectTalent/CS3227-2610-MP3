# Security and privacy

Baseline: ProductSpec v0.8, 8 October 2026 (SEC-001 updated). This file is the canonical home for cross-cutting authorization, privacy and AI safeguards. Capability specs link here; their scenarios illustrate these rules without establishing a separate policy.

## SEC-001: Access boundaries

Access MUST follow these boundaries:

| Data/action | Applicant access | HR access |
| --- | --- | --- |
| This company's published jobs, categories and requirements | Read | Read/close |
| Draft jobs | None | Read/write/publish |
| Closed jobs | Title of a job on their existing application | Read |
| Saved draft application and cover letter | Own draft read/write while its job is published; own read after closure | None |
| Submitted application, original/current letter and current review status | Own read; current-letter edit while its job is published; no status write | Read for review; status write through a separate authorized human action |
| HR notes and status-change history | None | Read; append notes and status events through authorized actions |
| Role assignment | Cannot set or change | Controlled administration only |
| Audit events | None | Read as authorized |

Creating jobs, editing job drafts, publishing and closing MUST be restricted to HR. An Applicant MUST NOT edit another Applicant's draft or submission, change the immutable original submitted letter, change HR status or invoke the HR summary. Applicant A MUST NOT read Applicant B's application, status or AI draft, or see HR notes/history. Anonymous users MUST NOT read any protected application, note or status event or access AI endpoints. HR MUST NOT read unsubmitted drafts, including a draft owned before an account's controlled promotion from Applicant to HR. HR write actions MUST check a verified user's current HR role on the server and in the database. Status events and logs MUST exclude letter and note text. Closing a job MUST NOT broaden or revoke these existing-record read boundaries. [APP-004](applications-and-review.md) owns save/submit/edit lifecycle and job-close behavior. Public published-job browsing remains available under [JOB-001](public-job-listings.md).

Scenario: Given a submitted application, when its owner and authorized HR open it, then each sees their permitted fields; the owner sees current status but not notes/history.

Denial scenario: Given anonymous access, another Applicant or an HR user requesting a saved draft, when the record is fetched by direct ID, then server checks and RLS return no protected data. Given an Applicant sending an HR write request, when authorization runs, then the operation is denied.

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

AI requests MUST load only the selected application's job details and requirements (for drafting, the selected published job under [AID-001](applicant-ai-draft.md)). Model requests MUST exclude HR notes, other applications, secrets and unrelated personal data. [AID-001](applicant-ai-draft.md) and [AIS-001](hr-ai-summary.md) define the narrower allowed input sets for each feature.

Scenario: Given a selected application/job, when an AI request is assembled, then unrelated job data and excluded data are absent. A summary contains only the selected letter and that job's published requirements; adversarial text cannot expose HR notes.

## SEC-006: Bounded AI usage and failure handling

AI endpoints MUST apply per-user usage limits, model output caps, timeouts and clear retry/error handling. Oversized and repeated requests MUST be limited, including when the SoC LLM is unavailable or returns a quota error. Exact thresholds remain unresolved until SoC LLM quotas have been reviewed.

Scenario: Given oversized or repeated requests, when limits are applied, then requests are bounded. Given an unavailable model or quota error, when a request fails, then timeout/retry/error behavior is clear without bypassing the limits.

## SEC-007: Privacy-preserving audit logging

Logs MUST record actor, operation, target, timestamp and outcome without cover-letter text or API keys. Audit access follows SEC-001. See [OPS-002](deployment-and-operations.md) for operational evidence.

Scenario: Given a logged operation, when its audit record is inspected, then the five fields are present and cover-letter text/API keys are absent.

## SEC-008: Synthetic development and test records

Development and security tests MUST use synthetic applicant records.

Scenario: Given applicant fixtures used for development or security testing, when reviewed, then they are synthetic records.
