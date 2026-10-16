# Tasks: HR application search, filters, sorting, and pagination

- Change/issues: 2026-10-16-hr-application-filters; [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: complete / closeout; John (Johnwz123)

## Before implementation

- [x] T00 — Human approval of proposal, deltas, design, and plan. Evidence: John approved in chat on 2026-10-16.

## Ordered implementation

- [x] T01 — Test-first unit tests for search query parsing, input sanitization, filtering, sorting, and pagination. Depends on: T00. IDs: APP-010; HR-APP-FILTER-AC-01..05. Files: `tests/unit/hr-application-filters.test.ts`. Verification: `pnpm vitest run tests/unit/hr-application-filters.test.ts` fails before implementation.
- [x] T02 — Implement `src/lib/hr-application-search.ts` with parameter schemas, sanitization, filtering, sorting, pagination, and URL building. Depends on: T01. IDs: APP-010; AC-01..05. Files: `src/lib/hr-application-search.ts`. Verification: `pnpm vitest run tests/unit/hr-application-filters.test.ts` passes.
- [x] T03 — Add `full_name` to `listItemSchema` and Supabase query in `src/lib/hr-applications.ts`; update unit tests in `tests/unit/hr-applications.test.ts`. Depends on: T02. IDs: APP-010; AC-06. Files: `src/lib/hr-applications.ts`, `tests/unit/hr-applications.test.ts`. Verification: `pnpm vitest run tests/unit/hr-applications.test.ts` passes.
- [x] T04 — Implement UI components `src/components/hr-application-filters.tsx` (300 ms debounced search, dropdown selects, sort toggle, clear filters) and `src/components/hr-application-pagination.tsx`. Depends on: T03. IDs: APP-010; AC-01..05. Files: `src/components/hr-application-filters.tsx`, `src/components/hr-application-pagination.tsx`. Verification: `pnpm typecheck` passes.
- [x] T05 — Integrate searchParams, filters, pagination, and applicant name display into `src/app/hr/applications/page.tsx`. Depends on: T04. IDs: APP-010; AC-01..06. Files: `src/app/hr/applications/page.tsx`. Verification: `pnpm vitest run` passes.
- [x] T06 — Run full quality checks: lint, typecheck, unit tests, and build. Depends on: T05. IDs: APP-010. Verification: `pnpm check` and `pnpm build` pass.

## Review and closeout

- [x] T07 — Independent review checks implementation against AC-01..06, security boundaries, and test coverage. Depends on: T06. Evidence: `handoffs/independent-review.md`. Resolved 1 blocking ESLint max-lines-per-function finding and 1 duplicate export finding.
- [x] T08 — Human acceptance recorded by John. Depends on: T07. Evidence: `record.md`.
- [x] T09 — Canonical spec sync and complete packet archive to `workflow/archive/2026-10-16-hr-application-filters/`. Depends on: T08. Evidence: `workflow/specs/applications-and-review.md` update (v1.17).
- [x] T10 — Session closeout log in `logs/2026-10-16-hr-application-filters.md`. Depends on: T09.
- [ ] T11 — Open issue-linked PR to `develop` referencing #97. Depends on: T10. Evidence: PR URL.

