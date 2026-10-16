# Implementation plan: HR application search, filters, sorting, and pagination

- Change/issues: 2026-10-16-hr-application-filters; [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Owner/status/date: John (Johnwz123); approved; 2026-10-16
- Approved inputs: proposal.md; design.md; specs/applications-and-review.md
- Baseline and affected IDs: ProductSpec v1.16; APP-001, APP-008, APP-010; HR-APP-FILTER-AC-01 through AC-06
- Constraints: Maintain `requireHR()` boundary and SEC-001; Conventional Commits; test-first development for behavior changes.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T01 | None | John (Implementer) | APP-010; AC-01, AC-02, AC-03, AC-04, AC-05 | `tests/unit/hr-application-filters.test.ts` (write failing unit tests for query parsing, sanitization, filtering, sorting, pagination) | `pnpm vitest run tests/unit/hr-application-filters.test.ts` (fails before implementation) |
| T02 | T01 | John (Implementer) | APP-010; AC-01, AC-02, AC-03, AC-04, AC-05 | `src/lib/hr-application-search.ts` (implement parsing, sanitization, filterApplications, sortApplications, paginateApplications) | `pnpm vitest run tests/unit/hr-application-filters.test.ts` (passes) |
| T03 | T02 | John (Implementer) | APP-010; AC-06 | `src/lib/hr-applications.ts`, `tests/unit/hr-applications.test.ts` (add `full_name` to `listItemSchema` and Supabase query; update tests) | `pnpm vitest run tests/unit/hr-applications.test.ts` (passes) |
| T04 | T03 | John (Implementer) | APP-010; AC-01, AC-02, AC-03, AC-04 | `src/components/hr-application-filters.tsx`, `src/components/hr-application-pagination.tsx` (debounced search input, filter selects, sort toggle, clear button, pagination bar) | Typecheck & component verification |
| T05 | T04 | John (Implementer) | APP-010; AC-01..06 | `src/app/hr/applications/page.tsx` (read searchParams, filter, sort, paginate, render filters, cards with applicant name, pagination) | `pnpm vitest run` & `pnpm build` |
| T06 | T05 | John (Implementer) | APP-010 | Complete test suite, typecheck, lint, prettier | `pnpm check` |
| T07 | T06 | Independent Reviewer / John | All | `handoffs/independent-review.md` and `record.md` | Separate review verification and human acceptance |
| T08 | T07 | John (Integration Lead) | All | `workflow/specs/applications-and-review.md`, `logs/2026-10-16-hr-application-filters.md`, PR to `develop` | Spec sync, closeout log, and PR creation |

## Integration and handoffs

- Implementer handles T01 through T06.
- Independent Reviewer verifies AC-01 through AC-06 and security/role boundary against `develop` baseline.
- Student John approves acceptance before canonical spec sync, closeout logging, and PR creation.

## Approval and completion evidence

- [x] Human approved the proposal, deltas, design and this plan before product implementation.
- [ ] tasks.md matches the ordered work and states acceptance evidence for each checkbox.
- [ ] Independent review and human acceptance are separate tasks with real decision evidence.
- [ ] Closeout includes every session log and truthful limitations.
- [ ] Contributor flow ends with issue-linked PR after closeout.
- Approval/date/source: Approved by John in chat on 2026-10-16.
