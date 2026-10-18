# Feature record: Scheduled job timezone handling

Status: in progress; approved browser-local timezone contract with labeled UTC no-JavaScript fallback

Owner: John (Johnwz123)

Spec version: ProductSpec v1.17; [ProductSpec.md](../../ProductSpec.md)
Date: 2026-10-18

## Metadata and artifact links

- Change ID/classification: `2026-10-18-scheduled-job-timezone`; defect restoration and behavior clarification
- GitHub issue: [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111), assigned to Johnwz123
- Branch/commits/PR: `fix/111-scheduled-job-timezone`; baseline `1f6d87224aeb04194961919f59499f83f7fddb9d`; approved packet `09ba17a`; initial implementation `252b731`; approved fallback remediation commit pending; PR pending
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Proposed delta: [specs/job-management.md](specs/job-management.md)
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v1.17, 16 October 2026; `develop` at `1f6d87224aeb04194961919f59499f83f7fddb9d`
- Archive path: pending approval, implementation, review, acceptance and closeout

## Approval checklist

- [x] Issue created and assigned; actual issue #111 records scope, reproduction, risk and affected IDs.
- [x] Human approval of proposal, timezone delta, design and plan. John approved browser-local entry/display and UTC storage in chat on 2026-10-18.
- [x] Initial implementation and approved follow-up passed focused tests, the full suite, TypeScript, repository lint and Prettier; follow-up independent review is pending.
- [x] Independent review complete for `09ba17a..252b731`; found P2 no-JavaScript form regression, now approved for remediation. See [T05 handoff](handoffs/T05-independent-review.md).
- [ ] Human acceptance recorded separately.
- [ ] Dated session summary and applicable guide/reflection updates complete.
- [ ] Pre-PR closeout complete and PR opened last.
- [ ] Accepted canonical delta synced before archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement IDs | Observable outcome                                                                                         | Evidence, result and limitation                                                                          |
| ------------------- | ------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| sched-tz-AC-01      | #111; JMG-004                               | HR-browser-local input is converted to the corresponding UTC instant independently of the server timezone. | Focused utility tests pass for Los Angeles and Singapore.                                                |
| sched-tz-AC-02      | #111; JMG-004                               | Existing UTC timestamps round-trip through the HR editor in HR-browser-local time without shifting.        | Focused helper and HR page tests pass; full browser hydration not smoke-tested.                          |
| sched-tz-AC-03      | #111; JMG-004, JOB-001                      | HR and public views display each instant in the viewer's browser timezone and label that timezone.         | Formatter utility and server-render fallback page tests pass.                                            |
| sched-tz-AC-04      | #111; JMG-004                               | Invalid or reversed values are rejected; DST gaps do not persist; overlaps follow documented behavior.     | Parser/helper tests pass; invalid enhanced action test confirms no RPC; overlap uses earlier occurrence. |
| sched-tz-AC-05      | #111; JMG-004, OVR-004                      | Without JavaScript, HR can create, edit, and clear schedules using native UTC-labeled fields.              | SSR, parser and action regressions pass; reviewer recheck pending.                                       |

## Agent handoffs

| Role and tool                           | Input/context supplied                         | Output and assumptions                                                                                   | Human verification                              |
| --------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------- | ----------------------------------------------- |
| Intake/proposal, primary assistant      | User request, issue #111, current specs/source | Draft issue/packet; incorporated John's browser-local interpretation/display and UTC storage decision    | John approved scope/plan in chat on 2026-10-18  |
| Independent test engineer, separate run | Commits `09ba17a..252b731`, packet, AC-01–05   | Read-only review found P2 no-JavaScript form regression; independently passed 5 files / 39 focused tests | UTC fallback selected; follow-up review pending |

The initial reviewer execution is separate from implementation and complete. Findings and checks are recorded in [T05 handoff](handoffs/T05-independent-review.md); approved remediation passes local checks and awaits follow-up verification.

## Implementation and tests

Changed files:

- `src/lib/hr-job-input.ts` validates explicit UTC submissions and converts the separately named no-JavaScript wall-time fallback as UTC.
- `src/lib/local-date-time.ts` converts browser-local input, formats viewer-local/UTC values, detects impossible local times, and parses/prints UTC fallback wall times.
- `src/components/local-schedule-time.tsx` renders named UTC fallback controls without JavaScript and switches to browser-local fields with explicit UTC submission after hydration.
- `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`, and `src/app/jobs/[id]/page.tsx` use the new components.
- Focused parser, helper, action, HR-page, and public-page unit tests cover the boundary.
- Approved issue packet and change index are in `09ba17a`; initial implementation is `252b731`; approved no-JavaScript fallback remediation is ready to commit after final diff checks.

