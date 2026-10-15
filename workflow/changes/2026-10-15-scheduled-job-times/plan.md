# Implementation plan: Scheduled job opening and closing times

- Change/issues: 2026-10-15-scheduled-job-times; [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Owner/status/date: John (Johnwz123); draft; 2026-10-15
- Approved inputs: proposal.md; design.md; specs/job-management.md; specs/public-job-listings.md
- Baseline and affected IDs: ProductSpec v1.11; JMG-001, JMG-002, JMG-003, JMG-004, JOB-001, APP-001; sched-AC-01, sched-AC-02, sched-AC-03, sched-AC-04
- Constraints: Follow test-first development (TDD) for behavior changes. Run unit and database tests.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --------------- | ---------- | ------------------ | ------------------------------ | ----------------------------- | -------------------------------------------------- |
| T00 | none | John (student owner) | All | proposal.md, design.md, plan.md, specs/ | Human approval recorded in record.md |
| T01 | T00 | Implementer | JMG-004, sched-AC-01, sched-AC-03 | `supabase/migrations/20261015000000_scheduled_job_times.sql`, `supabase/tests/database/hr_job_scheduling.test.sql` | `pnpm supabase db test` (or local test run); tests fail then pass |
| T02 | T01 | Implementer | JMG-004, sched-AC-01 | `src/lib/hr-job-input.ts`, `tests/unit/hr-job-input.test.ts` | `pnpm vitest run tests/unit/hr-job-input.test.ts`; validation of datetime parsing & bounds |
| T03 | T02 | Implementer | JMG-004, sched-AC-01, sched-AC-02 | `src/lib/hr-jobs.ts`, `tests/unit/hr-jobs.test.ts` | `pnpm vitest run tests/unit/hr-jobs.test.ts`; operational status derivation |
| T04 | T03 | Implementer | JMG-004, JOB-001, sched-AC-01, sched-AC-03 | `src/lib/jobs.ts`, `tests/unit/jobs.test.ts` | `pnpm vitest run tests/unit/jobs.test.ts`; public filtering on active window |
| T05 | T04 | Implementer | JMG-004, sched-AC-01, sched-AC-02, sched-AC-04 | `src/app/hr/jobs/actions.ts`, `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`, `src/app/jobs/[id]/page.tsx` | UI rendering, server actions, revert to draft, close job early |
| T06 | T05 | Test engineer | All | Full test suite | `pnpm test` and `pnpm lint`; full passing suite |
| T07 | T06 | Independent reviewer | All | Review handoff | Independent verification of diff against requirements |
| T08 | T07 | John (student owner) | All | record.md | Student acceptance recorded |
| T09 | T08 | Integration lead | All | Canonical specs & archive | Spec sync and packet archiving |

## Integration and handoffs

- Migration must be tested against local Supabase container before updating frontend queries.
- UI changes depend on the new fields in `hrJobSchema` and `hr-job-input`.

## Approval and completion evidence

- [ ] Human approved the proposal, deltas, design, and this plan before product implementation.
- [ ] tasks.md matches the ordered work and states acceptance evidence for each checkbox.
- [ ] Independent review and human acceptance are separate tasks with real decision evidence.
- [ ] Closeout includes every session log and truthful limitations.
- [ ] Contributor flow ends with issue-linked PR after closeout.
- Approval/date/source: Pending student owner sign-off.

