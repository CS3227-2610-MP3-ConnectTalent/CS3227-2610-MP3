# Tasks: PR #110 review follow-ups

- Change/issues: [#115](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/115), [#116](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/116), [#117](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/117), [#118](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/118)
- Plan/record: `plan.md`; `record.md`
- Status/owner: Accepted with stated limits; packet archived; PR #119 open; requester explicitly accepted in the student owner/verifier role (personal name not supplied); post-submission review follow-up in progress

## Before implementation

- [x] T00 — Requester approved the bounded corrections and develop target in the direct instruction dated 2026-10-19. Evidence: `proposal.md` and `record.md`.

## Ordered implementation

- [x] T01 — Preserve combined HR filter intent and reset oversized pages to page 1. Depends on: T00. IDs: APP-010; PR110-AC-01. Added mounted Happy DOM coverage of rapid role/status changes, pending search plus filter navigation, and Clear filters cancellation; the pagination assertion checks the exact first-page slice. Against `develop`, role/status and search/filter tests failed because later URLs dropped earlier filters; the clear-cancellation test passed. Focused suite passed after the fix.
- [x] T02 — Sync refreshed application identity/revision into form state. Depends on: T00. IDs: APP-005/007; PR110-AC-02. Extracted revision reconciliation into `src/lib/application-attachment.ts`; pure tests cover monotonic revision/identity behavior, and mounted form tests verify refreshed props update the hidden revision and new identity. Against `develop`, both mounted tests failed with stale revision/identity; focused suite passed after the fix.
- [x] T03 — Correct the withdrawal explanation. Depends on: T00. IDs: APP-001/008; PR110-AC-03. File: `src/components/withdrawal-control.tsx`. Added a focused confirmation-copy test; the baseline wording failed and the corrected wording passed.
- [x] T04 — Derive dashboard row status and totals from operational schedule state. Depends on: T00. IDs: APP-009/JMG-004. Added expired and future-scheduled job cases; baseline returned Published 2 / Closed 0 where Published 1 / Closed 1 was expected; focused suite passed after the operational-status fix.
- [x] T05 — Inspect final diff, check whitespace and applicable static checks, and record exact results. Depends on: T01–T04. IDs: PR110-AC-01–05. Focused tests: 11 files / 47 tests passed. Typecheck, changed-file ESLint, Prettier, and `git diff --check` passed; see `record.md` for exact commands and red/green evidence.

## Review and closeout

- [x] T06 — Separate reviewer rechecked the mounted navigation/form tests and test-environment dependency through `182b4a2`, then re-reviewed the post-submission CI fixture repair and packet corrections at `450ecbd`. No source or fixture defect was found; the refreshed identity assertion closes the prior P3 test gap. Remaining P2 validation limit: actual Next/browser transition interruption or out-of-order navigation is not exercised by the synchronous router mock. See `handoffs/T06-independent-review.md`.
- [x] T07 — Requester accepted as student owner/verifier with stated limits on 2026-10-19; source and limits are recorded in `proposal.md` and `record.md`.
- [x] T08 — Archived the complete packet after acceptance at `workflow/archive/2026-10-19-pr110-review-followups/`; updated the active/archive indexes. Canonical sync is N/A because no product requirements changed.
- [x] T09 — Completed [the dated closeout summary](../../../logs/2026-10-19-pr110-review-followups-closeout.md) and linked it from the archived record and indexes before PR submission.
- [x] T10 — Open issue-linked [PR #119](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/119) to `develop` as the final contributor action after the recorded gates. Opened 2026-10-19; PR remains open and unmerged. Subsequent review follow-up is recorded separately; it does not change the completed PR-submission task.

## Post-submission

- [ ] Merge/deployment/release decision remains separate; master promotion is explicitly outside this task.
