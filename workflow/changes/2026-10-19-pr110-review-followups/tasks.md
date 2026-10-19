# Tasks: PR #110 review follow-ups

- Change/issues: [#115](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/115), [#116](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/116), [#117](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/117), [#118](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/118)
- Plan/record: `plan.md`; `record.md`
- Status/owner: In progress; student owner unassigned for triage

## Before implementation

- [x] T00 — Requester approved the bounded corrections and develop target in the direct instruction dated 2026-10-19. Evidence: `proposal.md` and `record.md`.

## Ordered implementation

- [ ] T01 — Preserve combined HR filter intent and reset oversized pages to page 1. Depends on: T00. IDs: APP-010; PR110-AC-01. Files: `src/components/hr-application-filters.tsx`, `src/lib/hr-application-search.ts`, relevant existing pagination assertion. The assertion was updated, but the test was not run and the required observed RED result is missing; keep this task open.
- [x] T02 — Sync refreshed application identity/revision into form state. Depends on: T00. IDs: APP-005/007; PR110-AC-02. File: `src/components/application-form.tsx`. Source/type/lint review complete; tests not run.
- [x] T03 — Correct the withdrawal explanation. Depends on: T00. IDs: APP-001/008; PR110-AC-03. File: `src/components/withdrawal-control.tsx`. Copy compared with canonical requirements; static checks passed; tests not run.
- [x] T04 — Derive dashboard row status and totals from operational schedule state. Depends on: T00. IDs: APP-009/JMG-004; PR110-AC-04. Files: `src/lib/hr-dashboard.ts`, `src/app/hr/page.tsx`. Shared status helper and read-only path inspected; static checks passed; tests not run.
- [x] T05 — Inspect final diff, check whitespace and applicable static checks, and record exact results. Depends on: T01–T04. IDs: PR110-AC-01–05. `git diff --check`, typecheck, changed-file lint, and formatting passed. Test suite was not run; see `record.md`.

## Review and closeout

- [ ] T06 — Separate reviewer execution checks final diff, acceptance cases, privacy and maintainability; records independence, findings and rechecks.
- [ ] T07 — Student owner records acceptance or requested changes with date, source and conditions.
- [ ] T08 — After acceptance, archive complete packet; canonical sync is N/A because no product requirement changes; check navigation and links.
- [ ] T09 — Complete dated summary and record links before PR submission.
- [ ] T10 — Open issue-linked PR to `develop` as final contributor action after all gates.

## Post-submission

- [ ] Merge/deployment/release decision remains separate; master promotion is explicitly outside this task.
