# Proposed spec delta: security and privacy

- Change: `2026-10-07-applicant-applications`, [issue #6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6); Applicant owner Paul Cheng, confirmed in this conversation.
- Canonical destination: [security-and-privacy.md](../../../specs/security-and-privacy.md).
- Baseline: ProductSpec v0.6 at commit `0200eb9`; [SEC-001](../../../specs/security-and-privacy.md).
- Proposed baseline: v0.7 only after human approval, implementation, acceptance and sync.
- Cross-capability: [APP-004 proposal](applications-and-review.md) defines saved draft and letter revision behavior. SEC-001 remains the sole home for cross-role access.
- Approval: user approved this delta for implementation in the 2026-10-07 chat; canonical sync remains pending.

## ADDED

None.

## MODIFIED

### SEC-001: Access boundaries — proposed clarification

- Before: The v0.6 access table says Applicant has own application/letter read and HR has read for review; APP-003 says HR reads submitted applications. It does not distinguish a newly saved, unsubmitted draft from an application already submitted, or original versus current text after an edit.
- After: Replace the `Application and cover letter` table row with two rows:

  | Data/action | Applicant access | HR access |
  | --- | --- | --- |
  | Saved draft application and cover letter | Own draft read/write while its job is published; own read after closure | None |
  | Submitted application, original and current cover letter | Own read; current-letter edit while its job is published | Read for review |

  All other SEC-001 table rows and prohibitions remain unchanged. An Applicant MUST NOT edit another Applicant's draft/submission, change HR status, or change the immutable original submitted letter. Anonymous users MUST NOT read either row. The [APP-004 proposal](applications-and-review.md) owns save/submit/edit lifecycle and job-close behavior.
- Rationale/acceptance: saved drafts were chosen by the user; HR should see only material explicitly submitted, and original/current visibility must be clear for review. Supports `app6-AC-05`–`07`.
- Scenario: **Given** Applicant A's saved draft, **when** A returns, **then** A reads it, while HR and Applicant B cannot. **Given** A's submitted and later edited letter, **when** authorized HR reviews it, **then** both original and current text are available.
- Denial/failure scenario: **Given** an anonymous visitor or Applicant B, **when** they request A's draft or submission, **then** no letter is returned. **Given** A attempting to alter the original submitted snapshot or HR status, **when** the write is attempted, **then** it is denied.
- Rule relocation: none; SEC-001 remains the canonical home for the access matrix.

## REMOVED

None.

## Review and sync

- [x] User approved this access clarification with the application delta, design and plan on 2026-10-07.
- [ ] Independent reviewer verifies RLS and function permissions against the final matrix.
- [ ] Sync accepted text into canonical SEC-001 only after human acceptance; update baseline/version and verify links/IDs before archive.
- Sync commit / decision evidence: **pending**.
