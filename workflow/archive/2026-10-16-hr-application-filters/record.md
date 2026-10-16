# Feature record: HR application search, filters, sorting, and pagination

Status: accepted

Owner: John (Johnwz123), student and implementer

Spec version: ProductSpec v1.17 ([ProductSpec.md](../../ProductSpec.md))
Date: 2026-10-16

## Metadata and artifact links

- Change ID/classification: 2026-10-16-hr-application-filters; behavior change
- GitHub issues: [#97 feat(hr): application search, filters, sorting, and pagination](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Branch/commits/PR: `feat/97-hr-application-filters`; commits `7ca4e09`, `4c2ce47`, `a3b3b55`
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/applications-and-review.md](specs/applications-and-review.md)
- Implementation plan/tasks: [plan.md](plan.md) and [tasks.md](tasks.md)
- Baseline: v1.17 (2026-10-16)
- Archive path: workflow/archive/2026-10-16-hr-application-filters/
- Session closeout summary: [logs/2026-10-16-hr-application-filters.md](../../../logs/2026-10-16-hr-application-filters.md)

## Approval checklist

- [x] Issue triaged and scope agreed; actual issue [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97) created on 2026-10-16.
- [x] Human approved proposal, deltas, design, and plan before product implementation (John in chat, 2026-10-16).
- [x] Implementation and relevant checks complete with actual evidence below.
- [x] Independent review complete; findings and unresolved matters recorded.
- [x] Human acceptance recorded separately from implementation and review (John, 2026-10-16).
- [x] Relevant guides/reflections updated and every session log linked.
- [x] Pre-PR closeout complete; contributor PR opened last with issue links.
- [x] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| HR-APP-FILTER-AC-01 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user on `/hr/applications`, when they enter a search query, typing is debounced by 300ms and filters the displayed applications to those matching applicant `full_name` (case-insensitive substring match). | Passed: verified in `HRApplicationFilters` and tests in `tests/unit/hr-application-filters.test.ts` and `tests/unit/hr-application-pages.test.tsx`. |
| HR-APP-FILTER-AC-02 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user, when they filter by job, review status, or withdrawal state (`active`, `withdrawn`, `all`), only matching applications are shown. | Passed: verified in `FilterDropdowns`, `parseHRApplicationFilterParams`, and `filterApplications`; tested in `tests/unit/hr-application-filters.test.ts` and `tests/unit/hr-application-pages.test.tsx`. |
| HR-APP-FILTER-AC-03 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user, when they toggle sort between `newest` and `oldest`, applications are sorted by `submitted_at` DESC and ASC respectively. | Passed: verified in `sortApplications` and tests in `tests/unit/hr-application-filters.test.ts`. |
| HR-APP-FILTER-AC-04 | #97; [APP-010](../../specs/applications-and-review.md) | Given submitted applications exceeding the page size (e.g. 10), pagination controls render, disable out-of-bounds previous/next navigation, and display current page and total count. | Passed: verified in `HRApplicationPagination` and `paginateApplications`; tested in `tests/unit/hr-application-pagination.test.ts` and `tests/unit/hr-application-pages.test.tsx`. |
| HR-APP-FILTER-AC-05 | #97; [APP-010](../../specs/applications-and-review.md) | Given invalid, negative, or unparseable query parameters in the URL, the page safely defaults to valid values without crashing. | Passed: verified in `parseHRApplicationFilterParams` and `paginateApplications`; tested in `tests/unit/hr-application-filters.test.ts` and `tests/unit/hr-application-pagination.test.ts`. |
| HR-APP-FILTER-AC-06 | #97; [APP-010](../../specs/applications-and-review.md) | The application card renders the applicant's `full_name` alongside job title, status, and submission timestamp. | Passed: verified in `listSubmittedApplications` and `HRApplicationLink`; tested in `tests/unit/hr-applications.test.ts` and `tests/unit/hr-application-pages.test.tsx`. |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Implementer | Approved packet (proposal, design, deltas, plan) | Implementation and unit tests (commits `4c2ce47`, `a3b3b55`) | Accepted by John on 2026-10-16 |
| Independent Reviewer (`mp3-independent-verification`) | Code diff `origin/develop..4c2ce47`, tests, acceptance criteria | [Review report](handoffs/independent-review.md) (1 blocking ESLint function length finding, 1 advisory duplicate export finding; both resolved in `a3b3b55`) | Verified by John on 2026-10-16 |

## Implementation and tests

Changed files:
- `src/lib/hr-application-search.ts`
- `src/lib/hr-applications.ts`
- `src/components/hr-application-filters.tsx`
- `src/components/hr-application-filter-dropdowns.tsx`
- `src/components/hr-application-pagination.tsx`
- `src/app/hr/applications/page.tsx`
- `tests/unit/hr-application-filters.test.ts`
- `tests/unit/hr-application-pagination.test.ts`
- `tests/unit/hr-applications.test.ts`
- `tests/unit/hr-application-pages.test.tsx`

Verification commands and results:
- `pnpm vitest run tests/unit/hr-application-filters.test.ts tests/unit/hr-application-pagination.test.ts tests/unit/hr-applications.test.ts tests/unit/hr-application-pages.test.tsx`: 4 files, 32/32 tests passed
- `pnpm test:unit`: 93 files, 563/563 tests passed
- `pnpm typecheck`: Exit code 0, 0 errors
- `pnpm lint`: Exit code 0, 0 errors, 0 warnings
- `pnpm build`: Next.js Turbopack production build succeeded; `/hr/applications` dynamic server-rendered
