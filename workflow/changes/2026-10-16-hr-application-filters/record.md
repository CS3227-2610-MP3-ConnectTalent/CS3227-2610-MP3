# Feature record: HR application search, filters, sorting, and pagination

Status: in progress

Owner: John (Johnwz123), student and implementer

Spec version: ProductSpec v1.16 ([ProductSpec.md](../../ProductSpec.md))
Date: 2026-10-16

## Metadata and artifact links

- Change ID/classification: 2026-10-16-hr-application-filters; behavior change
- GitHub issues: [#97 feat(hr): application search, filters, sorting, and pagination](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Branch/commits/PR: `feat/97-hr-application-filters`; PR pending until opened
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/applications-and-review.md](specs/applications-and-review.md)
- Implementation plan/tasks: [plan.md](plan.md) and [tasks.md](tasks.md)
- Baseline: v1.16 (2026-10-16)
- Archive path: pending (workflow/archive/2026-10-16-hr-application-filters/)

## Approval checklist

- [x] Issue triaged and scope agreed; actual issue [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97) created on 2026-10-16.
- [x] Human approved proposal, deltas, design, and plan before product implementation (John in chat, 2026-10-16).
- [ ] Implementation and relevant checks complete with actual evidence below.
- [ ] Independent review complete; findings and unresolved matters recorded.
- [ ] Human acceptance recorded separately from implementation and review.
- [ ] Relevant guides/reflections updated and every session log linked.
- [ ] Pre-PR closeout complete; contributor PR opened last with issue links.
- [ ] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| HR-APP-FILTER-AC-01 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user on `/hr/applications`, when they enter a search query, typing is debounced by 300ms and filters the displayed applications to those matching applicant `full_name` (case-insensitive substring match). | Pending T01/T02/T04/T05 |
| HR-APP-FILTER-AC-02 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user, when they filter by job, review status, or withdrawal state (`active`, `withdrawn`, `all`), only matching applications are shown. | Pending T01/T02/T05 |
| HR-APP-FILTER-AC-03 | #97; [APP-010](../../specs/applications-and-review.md) | Given an authorized HR user, when they toggle sort between `newest` and `oldest`, applications are sorted by `submitted_at` DESC and ASC respectively. | Pending T01/T02/T05 |
| HR-APP-FILTER-AC-04 | #97; [APP-010](../../specs/applications-and-review.md) | Given submitted applications exceeding the page size (e.g. 10), pagination controls render, disable out-of-bounds previous/next navigation, and display current page and total count. | Pending T01/T02/T04/T05 |
| HR-APP-FILTER-AC-05 | #97; [APP-010](../../specs/applications-and-review.md) | Given invalid, negative, or unparseable query parameters in the URL, the page safely defaults to valid values without crashing. | Pending T01/T02 |
| HR-APP-FILTER-AC-06 | #97; [APP-010](../../specs/applications-and-review.md) | The application card renders the applicant's `full_name` alongside job title, status, and submission timestamp. | Pending T03/T05 |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Implementer | Approved packet (proposal, design, deltas, plan) | Implementation and unit tests | Pending implementation |
| Independent Reviewer | Code diff, tests, acceptance criteria | Review findings and assessment | Pending review |

## Implementation and tests

Changed files (planned):
- `src/lib/hr-application-search.ts`
- `src/lib/hr-applications.ts`
- `src/components/hr-application-filters.tsx`
- `src/components/hr-application-pagination.tsx`
- `src/app/hr/applications/page.tsx`
- `tests/unit/hr-application-filters.test.ts`
- `tests/unit/hr-applications.test.ts`

Verification commands (planned):
- `pnpm vitest run tests/unit/hr-application-filters.test.ts`
- `pnpm vitest run tests/unit/hr-applications.test.ts`
- `pnpm check`
- `pnpm build`
