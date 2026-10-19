# Feature record: application and HR review regressions

Status: implementation and independent review complete; fresh student acceptance pending; PR #124 open

Owner: Student owner pending assignment

Spec version: [ProductSpec v1.18](../../ProductSpec.md)

Date: 2026-10-19

## Metadata and artifact links

- Change ID/classification: 2026-10-19-review-flow-regressions; defects restoring existing behavior
- GitHub issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Branch/commits/PR: `fix/120-review-flow-regressions`; implementation `2998aeb`, first packet `69987fb`, review correction `257804b`, and archive/PR preparation `2d050a4` are pushed to origin; baseline `7495e576e8a4426834b294d4b36ab25300e6b65a`; [PR #124](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/124) is open against `develop`.
- Proposal: `proposal.md`
- Design: `design.md`
- Deltas: none; restoration of APP-002/003/004/005/007/008/010
- Implementation plan/tasks: `plan.md`; `tasks.md`
- Baseline: ProductSpec v1.18; `develop` at `7495e576e8a4426834b294d4b36ab25300e6b65a`
- Archive path: `workflow/archive/2026-10-19-review-flow-regressions/` (packet archived; final student acceptance remains pending after the independent review correction).

## Approval checklist

- [x] Issue intake and bounded issue criteria recorded.
- [x] User directly requested the four fixes, issue creation, commit/push, and PR preparation on 2026-10-19.
- [x] Implementation and relevant checks complete.
- [x] Independent review recheck complete; first-round finding and resolution recorded in `handoffs/T06-independent-review.md`.
- [ ] Fresh human acceptance recorded after review of corrected revision and final evidence. The earlier “I accept and approve. Please proceed” predates the independent review finding and does not satisfy this gate.
- [x] Dated session log and archive updated for PR #124 and current CI evidence.
- [x] Issue-linked PR #124 opened against `develop`.
- [x] Canonical sync decision recorded; no product delta, so sync is N/A.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID | Observable success / denial / failure                                                                 | Evidence, result and limitation                                                                                                               |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| review-AC-01        | #122; APP-005/form39-AC-06                 | Stale displayed values cannot save with a newer revision.                                             | Red/green same-application refresh and résumé response tests; identified-application switches reset form values, while first-ID creation preserves new-draft values. |
| review-AC-02        | #121; APP-007/008                          | An old/withdrawn application URL cannot cancel a newer active application's pending résumé operation. | Red/green API denial test; the unscoped legacy `cancel` intent returns 400 without calling cancellation.                                      |
| review-AC-03        | #120; APP-010                              | Browser history restoration cancels abandoned debounced navigation.                                   | Red/green mounted history test; the pending query is cancelled and restored URL/input remains.                                                |
| review-AC-04        | #123; APP-002/003/004                      | Applicant sees the current frozen letter and the original when they differ.                           | Red/green page render test; current and distinct original are rendered.                                                                       |

## Agent handoffs

Implementation and self-review are by the current Codex execution. Separate reviewer `/root/independent_review` completed a first read-only pass at `69987fb`, found a P2 in review-AC-01, then completed a clean re-review on `257804b`. Both reports and checks are recorded in [`handoffs/T06-independent-review.md`](handoffs/T06-independent-review.md).

## Implementation and tests

Changed files: application résumé route, Applicant application detail page, application form and résumé response state, HR filter debounce, focused unit tests and this workflow packet/log. The independent review found that a mounted form retained old application values when its identity changed; the form subtree now resets for a different identified application or job while a new draft keeps entered values when it receives its first ID.

Commands and results: original regression tests initially failed as expected (4 defects). In response to the independent review, the identity-switch assertion failed as expected: `bun node_modules/vitest/vitest.mjs run tests/unit/application-form-refresh.test.tsx` reported expected `Second applicant`, received `Initial applicant`. After the fix, that focused file passed (3 tests), and the full unit suite passed (110 files, 668 tests). `bun node_modules/typescript/bin/tsc --noEmit`, ESLint on the changed source/test, Prettier check on the changed source/test, and `git diff --check` passed. Direct Bun package entrypoints required elevated filesystem access because the sandbox returned EPERM on installed package symlinks.

Security/adversarial cases and results: the application résumé route remains same-origin, authenticated, and owner-resolved. The old unscoped `cancel` intent is rejected with 400; the cancellation service is not called. Existing upload/removal revision checks and internal operation-scoped cleanup tests passed. No database schema was changed.

Known limitations: the production build compiled and completed TypeScript, then failed during page-data collection for `/auth/reset-requested` because Bun reported a Next.js CommonJS wrapper error. Local Supabase was two migrations behind. PR Supabase CI run `39249952106` passed database and integration checks but exposed a stale Playwright assertion for the identical current/original submitted letter; that assertion is corrected and awaits rerun. No separate live hosted Supabase smoke was performed. No product-spec delta is expected because the repairs restore existing requirements APP-002/003/004/005/007/008/010; canonical sync is N/A. The initial user acceptance was recorded on 2026-10-19 before the first-round review finding; fresh student acceptance of the corrected revision/evidence remains pending. The separate reviewer rechecked the corrected revision and found no material issue.

## Review and decision

- Reviewer identity and independence: separate read-only agent `/root/independent_review` completed a first review at `69987fb` and clean re-review at `257804b`. The implementer is this Codex execution and does not count as independent.
- Findings/resolutions: original four issues #120–#123 were fixed. First-round reviewer found P2 review-AC-01: stale form values could be retained when the mounted form changed to another identified application. A regression failed before the correction; reviewer rechecked application switching, first-ID preservation, same-application refresh, and the five focused test files. No material findings remain.
- Human decisions: the user accepted and approved the initial revision on 2026-10-19 and instructed work to proceed. That decision predates the later review finding, so fresh student acceptance of the corrected revision and final evidence remains pending; merge and release remain separate decisions.
- Documentation/reflection/log updates: [dated session log](../../../logs/2026-10-19-review-flow-regressions.md); complete packet archived at `workflow/archive/2026-10-19-review-flow-regressions/` before PR submission.

## Session evidence index

| Date / session              | Summary log link                             | Work / prompts / decisions covered                                                                             | Verification status / missing coverage                                                                                                     |
| --------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-19 / active session | [session summary](../../../logs/2026-10-19-review-flow-regressions.md) | Repository review, issues #120–#123, implementation, initial acceptance, two-round independent review, correction, PR #124 follow-up | Full unit suite, static checks and five-file independent re-review passed; packet archived. PR Supabase CI run `39249952106` passed database and integration jobs but failed one stale Playwright assertion; its correction is pending CI rerun. Fresh student acceptance remains pending. |

## Canonical sync and archive

- Product delta: none; fixes restore APP-002/003/004/005/007/008/010. The initial user acceptance was recorded on 2026-10-19, before the later independent review finding; fresh acceptance of the corrected revision/evidence is pending.
- Canonical sync: N/A because the accepted repairs restore existing clauses.
- Archive: packet archived at `workflow/archive/2026-10-19-review-flow-regressions/` on 2026-10-19; packet and current indexes are preserved and this record reflects the open PR and pending acceptance gate.
- Outstanding work: student owner assignment and fresh acceptance of the corrected revision/evidence; resolve the acceptance review thread after that decision. Merge and release remain separate.
