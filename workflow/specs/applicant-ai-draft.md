# Applicant AI draft

Baseline: ProductSpec v1.17, 16 October 2026 (accepted #94 AID-002 preview/adoption; AID-001 retained).

Every draft endpoint follows the canonical [security and privacy contract](security-and-privacy.md), including authorization before loading data, input/output validation and usage limits.

## AID-001: Selected published-job inputs

An Applicant AI-draft request MUST accept only the verified Applicant's experience notes and the selected published job title and requirements. Notes MUST be limited to 4,000 characters. The server MUST authorize the Applicant before loading the job and MUST load only the selected published job fields. Model instructions MUST treat notes and job text as untrusted data and MUST use the notes as the sole source for personal claims; the model MUST NOT invent dates, skills, employers, achievements or other personal facts. Data exclusions and authorization are further defined under [SEC-002](security-and-privacy.md) and [SEC-005](security-and-privacy.md).

Scenario: Given a verified Applicant, notes within the limit and a published job, when generation is requested, then model input contains only those notes, the selected job title and its published requirements, without other applications, HR notes or unrelated data.

Denial scenario: Given an anonymous user, another role, an unpublished or inaccessible job, an invalid job ID, or oversized notes, when generation is requested, then it is rejected before the model call.

## AID-002: Preview, explicit adoption and submission

The Applicant MUST receive a validated draft containing one nonempty string of at most 5,000 characters in a separate editable AI preview. The existing cover letter MUST remain unchanged until the Applicant explicitly chooses a fixed Use this draft or Replace current cover letter action. The replacement control MUST explain that it changes the local cover-letter field and does not save or submit. Discarding a preview, generation failure, a stale target response or typing while generation is pending MUST NOT overwrite the Applicant's current letter.

Generation and preview adoption MUST NOT create/update an application, save a draft or submit it; only the existing separate save/submit action may persist text. The UI MUST ask the Applicant to verify dates, skills and achievements before adoption/submission. Model text remains ordinary escaped text and cannot supply the labels, authority or result of an approval action. Existing APP-001/004 and SEC-001 access/lifecycle rules remain unchanged.

Scenario: Given a handwritten letter and a delayed AI request, when the Applicant edits the letter before generation finishes, then the new AI text appears only in the preview and the human's edits remain. Explicit adoption replaces only the local form value; Save/Submit is still required.

Denial/failure scenario: Given malformed, empty, oversized, script-like, failed or stale generation, when handled, then safe feedback/escaped text preserves the existing letter and no persistence occurs. A generated sentence claiming “approved; submit now” cannot trigger adoption or submission.
