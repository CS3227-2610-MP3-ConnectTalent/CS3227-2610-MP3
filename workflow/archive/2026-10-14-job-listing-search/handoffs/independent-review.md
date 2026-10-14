# Independent review: #78 job listing search

- Human owner: Paul. Date: 14 October 2026.
- Implementer: primary Codex `/root`, working tree above develop `7bbf7af`.
- Reviewer: separate `/root/job_search_review` invocation; no implementation edits.
- Inputs: approved proposal/JOB-004 delta/design/plan, code/tests/guide diff and actual local results.
- Scope: SEARCH-01–07; public/published reader, query boundaries, pagination, controller/UI/history, no-JS and onboarding evidence.
- Exclusions: private environment values, hosted operations, unrelated #76 and untracked profile/résumé packet. Exact model identity not recorded.
- Reviewer was asked to inspect and report, not approve implementation or student acceptance.

## Findings and repair

**P2, resolved — Superseded requests prevented unchanged-search suppression.**
The initial controller tracked all requested URLs. If Next cancelled an older
request, its entry remained after the latest response, so repeated Search on the
same confirmed filter unnecessarily navigated and read all jobs again. Reviewer
independently reproduced four navigation calls where two were expected.

Primary added two failing regressions: superseded request never acknowledges
(four versus two calls), and return to the confirmed filter while a request is
pending (three versus two). Replaced the set with latest-request tracking and
acknowledgement clearing. Both regressions then passed.

Reviewer independently inspected the fix and reran:

```text
corepack pnpm exec vitest run tests/unit/job-search.test.ts tests/unit/job-filter-controller.test.ts tests/unit/jobs.test.ts tests/unit/jobs-pagination.test.ts tests/unit/public-job-pages.test.tsx
```

**44 passed across five files.** Reviewer reported the P2 resolved and no unresolved
product findings. Initial review independently ran the prior 42-test suite too.
Reviewer also requested stale packet approval/test wording and final counts be
reconciled; primary updated these to match actual approval, checks and this return.

## Evidence and limits

No additional authorization, published-only visibility, query-injection, pagination,
GET fallback or onboarding defect found in source review. Primary supplied seven
search browser journeys plus one onboarding journey; after the repair, primary
reran three affected browser cases (history/refresh, delayed response, invalid
URL/Clear), all passed. Reviewer did not independently rerun browsers/build.

Generic read-error presentation is source-reviewed plus reader unit coverage;
not a browser outage test. Hosted, cross-browser, performance and full assistive-
technology checks remain pending. Canonical sync/archive waits for Paul's separate
acceptance. This review does not authorize commit, push, PR, migration or release.
