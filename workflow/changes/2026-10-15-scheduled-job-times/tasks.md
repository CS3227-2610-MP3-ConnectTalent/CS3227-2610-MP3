# Tasks: Scheduled job opening and closing times

- Change/issues: 2026-10-15-scheduled-job-times; [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: pending approval; John (Johnwz123)

## Before implementation

- [x] T00 — John (student owner) records approval of proposal, deltas, design, and plan. Evidence: approved by John in chat on 2026-10-15; dependencies: none.

## Ordered implementation

- [x] T01 — Implementer creates database migration and tests for `opens_at`, `closes_at`, RLS, and RPCs (`unpublish_hr_job`, `submit_application`, `save_application_draft`). Depends on: T00. IDs: JMG-004, sched-AC-01, sched-AC-03. Files: `supabase/migrations/20261015000000_scheduled_job_times.sql`, `supabase/tests/database/hr_job_scheduling.test.sql`.
- [x] T02 — Implementer adds datetime parsing and validation in `src/lib/hr-job-input.ts`. Depends on: T01. IDs: JMG-004, sched-AC-01. Files: `src/lib/hr-job-input.ts`, unit tests in `tests/unit/hr-job-input.test.ts`. Evidence: 6 passing unit tests.
- [x] T03 — Implementer updates HR job schema and operational status helper in `src/lib/hr-jobs.ts`. Depends on: T02. IDs: JMG-004, sched-AC-01, sched-AC-02. Files: `src/lib/hr-jobs.ts`, unit tests in `tests/unit/hr-jobs.test.ts`. Evidence: 5 passing unit tests.
- [x] T04 — Implementer updates public job listing queries in `src/lib/jobs.ts` to filter active operational window. Depends on: T03. IDs: JMG-004, JOB-001, sched-AC-01, sched-AC-03. Files: `src/lib/jobs.ts`, unit tests in `tests/unit/jobs.test.ts`. Evidence: 14 passing unit tests.
- [x] T05 — Implementer updates HR job editor, job detail page, and server actions to support scheduling and unpublishing. Depends on: T04. IDs: JMG-004, sched-AC-01, sched-AC-02, sched-AC-04. Files: `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`, `src/app/hr/jobs/actions.ts`, `src/app/jobs/[id]/page.tsx`, `tests/unit/hr-job-actions.test.ts`, `tests/unit/hr-job-pages.test.tsx`. Evidence: 16 passing tests.
- [x] T06 — Test engineer runs full test suite and verifies all acceptance criteria. Depends on: T05. IDs: All. Files: entire repo. Evidence: 90 test files, 532 passing tests; lint and typecheck passing.

## Review and closeout

- [ ] T07 — Independent reviewer checks diff, acceptance evidence, and security boundaries. Depends on: T06. Evidence: handoffs/independent-review.md.
- [ ] T08 — Student owner John records acceptance decision. Evidence: record.md.
- [ ] T09 — Integration lead syncs canonical specs and archives change packet. Evidence: canonical specs and archive folder.
- [ ] T10 — Contributor logs dated session summary and opens issue-linked PR. Evidence: logs/ and PR link.
