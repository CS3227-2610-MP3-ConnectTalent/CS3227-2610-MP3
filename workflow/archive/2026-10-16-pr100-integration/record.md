# #98 / PR #100 integration and CI follow-up

- Owner: Paul Cheng; existing issue [#98](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/98), [PR #100](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/100).
- Existing branch `docs/98-mp2-lessons-quality`, head `9d0d34e`; fetched develop `60f11de` includes merged PR #96. No new branch proposed. Unrelated untracked old profile packet stays excluded.
- Request: resolve three conflicts, investigate repeated Chromium failures and assess reported 88.79% branch coverage. Concrete plan below awaits approval before integration edits. This is documentation/base integration, not a new product requirement.

## Observed evidence — 16 October 2026, Asia/Singapore

- GitHub reports PR #100 CONFLICTING. Non-working-tree `git merge-tree --write-tree HEAD origin/develop` identifies exactly `docs/UserGuide.md`, `workflow/archive/README.md`, `workflow/changes/README.md`; Developer Guide auto-merges.
- Supabase run `38915250904`, Chromium job `117020934299`, failed in **Start local Supabase and Mailpit** at 14:23:49 UTC (22:23:49 SGT). CLI output was deliberately withheld to avoid credentials; no browser assertion ran. The underlying startup cause is unknown. Database and race jobs passed separately, so do not claim a proven app/browser defect or a proven transient fix.
- PR #96 is MERGED; its final head `efa4dbd` had passing app, database, race, Chromium and product-site checks. Its 90.25% local branch result and meaningful tests are absent from PR #100's old branch. User supplied report for #100: 1,704/1,919 = 88.79%; no assertion that equal code/instrumentation was measured. Existing coverage icons are informational; app job passed. Integration and fresh results, not threshold changes or padding, are the first action.

## Proposal, design omission and plan

1. Merge fetched develop `60f11de` into the existing documentation branch without rebasing/force-pushing. Preserve all upstream runtime/tests/evals/spec/site changes and #98 documentation additions.
2. Resolve User Guide by retaining #98 schedules, active-window reapplication, frozen-history and unsaved-text advice, while keeping merged #96's separate AI preview and explicit Use/Replace policy. Combine both workflow index entries. Reconcile current checklist/guide references to #96 as merged while preserving historical audit statements with their revision context.
3. Do not edit runtime, SQL, credentials, coverage policy or CI workflow. Retain the startup failure evidence. A fresh remote CI attempt follows a separately authorized push; if startup repeats, diagnose its own infrastructure scope instead of silently adding retries or exposing raw logs.
4. Run scoped docs/content/link/format/whitespace checks, production Docusaurus build, full unit coverage and the critical local browser suite with synthetic fixtures/mocked AI. Zero additional live LLM calls; existing live budget is exhausted. Report actual coverage numerator/denominator and distinguish new results from the old report.
5. Obtain separate read-only integration review, fix/recheck findings, then request separate acceptance and archive. Record a dated summary. Commit/push only with explicit publication authorization; do not merge/release PR #100.

Separate product design/spec delta/canonical sync N/A: preserve already accepted upstream behavior and documentation corrections. This plan does not introduce application behavior or alter limits. If resolving integration requires a runtime fix, return with evidence before expanding scope.

## Acceptance evidence to collect

- INT-01: no conflict markers; all three paths reconciled; no local runtime/SQL/env/workflow/coverage-policy delta relative to merged develop.
- INT-02: guides describe preview/adoption accurately and retain #98 corrections; packet/log/index links resolve; site build succeeds.
- INT-03: actual final unit coverage and critical browser results recorded; original startup failure retained as unproven infrastructure cause; no manufactured green threshold.
- INT-04: independent review, actual human decisions and scope/privacy constraints recorded; hosted deployment/release not inferred.

Paul approved the concrete integration/check plan on 16 October 2026 (Asia/Singapore), replying **Approve integration and checks** to `call_a96x7Ck5zS4DpT74cGSR6qGr`. Existing issue/branch/accepted #98 packet reused; no commit/push/new PR/hosted change authorized for this follow-up. Merge performed with `--no-commit --no-ff`; working tree remains in an intentional pending-commit integration state.

## Tasks and actual results

- [x] INT-01: three conflict paths resolved; no unresolved index entries; `git diff origin/develop --name-only` contains only original #98 documentation/evidence paths. Runtime/tests/SQL/env/workflows/coverage policy preserved exactly from fetched develop. New follow-up record/handoff/log are evidence only.
- [x] INT-02 source: guide preview/adoption and #98 schedules/reapplication/frozen-history/unsaved-text corrections coexist. Current checklist now describes merged #96, with historical audit context preserved.
- [x] `node node_modules/vitest/vitest.mjs run --coverage`: **100 files, 609/609 tests**; branches **1,778/1,970 = 90.25%**, statements 93.29%, lines 94.37%, functions 92.99%. No policy edits. This is a new local measurement on the integrated tree, not a rewritten PR #100 report.
- [x] `node node_modules/@docusaurus/core/bin/docusaurus.mjs build` from `website/`: client/server compiled, generated build successfully.
- [x] `node node_modules/typescript/bin/tsc --noEmit`: passed. Scoped Prettier, staged/unstaged whitespace and 114 local documentation link targets passed. No unmerged index entries remain.
- [x] Separate read-only [integration review](handoffs/independent-review.md): no blockers; independently checked scoped formatting/whitespace and no runtime delta. Runtime suites are coordinator runs, not reviewer executions.
- [x] INT-03 critical browser result: **12/12 passed**, zero skipped, exit 0, 3.2 minutes. Command uses `PLAYWRIGHT_BASE_URL=http://localhost:3000`, `PLAYWRIGHT_SERVER_COMMAND=node node_modules/next/dist/bin/next dev --port 3000`, `node --env-file=.env.local node_modules/@playwright/test/cli.js test`, and all eight files from `test:e2e:critical`; ignored output `test-results/pr100-integration-critical`. Full withdrawal 37.5 seconds and profile/resume 27.4 seconds passed. No raw env values or provider calls.
- [x] Final scope comparison: `git diff --exit-code origin/develop -- src tests supabase package.json pnpm-lock.yaml vitest.config.ts .github/workflows next.config.ts website/package.json website/docusaurus.config.ts` passed with no output; no new local changes in those paths.
- [x] Paul separately accepted with recorded limits and authorized commit/push to PR #100 on 16 October 2026 (Asia/Singapore), replying **Accept and commit/push to PR #100** to `call_Dkd2hPcDhyHKOssypr33pjHn`. Complete packet archived afterward; canonical sync N/A for documentation/base integration.
- [ ] Commit/push are now explicitly authorized; execution and remote CI rerun remain pending at this pre-publication record. The original Supabase startup failure remains recorded with unknown underlying cause. Repository merge/release require separate decisions.

Session: [dated summary](../../../logs/2026-10-16-pr100-integration.md). Rollback: abandon the uncommitted merge only if requested, preserving approved follow-up evidence and unrelated untracked work; no database rollback. After publication, a reviewed documentation revert/base integration decision is separate from release rollback. Hosted parity and full accessibility remain unverified.