Commands and results:

- `git status --short --branch`, baseline/remote commit inspection: clean `develop` at `1f6d872` before branch creation; `origin/develop` matched.
- Before implementation, `bun node_modules/vitest/vitest.mjs run tests/unit/hr-job-input.test.ts` failed as intended: the new assertion expected a timezone-less value to be rejected but received `success` (`1 failed, 6 passed`). This established the server-boundary defect.
- First local-date-time run found two conversion failures around DST; the focused test isolated a test-timezone race, and after consolidating timezone changes into one test, the corrected helper passed.
- `bun node_modules/vitest/vitest.mjs run tests/unit/hr-job-input.test.ts tests/unit/hr-job-actions.test.ts tests/unit/local-date-time.test.ts tests/unit/hr-job-pages.test.tsx tests/unit/public-job-pages.test.tsx`: after fallback remediation, passed, 5 files / 44 tests.
- `bun node_modules/typescript/bin/tsc --noEmit`: passed after fallback remediation.
- `bun node_modules/eslint/bin/eslint.js`: passed repository-wide after fallback remediation and final formatting.
- `bun node_modules/vitest/vitest.mjs run`: after fallback remediation, passed all 104 files / 651 tests in a standalone run. Two earlier full-suite attempts timed out in PDF parser tests; both affected files passed alone (2 files / 23 tests), and the final full run passed.
- Prettier initially reported formatting issues; changed files were formatted, then `bun node_modules/prettier/bin/prettier.cjs --check ...` passed after final packet edits.
- Next.js local documentation read: Server and Client Components and Server Action forms guides; no code changed.
- Supabase skill reviewed; no Supabase schema, RLS, RPC or storage change is proposed.
- `bun run test:unit -- tests/unit/hr-job-input.test.ts`: the package script could not start because `node` is not installed; direct Bun invocation was used. A Next production build and interactive browser hydration smoke were not run.

Security/adversarial cases: no authorization or private data flow changes proposed. Existing safe parse failure and ordering behavior must remain verified after approval.

Known limitations: no interactive browser/hosted smoke or Next production build has been run. Daylight-saving overlap behavior uses the browser's earlier local-time occurrence; nonexistent browser-local times are rejected. The no-JavaScript fallback is explicitly UTC rather than the user's local timezone.

## Review and decision

- Reviewer findings/fixes: separate review completed for `09ba17a..252b731`; P2 no-JavaScript form regression found. John selected the labeled UTC fallback; remediation and regressions pass locally; follow-up review pending. See [T05 handoff](handoffs/T05-independent-review.md).
- Human decision/date: John approved HR-browser-local interpretation, UTC database storage, and viewer-browser-local display, then selected the labeled UTC no-JavaScript fallback on 2026-10-18 in direct chat.
- Guide/reflection/log updates: dated summary drafted at [logs/2026-10-18-scheduled-job-timezone.md](../../../logs/2026-10-18-scheduled-job-timezone.md); it will be finalized after review and acceptance. No separate guide/reflection change is currently required.

## Session evidence index

| Date/session              | Summary log link                                                  | Work / prompts / decisions covered                                                                                               | Verification status / missing coverage                                                     |
| ------------------------- | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| 2026-10-18 active session | [summary log](../../../logs/2026-10-18-scheduled-job-timezone.md) | Created issue #111, approved browser-local/UTC behavior and the UTC no-JavaScript fallback, implemented and verified remediation | Initial P2 corrected locally; independent follow-up review and separate acceptance pending |

## Canonical sync and archive

- Accepted delta/human decision: proposed browser-local input and display with UTC storage, approved by John on 2026-10-18; canonical sync awaits implementation review and separate acceptance.
- Canonical sync commit/files/version/date: pending; proposed v1.18 if accepted.
- Sync verification: pending.
- Archive decision/date/path: pending approval and closeout.
- Navigation repairs after moving: pending.
- Outstanding work: commit the approved fallback remediation, independent follow-up review, separate student acceptance, final log, canonical sync, archive and issue-linked PR.
