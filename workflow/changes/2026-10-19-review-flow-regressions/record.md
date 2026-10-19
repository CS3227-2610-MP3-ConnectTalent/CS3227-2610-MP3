# Feature record: application and HR review regressions

Status: implemented; independent review recheck pending; user acceptance recorded

Owner: Student owner pending assignment

Spec version: [ProductSpec v1.18](../../ProductSpec.md)

Date: 2026-10-19

## Metadata and artifact links

- Change ID/classification: 2026-10-19-review-flow-regressions; defects restoring existing behavior
- GitHub issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Branch/commits/PR: `fix/120-review-flow-regressions`; implementation commit [`2998aeb`](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/2998aebac419ed8ef3613d8383c0f63562b9e005), packet commit [`69987fb`](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/69987fb760db25695d01e96614912beb5eb95aa6), final review-fix commit pending; baseline `7495e576e8a4426834b294d4b36ab25300e6b65a`; PR pending
- Proposal: `proposal.md`
- Design: `design.md`
- Deltas: none; restoration of APP-002/003/004/005/007/008/010
- Implementation plan/tasks: `plan.md`; `tasks.md`
- Baseline: ProductSpec v1.18; `develop` at `7495e576e8a4426834b294d4b36ab25300e6b65a`
- Archive path: pending acceptance and canonical sync decision

## Approval checklist

- [x] Issue intake and bounded issue criteria recorded.
- [x] User directly requested the four fixes, issue creation, commit/push, and PR preparation on 2026-10-19.
- [x] Implementation and relevant checks complete.
- [ ] Independent review recheck complete; first-round finding and resolution recorded in `handoffs/T06-independent-review.md`.
- [x] Human acceptance recorded separately from implementation and review; user said “I accept and approve. Please proceed” on 2026-10-19, before the independent review reported its additional #122 finding.
- [ ] Dated session log and closeout complete.
- [ ] Issue-linked PR opened after closeout.
- [ ] Canonical sync decision recorded; no delta expected.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID | Observable success / denial / failure                                                                 | Evidence, result and limitation                                                                                                               |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| review-AC-01        | #122; APP-005/form39-AC-06                 | Stale displayed values cannot save with a newer revision.                                             | Red/green form refresh and résumé response tests; refreshed server props do not advance the local revision while displayed fields stay stale. |
| review-AC-02        | #121; APP-007/008                          | An old/withdrawn application URL cannot cancel a newer active application's pending résumé operation. | Red/green API denial test; the unscoped legacy `cancel` intent returns 400 without calling cancellation.                                      |
| review-AC-03        | #120; APP-010                              | Browser history restoration cancels abandoned debounced navigation.                                   | Red/green mounted history test; the pending query is cancelled and restored URL/input remains.                                                |
| review-AC-04        | #123; APP-002/003/004                      | Applicant sees the current frozen letter and the original when they differ.                           | Red/green page render test; current and distinct original are rendered.                                                                       |

## Agent handoffs

Implementation and self-review are by the current Codex execution. Separate reviewer `/root/independent_review` completed a first read-only pass at `69987fb` and found a P2 in review-AC-01; its report and a request for re-review after the fix are recorded in [`handoffs/T06-independent-review.md`](handoffs/T06-independent-review.md).

## Implementation and tests

Changed files: application résumé route, Applicant application detail page, application form and résumé response state, HR filter debounce, focused unit tests and this workflow packet/log. The independent review found that a mounted form retained old application values when its identity changed; the form subtree now resets for a different identified application or job while a new draft keeps entered values when it receives its first ID.

Commands and results: original regression tests initially failed as expected (4 defects). The independent review's added identity-switch assertion then failed as expected: `bun node_modules/vitest/vitest.mjs run tests/unit/application-form-refresh.test.tsx` reported expected `Second applicant`, received `Initial applicant`. After the fix, that focused file passed (3 tests), and the full unit suite passed (110 files, 668 tests). `bun node_modules/typescript/bin/tsc --noEmit`, ESLint on the changed source/test, Prettier check on the changed source/test, and `git diff --check` passed. Direct Bun package entrypoints required elevated filesystem access because the sandbox returned EPERM on installed package symlinks.

Security/adversarial cases and results: the application résumé route remains same-origin, authenticated, and owner-resolved. The old unscoped `cancel` intent is rejected with 400; the cancellation service is not called. Existing upload/removal revision checks and internal operation-scoped cleanup tests passed. No database schema was changed.

Known limitations: the production build compiled and completed TypeScript, then failed during page-data collection for `/auth/reset-requested` because Bun reported a Next.js CommonJS wrapper error. Browser E2E and hosted smoke were not run; local Supabase was two migrations behind. No product-spec delta is expected because the repairs restore existing requirements APP-002/003/004/005/007/008/010; canonical sync is N/A. User acceptance was recorded on 2026-10-19 before the independent reviewer returned its first-round finding; the reviewer has been asked to recheck the final revision.

## Review and decision

- Reviewer identity and independence: separate read-only agent `/root/independent_review` completed the first review at `69987fb`; re-review of the fix commit is pending. The implementer is this Codex execution and does not count as independent.
- Findings/resolutions: original four issues #120–#123 were fixed. First-round reviewer found P2 review-AC-01: stale form values could be retained when the mounted form changed to another identified application. The new test failed before the correction and passes after it; the first reviewer recommended holding the PR until this is independently rechecked.
- Human decisions: user accepted and approved on 2026-10-19 and instructed work to proceed. The later review finding was repaired within the same approved #122 behavior; merge and release remain separate decisions.
- Documentation/reflection/log updates: [dated session log](../../../logs/2026-10-19-review-flow-regressions.md); closeout and archive remain pending reviewer recheck and final push.

## Session evidence index

| Date / session              | Summary log link                             | Work / prompts / decisions covered                                                                             | Verification status / missing coverage                                                                                                     |
| --------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-19 / active session | `logs/2026-10-19-review-flow-regressions.md` | Repository review, issues #120–#123, implementation, student acceptance, independent review finding and repair | Full unit suite and static checks passed; independent re-review, archive and PR remain pending. Browser E2E and hosted smoke remain unrun. |

## Canonical sync and archive

- Accepted delta/human decision: user accepted on 2026-10-19; fixes restore APP-002/003/004/005/007/008/010 and introduce no product requirement delta.
- Canonical sync: N/A because the accepted repairs restore existing clauses.
- Archive: pending independent re-review and complete closeout.
- Outstanding work: obtain reviewer recheck on the pushed fix, complete dated log and packet archive, then open the issue-linked PR as the final contributor action. Merge and release remain separate.
