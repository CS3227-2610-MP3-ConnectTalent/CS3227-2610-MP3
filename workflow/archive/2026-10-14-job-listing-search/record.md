# #78: debounced public job search

Owner Paul; intake date 14 October 2026.
Issue: https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/78.
Branch: feat/78-job-listing-search; updated develop baseline `7bbf7af`, product v1.9.
Status: accepted with recorded limits; canonical JOB-004 synced to v1.10 before archive.

[Proposal](proposal.md) · [delta](specs/public-job-listings.md) ·
[design](design.md) · [plan](plan.md) · [tasks](tasks.md).
[Session summary](../../../logs/2026-10-14-job-search-intake.md).
[Implementation summary](../../../logs/2026-10-14-job-search-implementation.md).

## Request, authority and evidence

Paul requested a text search bar for job listings, usual debouncing, and a new branch.
This explicitly authorizes the new branch; issue creation follows repository intake.
At intake src/app/page.tsx supported only category; src/lib/jobs.ts uses a publishable
client and keyset-paginated published/category reads with stable final ordering.
Current canonical public spec has JOB-001 through JOB-003; propose unused JOB-004.

At intake, fetched origin and confirmed develop at `7bbf7af`. PR #77 was open; this new
branch starts from develop without its unrelated PDF changes. The unrelated
untracked workflow/changes/2026-10-09-profile-resume packet remains untouched.
Issue search returned no existing text-search title. Created #78 then switched to
updated develop and created feat/78-job-listing-search.

Primary Codex read intake/proposal/design skills and installed Next.js Form/router
docs. Supabase skill read for the existing reader boundary; no API/schema changes
implemented. A separate independent reviewer later ran and rechecked the code;
see the handoff below.

## Approved decisions

Search four public fields; normalized case-insensitive literal phrase up to 100
characters; category intersection; 300 ms debounce; immediate Search/Clear;
URL/history behavior and IME/latest-intent handling in design. Server filters the
complete existing paginated public result set; no DB migration or dependency.

## Gates and limits

- User new-feature/new-branch request: recorded above.
- Concrete proposal/delta/design/plan approval: Paul replied **“Approve plan and implement”**
  in chat on 14 October 2026 before implementation, covering this complete packet.
- Test-first implementation: completed; see checks below.
- Independent review: complete, one P2 fixed and independently rechecked.
- Student acceptance: Paul answered **“Accept with recorded limits”** on 14 October 2026 after the local results and independent review were presented, separately from the implementation-plan approval.
- Canonical sync: JOB-004 and the v1.10 ProductSpec/spec index were checked before archiving; no unrelated clauses changed.
- Commit/push/PR: Paul subsequently requested these in chat; hosted operations remain pending.
- No deployed behavior claim. Existing tests/results from #76 do not verify #78.

## Implementation and actual checks

Primary Codex implemented the approved packet on the uncommitted working tree
above baseline `7bbf7af`. No secrets, dependencies, DB schema or hosted settings
changed. Server reads still use publishable-key published/category pagination;
only public validated fields are matched. Result markup was extracted to retain
small page/control responsibilities. Query text is URL state, not a custom log.

