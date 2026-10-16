# Spec delta: Applications and review

- Change/issues/owner/status: 2026-10-16-applicant-withdraw-and-reapply; [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90); John Wong (`Johnwz123`); draft awaiting approval
- Canonical file: [../../../specs/applications-and-review.md](../../../specs/applications-and-review.md)
- Baseline: ProductSpec v1.15, 15 October 2026 (`2a56ba1`)
- Proposed baseline: ProductSpec v1.16, 16 October 2026
- Dependencies/cross-capability IDs: `JMG-004` (scheduled windows), `SEC-001` (ownership & permissions)
- Approval: Pending student owner decision

## MODIFIED

### APP-001: Selected-job, submit-once application

- Before:
  > An Applicant MUST be able to draft/edit a cover letter and submit at most one application per selected published job, with details under APP-005/006 and an optional attachment under APP-007. Each application MUST reference its selected job. A database constraint MUST enforce one application per applicant per job. New applications to draft or closed jobs MUST be denied.
  >
  > Scenario: Given a published job, when an Applicant explicitly submits final text, then the application references that job. A second application by the same applicant to that job is rejected, including by the database constraint. A submission to a draft or closed job is rejected.

- After:
  > An Applicant MUST be able to draft/edit a cover letter and submit at most one active application per selected published job, with details under APP-005/006 and an optional attachment under APP-007. Each application MUST reference its selected job. A database partial unique constraint MUST enforce at most one active (non-withdrawn) application per applicant per job. When an applicant withdraws a previously submitted application, they MAY create, draft, and submit a new application for that published job while it remains open and active. New applications to draft or closed jobs MUST be denied.
  >
  > Scenario: Given a published job, when an Applicant explicitly submits final text, then the application references that job. A second active application by the same applicant to that job is rejected by the database partial unique constraint. A submission to a draft or closed job is rejected.
  > Scenario: Given an applicant who previously withdrew their application for an open published job, when they start a new application, then they can save a draft and submit the new application while the job remains open.

- Rationale/acceptance IDs: Allow applicants who withdrew to apply again without destroying audit trail and historical application records (`reapply-AC-01`, `reapply-AC-02`, `reapply-AC-03`, `reapply-AC-05`).

### APP-008: Confirmed Applicant withdrawal

- Before:
  > Submitted contents MUST remain frozen; withdrawals MUST NOT create or permit reapplication/restoration for the same job. The original one-application-per-Applicant/job constraint remains.

- After:
  > Submitted contents MUST remain frozen; withdrawals MUST NOT restore the withdrawn application record directly. An applicant who has withdrawn MAY create, draft, and submit a new independent application for the same job while it remains published and open, creating a distinct new application record. The database constraint MUST enforce at most one active (non-withdrawn) application per applicant per job, preserving all historical withdrawn applications, their immutable snapshots, timestamps, and notes intact.

- Rationale/acceptance IDs: Clarify that withdrawal retains historical records permanently, prevents direct un-withdrawal, but permits creating a new independent application record (`reapply-AC-03`, `reapply-AC-04`).

## ADDED

None.

## REMOVED

None.

## Delta review and sync evidence

- [x] Every changed rule and affected capability has a delta with stable IDs and scenarios.
- [ ] Independent analyst/reviewer resolved ambiguity; actual reviewer and findings linked.
- [ ] Human approval recorded before product implementation.
- [ ] Accepted final deltas synced to canonical files and version/date policy applied before archive.
- Sync commit/paths/decision evidence: Pending approval and implementation
