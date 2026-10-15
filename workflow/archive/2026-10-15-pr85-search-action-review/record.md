# PR #85 review follow-up: Search pending state

- Issue/PR: [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83), [PR #85](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/85)
- Owner: Paul Cheng; requested assessment and, if warranted, repair of the quoted Codex review finding in this conversation on 15 October 2026.
- Requirement: existing [JOB-004](../../specs/public-job-listings.md) explicit Search pending clause. No new product requirement, role policy, API, schema or deployment operation.
- Source: GitHub review comment `discussion_r4278637469`, quoted by Paul. The root inspected the current local source and confirmed that generic transition/history pending is passed to the Search button, including non-Search navigation.

## Bounded repair plan and design

1. Add a failing focused test showing that generic route/history pending retains the results announcement but leaves the Search button idle, and that an explicit Search is the only action that marks it busy.
2. Track explicit Search request state in the existing job filter controller. Clear it on confirmation or newer input/category/Clear/history intent; keep the generic transition/history state for the results-level announcement. Preserve no-JavaScript form submission and the existing debounce/history rules.
3. Run focused unit and delayed browser checks, typecheck, lint and format checks. Request separate read-only review, then record actual limits and obtain Paul's separate acceptance before any spec sync/closeout. No commit or push without Paul's explicit instruction.

This repair follows the already accepted JOB-004 contract and the user's direct instruction to make the change if the review finding applies. The earlier design's choice to use generic `useTransition` for the button is superseded only for that button; the results-level pending state stays as designed.

## Evidence and outcome

- Reproduction: before the repair, `corepack pnpm exec vitest run tests/unit/navigation-loading.test.tsx tests/unit/job-filter-controller.test.ts` failed 3/21 cases. A non-Search transition and history restoration showed “Searching…”; the controller lacked an explicit Search method.
- Repair: `JobFilterController.search()` marks only a launched explicit request. Confirmation or a newer edit, category, Clear or history intent clears that state. `JobListingFilters` uses it for the Search button while leaving generic result progress unchanged. Native GET form behavior remains available without JavaScript.
- Focused unit rerun: 21/21 passed. Full `corepack pnpm test:unit`: 404/404 passed. `corepack pnpm typecheck`, scoped ESLint, scoped Prettier and `git diff --check` passed.
- Browser: the first Playwright invocation printed both selected delayed Search/debounce scenarios as passed, but its owned Windows dev-server process remained open and the command was interrupted. A second run against an already running local dev server exited successfully with both scenarios passed (2/2). The separate dev server was stopped afterward.
- Independent review: separate read-only `/root/pr85_search_review` execution inspected the code, spec and tests; it found no blocking source issue and independently reran 21/21 focused unit tests plus `git diff --check`. It did not execute browser tests. The reviewer identified this evidence section as pending; it is now updated.
- Human acceptance: after receiving the concrete repair and checks, Paul separately requested “can u commit and psuh” in this conversation on 15 October 2026. This is acceptance of the reviewed local repair with the limits below and authorization to update the existing PR #85 branch; it is not a PR merge or release decision.
- Canonical sync: N/A for a new delta. The accepted JOB-004 clause already requires action-specific feedback for explicit Search and permits newer intent. The repair makes implementation match that existing clause; v1.13 remains the integrated branch baseline.
- Limits: category/Clear/history non-Search states have focused unit/controller coverage but no new browser delay case; hosted latency and full accessibility remain pending. Commit, push, PR merge and deployment results must be recorded only after they occur.

[Dated session summary](../../../logs/2026-10-15-pr85-search-review-followup.md).
