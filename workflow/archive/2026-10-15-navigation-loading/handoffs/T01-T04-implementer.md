# Implementer handoff: issue #83, T01–T04

- Issue/task/dependencies: [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83); [approved packet](../proposal.md), [design](../design.md), [plan](../plan.md).
- Human accountable owner: Paul Cheng; approved proposal, both deltas, design, plan and branch on 15 October 2026.
- Assignment: root Codex implementer, 15 October 2026. Model/run identifier not independently available in the record.
- Goal/scope: Search submit feedback and link-local feedback for Apply and real return-to-Careers links; no server, database, role, AI or deployment changes.
- Baseline: `f65f699ff2de76466e6cf374011119aec2414a91` on `feat/83-navigation-loading`; changes remain uncommitted. Open PR #82 is not included. Unrelated untracked profile/résumé packet was not touched.
- Acceptance IDs: UI83-AC-01 through UI83-AC-04; JOB-004 and proposed OVR-005.
- Changed implementation: `src/components/job-listing-filters.tsx`, new `pending-link-status.tsx`, shared Back/Auth return links, Apply link, and the audited direct Careers return links in Applicant/HR application list, job not-found and error pages.
- Changed evidence/docs: focused unit/browser tests, User/Developer guides, this packet and dated summaries.

## Test-first and final checks

| Check                                                                                                                                    | Actual result                                                                                                                             | Limit                                                                                    |
| ---------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Focused unit tests before code                                                                                                           | Three navigation/Search expectations failed for missing feedback; separate Apply assertion failed. These were intended behavior failures. | Test-first evidence, not a production incident.                                          |
| `node node_modules/vitest/vitest.mjs run tests/unit/navigation-loading.test.tsx tests/unit/public-job-pages.test.tsx`                    | Passed 16/16 after implementation.                                                                                                        | Focused component/server markup coverage.                                                |
| `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/navigation-loading.spec.ts tests/e2e/job-search.spec.ts` | Final combined rerun passed 12/12 against local Next and Supabase, including superseded Search and route-failure document fallback.       | Synthetic local data; not Vercel latency.                                                |
| Hard-failure probe aborting both RSC and document Careers requests                                                                       | Failed: source page remained mounted with “Opening roles…” for 20 seconds. A temporary React timeout did not fire and was removed.        | Open P2 under currently approved OVR-005; see independent review and proposed amendment. |
| `corepack pnpm exec tsc --noEmit`; scoped ESLint; scoped Prettier                                                                        | Passed after extracting a Search button component and formatting touched files.                                                           | Static checks.                                                                           |
| `corepack pnpm build`; `git diff --check`                                                                                                | Passed; Next production build completed.                                                                                                  | Does not establish hosted deployment.                                                    |

The link indicator relies on Next 16 `useLinkStatus` and shows only while a real client navigation waits. Prefetched/fast destinations may not show an intermediate frame. The search input, category and Clear remain available when the Search submit is disabled. Native hrefs and server-side role/onboarding checks remain in place. Full assistive-technology and hosted-latency checks have not run.

## Review and decision

- Implementer: root Codex; self-checks above are not independent review.
- Reviewer: separate read-only agent `/root/navigation_loading_review`; [handoff](independent-review.md) records its original P2 and independent re-review after Paul's amendment approval.
- Student acceptance: Paul separately answered “Accept with recorded limits” on 15 October 2026. No commit, push or PR authorization follows from that acceptance.

## Full coverage follow-up

Initial full coverage failed six page tests from outdated next/link mocks and one overbroad Auth assertion. After focused fixture repairs and three new Search-state cases, corepack pnpm test:unit:coverage passed 398/398 with 88.3% branch coverage (1351/1530).
