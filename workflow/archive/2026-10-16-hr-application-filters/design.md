# Design: HR application search, filters, sorting, and pagination

- Change ID/issues: 2026-10-16-hr-application-filters; [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97)
- Owner/status/date: John (Johnwz123); approved; 2026-10-16
- Inputs: proposal.md; `specs/applications-and-review.md`; ProductSpec v1.16; APP-001, APP-008, APP-010
- Scope and affected components/files:
  - `src/lib/hr-application-search.ts` (new): query parameter schemas, sanitization, filtering, sorting, pagination helpers, and URL builders.
  - `src/lib/hr-applications.ts`: update `listItemSchema` and Supabase query to include `full_name`.
  - `src/components/hr-application-filters.tsx` (new): interactive filter controls with 300 ms debounced search, dropdown filters, sort toggle, and clear action.
  - `src/components/hr-application-pagination.tsx` (new): pagination summary and navigation controls.
  - `src/app/hr/applications/page.tsx`: integrate query parsing, filtering, pagination, and applicant name rendering.
  - `tests/unit/hr-application-filters.test.ts` (new): unit tests for parsing, sanitization, filtering, sorting, and pagination.
  - `tests/unit/hr-applications.test.ts`: test `listItemSchema` with `full_name`.

## Decisions and alternatives

| Decision                                             | Considered alternatives                                   | Reason and tradeoffs                                                                                                                                                                                                       | Human approval reference              |
| ---------------------------------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| Server-driven filtering over fetched applications    | Client-side only state; or dedicated complex database RPC | Uses existing `listSubmittedApplications()` pipeline with `fetchAllPages()` and performs pure filtering/sorting/pagination on the server. Low query complexity, zero database migrations, highly testable with unit tests. | Approved by John in chat (2026-10-16) |
| URL query parameters as single source of truth       | Ephemeral client React state                              | Preserves back/forward navigation, enables bookmarking, and allows sharing filtered views with other HR members.                                                                                                           | Approved by John in chat (2026-10-16) |
| 300 ms debounced search with immediate Enter / Clear | Immediate fetch on every keystroke; or button-only submit | Prevents server thrashing on fast typing while providing a responsive search experience; aligns directly with `JOB-004` public search pattern.                                                                             | Approved by John in chat (2026-10-16) |
| Default withdrawal filter = `active`                 | Default = `all`                                           | HR reviewers typically triage active candidates. Defaulting to `active` hides withdrawn candidates from the main queue while still allowing toggle to `all` or `withdrawn`.                                                | Approved by John in chat (2026-10-16) |
| Include `full_name` on list card                     | Only show `Applicant <uuid>`                              | Displaying applicant names is standard HR workflow; `full_name` already exists in `applications` table and is accessible under existing HR RLS.                                                                            | Approved by John in chat (2026-10-16) |

## Interfaces and data flow

```
HR User Browser
    │
    ▼ (GET /hr/applications?q=alice&job=<uuid>&status=submitted&withdrawal=active&sort=newest&page=1)
Next.js Page (src/app/hr/applications/page.tsx)
    │
    ├─► requireHR() -> verifies HR role session via Supabase Auth
    ├─► listSubmittedApplications() -> queries applications table (includes full_name)
    │
    ├─► parseHRApplicationFilterParams(searchParams) -> validated params with safe fallbacks
    ├─► filterApplications(applications, params) -> applies job, status, withdrawal, name search
    ├─► sortApplications(filtered, sort) -> newest (DESC) or oldest (ASC)
    └─► paginateApplications(sorted, page, pageSize) -> items, total, totalPages, page
    │
    ▼
HTML Response with:
    - HRApplicationFilters (Client Component with debounced input, dropdowns, sort)
    - HRApplicationLink list (renders full_name, job_title, status, date)
    - HRApplicationPagination (renders Prev/Next and Page X of Y)
```

## Authorization and privacy impact

- Authorization: Protected by `requireHR()` on the server side. Only authenticated HR users can access `/hr/applications` or view submitted applications.
- Privacy: `full_name` is an existing field in the `applications` table collected during application submission. Exposing `full_name` to HR within their authenticated review view is appropriate and within existing role boundaries (SEC-001). No applicant data is leaked to unauthorized users or unauthenticated visitors.

## Failure behavior

| Failure / adversarial input                                              | Observable outcome / state guarantees                                                                  | Verification                                   |
| ------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------ | ---------------------------------------------- |
| Malformed or overlong search query (`> 100` chars or control characters) | Parser marks query invalid or trims/sanitizes safely without throwing. Safe empty results or fallback. | Unit tests in `hr-application-filters.test.ts` |
| Negative or non-numeric `page` param                                     | Safely falls back to `page = 1`.                                                                       | Unit tests in `hr-application-filters.test.ts` |
| `page` beyond `totalPages`                                               | Displays empty page or clamps to last page gracefully without crash.                                   | Unit tests in `hr-application-filters.test.ts` |
| Invalid job ID or review status                                          | Safely falls back to no filter (`all`).                                                                | Unit tests in `hr-application-filters.test.ts` |
| Supabase query failure                                                   | Displays existing standard error banner: "Review data is temporarily unavailable. Try again later."    | Existing page error handling preserved         |

## Migration and backward compatibility

- Schema: No database schema migration required. The `applications` table already contains `full_name`, `job_id`, `review_status`, `withdrawn_at`, and `submitted_at`.
- Backward compatibility: Visiting `/hr/applications` with no query parameters works seamlessly with default parameters (`withdrawal=active`, `sort=newest`, `page=1`).

## Rollout and rollback

- Rollout: Merged to `develop` after local test suite, type check, lint, and independent review.
- Rollback: Revert the PR commit; no database migrations to roll back.

## Review and unresolved decisions

- [x] Interfaces and requirement IDs agree with the deltas and proposal.
- [x] Security, failure, migration, rollout and rollback impacts assessed or justified N/A.
- Human approval: John (student owner); approved in chat on 2026-10-16.
