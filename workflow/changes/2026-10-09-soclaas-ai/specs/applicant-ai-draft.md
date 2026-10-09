# Spec delta: Applicant AI draft

- Change/issues/owner/status: 2026-10-09-soclaas-ai; #7; John; delta and plan approved, implementation in progress
- Canonical file: [applicant-ai-draft.md](../../../specs/applicant-ai-draft.md)
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4; AID-001/AID-002
- Proposed baseline: v1.1
- Dependencies/cross-capability IDs: APP-001/APP-004, SEC-001 through SEC-007, OPS-002
- Approval: John approved the written delta in chat on 2026-10-09.

## MODIFIED

### AID-001: Selected published-job inputs

- Before: The draft endpoint accepts only the Applicant’s notes and selected published-job text, scoped under SEC-005.
- After: An Applicant AI-draft request MUST accept only the verified Applicant’s notes, the selected published job title, and that job’s published requirements. Notes MUST be limited to 4,000 characters. The server MUST authorize the Applicant before loading the job and MUST load only the selected published job fields. Model instructions MUST treat notes and job text as untrusted data and MUST use the notes as the sole source for personal claims; the model MUST NOT invent dates, skills, employers, achievements, or other personal facts.
- Rationale/acceptance IDs: Minimize model input and prevent unsupported personal claims; AI-AC-01/AI-AC-06.
- Scenario: Given a verified Applicant, bounded notes and a published job, when generation is requested, then only those notes, the job title and requirements are sent to the model.
- Denial/failure scenario: Given an anonymous user, another role, an unpublished job, an invalid job ID, or oversized notes, when generation is requested, then it is rejected before the model call.

### AID-002: Editable draft and explicit submission

- Before: The Applicant retains ownership of the final cover letter, can edit the generated draft and explicitly submit final text; generation never submits an application.
- After: The Applicant MUST receive a Zod-validated draft object containing one non-empty draft string of at most 5,000 characters. The draft MUST be placed in an editable form and MUST remain ordinary text. The generation endpoint MUST NOT create or update an application, save the draft, or submit it. Only the existing separate save/submit action may persist text. The UI MUST ask the Applicant to verify dates, skills, and achievements before submission.
- Rationale/acceptance IDs: Keep submission explicit and preserve Applicant review; AI-AC-02/AI-AC-05.
- Scenario: Given valid model output, when the Applicant receives it, then it can be edited, is not persisted by generation, and the form asks the Applicant to verify personal details before submission.
- Denial/failure scenario: Given malformed, empty, oversized or script-like model output, when it is parsed or rendered, then it is rejected safely or displayed as escaped text; no application is created or changed.

## Delta review and sync evidence

- [x] John approved this written delta on 2026-10-09.
- [ ] Confirm cross-links and output limits against SEC-004/SEC-006 before implementation.
- [ ] Do not sync to the canonical specification until post-implementation acceptance.
- Sync commit/paths/decision evidence: Pending; no canonical file changed.
