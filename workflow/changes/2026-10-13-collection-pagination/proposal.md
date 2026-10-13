# Proposal: complete paginated collection reads

- Issue: [#70](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/70)
- Related review: [PR #69](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/69), HR dashboard pagination finding for #68
- Owner: John Wong (Johnwz123)
- Classification: defect restoration / data-access pagination; no new product capability

## Problem

The Supabase Data API limits each response to 1,000 rows. Several collection reads do not request ranges, so large job, application, note, or status-history collections can be silently incomplete. In particular, the HR dashboard aggregates the truncated job and submitted-application reads, which produces incorrect totals.

## Goal and non-goals

Fetch every row for existing collection reads in bounded keyset pages using stable UUID IDs while preserving the current display order, full-list return value, caller behavior, validation, and role/RLS boundaries. Fail a read as a whole if any page fails. Keyset pagination must not duplicate or skip an existing row when an earlier ID is inserted between page requests.

This does not add collection API routes, alter API response shapes, add page controls, change authorization, add a database view/RPC, or paginate single-resource/detail/action endpoints.

## Acceptance evidence

| ID        | Given / when / then                                                                                                                                         | Evidence                                                                               |
| --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| PAG-AC-01 | Given more rows than one query page, when an existing collection read runs, then it returns every ordered row using stable ID cursors.                      | Query-level tests crossing a page boundary for Applicant and HR reads and public jobs. |
| PAG-AC-02 | Given a result count exactly divisible by the page size, when it is fetched, then the reader makes a terminal empty-page request and returns each row once. | Shared pagination-helper unit test.                                                    |
| PAG-AC-03 | Given a later page fails, when a collection read runs, then it fails without returning a partial result.                                                    | Shared pagination-helper test and safe caller error tests.                             |
| PAG-AC-04 | Given an API route returns one resource, performs one action, or redirects, when audited, then no pagination is added.                                      | Route inventory in `api-audit.md` and existing endpoint tests.                         |
| PAG-AC-05 | Given a lower ID is inserted between page requests, when keyset pagination continues, then previously fetched boundary rows are not repeated.               | Shared helper and public-job query tests simulate an insertion between pages.          |

## Approval and scope

On 2026-10-13, John Wong requested that the PR review pagination finding be fixed and that all API endpoints be audited, with every endpoint/read that should be paginated updated in the same branch and PR. This packet records that explicit implementation request and bounds it to the existing collection data reads listed in `design.md`; it keeps single-resource and action endpoints unchanged.

The request authorizes implementation in the already-open `feat/68-hr-dashboard` branch and PR #69. No canonical product requirement changes because the work restores complete results for existing list operations; canonical spec sync is N/A.
