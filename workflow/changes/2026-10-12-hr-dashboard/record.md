# Feature record: HR recruitment dashboard

Status: implementation and checks recorded; independent review and student acceptance pending

Owner: John Wong (Johnwz123), confirmed on 2026-10-12

Spec version: v1.8 baseline; proposed v1.9 if APP-009 is accepted

Date: 2026-10-12

## Metadata and artifact links

- Change ID/classification: 2026-10-12-hr-dashboard; behavior change
- GitHub issue: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68), open, enhancement, assigned to John Wong
- Branch: feat/68-hr-dashboard from develop at 84761e1; implementation commit `a238c41`; PR pending
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Delta: [proposed APP-009](specs/applications-and-review.md)
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Implementer handoff: [implementer-handoff.md](implementer-handoff.md)
- Archive: pending acceptance and canonical sync

## Approval checklist

- [x] Issue #68 created and triaged with scope, IDs, risk, enhancement label and John Wong as owner on 2026-10-12.
- [x] John Wong approved the bounded in-chat design on 2026-10-12 ("Looks good, please proceed.").
- [x] John Wong approved proposal, APP-009 delta, design and plan in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”).
- [x] Implementation and checks recorded on 2026-10-12; critical E2E has three failures in existing non-dashboard journeys, detailed below.
- [ ] Independent review complete; pending.
- [ ] Separate student acceptance recorded; pending.
- [ ] Canonical sync, archive, guide and dated summary complete; pending.
- [ ] Pre-PR closeout and issue-linked PR complete; pending.

## Requirement and acceptance criteria

| ID        | Requirement link                   | Observable outcome                                                                                       | Evidence/result                                                    |
| --------- | ---------------------------------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| HRD-AC-01 | #68; proposed APP-009; APP-003     | HR sees job lifecycle counts, active application counts by review status and a separate withdrawn total. | Unit aggregate/page checks passed; dashboard E2E passed            |
| HRD-AC-02 | #68; proposed APP-009; APP-008     | Counts group by job ID, include closed jobs and do not double-count withdrawn prior status.              | Unit aggregate and synthetic duplicate-title/closed-job E2E passed |
| HRD-AC-03 | #68; proposed APP-009              | No jobs/applications shows zeros and clear empty guidance.                                               | Unit/page empty-state checks passed                                |
| HRD-AC-04 | #68; proposed APP-009; SEC-001/002 | Anonymous and Applicant actors receive existing route denial and no counts.                              | Page authorization and synthetic guest/Applicant E2E passed        |
| HRD-AC-05 | #68; proposed APP-009; SEC-001/002 | HR links work; a read failure shows generic unavailable text and no query/private details.               | Unit/page read-failure checks and dashboard links E2E passed       |

## Agent handoffs

No subagent was dispatched. John Wong is the owner and proposed implementer. The [implementer handoff](implementer-handoff.md) supplies the T01-T04 evidence for a separate reviewer; reviewer execution remains pending.

## Implementation and tests

Changed files: `src/app/hr/page.tsx`, `src/lib/hr-dashboard.ts`, `src/lib/hr-applications.ts`, `src/components/account-navigation.tsx`, `tests/unit/hr-applications.test.ts`, `tests/unit/hr-dashboard.test.ts`, `tests/unit/hr-dashboard-page.test.tsx`, `tests/e2e/hr-dashboard.spec.ts`, `tests/e2e/support/hr-dashboard-journey.ts`, `package.json`, `docs/UserGuide.md`, this packet and `workflow/changes/README.md`.

Test-first evidence: before adding `job_id` to the validated HR list row and query, `bun ./node_modules/vitest/vitest.mjs run tests/unit/hr-applications.test.ts` failed because the select string omitted `job_id`. The failure was the intended behavior assertion, not an infrastructure error. The final full unit suite passed afterward.

Final checks on 2026-10-12:

| Command                                                                             | Result                                                                                                                                      |
| ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run lint`                                                                      | Exit 0; 0 errors and 2 warnings for unused eslint-disable directives in generated `coverage/` files.                                        |
| `bun run typecheck`                                                                 | Exit 0.                                                                                                                                     |
| `bun run test:unit`                                                                 | Exit 0; 63 files and 342 tests passed.                                                                                                      |
| `bun prettier --check` on all changed source, test, package, guide and packet files | Exit 0; all matched files use Prettier style.                                                                                               |
| `bun run format:check`                                                              | Exit 1; reports 37 repository files with formatting differences. The changed-file check above passed; unrelated files were not reformatted. |
| `bun run build`                                                                     | Exit 0; Next.js 16.3.8 generated `/hr` as a dynamic server-rendered route.                                                                  |
| `bun run test:e2e:critical`                                                         | Exit 1; 7 passed and 3 failed. The new HR dashboard journey passed. Failures are recorded below.                                            |
| `git diff --check`                                                                  | Passed with no whitespace errors.                                                                                                           |

The three failures occurred in existing non-dashboard E2E cases: `applicant-applications.spec.ts` could not match the exact original-letter text after submission; `application-withdrawal.spec.ts` stayed on the apply page after saving a draft instead of navigating to the application; and `hr-application-review.spec.ts` showed “The change was saved” while its status remained “In review” after choosing “Shortlisted.” Their captured Playwright contexts are in ignored `test-results/`. The HR dashboard case passed in the same run. The same tests were not run on a clean baseline, so their relationship to this branch is unverified; no unrelated repair was made.

The browser run used local Supabase. Five already-authored pending migrations were applied with `bun ./node_modules/supabase/dist/supabase.js migration up --local` (no reset); the local stack was stopped after testing. The browser journey used synthetic records and its fixture cleanup completed.

Security cases: `/hr` calls the existing HR authorization guard before reading data. Unit/page checks verified authorization denial, generic all-or-nothing read failure, zero applicant-private content in rendered output, and synthetic guest/Applicant denial in the browser journey. The dashboard is read-only and renders aggregate fields plus job titles/links only.

Limitations: aggregates read the existing HR job and submitted-application result sets in server memory; no pagination or database aggregation. The critical suite has three unresolved failures outside the dashboard-specific journey, and the repository-wide formatting check is not clean. Hosted rollout/release are separate decisions.

## Review and decision

- Reviewer identity/independence: pending; the implementer did not perform or claim independent review.
- Findings/resolutions: pending.
- Human decisions: in-chat bounded design and implementation packet approved by John Wong on 2026-10-12. The latest user message says “It's been accepted. Please proceed.” Its stage (separate reviewer approval, student acceptance, or both) is awaiting clarification; T05/T06 remain unmarked.
- User Guide update: completed in `docs/UserGuide.md`; dated session summary pending closeout.

## Session evidence index

| Date/session       | Summary                    | Work                                                                                         | Status                                                                              |
| ------------------ | -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-10-12/current | Dated logs summary pending | Approved HR dashboard implementation; unit/build checks; local critical E2E; packet evidence | T00-T04 complete; separate review/acceptance, canonical sync/archive and PR pending |

## Canonical sync and archive

- Accepted delta/decision: pending; proposed APP-009 only
- Canonical sync commit/files/version/date: pending; canonical files untouched
- Sync verification: pending
- Archive decision/date/path: pending
- Navigation repairs after archive: pending
- Outstanding work: separate review, student acceptance, canonical sync/archive, dated summary and PR closeout.
