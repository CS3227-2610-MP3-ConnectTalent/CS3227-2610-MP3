# Feature record: application and HR review regressions

Status: review-flow implementation and independent review complete through `114ba259`; a follow-up Chromium revision regression is being fixed, with hosted CI and fresh student acceptance pending

Owner: Student owner pending assignment

Spec version: [ProductSpec v1.18](../../ProductSpec.md)

Date: 2026-10-19

## Metadata and artifact links

- Change ID/classification: 2026-10-19-review-flow-regressions; defects restoring existing behavior
- GitHub issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Branch/commits/PR: `fix/120-review-flow-regressions`; follow-up corrections `a194e89` and `114ba25914547a54b207415f32118d367c1faec3` are pushed to origin; baseline `7495e576e8a4426834b294d4b36ab25300e6b65a`; [PR #124](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/124) is open against `develop`.
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
- [x] Independent review recheck complete through `114ba259`; first-round finding, subsequent identity fixes, and the CI-driven revision fix are recorded in `handoffs/T06-independent-review.md`.
- [ ] Fresh human acceptance recorded after review of corrected revision and final evidence. The earlier “I accept and approve. Please proceed” predates the independent review finding and does not satisfy this gate.
- [x] Dated session log and archive updated for PR #124 and latest known evidence; current-head hosted CI is pending.
- [x] Issue-linked PR #124 opened against `develop`.
- [x] Canonical sync decision recorded; no product delta, so sync is N/A.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID | Observable success / denial / failure                                                                 | Evidence, result and limitation                                                                                                               |
| ------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| review-AC-01        | #122; APP-005/form39-AC-06                 | Stale displayed values cannot save with a newer revision.                                             | Red/green same-application refresh and résumé response tests; identity switches and ID disappearance reset form state. A null-to-first-ID update preserves values only after a local résumé response established that same ID; externally created drafts remount from server values. |
| review-AC-02        | #121; APP-007/008                          | An old/withdrawn application URL cannot cancel a newer active application's pending résumé operation. | Red/green API denial test; the unscoped legacy `cancel` intent returns 400 without calling cancellation.                                      |
| review-AC-03        | #120; APP-010                              | Browser history restoration cancels abandoned debounced navigation.                                   | Red/green mounted history test; the pending query is cancelled and restored URL/input remains.                                                |
| review-AC-04        | #123; APP-002/003/004                      | Applicant sees the current frozen letter and the original when they differ.                           | Red/green page render test; current and distinct original are rendered.                                                                       |
| review-AC-05        | #120; APP-005/form39-AC-06                 | After a first résumé upload creates a draft, profile copy uses the upload's confirmed revision when stale refreshed props identify that same application; a different application never inherits it. | Focused hook regression covers matching and mismatched IDs; local Vitest is blocked in this checkout, so hosted checks on the final follow-up commit remain pending. |

## Agent handoffs

Implementation and self-review are by the current Codex execution. Separate reviewer `/root/independent_review` completed read-only reviews at `69987fb`, `257804b`, `a194e89`, and `114ba259`. The final review found no new source defect and recommends holding readiness pending hosted CI and fresh student acceptance. Reports and checks are recorded in [`handoffs/T06-independent-review.md`](handoffs/T06-independent-review.md).

## Implementation and tests

Changed files: application résumé route, Applicant application detail page, application form and résumé response state, HR filter debounce, focused unit tests and this workflow packet/log. The independent review found that a mounted form retained old application values when its identity changed; the form subtree now resets for a different identified application or job while a new draft keeps entered values only when its own résumé response established that first ID. Follow-up review also identified that ID disappearance and IDs created in another tab needed the same protection; both transitions now remount from server state unless the newly received ID matches the locally recorded résumé response.

Commands and results: original regression tests initially failed as expected (4 defects). In response to the independent review, the identity-switch assertion failed as expected: `bun node_modules/vitest/vitest.mjs run tests/unit/application-form-refresh.test.tsx` reported expected `Second applicant`, received `Initial applicant`. After the fix, that focused file passed (3 tests), and the full unit suite passed (110 files, 668 tests). `bun node_modules/typescript/bin/tsc --noEmit`, ESLint on the changed source/test, Prettier check on the changed source/test, and `git diff --check` passed. Direct Bun package entrypoints required elevated filesystem access because the sandbox returned EPERM on installed package symlinks.

Review follow-up red/green evidence: added tests for external null-to-ID draft adoption, local résumé-response ID creation, mismatched local/server IDs, and existing-ID-to-null withdrawal. Before the correction, the external-adoption and ID-disappearance tests failed (the mounted form retained old values); the local résumé-response preservation test passed. After the correction, the focused application-form file passed all 6 tests.

Security/adversarial cases and results: the application résumé route remains same-origin, authenticated, and owner-resolved. The old unscoped `cancel` intent is rejected with 400; the cancellation service is not called. Existing upload/removal revision checks and internal operation-scoped cleanup tests passed. No database schema was changed.

Known limitations: the production build compiled and completed TypeScript, then failed during page-data collection for `/auth/reset-requested` because Bun reported a Next.js CommonJS wrapper error. Local Supabase was two migrations behind; no separate live hosted Supabase smoke was performed. Supabase CI run `39281163224` on `a194e89` passed database and integration race suites but failed one Playwright critical journey: profile-copy used stale server revision props immediately after a successful local résumé response. A red/green regression reproduced the stale revision header, and `114ba259` now uses the confirmed response revision until props refresh. On `114ba259`, the six-file focused suite passed (27 tests), TypeScript, ESLint, Prettier and `git diff --check` passed; the full unit run stalled without a result. Hosted general CI run `39281163135` and Supabase CI run `39281163224` are pending for the final pushed commit. No current-head hosted pass is claimed. No product-spec delta is expected because repairs restore existing requirements APP-002/003/004/005/007/008/010; canonical sync is N/A. The initial user acceptance predates the review findings; fresh student acceptance of the corrected revision/evidence remains pending.

## Review and decision

- Reviewer identity and independence: separate read-only agent `/root/independent_review` completed reviews at `69987fb`, `257804b`, `a194e89`, and `114ba259`. The implementer is this Codex execution and does not count as independent.
- Findings/resolutions: original four issues #120–#123 and the form identity/revision findings were fixed. The final review on `114ba259` found no new source defect and independently passed six focused files/27 tests. The prior CI Playwright failure was diagnosed to a stale revision header after local upload; a red/green test and `114ba259` fix it. Hosted validation for that fix remains pending.
- Human decisions: the user accepted and approved the initial revision on 2026-10-19 and instructed work to proceed. That decision predates the later review finding, so fresh student acceptance of the corrected revision and final evidence remains pending; merge and release remain separate decisions.
- Documentation/reflection/log updates: [implementation log](../../../logs/2026-10-19-review-flow-regressions.md); [PR #124 review/CI follow-up](../../../logs/2026-10-20-pr124-review-followups.md); complete packet archived at `workflow/archive/2026-10-19-review-flow-regressions/` before PR submission.

## Session evidence index

| Date / session              | Summary log link                             | Work / prompts / decisions covered                                                                             | Verification status / missing coverage                                                                                                     |
| --------------------------- | -------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| 2026-10-19 / active session | [session summary](../../../logs/2026-10-19-review-flow-regressions.md) | Repository review, issues #120–#123, implementation, initial review and PR preparation | Earlier implementation and review evidence; see the later [PR #124 follow-up](../../../logs/2026-10-20-pr124-review-followups.md) for current source-head findings and CI. |
| 2026-10-20 / PR #124 follow-up | [follow-up summary](../../../logs/2026-10-20-pr124-review-followups.md) | CI-driven revision repair, final independent review, review-thread and acceptance state | Final independent review on `114ba259` passed six focused files/27 tests and found no new source defect. Hosted CI runs `39281163135` and `39281163224` are pending; fresh student acceptance remains pending. |

## Canonical sync and archive

- Product delta: none; fixes restore APP-002/003/004/005/007/008/010. The initial user acceptance was recorded on 2026-10-19, before the later independent review finding; fresh acceptance of the corrected revision/evidence is pending.
- Canonical sync: N/A because the accepted repairs restore existing clauses.
- Archive: packet archived at `workflow/archive/2026-10-19-review-flow-regressions/` on 2026-10-19; packet and current indexes are preserved and this record reflects the open PR and pending acceptance gate.
- Outstanding work: verify current-head hosted CI, then obtain fresh student acceptance of the corrected revision and evidence. Keep the acceptance review thread unresolved until that decision. Merge and release remain separate.
- Follow-up from Supabase CI on `8a01474`: the interrupted first-upload journey received API revision `2` after retry but sent revision `1` for profile copy. Acceptance scenario `review-AC-05` is tied to existing APP-005/form39-AC-06: refreshed props may carry the locally confirmed revision only when the successful response and newly adopted application IDs match; a different ID resets to its own server revision. Focused regressions cover both cases. The first correction on `cedb8f1` passed general CI `39357818076` and Supabase CI `39357818084`, including critical Playwright journeys. Independent review identified and the follow-up corrected the ID-mismatch edge case. The local Vitest command is blocked because pnpm/Node are unavailable and Bun cannot read the Vitest package-store path (`EPERM`). Hosted verification is pending on the final pushed follow-up commit; no pass is claimed yet.
