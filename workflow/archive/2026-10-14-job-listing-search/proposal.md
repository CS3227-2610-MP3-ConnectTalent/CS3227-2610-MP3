# Proposal: debounced public job search

- Issue: [#78](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/78).
- Owner: Paul. Date: 14 October 2026. Status: approved for implementation and separately accepted with recorded limits.
- Baseline: develop `7bbf7af`, [ProductSpec](../../ProductSpec.md) v1.9.
- Branch: `feat/78-job-listing-search`, explicitly authorized in Paul's request.
- Classification: bounded product addition; proposed JOB-004, preserving JOB-001/002/003, ACC-006 and SEC-001.

## Intent and scope

Visitors currently have category filtering only. Add a labelled text search above
the results, usable with categories, without changing the single-employer scope.
Propose case-insensitive literal phrase matching in title, team, description or
requirements. Trim/collapse whitespace in query and searchable text; maximum
100 Unicode characters after normalization. No stemming, ranking, spelling fixes,
AI, résumé/private-data search, schema migration or new dependency.

Typing applies after 300 ms of inactivity. Enter or Search applies immediately.
Clear search clears only text immediately; All roles clears only category and
retains text. Search and category persist in URL `q` and `category`. Debounced
edits replace history; explicit Search/category/Clear actions create meaningful
history entries only when the destination differs. Back/forward and refresh restore
the committed query/category. Do not submit mid-IME composition. Preserve focus
and page scroll while typing.

Guests, complete Applicants and HR retain existing public browsing. Incomplete
signed-in Applicants still go to My profile. No HR management UI or AI changes.

## Acceptance scenarios

| ID        | Given / When / Then                                                                                                                                                                      | Evidence                                          |
| --------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------- |
| SEARCH-01 | Published roles with a phrase in each public field; search with different case/whitespace; matching roles appear in current published-date/ID order                                      | Pure matcher and data-reader tests                |
| SEARCH-02 | Selected category and text; only jobs matching both appear; Clear retains category and All roles retains text                                                                            | Unit and browser                                  |
| SEARCH-03 | Rapid input; one update after 300 ms; Enter applies immediately and cancels timer; IME composition never submits early                                                                   | Timer/controller and browser tests                |
| SEARCH-04 | Shared URL, refresh and browser back/forward; input, category, counts and results agree; pending older work cannot restore old state after newer input/category/unmount                  | Browser including delayed navigation              |
| SEARCH-05 | Empty/blank search; ordinary category results; no matches; explicit empty message and clear control; duplicate/overlong/control-character query; safe invalid-input feedback and no jobs | Query/page and browser tests                      |
| SEARCH-06 | Draft/closed matches, later database pages and incomplete Applicant; only all eligible published matches appear; onboarding remains enforced                                             | Reader/pagination, listing/onboarding regressions |
| SEARCH-07 | Keyboard/mobile use and loading/error; labelled search, focus retained, status announcement and no horizontal overflow; read failure has generic feedback                                | Browser and independent review                    |

## Alternatives and risks

Retain category-only: no text discovery. Browser-only filtering: simple but sends
all fetched jobs and makes URL/server consistency harder. Database full-text or
ILIKE filters: useful later, but adds escaping/index/ranking decisions for this
small scope. Proposed approach filters the already paginated public dataset on
the server with a pure literal matcher; no raw search enters SQL/PostgREST filters.
This retains the existing all-public-rows read cost. Larger catalogues need a
separate indexed-search/pagination design; debounce is not rate limiting.

Query values are ordinary public job keywords in URLs/browser history; do not add
analytics, custom query logging or private data. Pending navigation/IME/history
are the main UI risks, covered by explicit scenarios.

Dependencies: existing listings/onboarding and local Supabase synthetic fixtures.
At intake PR #77 remained open and was not a dependency. Actual implementation/test
outcomes and separate acceptance are in record.md.

Artifacts: [delta](specs/public-job-listings.md), [design](design.md),
[plan](plan.md), [tasks](tasks.md), [record](record.md).
Paul approved this complete packet before implementation, then separately accepted
the reviewed result with recorded limits on 14 October 2026. See record.md.
