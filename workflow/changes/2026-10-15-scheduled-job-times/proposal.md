# Proposal: Scheduled job opening and closing times

- Change ID: 2026-10-15-scheduled-job-times
- Issues: [#88 feat(jobs): schedule opening and closing times for job listings](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Owner: John (Johnwz123)
- Status: awaiting approval
- Date: 2026-10-15
- Baseline: ProductSpec v1.11; [ProductSpec.md](../../ProductSpec.md)
- Affected capabilities: [job-management.md](../../specs/job-management.md) (`JMG-001`, `JMG-002`, `JMG-003`, new `JMG-004`), [public-job-listings.md](../../specs/public-job-listings.md) (`JOB-001`), [applications-and-review.md](../../specs/applications-and-review.md) (`APP-001`)
- Classification: behavior change; medium risk, schema migration, RLS, and UI updates

## Intent, problem, and motivation

Currently, HR administrators can only transition job listings between states manually: publishing a draft immediately opens it to the public, and closing a published job immediately closes it. If HR wants a job posting to go live on a specific future date/time or to stop accepting applications at a specific deadline, they must manually sign in and perform the action at that exact moment.

This change introduces optional scheduled opening (`opens_at`) and closing (`closes_at`) timestamps to job listings. Postings scheduled for the future remain hidden and unopen until the scheduled time. Postings with a closing deadline automatically disappear from public view and stop accepting applications when the deadline passes. Reopening closed jobs remains strictly disallowed to preserve requirement integrity.

## Goals, non-goals, and scope boundaries

- Goals:
  - Allow HR to set optional opening and closing dates/times on job listings via the job editor form.
  - Automatically evaluate the active window (`opens_at <= now()` and `closes_at > now()`) in PostgreSQL RLS policies and server queries.
  - Display an operational status in HR Manage Jobs: "Draft", "Scheduled", "Published", or "Closed".
  - Allow HR to revert a scheduled job back to "Draft" or edit its schedule before `opens_at` arrives.
  - Allow HR to manually close an active or scheduled job at any time.
  - Display application closing deadlines on public job detail pages when set.
- Non-goals:
  - Reopening closed jobs (remains disallowed per `JMG-002`/`JMG-003`).
  - External cron workers / daemons (`pg_cron`, serverless cron runners); active availability is evaluated dynamically in SQL/RLS.
- Users/roles:
  - HR: Create, edit, schedule, publish, revert scheduled, and close jobs.
  - Applicants / Guests: View and apply only to jobs within their active operational window (`now() >= opens_at` and `now() < closes_at`).
- Scope boundaries:
  - Schema migration on `public.jobs`.
  - RPCs: `create_hr_job_draft`, `edit_hr_job_draft`, `unpublish_hr_job`, `submit_application`, `save_application_draft`.
  - HR job editor and detail pages (`src/app/hr/jobs/`).
  - Public job listing and detail queries (`src/lib/jobs.ts`, `src/app/jobs/`).

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| ----------- | --------------------- | ------------------- |
| Dynamic time-window evaluation in SQL & RLS | Precise, zero cron maintenance, robust across local/staging/prod | Chosen: Simplest, most reliable, zero operational failure points |
| Background cron mutation (`pg_cron`) | Status column is mutated on disk | Rejected: High complexity, polling delay, fragile in local/test environments |
| Status quo (manual only) | No code changes | Rejected: Does not satisfy user requirement for automated scheduling |

- Assumptions: System clocks on database and application servers are synchronized via NTP.
- Dependencies: Supabase PostgreSQL migration; Next.js server actions.
- Risks: RLS leakage if time condition is omitted from queries; mitigated by embedding active window check directly into RLS policy for `public.jobs`.
- Open decisions: None.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| ------------- | --------------------------------------------- | --------------------------- | --------------------------- |
| sched-AC-01 | #88; JMG-004; [job-management.md](../../specs/job-management.md) | Given a draft with future `opens_at`, when published, it displays as "Scheduled" to HR and is hidden from public listings and application submissions until `opens_at`. | Database & E2E tests; John |
| sched-AC-02 | #88; JMG-004; [job-management.md](../../specs/job-management.md) | Given a scheduled job before `opens_at`, when HR reverts it to draft, it returns to draft state with editable content and schedule. | Stored procedure & UI tests; John |
| sched-AC-03 | #88; JMG-004, JOB-001; [public-job-listings.md](../../specs/public-job-listings.md) | Given an active job whose `closes_at` has passed, it disappears from public listings and rejects application draft saves/submissions. | RLS & RPC tests; John |
| sched-AC-04 | #88; JMG-003, JMG-004; [job-management.md](../../specs/job-management.md) | Given any scheduled or live job, HR can explicitly close it at any time, permanently preserving applications and locking the job. | Stored procedure & UI tests; John |

- Spec deltas: `specs/job-management.md`, `specs/public-job-listings.md`
- Design: `design.md`
- Plan and tasks: `plan.md` and `tasks.md`
- Evidence: `record.md`

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, deltas, design or omission reason, and plan agreed before product implementation.
- Approver: John (Johnwz123)
- Decision/date/source: Approved on 2026-10-15 via user chat confirmation
- Conditions: None.

