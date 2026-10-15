# Job management

Baseline: ProductSpec v1.15, 15 October 2026 (integrated #88 scheduled opening and closing times).

Job fields and categories are defined in [JOB-002 / JOB-003](public-job-listings.md). Canonical permissions for every state are in [SEC-001 / SEC-002](security-and-privacy.md).

## JMG-001: Draft creation and editing

HR MUST be able to create and edit this company's draft job listings. Jobs MUST be managed as draft, published or closed.

Scenario: Given authorized HR, when they create a draft and edit its content, then the draft reflects the edits without appearing in public listings.

## JMG-002: Explicit publication and fixed content

HR MUST explicitly publish jobs. Published job content MUST stay fixed so submitted applications can be reviewed against the same requirements; published and closed content MUST NOT be edited. Only published jobs accept new applications, as defined in [APP-001](applications-and-review.md).

Scenario: Given an HR-created draft, when HR publishes it, then it becomes available publicly and accepts applications; subsequent edits to published content are denied.

## JMG-003: Closing preserves applications

HR MUST be able to explicitly close a published job. Closing MUST preserve its existing applications for applicants and HR. See [SEC-001](security-and-privacy.md) for closed-job visibility and [APP-001](applications-and-review.md) for submission eligibility.

Scenario: Given a published job with an existing application, when HR closes it, then the existing application remains available under its access rules, the job no longer appears publicly or accepts new applications, and its content cannot be edited.

## JMG-004: Scheduled opening and closing windows

HR MAY optionally set an opening date and time (`opens_at`) and/or a closing date and time (`closes_at`) for a job listing. If set, `closes_at` MUST be strictly after `opens_at`. A published job with a future `opens_at` MUST be treated as `Scheduled`; it MUST NOT appear in public listings or accept application saves/submissions until `opens_at` arrives. While in the `Scheduled` state, HR MAY edit the schedule or revert the job back to `Draft`. Once `opens_at` arrives (or immediately if `opens_at` is omitted), the job MUST become active and live, and its content and requirements MUST stay permanently fixed. When `closes_at` arrives, the job MUST automatically stop appearing in public listings and stop accepting application drafts or submissions. Closing MUST preserve all existing applications. HR MAY explicitly close an active or scheduled job at any time before `closes_at`. Reopening closed jobs MUST remain denied.

Scenario: Given an HR user, when they publish a job with `opens_at` in the future, then the job displays as "Scheduled" in HR views and does not appear in public listings or accept applications until `opens_at`.
Scenario: Given a scheduled job before `opens_at`, when HR reverts it to draft, then the job returns to draft status and its content and schedule can be edited.
Scenario: Given an active job with a scheduled `closes_at`, when the current time passes `closes_at`, then the job is automatically hidden from public listings and rejects new application draft saves and submissions.
Denial scenario: Given an applicant or anonymous visitor, when they attempt to read or submit an application to a job before `opens_at` or after `closes_at`, then the request is rejected with safe feedback and no write occurs.
