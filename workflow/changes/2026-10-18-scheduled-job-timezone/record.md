# Feature record: Scheduled job timezone handling

Status: in progress; approved browser-local timezone contract

Owner: John (Johnwz123)

Spec version: ProductSpec v1.17; [ProductSpec.md](../../ProductSpec.md)
Date: 2026-10-18

## Metadata and artifact links

- Change ID/classification: `2026-10-18-scheduled-job-timezone`; defect restoration and behavior clarification
- GitHub issue: [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111), assigned to Johnwz123
- Branch/commits/PR: `fix/111-scheduled-job-timezone`; baseline `1f6d87224aeb04194961919f59499f83f7fddb9d`; no implementation commit or PR yet
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Proposed delta: [specs/job-management.md](specs/job-management.md)
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v1.17, 16 October 2026; `develop` at `1f6d87224aeb04194961919f59499f83f7fddb9d`
- Archive path: pending approval, implementation, review, acceptance and closeout

## Approval checklist

- [x] Issue created and assigned; actual issue #111 records scope, reproduction, risk and affected IDs.
- [x] Human approval of proposal, timezone delta, design and plan. John approved browser-local entry/display and UTC storage in chat on 2026-10-18.
- [x] Implementation and relevant checks complete; focused tests, formatting, TypeScript and lint pass. The full suite has two PDF parser timeout failures that pass when those tests run alone.
- [ ] Independent review complete; no reviewer run has occurred.
- [ ] Human acceptance recorded separately.
- [ ] Dated session summary and applicable guide/reflection updates complete.
- [ ] Pre-PR closeout complete and PR opened last.
- [ ] Accepted canonical delta synced before archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement IDs | Observable outcome                                                                                         | Evidence, result and limitation                                                 |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| sched-tz-AC-01      | #111; JMG-004                               | HR-browser-local input is converted to the corresponding UTC instant independently of the server timezone. | Focused utility tests pass for Los Angeles and Singapore.                       |
| sched-tz-AC-02      | #111; JMG-004                               | Existing UTC timestamps round-trip through the HR editor in HR-browser-local time without shifting.        | Focused helper and HR page tests pass; full browser hydration not smoke-tested. |
| sched-tz-AC-03      | #111; JMG-004, JOB-001                      | HR and public views display each instant in the viewer's browser timezone and label that timezone.         | Formatter utility and server-render fallback page tests pass.                   |
| sched-tz-AC-04      | #111; JMG-004                               | Invalid, timezone-less, DST-gap, or reversed values are rejected without persistence.                      | Parser/helper tests pass; DST overlap uses the browser's earlier occurrence.    |

## Agent handoffs

| Role and tool                      | Input/context supplied                         | Output and assumptions                                                                                | Human verification                             |
| ---------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------- |
| Intake/proposal, primary assistant | User request, issue #111, current specs/source | Draft issue/packet; incorporated John's browser-local interpretation/display and UTC storage decision | John approved scope/plan in chat on 2026-10-18 |

No separate reviewer or subagent execution has occurred.

## Implementation and tests

Changed files:

- `src/lib/hr-job-input.ts` now accepts only timezone-bearing date/time values and normalizes them to UTC.
- `src/lib/local-date-time.ts` converts local input, formats viewer-local/UTC times, and detects impossible local times.
- `src/components/local-schedule-time.tsx` supplies browser-local schedule inputs and hydration-safe local time displays.
- `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`, and `src/app/jobs/[id]/page.tsx` use the new components.
- Focused parser, helper, action, HR-page, and public-page unit tests cover the boundary.
- Issue packet and change index are in commit `09ba17a`; implementation changes are not yet committed.

Commands and results:

- `git status --short --branch`, baseline/remote commit inspection: clean `develop` at `1f6d872` before branch creation; `origin/develop` matched.
- Before implementation, `bun node_modules/vitest/vitest.mjs run tests/unit/hr-job-input.test.ts` failed as intended: the new assertion expected a timezone-less value to be rejected but received `success` (`1 failed, 6 passed`). This established the server-boundary defect.
- First local-date-time run found two conversion failures around DST; the focused test isolated a test-timezone race, and after consolidating timezone changes into one test, the corrected helper passed.
- `bun node_modules/vitest/vitest.mjs run tests/unit/hr-job-input.test.ts tests/unit/hr-job-actions.test.ts tests/unit/local-date-time.test.ts tests/unit/hr-job-pages.test.tsx tests/unit/public-job-pages.test.tsx`: passed, 5 files / 39 tests.
- `bun node_modules/typescript/bin/tsc --noEmit`: passed.
- `bun node_modules/eslint/bin/eslint.js`: passed repository-wide after final formatting.
- `bun node_modules/vitest/vitest.mjs run`: 102 files / 642 tests passed on the first run, with four PDF parser timeout failures; a standalone rerun passed 102 files / 644 tests and timed out on two PDF tests (`resume-input.test.ts` and `resume-validation-errors.test.ts`, 5-second test limit). The two files pass when run alone: `bun node_modules/vitest/vitest.mjs run tests/unit/resume-input.test.ts tests/unit/resume-validation-errors.test.ts` (2 files / 23 tests). The timeouts are in resume validation, outside this change; the full-suite timeout cause was not investigated further.
- `bun run test:unit -- tests/unit/hr-job-input.test.ts`: could not invoke the package script because `node` is not installed. Direct Bun invocation of Vitest was used instead.
- Prettier initially reported formatting issues; changed files were formatted, then `bun node_modules/prettier/bin/prettier.cjs --check ...` passed after final packet edits.
- Next.js local documentation read: Server and Client Components and Server Action forms guides; no code changed.
- Supabase skill reviewed; no Supabase schema, RLS, RPC or storage change is proposed.
- `bun run test:unit -- tests/unit/hr-job-input.test.ts`: the package script could not start because `node` is not installed; direct Bun invocation was used. A Next production build and interactive browser hydration smoke were not run.

Security/adversarial cases: no authorization or private data flow changes proposed. Existing safe parse failure and ordering behavior must remain verified after approval.

Known limitations: no interactive browser/hosted smoke or Next production build has been run. Daylight-saving overlap behavior uses the browser's earlier local-time occurrence; nonexistent local times are rejected. Two full-suite PDF parser timeouts remain unresolved; the affected tests pass in isolation and are outside this issue's scope.

## Review and decision

- Reviewer findings/fixes: pending separate reviewer execution after implementation.
- Human decision/date: John approved HR-browser-local interpretation, UTC database storage, and viewer-browser-local display on 2026-10-18 in direct chat.
- Guide/reflection/log updates: pending; dated session summary will be created during closeout.

## Session evidence index

| Date/session              | Summary log link | Work / prompts / decisions covered                                                                       | Verification status / missing coverage                    |
| ------------------------- | ---------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 2026-10-18 active session | pending          | Created issue #111, assigned owner, traced parser/editor/display paths, and prepared/approved the packet | Source inspection only; implementation and checks pending |

## Canonical sync and archive

- Accepted delta/human decision: proposed browser-local input and display with UTC storage, approved by John on 2026-10-18; canonical sync awaits implementation review and separate acceptance.
- Canonical sync commit/files/version/date: pending; proposed v1.18 if accepted.
- Sync verification: pending.
- Archive decision/date/path: pending approval and closeout.
- Navigation repairs after moving: pending.
- Outstanding work: implementation/test evidence, separate review, student acceptance, canonical sync, log, archive and PR.
