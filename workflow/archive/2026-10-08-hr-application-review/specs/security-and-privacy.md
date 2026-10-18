# Proposed spec delta: security and privacy

- Change/issue/owner: `2026-10-08-hr-application-review`; [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9); Paul Cheng; accepted locally 2026-10-08.
- Canonical destination: [SEC-001](../../../specs/security-and-privacy.md). SEC-002 and SEC-007 retain their existing rules and are implementation targets, not changed text.
- Baseline: ProductSpec v0.7 at `551da67`; accepted text synced to v0.8 on 2026-10-08 before archive.
- Cross-capability: [APP-002/003 delta](applications-and-review.md) owns lifecycle and UI; [ACC-002 delta](accounts-and-roles.md) owns controlled role assignment.
- Approval and acceptance: Paul Cheng approved this delta with the complete packet, then separately accepted the local feature with recorded SEC-007/hosted-preview limits on 2026-10-08. Synced to canonical v0.8.

## ADDED

None.

## MODIFIED

### SEC-001: Access boundaries

- Before: Applicant owns application/letter reads; HR reads submitted applications for review and can read/write HR notes; Applicant cannot change HR status. The v0.7 table does not explicitly state Applicant status visibility or status-event access.
- After: Retain all existing job, AI, role-assignment and audit boundaries. Replace the submitted-application row and clarify the HR-notes row as follows:

  | Data/action | Applicant access | HR access |
  | --- | --- | --- |
  | Saved draft application and cover letter | Own draft read/write while job is published; own read after closure | None |
  | Submitted application, original/current letter and current review status | Own read; current-letter edit while job is published; no status write | Read for review; status write through a separate authorized human action |
  | HR notes and status-change history | None | Read; append notes and status events through authorized actions |

  Anonymous users MUST NOT read any protected application, note or status event. Applicant A MUST NOT read Applicant B's application or status, see HR notes/history, or grant themselves HR. HR MUST NOT read unsubmitted drafts, including a draft owned before that account's controlled promotion from Applicant to HR. HR write actions MUST check a verified user's current HR role on the server and in the database. Status events and logs MUST exclude letter and note text. Closing a job MUST NOT broaden or revoke these existing-record read boundaries.
- Rationale/acceptance: issue #9; `hr9-AC-01`–`06`. APP-002/003 hold the feature behavior, while this file holds the cross-role access policy.
- Scenario: **Given** a submitted application, **when** its owner and authorized HR open it, **then** each sees their permitted fields; the owner sees current status but not notes/history.
- Denial/failure scenario: **Given** anonymous access, another Applicant or an HR user requesting a saved draft, **when** the record is fetched by direct ID, **then** RLS and server checks return no protected data. **Given** an Applicant sending an HR write request, **when** authorization runs, **then** the operation is denied.
- Rule relocation: none.

## REMOVED

None.

## Review and sync

- [x] Complete packet approved by student owner for implementation on 2026-10-08.
- [x] Separate read-only security review checked policies, grants, security-definer functions and server queries; no confirmed bypass, with SEC-007 audit gap recorded.
- [x] Accepted SEC-001 text synced to canonical v0.8 before archive.
- Sync commit: `47c4a3f`. Human decision: 2026-10-08 conversation acceptance with recorded limits; see [record](../record.md).
