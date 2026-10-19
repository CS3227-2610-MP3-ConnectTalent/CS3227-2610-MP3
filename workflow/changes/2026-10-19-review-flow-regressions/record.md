# Feature record: application and HR review regressions

Status: implemented; independent review and student acceptance pending

Owner: Student owner pending assignment

Spec version: [ProductSpec v1.18](../../ProductSpec.md)

Date: 2026-10-19

## Metadata and artifact links

- Change ID/classification: 2026-10-19-review-flow-regressions; defects restoring existing behavior
- GitHub issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Branch/commits/PR: `fix/120-review-flow-regressions`; implementation commit [`2998aeb`](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/2998aebac419ed8ef3613d8383c0f63562b9e005) pushed to origin; baseline `7495e576e8a4426834b294d4b36ab25300e6b65a`; PR pending
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
- [ ] Independent review complete; findings and resolution recorded.
- [ ] Human acceptance recorded separately.
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

No subagents or separate reviewer runs have been used. Implementation and self-review are by the current Codex execution; independent review remains pending.

## Implementation and tests

Changed files: application résumé route, Applicant application detail page, application form and résumé response state, HR filter debounce, focused unit tests and this workflow packet/log.

Commands and results: new regression tests initially failed as expected (4 failures: stale revision adoption, unscoped cancellation, stale history query, omitted current letter). Final full unit suite passed (109 files, 667 tests); final focused/adjacent suite passed (9 files, 38 tests). TypeScript typecheck, ESLint on changed source/tests, Prettier check and `git diff --check` passed. Standard package shims could not launch because Node is unavailable and Bun hit EPERM on the Vitest symlink; direct local package entrypoints ran after elevated filesystem access.

Security/adversarial cases and results: the application résumé route remains same-origin, authenticated, and owner-resolved. The old unscoped `cancel` intent is rejected with 400; the cancellation service is not called. Existing upload/removal revision checks and internal operation-scoped cleanup tests passed. No database schema was changed.

Known limitations: the final production build compiled and completed TypeScript, then failed during page-data collection for `/auth/reset-requested` because Bun reported a Next.js CommonJS wrapper error. Browser E2E and hosted smoke were not run; local Supabase was two migrations behind. No product-spec delta is expected; canonical sync is N/A after student acceptance confirms these repairs restore existing requirements. No independent review has been performed, and student acceptance is pending.

## Review and decision

- Reviewer identity and independence: pending; current execution implemented and self-reviewed and cannot count as independent review.
- Findings/resolutions: four findings linked to issues #120–#123; all four focused regressions and the full unit suite rechecked successfully.
- Human decisions: direct user request authorizes the bounded fixes and PR preparation; separate student acceptance, merge and release remain pending.
- Documentation/reflection/log updates: [dated session log](../../../logs/2026-10-19-review-flow-regressions.md); closeout is incomplete until independent review and acceptance.

## Session evidence index

| Date / session              | Summary log link                             | Work / prompts / decisions covered                                             | Verification status / missing coverage                                                                                |
| --------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| 2026-10-19 / active session | `logs/2026-10-19-review-flow-regressions.md` | Repository review, four issues, fix implementation, commit/push and PR request | Full and focused unit suites plus static checks passed; independent review, student acceptance and PR remain pending. |

## Canonical sync and archive

- Accepted delta/human decision: no requirement change expected; final confirmation pending student acceptance.
- Canonical sync: expected N/A because these repairs restore existing clauses; verify before closeout.
- Archive: pending acceptance and complete closeout.
- Outstanding work: independent review and findings, separate student acceptance, then final PR-last closeout and submission. Packet archive remains pending acceptance.
