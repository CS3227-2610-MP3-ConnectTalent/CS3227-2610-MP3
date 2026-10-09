# Applicant AI draft

Baseline: ProductSpec v1.1, 9 October 2026 (AID-001/AID-002 updated).

Every draft endpoint follows the canonical [security and privacy contract](security-and-privacy.md), including authorization before loading data, input/output validation and usage limits.

## AID-001: Selected published-job inputs

An Applicant AI-draft request MUST accept only the verified Applicant's experience notes and the selected published job title and requirements. Notes MUST be limited to 4,000 characters. The server MUST authorize the Applicant before loading the job and MUST load only the selected published job fields. Model instructions MUST treat notes and job text as untrusted data and MUST use the notes as the sole source for personal claims; the model MUST NOT invent dates, skills, employers, achievements or other personal facts. Data exclusions and authorization are further defined under [SEC-002](security-and-privacy.md) and [SEC-005](security-and-privacy.md).

Scenario: Given a verified Applicant, notes within the limit and a published job, when generation is requested, then model input contains only those notes, the selected job title and its published requirements, without other applications, HR notes or unrelated data.

Denial scenario: Given an anonymous user, another role, an unpublished or inaccessible job, an invalid job ID, or oversized notes, when generation is requested, then it is rejected before the model call.

## AID-002: Editable draft and explicit submission

The Applicant MUST receive a validated draft containing one non-empty string of at most 5,000 characters. The draft MUST be placed in an editable form and MUST remain ordinary text. The generation endpoint MUST NOT create or update an application, save the draft or submit it; only the existing separate save/submit action may persist text. The UI MUST ask the Applicant to verify dates, skills and achievements before submission. Submission and subsequent text access follow [APP-001](applications-and-review.md), [APP-004](applications-and-review.md) and [SEC-001](security-and-privacy.md).

Scenario: Given a valid AI-generated draft, when the Applicant receives it, then it remains editable, is not persisted by generation, and the form asks the Applicant to verify personal details before submission. Submission requires a separate explicit action.

Denial/failure scenario: Given malformed, empty, oversized or script-like model output, when it is validated or rendered, then it is rejected safely or displayed as escaped text; no application is created or changed.
