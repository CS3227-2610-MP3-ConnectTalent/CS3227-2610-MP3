# Tasks: PR #110 review follow-ups

- Change/issues: [#115](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/115), [#116](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/116), [#117](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/117), [#118](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/118)
- Plan/record: `plan.md`; `record.md`
- Status/owner: In progress; student owner unassigned for triage

## Before implementation

- [x] T00 — Requester approved the bounded corrections and develop target in the direct instruction dated 2026-10-19. Evidence: `proposal.md` and `record.md`.

## Ordered implementation

- [x] T01 — Preserve combined HR filter intent and reset oversized pages to page 1. Depends on: T00. IDs: APP-010; PR110-AC-01. Added unit coverage for successive merged updates and stale/pending URL synchronization; the existing pagination assertion checks the exact first-page slice. RED observed against the baseline (page 999 returned page 3; missing filter helpers failed); focused suite passed afterward. See `record.md`.
- [x] T02 — Sync refreshed application identity/revision into form state. Depends on: T00. IDs: APP-005/007; PR110-AC-02. Extracted revision reconciliation into `src/lib/application-attachment.ts`; tests cover revision advance, preservation of newer local revision, and identity change. RED observed before the helper existed; focused suite passed afterward.
- [x] T03 — Correct the withdrawal explanation. Depends on: T00. IDs: APP-001/008; PR110-AC-03. File: `src/components/withdrawal-control.tsx`. Added a focused confirmation-copy test; the baseline wording failed and the corrected wording passed.
- [x] T04 — Derive dashboard row status and totals from operational schedule state. Depends on: T00. IDs: APP-009/JMG-004. Added expired and future-scheduled job cases; baseline returned Published 2 / Closed 0 where Published 1 / Closed 1 was expected; focused suite passed after the operational-status fix.
- [x] T05 — Inspect final diff, check whitespace and applicable static checks, and record exact results. Depends on: T01–T04. IDs: PR110-AC-01–05. Focused tests: 9 files / 42 tests passed. Typecheck, changed-file ESLint, Prettier, and `git diff --check` passed; see `record.md` for exact commands and red/green evidence.

## Review and closeout

- [x] T06 — Separate reviewer rechecked the helper extraction, focused tests, and final commit range. No source defect found. Recorded two evidence limits: no actual router-transition hook test (P2) and no mounted form prop-refresh test (P3); these are limits, not confirmed behavior defects. See `handoffs/T06-independent-review.md`.
- [ ] T07 — Student owner records acceptance or requested changes with date, source and conditions.
- [ ] T08 — After acceptance, archive complete packet; canonical sync is N/A because no product requirement changes; check navigation and links.
- [ ] T09 — Complete dated summary and record links before PR submission.
- [ ] T10 — Open issue-linked PR to `develop` as final contributor action after all gates.

## Post-submission

- [ ] Merge/deployment/release decision remains separate; master promotion is explicitly outside this task.
