# Spec delta: Security and privacy

- Change/issues/owner/status: 2026-10-09-soclaas-ai; #7 and #10; John; draft awaiting written review
- Canonical file: [security-and-privacy.md](../../../specs/security-and-privacy.md)
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4; SEC-001/SEC-006/SEC-007
- Proposed baseline: v1.1
- Dependencies/cross-capability IDs: APP-004, AID-001/AID-002, AIS-001/AIS-002, OPS-002
- Approval: John approved the design for packet drafting on 2026-10-09; written delta review pending

## MODIFIED

### SEC-001: Access boundaries

- Before: Applicants may read their submitted application and edit the current letter while the job is published; HR reads submitted applications and controls status. HR may read authorized audit events.
- After: Applicants MAY read their own submitted application but MUST NOT write any submitted letter or status. Applicant draft edits remain allowed only while the selected job is published. An Applicant seeking a post-submission correction MUST be directed to HR. HR may read submitted applications and authorized metadata-only audit events, and only HR can change status through the separate authorized action. Existing boundaries for other applicants, HR notes, status history, drafts, and anonymous users remain unchanged.
- Rationale/acceptance IDs: Freeze the submitted source for HR and AI; AI-AC-04/AI-AC-07.
- Scenario: Given an Applicant’s submitted application, when the owner or another Applicant attempts a direct edit/read outside their access, then the database/RLS and server deny the operation and the record remains unchanged.
- Denial/failure scenario: Given an anonymous user or Applicant invoking HR summary, when the route is requested, then it is denied before protected data or model access.
- Rule relocation, if any: APP-004 continues to own the application lifecycle; SEC-001 remains the canonical access boundary.

### SEC-006: Bounded AI usage and failure handling

- Before: AI endpoints require per-user limits, output caps, timeouts and retry/error handling; exact thresholds remain unresolved pending quota review.
- After: Both AI endpoints MUST validate request sizes before a provider call and MUST enforce durable, atomic limits of at most three requests per user in any rolling minute across both features and at most 60 provider requests per deployment in any rolling minute. Limits MUST be enforced across server instances using an authenticated database RPC, not a process-local counter. The Applicant notes limit is 4,000 characters; submitted letters remain limited to the existing 5,000 characters; job requirements remain limited to the existing 10,000 characters. The draft output is capped at 500 provider tokens and 5,000 characters. The summary output is capped at 350 provider tokens and its three arrays are each limited to five strings of at most 240 characters. Each provider request MUST time out after 20 seconds. Each user request MUST make at most one provider call; provider calls MUST NOT be automatically retried.

  Invalid input MUST return a clear validation error without a provider call. Authentication and role denials MUST occur before protected data loads or provider calls. User quota exhaustion MUST return a recoverable rate-limit state with a retry interval and no provider call. SoCLaaS quota/rate errors, outages, network errors, and timeouts MUST return safe retry-later states without exposing provider bodies, secrets, or prompt text. Empty, malformed, over-limit, or schema-invalid model output MUST be discarded and MUST NOT be partially displayed. An audit reservation failure MUST prevent the provider call; a final audit-write failure MUST discard the result and return an error. The Applicant’s typed text and HR’s source application/status MUST remain unchanged in every failure case.
- Rationale/acceptance IDs: Bound cost and state changes, honor SoCLaaS limits, and make failures recoverable; AI-AC-05/AI-AC-07.
- Scenario: Given oversized input, user/global quota exhaustion, or an invalid role, when an endpoint is called, then the request is rejected before SoCLaaS and the interface retains the user’s state.
- Denial/failure scenario: Given a provider 429/5xx, timeout, malformed JSON, Zod failure, or audit failure, when generation fails, then no partial output or database mutation occurs, a safe error is shown, the outcome is recorded when possible, and no automatic provider retry occurs.

### SEC-007: Privacy-preserving audit logging

- Before: Logs MUST record actor, operation, target, timestamp and outcome without cover-letter text or API keys.
- After: Metadata-only audit events MUST record application submission, each HR status change, and each provider invocation’s actor, operation, target, timestamp, and outcome. Application submission metadata MUST be written in the same database transaction as submission. Existing application_status_events remain the record of HR status changes. An AI invocation MUST have a metadata-only start record before the external call and a terminal outcome after it. If start/reservation cannot be recorded, no provider call may occur. If terminal recording fails, the output MUST be withheld and any fallback server log MUST contain metadata only. Logs MUST NOT contain applicant notes, letter text, prompts, model output, authentication tokens, or provider keys. HR read access follows SEC-001; Applicants cannot read audit events.
- Rationale/acceptance IDs: Make submissions, status actions, and AI use accountable without copying sensitive content; AI-AC-06.
- Scenario: Given a successful or failed provider invocation, when authorized audit evidence is inspected, then actor, operation, target, time and outcome are present without notes, letter text, prompt, output, or key.
- Denial/failure scenario: Given audit storage is unavailable before invocation, when generation is requested, then the model is not called. Given audit finalization fails after a provider response, then the response is discarded and the metadata-only start record remains available for reconciliation.

## Delta review and sync evidence

- [ ] John reviews these deltas before a plan is written.
- [ ] Check quota behavior against the configured key’s actual SoCLaaS policy before live calls.
- [ ] Do not sync to the canonical specification until post-implementation acceptance.
- Sync commit/paths/decision evidence: Pending; no canonical file changed.
