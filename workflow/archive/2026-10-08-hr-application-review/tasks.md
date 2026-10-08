# Tasks: HR application review

- Change/issue: `2026-10-08-hr-application-review`, [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- [Plan](plan.md) / [record](record.md); approved for implementation by Paul Cheng on 2026-10-08.

## Before implementation

- [x] T00 — Student owner approved proposal, four deltas, design and plan, including status transitions and shared Development Supabase migration gate. Evidence: explicit 2026-10-08 conversation reply recorded in `record.md`.

## Ordered implementation

- [x] T01 — Focused pgTAP tests observed missing review columns/tables fail before the local migration; later missing-relation abort is recorded. See [implementation summary](../../../logs/2026-10-08-hr-review-implementation.md). AC-01–06.
- [x] T02 — Additive migration, backfill, RLS/grants and narrow HR RPCs applied **locally**; existing Applicant suite and 66 total database assertions passed. AC-01–06. Shared databases remain untouched.
- [x] T03 — Verified HR auth, HR queries/actions and role-aware sign-in added. HR redirect test failed on `/applications` then passed; input unit tests passed. AC-01–04/06.
- [x] T04 — HR list/detail/forms, Applicant status display and local HR browser scenario added; full browser suite passed six tests. AC-02–05.
- [x] T05 — Local database, unit, browser, Applicant race, lint, typecheck and build checks passed. Earlier browser/test setup failures and remaining limits are in the [implementation summary](../../../logs/2026-10-08-hr-review-implementation.md). AC-01–07 local evidence only.
- [x] T06 — Guides, reflections, README and manual HR runbook updated; AI data boundary documented. Student acceptance was later recorded in T08; teammate agreement remains pending.

## Review and closeout

- [x] T07 — Separate read-only reviewer checked final diff, database permissions, migration compatibility and test quality; its medium privacy-evidence finding was corrected and rechecked. [Review handoff](handoffs/independent-review.md) records F2/F3 limits. Depends on T05/T06.
- [x] T08 — Paul Cheng separately accepted the locally implemented feature with recorded SEC-007/hosted-preview limits on 2026-10-08; accepted deltas synced to canonical v0.8 before archive. Complete packet archive and final links checked as part of closeout. Depends on T07.
- [ ] T09 — Complete dated logs, final record and issue-linked PR to `develop` only after separate Git instruction. Depends on T08. PR creation ends contributor flow.

## Post-submission decisions

- [ ] Team owner records reviewed Development Supabase migration, preview smoke, merge, later Production Supabase migration and `master` release as separate actions/evidence. None is authorized by this draft packet.
