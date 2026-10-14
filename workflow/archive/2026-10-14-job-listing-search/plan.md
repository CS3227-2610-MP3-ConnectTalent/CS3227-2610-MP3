# Plan: #78 job listing search

Owner Paul; approved in chat, 14 October 2026. Branch feat/78-job-listing-search.
Inputs: [proposal](proposal.md), [design](design.md), [JOB delta](specs/public-job-listings.md).
Primary Codex performs bounded implementation after concrete approval.
Independent review runs separately after implementation; see record for actual assignment.

| Task | Depends on          | Files / outcome                                                                                                                                        | Verification                                                                                                                                  |
| ---- | ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| T00  | Intake              | Record Paul's approval of proposal/delta/design/plan                                                                                                   | Actual chat decision                                                                                                                          |
| T01  | T00                 | src/lib/job-search.ts; src/lib/jobs.ts; unit matcher/query and jobs-pagination tests                                                                   | Observe intended red, then green for SEARCH-01/02/05/06; literal punctuation, Unicode/whitespace, invalid arrays, complete paginated matches  |
| T02  | T01                 | src/app/page.tsx; src/components/job-listing-filters.tsx; optional use-job-listing-filters.ts and job-listing-results.tsx; existing Input/Button reuse | Test-first page/control cases; invalid query skips reads; category+search links; labelled form                                                |
| T03  | T02                 | tests/e2e/job-search.spec.ts and focused support fixture if needed; existing listing and onboarding checks                                             | Debounce, Enter, IME, rapid typing/category and delayed responses, history/refresh, no-JS Search, clear, empty, keyboard/mobile; SEARCH-02–07 |
| T04  | T03                 | docs/UserGuide.md and docs/DeveloperGuide.md; bounded test/source fixes                                                                                | Focused unit/browser, typecheck, scoped lint/format, build, diff/link checks; document actual red/green/limits                                |
| T05  | T04                 | handoffs/independent-review.md                                                                                                                         | Separate review of final diff, search semantics, access, async behavior and meaningful tests; fix/recheck findings                            |
| T06  | T05                 | record.md                                                                                                                                              | Separate Paul acceptance with limits; no inferred decision                                                                                    |
| T07  | T06                 | canonical public spec/ProductSpec/index; packet archive/current indexes; dated logs                                                                    | Sync accepted deltas first, version reconciliation, full archive, links and truthful evidence                                                 |
| T08  | T07 + authorization | Git commit/push/PR into develop                                                                                                                        | Paul explicitly requested publication after accepting #78; repository template and issue closure required                                     |

Allowed source/test/doc files are listed above, plus new focused search unit tests
under tests/unit/. Preserve unrelated packets, all #76 branch work, AI features,
application workflow and personal reflections. Test fixture setup may use existing
local Supabase synthetic helpers; no hosted reads/writes or reset authorized.

No new DB policy/schema means migration and new pgTAP cases N/A. Published-only
reader and onboarding regressions remain required. Use targeted tests; broaden
only for a concrete failure/risk. Read installed Next.js guides before writing
navigation code and current Supabase docs if query API changes are necessary.

Actual check outcomes and failures are in record.md and the implementation summary.
No acceptance or deployment is inferred from those results.
