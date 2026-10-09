# Spec delta: HR AI summary

- Change/issues/owner/status: 2026-10-09-soclaas-ai; #10; John; written delta approved, implementation plan approval pending
- Canonical file: [hr-ai-summary.md](../../../specs/hr-ai-summary.md)
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4; AIS-001/AIS-002
- Proposed baseline: v1.1
- Dependencies/cross-capability IDs: APP-003/APP-004, SEC-001 through SEC-007, OPS-002
- Approval: John approved the written delta in chat on 2026-10-09.

## MODIFIED

### AIS-001: Selected submitted-letter inputs

- Before: The summary accepts only the selected submitted cover letter and that job’s published requirements.
- After: The HR summary MUST accept only one authorized submitted application’s current cover_letter value, which becomes immutable at submission or at the rollout cutoff, and that job’s published requirements. For existing applications, the current value MUST be frozen without overwriting original_submitted_letter, which remains the first-submission snapshot. The server MUST verify the HR role before loading either field and MUST load no HR notes, status history, other application, or unrelated personal data.
- Rationale/acceptance IDs: Preserve any allowed edits made before rollout while giving future summaries a stable source; AI-AC-03/AI-AC-06.
- Scenario: Given authorized HR and one submitted application, when summary is requested, then model input contains only that application’s frozen current letter and its job’s fixed published requirements.
- Denial/failure scenario: Given an Applicant, anonymous visitor, unsubmitted application, or inaccessible application ID, when summary is requested, then no protected application data or model call is produced.

### AIS-002: Evidence summary without hiring decisions

- Before: The summary returns evidence mentioned, requirements not addressed and follow-up questions; it does not score, rank, reject, or change status, and HR retains the original application and status decision.
- After: The summary MUST return a strict object with exactly three arrays: evidence_mentioned, requirements_not_addressed, and follow_up_questions. Each array MUST contain no more than five strings, and each string MUST contain no more than 240 characters. Zod MUST reject missing, extra, malformed, empty, or over-limit fields. The output MUST NOT score, rank, recommend hiring/rejection, change status, create notes, or trigger another action. HR MUST see the summary beside the source letter and a notice to verify every point against that letter. HR alone changes status through the separate human action.
- Rationale/acceptance IDs: Make the shape bounded and preserve human oversight; AI-AC-03/AI-AC-05/AI-AC-06.
- Scenario: Given valid model JSON, when HR receives the summary, then the three bounded sections appear beside the submitted letter with a verification notice and no status change.
- Denial/failure scenario: Given malformed output, provider failure, or adversarial letter text requesting private data or a hiring action, when summary generation fails or completes, then no private data is added, no partial result is shown, and application status remains unchanged.

## Delta review and sync evidence

- [x] John approved this written delta on 2026-10-09.
- [ ] Confirm the current-letter cutoff behavior and migration compatibility before implementation.
- [ ] Do not sync to the canonical specification until post-implementation acceptance.
- Sync commit/paths/decision evidence: Pending; no canonical file changed.
