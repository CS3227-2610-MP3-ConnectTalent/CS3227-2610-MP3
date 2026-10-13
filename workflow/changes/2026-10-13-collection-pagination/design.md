# Design: complete collection reads with Supabase ranges

- Issue: [#70](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/70)
- Related: #68 / PR #69 HR dashboard; current branch `feat/68-hr-dashboard`
- Owner: John Wong; implementation authorized by his 2026-10-13 request
- Product delta: none; no change to list response shapes or existing UI behavior

## Audit

Current App Router route handlers:

| Route                           | Methods / result                                                                             | Pagination decision                |
| ------------------------------- | -------------------------------------------------------------------------------------------- | ---------------------------------- |
| `/api/profile/resume`           | `GET` returns one private résumé; `POST` mutates one résumé and returns its current metadata | N/A: one resource / action         |
| `/api/applications/[id]/resume` | `GET` returns one application résumé; `POST` uploads or removes one résumé                   | N/A: item-scoped resource / action |
| `/api/jobs/[id]/resume`         | `POST` uploads one application résumé for a job                                              | N/A: item-scoped action            |
| `/api/ai/applicant-draft`       | `POST` returns one validated draft                                                           | N/A: one bounded result            |
| `/api/ai/hr-summary`            | `POST` returns one validated summary                                                         | N/A: one bounded result            |
| `/auth/callback`                | Auth callback exchanges a code and redirects                                                 | N/A: redirect                      |

No route handler returns a collection. The collection surfaces are server-rendered pages backed by these unbounded list reads:

| Data function               | Consumer                          | Decision                                        |
| --------------------------- | --------------------------------- | ----------------------------------------------- |
| `listPublishedJobs`         | Public home page                  | Paginate all published jobs                     |
| `listOwnApplications`       | Applicant applications page       | Paginate the signed-in Applicant's applications |
| `listHRJobs`                | HR jobs page and dashboard        | Paginate all HR-visible jobs                    |
| `listSubmittedApplications` | HR application list and dashboard | Paginate all HR-visible submitted applications  |
| `listHRNotes`               | HR application detail             | Paginate application notes                      |
| `listHRStatusEvents`        | HR application detail             | Paginate status history                         |

Single-row `maybeSingle()` reads, Storage download/upload/remove calls, AI generation calls, mutations, and the auth callback are not collection reads.

## Query behavior

Add a shared server-side helper that calls a supplied ordered page query with inclusive 0-based offsets. Use a page size of 500, below the configured Data API cap of 1,000. Append each page and stop when a page is shorter than 500; if the row count is an exact multiple, request one empty terminal page. Propagate any page error so callers return their existing generic error and never a partial collection.

Every page uses a stable two-column order: its existing date column followed by unique `id` (same direction). Keep all existing filters, selects, RLS-scoped clients, schemas, and caller-facing return types. The public job reader continues using the publishable key and published-job filter.

## Risks, failure, and rollback

- Offset pagination can observe concurrent inserts/deletes between requests; deterministic ordering prevents tie instability, but it is not a database snapshot. The pages are request-local and read-only; no stronger snapshot or cross-request consistency guarantee is added.
- Query cost grows with the number of pages. The 500-row bound keeps each response below the configured API cap.
- Any later-page error rejects the whole read and follows current generic error handling.
- Rollback is a code revert; there is no migration, persistent state, or API contract change.
