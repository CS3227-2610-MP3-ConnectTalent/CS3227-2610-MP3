# API and collection pagination audit

Audit baseline: PR #69 head `18a022e`, 2026-10-13. Final source audit includes both the initial response-cap fix and the mutable-collection keyset correction.

## Route handlers

| Route file                                      | Methods   | Returns a collection?                         | Pagination |
| ----------------------------------------------- | --------- | --------------------------------------------- | ---------- |
| `src/app/api/profile/resume/route.ts`           | GET, POST | No; one résumé or one mutation result         | N/A        |
| `src/app/api/applications/[id]/resume/route.ts` | GET, POST | No; one application résumé or mutation result | N/A        |
| `src/app/api/jobs/[id]/resume/route.ts`         | POST      | No; one résumé upload action                  | N/A        |
| `src/app/api/ai/applicant-draft/route.ts`       | POST      | No; one validated draft                       | N/A        |
| `src/app/api/ai/hr-summary/route.ts`            | POST      | No; one validated summary                     | N/A        |
| `src/app/auth/callback/route.ts`                | GET       | No; redirects after auth callback             | N/A        |

No collection API endpoint exists in this branch.

## Collection reads

| Function                    | Consumer                     | Baseline  | Final result                                                                                                       |
| --------------------------- | ---------------------------- | --------- | ------------------------------------------------------------------------------------------------------------------ |
| `listPublishedJobs`         | public home page             | unbounded | 500-row keyset pages by ID; restores `published_at DESC, id DESC`; tested across 501 rows and an inter-page insert |
| `listOwnApplications`       | Applicant application list   | unbounded | 500-row keyset pages by ID; restores `updated_at DESC, id DESC`                                                    |
| `listHRJobs`                | HR job list and dashboard    | unbounded | 500-row keyset pages by ID; restores `created_at DESC, id DESC`; tested across 501 rows                            |
| `listSubmittedApplications` | HR review list and dashboard | unbounded | 500-row keyset pages by ID; restores `submitted_at DESC, id DESC`; tested across 501 rows                          |
| `listHRNotes`               | HR application detail        | unbounded | 500-row keyset pages by ID; restores `created_at ASC, id ASC`                                                      |
| `listHRStatusEvents`        | HR application detail        | unbounded | 500-row keyset pages by ID; restores `created_at ASC, id ASC`                                                      |

`fetchAllPages` in `src/lib/supabase/pagination.ts` advances with an exclusive `id > cursor` filter and an ordered `id ASC` query with a 500-row limit. It validates strict cursor progress, requests an empty terminal page for exact page-size multiples, and throws on any page error. Each caller maps a query error to its existing generic error; no partial collection is returned. `tests/unit/jobs-pagination.test.ts` verifies the Supabase client sends ID cursor filters and no offset, and that an insert before the cursor does not duplicate the boundary row.

No route handler returns a collection, so route-level pagination is N/A. No page controls or response-shape changes were introduced. The data readers restore their pre-change timestamp/ID order after collecting keyset pages. Keyset paging avoids offset boundary shifts but does not provide a shared snapshot across HTTP requests.

Single-row profile/job/application/resume reads, mutations, Storage operations, and AI provider requests are excluded because they do not return collections.
