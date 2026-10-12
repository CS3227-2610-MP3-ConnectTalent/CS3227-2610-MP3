# Tasks: HR recruitment dashboard

- Issue: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68)
- Plan/record: plan.md; record.md
- Status/owner: accepted with recorded evidence limits; closeout complete; push/PR pending; John Wong

## Before implementation

- [x] T00 — John Wong approved proposal, APP-009 delta, design and plan in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”); issue triage is complete.

## Ordered implementation

- [x] T01 — Add focused aggregation, query and page tests that first fail for missing dashboard behavior. Depends on T00. IDs: APP-009, HRD-AC-01 to 05. Files: tests/unit/hr-applications.test.ts, tests/unit/hr-dashboard.test.ts, tests/unit/hr-dashboard-page.test.tsx. RED observed: HR query lacked job_id in its select; focused suite passed after implementation.
- [x] T02 — Implement authorized data aggregation, /hr page and HR navigation. Depends on T01. IDs: APP-009, SEC-001/002, HRD-AC-01 to 05. Files: src/lib/hr-dashboard.ts, src/lib/hr-applications.ts, src/app/hr/page.tsx, src/components/account-navigation.tsx. Verify duplicate-title grouping, withdrawn exclusion, role denial and safe read failure.
- [x] T03 — Add synthetic browser coverage and user guidance. Depends on T02. IDs: APP-009, HRD-AC-01 to 05. Files: tests/e2e/hr-dashboard.spec.ts, tests/e2e/support/hr-dashboard-journey.ts, package.json, docs/UserGuide.md. The dashboard journey passed in the local critical suite; unit/page tests cover empty and read-error states.
- [x] T04 — Run final approved checks and record exact results, limitations, failures and reruns. Depends on T02/T03. IDs: APP-009, HRD-AC-01 to 05. Lint, typecheck, unit tests, changed-file formatting and build passed; repository-wide formatting found 37 existing files; local critical E2E ran with the dashboard case passing and three failures in other existing journeys. See record.md.

## Review and closeout

- [ ] T05 — Independent reviewer execution evidence is unavailable. John’s full-approval statement is recorded, but no separate reviewer identity/run/findings are claimed.
- [x] T06 — John Wong confirmed full approval on 2026-10-12 after the known implementation check results were presented; acceptance is recorded with those limits.
- [x] T07 — APP-009 synced to v1.9, IDs/links checked, packet archived, guide/indexes updated and dated summary written on 2026-10-13.
- [ ] T08 — Complete closeout and open issue-linked PR to develop using the template, Conventional Commit title and Closes #68. PR creation ends contributor work; merge/release remain separate.
