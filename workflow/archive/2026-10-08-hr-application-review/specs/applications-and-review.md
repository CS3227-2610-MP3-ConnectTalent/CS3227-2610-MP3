# Proposed spec delta: applications and HR review

- Change/issue/owner: `2026-10-08-hr-application-review`; [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9); Paul Cheng; accepted locally 2026-10-08.
- Canonical destination: [applications-and-review.md](../../../specs/applications-and-review.md), APP-002 and APP-003.
- Baseline: ProductSpec v0.7 at `551da67`; accepted text synced to v0.8 on 2026-10-08 before archive.
- Cross-capability: [SEC-001 delta](security-and-privacy.md) owns access; [ACC-002 delta](accounts-and-roles.md) owns HR provisioning; existing APP-004 governs current/original letter lifecycle.
- Approval and acceptance: Paul Cheng approved this delta and transition policy with the complete packet, then separately accepted the local feature with recorded limits on 2026-10-08. Synced to canonical v0.8.

## ADDED

None.

## MODIFIED

### APP-002: Applicant reading

- Before: Applicant may read their own application; other Applicants and HR-status changes are denied.
- After: An Applicant MUST be able to read their own draft or submitted application and, after submission, the current HR review status. They MUST NOT read another Applicant's application, any HR note or status history, or perform an HR status action. Existing application reads remain available after job closure under JMG-003 and SEC-001.
- Rationale/acceptance: issue #9 explicitly requires own status visibility; `hr9-AC-04/05`.
- Scenario: **Given** Applicant A's submitted application, **when** A opens it after HR changes status, **then** A sees the current status and their letter, including after job closure.
- Denial scenario: **Given** Applicant B or an anonymous visitor, **when** they request A's application/status/notes, **then** no protected data is returned.

### APP-003: HR review, notes and separate status action

- Before: HR may read submitted applications and original letters, write HR-only notes and separately update status; status values and note behavior are unspecified.
- After: Authorized HR MUST be able to list and read only submitted applications for this portal, showing selected job, original submitted cover letter, current cover letter and current review status. HR MUST NOT see unsubmitted drafts. HR notes MUST be append-only records with author and creation time, readable only by authorized HR. The initial review status MUST be `Submitted` on explicit Applicant submission. Authorized HR MAY set `In review`, `Shortlisted` or `Rejected` through a separate explicit human action and MAY move among those three to correct a decision; HR MUST NOT set a submitted application back to `Submitted`. Every status action MUST preserve the application and record actor/time without exposing letter or note text in status events. AI text or output MUST NOT trigger notes or status actions. Submitted applications, notes and status remain available to HR after job closure, subject to SEC-001.
- Rationale/acceptance: issue #9 and user's chosen status/note behavior; transition policy requires full-packet approval; `hr9-AC-02/03/04/05/06`.
- Scenario: **Given** an authorized HR user and a submitted application, **when** HR opens its detail, adds a note and separately selects `In review`, **then** HR sees the authored note and new status while the Applicant sees only their own current status.
- Denial/failure scenario: **Given** an unsubmitted draft, **when** HR requests its ID, **then** no draft is returned. **Given** an Applicant, anonymous visitor or stale/invalid status request, **when** the status action is attempted, **then** the write is denied without changing status or exposing notes.
- Rule relocation: none; authorization remains in [SEC-001/002](../../../specs/security-and-privacy.md).

## REMOVED

None.

## Review and sync

- [x] Complete packet and status transition policy approved by student owner for implementation on 2026-10-08.
- [x] Separate read-only review checked Applicant/HR visibility and status semantics; its privacy-test evidence finding was corrected and rechecked.
- [x] Accepted APP-002/003 text synced to canonical v0.8 before archive.
- Sync commit: pending separate user instruction. Human decision: 2026-10-08 conversation acceptance with recorded limits; see [record](../record.md).
