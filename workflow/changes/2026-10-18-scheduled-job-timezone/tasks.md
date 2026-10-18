# Tasks: Scheduled job timezone handling

- Change/issues: `2026-10-18-scheduled-job-timezone`; [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: in progress; John (Johnwz123)

## Before implementation

- [x] T00 — John approves HR-browser-local interpretation, UTC storage, viewer-browser-local display, and proposal/delta/design/plan. Evidence: direct chat response on 2026-10-18, recorded in record.md; dependencies: none.
- [x] T00b — After initial review finds a no-JavaScript form regression, John selects the labeled UTC fallback. Evidence: direct chat response on 2026-10-18; see design.md and record.md.

## Ordered implementation

- [x] T01 — Add and observe failing tests for browser-local-to-UTC conversion, DST gap rejection, and server rejection of timezone-less input. Depends on T00. IDs: JMG-004, sched-tz-AC-01/04. Files: `tests/unit/hr-job-input.test.ts`, new `tests/unit/local-date-time.test.ts`. Evidence: before parser change, focused test expected timezone-less input to be rejected but received success; after change, focused regression tests pass.
- [x] T02 — Implement browser-local input conversion and HR edit-form round-trip using a hidden UTC ISO field. Depends on T01. IDs: JMG-004, sched-tz-AC-01/02. Files: parser, local-time helper/client component, job editor, tests. Evidence: local date/time helper tests verify conversion in Los Angeles and Singapore; HR page test verifies stored UTC remains in the hidden form field.
- [x] T03 — Render HR and public schedule deadlines in each viewer's local timezone and identify it, with UTC server-render fallback. Depends on T00/T02. IDs: JMG-004, JOB-001, sched-tz-AC-03. Files: HR/public job detail pages and `tests/unit/hr-job-pages.test.tsx`. Evidence: page tests verify timezone-labeled UTC fallback markup; browser-local formatter is covered by utility tests.
- [x] T04 — Run relevant final checks and document results. Depends on T01-T03. IDs: all. Files: record.md and changed files. Verification: focused unit tests (5 files / 39 tests), TypeScript, repository lint and Prettier pass. Full suite has two resume-PDF parser timeouts; both affected test files pass alone. Next build and browser hydration smoke were not run. Evidence: record.md.

## Review and closeout

- [x] T05 — Separate test engineer reviewed `09ba17a..252b731`, independently ran the focused suite, and found a P2 no-JavaScript native form regression. Evidence: `handoffs/T05-independent-review.md`.
- [x] T05a — Added failing native no-JavaScript SSR/parser/action tests, then restored UTC-labeled native create/edit/clear and explicit UTC server parsing; browser-enhanced submissions still require converted UTC. Pre-fix run failed 3 regression assertions; final focused suite passed 44/44, full suite 651/651. Evidence: record.md.
- [x] T05b — Separate test engineer rechecked `09ba17a..96d30b0` and the test-only `db5d617` delta. The reviewer confirmed the P2 is resolved and found no new issues; independently passed the focused suite at final head (5 files / 45 tests). Evidence: `handoffs/T05b-independent-review.md`.
- [ ] T06 — John records student acceptance separately from implementation/review after T05b.
- [ ] T07 — Sync the accepted delta to canonical JMG-004 and product index/version; complete logs and archive packet after checking links.
- [ ] T08 — Commit final closeout and open issue-linked PR to `develop` with `Closes #111` after closeout. Merge and release remain separate decisions.

## Post-submission

- [ ] Record later merge/release decision and actual validation separately.
