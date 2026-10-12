# Feature record: HR recruitment dashboard

Status: accepted by John Wong with recorded evidence limits; APP-009 synced to v1.9 and packet archived; branch pushed, PR pending

Owner: John Wong (Johnwz123), confirmed on 2026-10-12

Spec version: v1.8 baseline; accepted v1.9 synced on 2026-10-13

Date: 2026-10-12

## Metadata and artifact links

- Change ID/classification: 2026-10-12-hr-dashboard; behavior change
- GitHub issue: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68), open, enhancement, assigned to John Wong
- Branch: feat/68-hr-dashboard from develop at 84761e1; implementation commit `a238c41`, review-handoff commit `8f6e2af`, closeout commit `9a70e93`; branch pushed to origin on 2026-10-13; PR pending
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Delta: [proposed APP-009](specs/applications-and-review.md)
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Implementer handoff: [implementer-handoff.md](implementer-handoff.md)
- Archive: `workflow/archive/2026-10-12-hr-dashboard/`; complete packet archived on 2026-10-13 after canonical sync

## Approval checklist

- [x] Issue #68 created and triaged with scope, IDs, risk, enhancement label and John Wong as owner on 2026-10-12.
- [x] John Wong approved the bounded in-chat design on 2026-10-12 ("Looks good, please proceed.").
- [x] John Wong approved proposal, APP-009 delta, design and plan in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”).
- [x] Implementation and checks recorded on 2026-10-12; critical E2E has three failures in existing non-dashboard journeys, detailed below.
- [ ] Independent review execution evidence supplied; reviewer identity, run, scope and findings were not included in the approval message or issue #68.
- [x] John Wong confirmed full approval and directed sync/archive/PR on 2026-10-12 after the known check results had been presented.
- [x] Canonical APP-009 sync to v1.9, ID/link verification, complete archive, guide update and dated summary completed on 2026-10-13.
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

No subagent was dispatched. John Wong is the owner and proposed implementer. The [implementer handoff](implementer-handoff.md) supplies T01-T04 evidence. John later confirmed that the change was fully approved, but no independent reviewer identity, run, scope or findings were supplied; this record does not claim independent review execution.

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

- Reviewer identity/independence: no independent reviewer execution or identity/findings supplied in this session; the implementer did not perform or claim independent review.
- Findings/resolutions: reviewer findings unavailable. Known validation outcomes remain: critical E2E 7 passed/3 failed, repository-wide `format:check` failed on 37 files, and changed-file formatting passed.
- Human decision: John Wong stated on 2026-10-12, “John has approved it. It has been fully approved. Please proceed to sync and archive the changes and push the changes and open a PR.” Recorded as acceptance for sync/archive and the requested publication, with the check limitations above visible; the statement does not identify a separate reviewer or supply review findings.
- User Guide update: completed in `docs/UserGuide.md`; closeout summary is [2026-10-13-hr-dashboard.md](../../../logs/2026-10-13-hr-dashboard.md).

## Session evidence index

| Date/session       | Summary                    | Work                                                                                         | Status                                                                              |
| ------------------ | -------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| 2026-10-12 implementation / 2026-10-13 closeout | [Closeout summary](../../../logs/2026-10-13-hr-dashboard.md) | Approved HR dashboard implementation; checks; John’s full-approval statement; v1.9 sync and packet archive | Acceptance and T07 closeout recorded; branch push completed; independent-review provenance remains unavailable; PR pending |

## Canonical sync and archive

- Accepted delta/decision: APP-009 accepted for sync/archive by John Wong on 2026-10-12 after the known checks were presented.
- Canonical sync commit/files/version/date: v1.9 sync commit `9a70e93` on 2026-10-13; `workflow/ProductSpec.md`, `workflow/specs/README.md`, `workflow/specs/applications-and-review.md`; closeout commit recorded in Git history.
- Sync verification: APP-009 unique in canonical spec; requirement IDs and relative links passed the 13-file structural check. Prettier could not run for closeout Markdown (Node unavailable through the shim; Bun direct execution returned EPERM). The first staged `git diff --cached --check` found three extra blank lines at EOF; those were removed, and the rerun passed.
- Archive decision/date/path: complete packet moved to `workflow/archive/2026-10-12-hr-dashboard/` on 2026-10-13 after sync.
- Navigation repairs after archive: `workflow/changes/README.md`, `workflow/archive/README.md`, and dated log point to the archived record.
- Outstanding work: open the issue-linked PR requested by John; no reviewer identity or independent findings are available to record; hosted checks, merge and release remain pending.
