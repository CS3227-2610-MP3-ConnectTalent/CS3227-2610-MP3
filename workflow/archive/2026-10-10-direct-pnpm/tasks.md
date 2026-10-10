# Tasks: use pnpm directly

- Change/issues: 2026-10-10-direct-pnpm; issue #47
- Plan/record: plan.md; record.md
- Status/owner: pre-PR closeout complete; PR submission is the final contributor action; John

## Before implementation

- [x] T00 — John records approval of proposal, design omission, and plan. Evidence: decision/date/source in record.md. Dependencies: none.

## Ordered implementation

- [x] T01 — John replaces active Corepack invocations with direct pnpm in the six approved files and states the pinned pnpm 12.8.1 prerequisite. Depends on: T00. IDs: DPNPM-AC-01..03. Files: README.md, CONTRIBUTING.md, docs/UserGuide.md, docs/DeveloperGuide.md, .env.example, playwright.config.ts. Verification: inspect examples and scan the scoped active files; record actual evidence.
- [x] T02 — John runs the scoped Corepack reference scan and git diff --check, confirms package-manager pin/CI/history boundaries, and records results. Depends on: T01. IDs: DPNPM-AC-03..04. Application tests: N/A, documentation/tooling-only.

## Review and closeout

- [x] T03 — A separate reviewer inspects the implementation diff and static evidence; records independence, findings, fixes, and rechecks. Depends on: T02. The review found no technical defects and identified a process-sequencing gap because John’s implementation acceptance preceded review.
- [x] T04 — John records post-review acceptance or conditions after considering the independent review. John’s earlier implementation acceptance is recorded in record.md but does not complete this post-review decision. Depends on: T03. Post-review acceptance and authorization were recorded on 2026-10-10.
- [x] T05 — John records no product delta, updates applicable guides and session summary, and archives the complete packet after acceptance. Depends on: T04.
- [ ] T06 — Authorized contributor completes pre-PR closeout and opens an issue-linked PR to develop as the final contributor action. Depends on: T05.
