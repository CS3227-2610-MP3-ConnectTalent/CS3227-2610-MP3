# Proposal: HR application search, filters, sorting, and pagination

- Change ID: 2026-10-16-hr-application-filters
- Issues: [#97 feat(hr): application search, filters, sorting, and pagination](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Owner: John (Johnwz123), student and implementer
- Status: awaiting approval
- Date: 2026-10-16
- Baseline: ProductSpec v1.16 ([ProductSpec.md](../../ProductSpec.md))
- Affected capabilities: [applications-and-review.md](../../specs/applications-and-review.md) (`APP-001`, `APP-008`, `APP-010`)
- Classification: behavior change; low risk, bounded UI and server-side querying

## Intent, problem, and motivation

Authorized HR administrators review all submitted applications on `/hr/applications`. Currently, the page retrieves all submitted applications across every job opening in a flat list ordered solely by newest `submitted_at`, displaying raw UUIDs (`Applicant <uuid>`) with no search, filtering, sorting, or pagination. As application volume increases, HR users cannot filter by a specific job role, isolate active candidates from withdrawn candidates, triage applications by review status (`Submitted`, `In review`, `Shortlisted`, `Rejected`), locate candidates by name, or process applications in arrival (oldest-first) order.

This change adds bounded search by applicant name (with 300ms debouncing and input sanitization), filters by job, review status, and withdrawal status, sort order toggle (newest first vs oldest first), pagination controls, and displays the applicant's name on list cards.

## Goals, non-goals, and scope boundaries

- Goals:
  - Add search by applicant name with 300 ms debounced input and URL parameter synchronization.
  - Add filter by Job (All or specific job ID).
  - Add filter by Review Status (`All`, `Submitted`, `In review`, `Shortlisted`, `Rejected`).
  - Add filter by Withdrawal state (`Active only` [default], `Withdrawn only`, `All`).
  - Add sorting toggle: `Newest first` (`submitted_at DESC`, default) vs `Oldest first` (`submitted_at ASC`).
  - Add pagination controls (e.g. 10 or 20 items per page) with Previous/Next buttons and page count indicators.
  - Display applicant's `full_name` on each application item in the list view (retrieved via `applications` table).
  - Synchronize all search, filter, sort, and pagination state into URL query parameters (`q`, `job`, `status`, `withdrawal`, `sort`, `page`) for shareability and browser history navigation.
  - Safe fallback for invalid, malformed, or out-of-range query parameters.
- Non-goals:
  - Changing HR review actions, notes, or status transition logic.
  - Full-text search inside cover letters or résumé attachments.
  - Exporting applications to external formats (CSV/Excel).
  - Exposing HR search/filter features or applicant names to public visitors or applicants.
- Users/roles:
  - Authorized HR only. Gated by `requireHR()` and Supabase RLS.
- Scope boundaries:
  - Modifies `src/lib/hr-applications.ts`, `src/app/hr/applications/page.tsx`.
  - Adds `src/components/hr-application-filters.tsx`, `src/lib/hr-application-search.ts`.
  - Adds tests in `tests/unit/hr-applications.test.ts` and `tests/unit/hr-application-filters.test.ts`.

## Alternatives and dependencies

| Alternative                                                                                   | Benefit / cost / risk                                                                                                  | Decision and reason                                                                                                                    |
| --------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| Keep current behavior (unpaginated, newest-first, unfilterable list)                          | Zero implementation cost; unusable at realistic application volumes                                                    | Rejected: HR cannot efficiently triage candidates or review by job opening.                                                            |
| Client-side only filtering (fetch all rows into browser JS)                                   | Simpler server code; poor performance with large application sets, leaks unnecessary data payload                      | Rejected: Server-side validation and URL query parsing keeps rendering fast, accessible, and aligned with Next.js App Router patterns. |
| URL search params with server-side filtering, sorting, pagination, and debounced client input | Fast server rendering, shareable URLs, responsive debounced search, accessible without JavaScript, respects pagination | Chosen: Balances simplicity with robust UX and aligns with `JOB-004` search pattern in careers portal.                                 |

- Assumptions:
  - The `applications` table contains `full_name` for submitted applications.
  - Dataset sizes for a single company's jobs and applications can be fetched via `requireHR()` with `fetchAllPages()` or targeted queries and filtered/paginated cleanly.
- Dependencies:
  - None external. Uses existing Supabase client, Next.js App Router, and Lucide icons.
- Risks:
  - Query parameter injection or malformed input: mitigated by strict Zod / parsing sanitization and safe default fallbacks.
  - Debounce thrashing: mitigated by 300ms debounce timer and immediate Enter / Search triggering.

## Acceptance evidence and artifacts

| Acceptance ID       | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                                                        | Required evidence and owner                                     |
| ------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| HR-APP-FILTER-AC-01 | #97; APP-010                                  | Given an authorized HR user on `/hr/applications`, when they enter a search query, typing is debounced by 300ms and filters the displayed applications to those matching applicant `full_name` (case-insensitive substring match). | Unit test and component check; John                             |
| HR-APP-FILTER-AC-02 | #97; APP-010                                  | Given an authorized HR user, when they filter by job, review status, or withdrawal state (`active`, `withdrawn`, `all`), only matching applications are shown.                                                                     | Unit tests in `tests/unit/hr-application-filters.test.ts`; John |
| HR-APP-FILTER-AC-03 | #97; APP-010                                  | Given an authorized HR user, when they toggle sort between `newest` and `oldest`, applications are sorted by `submitted_at` DESC and ASC respectively.                                                                             | Unit tests in `tests/unit/hr-application-filters.test.ts`; John |
| HR-APP-FILTER-AC-04 | #97; APP-010                                  | Given submitted applications exceeding the page size (e.g. 10), pagination controls render, disable out-of-bounds previous/next navigation, and display current page and total count.                                              | Unit tests and rendering check; John                            |
| HR-APP-FILTER-AC-05 | #97; APP-010                                  | Given invalid, negative, or unparseable query parameters in the URL, the page safely defaults to valid values without crashing.                                                                                                    | Unit test for query parser; John                                |
| HR-APP-FILTER-AC-06 | #97; APP-010                                  | The application card renders the applicant's `full_name` alongside job title, status, and submission timestamp.                                                                                                                    | Unit test and page view check; John                             |

- Spec deltas: `specs/applications-and-review.md`
- Design: `design.md`
- Plan and tasks: `plan.md` and `tasks.md`
- Evidence: `record.md`

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, deltas, design or omission reason, and plan agreed before product implementation.
- Approver: John (student owner)
- Decision/date/source: approved; 2026-10-16; user prompt in chat
- Conditions: Include debounced search input, URL state synchronization, and comprehensive unit tests.
