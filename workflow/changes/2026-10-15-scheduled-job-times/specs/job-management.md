# Spec delta: job-management

- Change/issues/owner/status: 2026-10-15-scheduled-job-times; [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88); John (Johnwz123); draft
- Canonical file: [job-management.md](../../../specs/job-management.md)
- Baseline: ProductSpec v0.6, 5 October 2026
- Proposed baseline: ProductSpec v1.12
- Dependencies/cross-capability IDs: [public-job-listings.md](../../../specs/public-job-listings.md) (`JOB-001`), [applications-and-review.md](../../../specs/applications-and-review.md) (`APP-001`), [security-and-privacy.md](../../../specs/security-and-privacy.md) (`SEC-001`)
- Approval: Pending human approval

## ADDED

### JMG-004: Scheduled opening and closing windows

HR MAY optionally set an opening date and time (`opens_at`) and/or a closing date and time (`closes_at`) for a job listing. If set, `closes_at` MUST be strictly after `opens_at`. A published job with a future `opens_at` MUST be treated as `Scheduled`; it MUST NOT appear in public listings or accept application saves/submissions until `opens_at` arrives. While in the `Scheduled` state, HR MAY edit the schedule or revert the job back to `Draft`. Once `opens_at` arrives (or immediately if `opens_at` is omitted), the job MUST become active and live, and its content and requirements MUST stay permanently fixed. When `closes_at` arrives, the job MUST automatically stop appearing in public listings and stop accepting application drafts or submissions. Closing MUST preserve all existing applications. HR MAY explicitly close an active or scheduled job at any time before `closes_at`. Reopening closed jobs MUST remain denied.

- Rationale/acceptance IDs: sched-AC-01, sched-AC-02, sched-AC-03, sched-AC-04
- Scenario: **Given** an HR user, **When** they publish a job with `opens_at` in the future, **Then** the job displays as "Scheduled" in HR views and does not appear in public listings or accept applications until `opens_at`.
- Scenario: **Given** a scheduled job before `opens_at`, **When** HR reverts it to draft, **Then** the job returns to draft status and its content and schedule can be edited.
- Scenario: **Given** an active job with a scheduled `closes_at`, **When** the current time passes `closes_at`, **Then** the job is automatically hidden from public listings and rejects new application draft saves and submissions.
- Denial/failure scenario: **Given** an applicant or anonymous visitor, **When** they attempt to read or submit an application to a job before `opens_at` or after `closes_at`, **Then** the request is rejected with safe feedback and no write occurs.

## MODIFIED

None

## REMOVED

None

## Delta review and sync evidence

- [x] Every changed rule and affected capability has a delta with stable IDs and scenarios.
- [ ] Independent analyst/reviewer resolved ambiguity; actual reviewer and findings linked.
- [ ] Human approval recorded before product implementation.
- [ ] Accepted final deltas synced to canonical files and version/date policy applied before archive.
- Sync commit/paths/decision evidence: Pending human approval and implementation.

