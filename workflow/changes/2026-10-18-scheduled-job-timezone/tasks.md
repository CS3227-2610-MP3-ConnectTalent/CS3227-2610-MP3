# Tasks: Scheduled job timezone handling

- Change/issues: `2026-10-18-scheduled-job-timezone`; [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: in progress; John (Johnwz123)

## Before implementation

- [x] T00 — John approves HR-browser-local interpretation, UTC storage, viewer-browser-local display, and proposal/delta/design/plan. Evidence: direct chat response on 2026-10-18, recorded in record.md; dependencies: none.

## Ordered implementation

- [x] T01 — Add and observe failing tests for browser-local-to-UTC conversion, DST gap rejection, and server rejection of timezone-less input. Depends on T00. IDs: JMG-004, sched-tz-AC-01/04. Files: `tests/unit/hr-job-input.test.ts`, new `tests/unit/local-date-time.test.ts`. Evidence: before parser change, focused test expected timezone-less input to be rejected but received success; after change, focused regression tests pass.
- [x] T02 — Implement browser-local input conversion and HR edit-form round-trip using a hidden UTC ISO field. Depends on T01. IDs: JMG-004, sched-tz-AC-01/02. Files: parser, local-time helper/client component, job editor, tests. Evidence: local date/time helper tests verify conversion in Los Angeles and Singapore; HR page test verifies stored UTC remains in the hidden form field.
- [x] T03 — Render HR and public schedule deadlines in each viewer's local timezone and identify it, with UTC server-render fallback. Depends on T00/T02. IDs: JMG-004, JOB-001, sched-tz-AC-03. Files: HR/public job detail pages and `tests/unit/hr-job-pages.test.tsx`. Evidence: page tests verify timezone-labeled UTC fallback markup; browser-local formatter is covered by utility tests.
- [x] T04 — Run relevant final checks and document results. Depends on T01-T03. IDs: all. Files: record.md and changed files. Verification: focused unit tests (5 files / 39 tests), TypeScript, repository lint and Prettier pass. Full suite has two resume-PDF parser timeouts; both affected test files pass alone. Next build and browser hydration smoke were not run. Evidence: record.md.

## Review and closeout

- [ ] T05 — A separate reviewer checks final diff, acceptance cases, and risks. Evidence: independent review artifact and commit range.
- [ ] T06 — John records student acceptance separately from implementation/review.
- [ ] T07 — Sync the accepted delta to canonical JMG-004 and product index/version; complete logs and archive packet after checking links.
- [ ] T08 — Open issue-linked PR to `develop` with `Closes #111` after closeout. Merge and release remain separate decisions.

## Post-submission

- [ ] Record later merge/release decision and actual validation separately.
