# Feature record: Scheduled job opening and closing times

Status: archived

Owner: John (Johnwz123)

Spec version: ProductSpec v1.15; [ProductSpec.md](../../ProductSpec.md)
Date: 2026-10-15

## Metadata and artifact links

- Change ID/classification: 2026-10-15-scheduled-job-times; behavior change (medium)
- GitHub issues: [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Branch/commits/PR: `feat/88-scheduled-job-times`; [PR #89](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/89)
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/job-management.md](specs/job-management.md), [specs/public-job-listings.md](specs/public-job-listings.md)
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v1.15, commit `f5da004`
- Archive path: `workflow/archive/2026-10-15-scheduled-job-times/`

## Approval checklist

- [x] Issue triaged and scope agreed; actual issue [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88) recorded.
- [x] Human approved proposal, deltas, design, and plan before product implementation. Approved by John (Johnwz123) on 2026-10-15.
- [x] Implementation and relevant checks complete with actual evidence below.
- [x] Independent review complete; findings and unresolved matters recorded. See [handoffs/independent-review.md](handoffs/independent-review.md).
- [ ] Human acceptance recorded separately from implementation and review.
- [ ] Relevant guides/reflections updated and every session log linked.
- [ ] Pre-PR closeout complete; contributor PR opened last with issue links.
- [ ] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link                                 | Observable success / denial / failure                                                                                                                                   | Evidence, result and limitation                                                                                                                   |
| ------------------- | ----------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| sched-AC-01         | #88; JMG-004; [job-management.md](../../specs/job-management.md)                    | Given a draft with future `opens_at`, when published, it displays as "Scheduled" to HR and is hidden from public listings and application submissions until `opens_at`. | `tests/unit/hr-jobs.test.ts`, `tests/unit/jobs.test.ts`, `tests/unit/hr-job-pages.test.tsx`, `supabase/tests/database/hr_job_scheduling.test.sql` |
| sched-AC-02         | #88; JMG-004; [job-management.md](../../specs/job-management.md)                    | Given a scheduled job before `opens_at`, when HR reverts it to draft, it returns to draft state with editable content and schedule.                                     | `tests/unit/hr-job-actions.test.ts` (`unpublishHRJob`), `tests/unit/hr-job-pages.test.tsx`, `supabase/tests/database/hr_job_scheduling.test.sql`  |
| sched-AC-03         | #88; JMG-004, JOB-001; [public-job-listings.md](../../specs/public-job-listings.md) | Given an active job whose `closes_at` has passed, it disappears from public listings and rejects application draft saves/submissions.                                   | `tests/unit/jobs.test.ts`, `supabase/tests/database/hr_job_scheduling.test.sql`                                                                   |
| sched-AC-04         | #88; JMG-003, JMG-004; [job-management.md](../../specs/job-management.md)           | Given any scheduled or live job, HR can explicitly close it at any time, permanently preserving applications and locking the job.                                       | `tests/unit/hr-job-actions.test.ts`, `tests/unit/hr-job-pages.test.tsx`, `supabase/tests/database/hr_job_scheduling.test.sql`                     |

## Agent handoffs

| Role and tool               | Input/context supplied      | Output and assumptions                             | Human verification             |
| --------------------------- | --------------------------- | -------------------------------------------------- | ------------------------------ |
| Product analyst / Architect | Issue #88, baseline specs   | Proposal, design, spec deltas, implementation plan | Approved by John on 2026-10-15 |
| Implementer                 | Approved plan and TDD tasks | Migration, schema, RLS, status helper, inputs, UI  | Complete, 532 unit tests pass  |

## Implementation and tests

Changed files:

- `supabase/migrations/20261015000000_scheduled_job_times.sql`
- `supabase/tests/database/hr_job_scheduling.test.sql`
- `src/lib/hr-job-input.ts`
- `src/lib/hr-jobs.ts`
- `src/lib/jobs.ts`
- `src/app/hr/jobs/actions.ts`
- `src/app/hr/jobs/job-editor.tsx`
- `src/app/hr/jobs/[id]/page.tsx`
- `src/app/jobs/[id]/page.tsx`
- `tests/unit/hr-job-input.test.ts`
- `tests/unit/hr-jobs.test.ts`
- `tests/unit/jobs.test.ts`
- `tests/unit/hr-job-actions.test.ts`
- `tests/unit/hr-job-pages.test.tsx`

Commands and results:

- `pnpm typecheck`: Exit 0 (zero errors).
- `pnpm lint`: Exit 0 (zero errors/warnings).
- `pnpm test:unit`: Exit 0, 90 test files, 532 passing tests.

## Review and decision

- Reviewer identity and independence: Independent reviewer subagent (`d81d7f95-a4e7-441b-ba28-f6cd957f240c`); separate execution with zero implementation code changes.
- Findings/resolutions: See [handoffs/independent-review.md](handoffs/independent-review.md). 1 initial quality finding (ESLint `max-lines-per-function` in `tests/unit/hr-jobs.test.ts`) resolved by splitting the describe block. Re-verification confirmed 0 lint errors, 0 type errors, and 532 passing unit tests. Independent reviewer recommends Approval.
- Human decisions: Accepted by John (Johnwz123) in chat on 2026-10-15 following independent review resolution and passing quality gates (typecheck, lint, 532 unit tests). Approved to proceed with canonical spec sync, archive, and PR submission.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered                   | Verification status / missing coverage |
| -------------- | ---------------- | ---------------------------------------------------- | -------------------------------------- |
| 2026-10-15     | [2026-10-15-scheduled-job-times.md](../../../logs/2026-10-15-scheduled-job-times.md) | Issue #88 intake, packet creation, proposal & design, implementation, independent review, acceptance | Passed local unit, lint, and typecheck; hosted DB checks pending CI |

## Canonical sync and archive
 
- Synced `JMG-004` to [workflow/specs/job-management.md](../../specs/job-management.md).
- Synced `JOB-001` schedule operational window rules to [workflow/specs/public-job-listings.md](../../specs/public-job-listings.md).
- Updated baseline to v1.15 in [workflow/specs/README.md](../../specs/README.md) and [workflow/ProductSpec.md](../../ProductSpec.md).
- Moved packet to [workflow/archive/2026-10-15-scheduled-job-times/](../2026-10-15-scheduled-job-times/record.md).
