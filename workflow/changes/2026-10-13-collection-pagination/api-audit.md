# API and collection pagination audit

Audit baseline: PR #69 head `18a022e`, 2026-10-13. Final source audit complete after the local pagination implementation.

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

| Function                    | Consumer                     | Baseline  | Final result                                                               |
| --------------------------- | ---------------------------- | --------- | -------------------------------------------------------------------------- |
| `listPublishedJobs`         | public home page             | unbounded | 500-row ranges; order `published_at DESC, id DESC`; tested across 501 rows |
| `listOwnApplications`       | Applicant application list   | unbounded | 500-row ranges; order `updated_at DESC, id DESC`                           |
| `listHRJobs`                | HR job list and dashboard    | unbounded | 500-row ranges; order `created_at DESC, id DESC`; tested across 501 rows   |
| `listSubmittedApplications` | HR review list and dashboard | unbounded | 500-row ranges; order `submitted_at DESC, id DESC`; tested across 501 rows |
| `listHRNotes`               | HR application detail        | unbounded | 500-row ranges; order `created_at ASC, id ASC`                             |
| `listHRStatusEvents`        | HR application detail        | unbounded | 500-row ranges; order `created_at ASC, id ASC`                             |

`fetchAllPages` in `src/lib/supabase/pagination.ts` uses Supabase's inclusive ranges, appends pages in order, requests an empty terminal page for exact page-size multiples, and throws on any page error. Each caller maps a query error to its existing generic error; no partial collection is returned. The installed Supabase JS client serializes ranges as `offset`/`limit` parameters, verified by `tests/unit/jobs-pagination.test.ts`.

No route handler returns a collection, so route-level pagination is N/A. No page controls or response-shape changes were introduced.

Single-row profile/job/application/resume reads, mutations, Storage operations, and AI provider requests are excluded because they do not return collections.