| Acceptance / check             | Command / evidence                                                                                                                                                                                     | Result and limits                                                                                                                                                                                                        |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| SEARCH-01/06 red → green       | `corepack pnpm exec vitest run tests/unit/jobs.test.ts tests/unit/jobs-pagination.test.ts`                                                                                                             | Initial 9 intended failures (search ignored), 4 passed; after helper/reader implementation 13 passed. Includes final-page-only match among 501 rows.                                                                     |
| SEARCH-05 boundary red → green | `corepack pnpm exec vitest run tests/unit/public-job-pages.test.tsx`                                                                                                                                   | Initial 3 invalid-query failures, 9 passed; final 12 passed. Invalid q does not call reader.                                                                                                                             |
| SEARCH-02 UI red → green       | `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/job-search.spec.ts` with `PLAYWRIGHT_SERVER_COMMAND=corepack pnpm dev`                                                 | Initial missing-searchbox failure. First implemented journey passed. Expanded suite final 7 passed.                                                                                                                      |
| SEARCH-01–07 focused units     | `corepack pnpm exec vitest run tests/unit/job-search.test.ts tests/unit/job-filter-controller.test.ts tests/unit/jobs.test.ts tests/unit/jobs-pagination.test.ts tests/unit/public-job-pages.test.tsx` | 44 passed after review repair. Literal/Unicode/control/multiplicity validation, sorting/pagination boundaries, 300 ms fake-clock debounce, IME, immediate/cancel/history, safe loading error.                            |
| SEARCH-02–07 browsers          | Same Playwright command above                                                                                                                                                                          | 7 passed: category+clear, All/history/refresh, composition/replace, delayed older response, invalid/literal/draft/closed, 390px keyboard/status/focus, no-JS native GET. Local Chromium, not a full accessibility audit. |
| ACC-006 regression             | Playwright with `tests/e2e/required-profile.spec.ts` added to above command                                                                                                                            | 1 passed (synthetic signup/verification, blocked search URL until profile completion, uploads/autofill/sign-in). Existing guards unchanged.                                                                              |
| Typecheck / scoped lint        | `corepack pnpm exec tsc --noEmit`; scoped `eslint` on changed source/tests                                                                                                                             | Passed; initial oversized SearchForm failed lint, extracted SearchInput then passed.                                                                                                                                     |
| Production build               | `corepack pnpm build`                                                                                                                                                                                  | Passed. Local build, not Vercel runtime/rollout verification.                                                                                                                                                            |

Further failure/recheck details are preserved in the implementation summary. Local
browser timing tests use synthetic fixtures; no hosted account, AI provider or
production data is involved. No schema change: new migration/pgTAP N/A. Full
assistive-technology/cross-browser/hosted preview testing remains pending. The
existing all-row read cost remains; no scalability/load-test claim.

## Review and remaining gates

Final scoped Prettier and git diff --check passed; 90 local links across 11
packet/guide/log files resolved. Production build was rerun after the review repair
and passed, including TypeScript. The final scoped lint pass also passed. SEARCH-07
generic error UI is source-reviewed with a reader error unit, not a browser outage
test. These limits are included in the acceptance request.

Separate reviewer `/root/job_search_review` assigned on 14 October 2026 under
mp3-independent-verification; no implementation involvement.
[Review and recheck](handoffs/independent-review.md): one P2 in superseded request
tracking was fixed after two intended regression failures. Reviewer independently
ran all 44 units and found no unresolved product findings. Primary reran the
three affected browser cases (history, delayed response, invalid/Clear), all passed.
Paul's separate acceptance and canonical sync/archive are recorded below;
publication is pending at this record revision.
Revert these source/UI changes to restore category-only behavior; no data rollback
is needed. PR #77 spec-version reconciliation remains a later integration concern.

## Accepted sync and archive decision

Paul's separate acceptance source is his 14 October reply **“Accept with recorded limits”**
to the #78 acceptance question. He then requested staging, committing and a PR.
Accepted limits: no hosted preview, cross-browser, load or full assistive-technology
check; SEARCH-07 browser outage case not run; the existing all-row reader cost
remains. The initial P2 request-bookkeeping defect was repaired and separately
rechecked before acceptance. This is feature acceptance, not deployment approval.

Canonical sync happened before archive on 14 October: [public job listings](../../specs/public-job-listings.md)
added exactly one JOB-004; [ProductSpec](../../ProductSpec.md) and the [spec index](../../specs/README.md)
now report v1.10. A normalized-clause check found all six sampled approved
boundary/behavior phrases in the delta and canonical text and exactly one JOB-004.
No DB migration or other capability rule was changed. The complete packet is
archived at `workflow/archive/2026-10-14-job-listing-search/` with the reviewer
handoff, original red checks, fixes, acceptance and limitations preserved. Relative
links and session summaries were checked after the move. The commit hash and PR
number are pending until publication and do not form part of this pre-PR snapshot.
