# PR #96 browser repair and meaningful branch tests

- Issues: [#94](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/94), [#95](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/95); existing PR [#96](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/96).
- Owner: Paul Cheng. Baseline `8ae7343`, existing branch `feat/94-95-ai-security-evals` checked out in `.worktrees/pr96-ci-coverage`. The original workspace remains on `docs/98-mp2-lessons-quality`; its accepted uncommitted docs and unrelated old profile packet are preserved. No new branch was created.
- User requested additional meaningful branch tests and repair of PR #96's failed Chromium check. Paul approved the concrete repair/coverage plan on 16 October 2026 (SGT), replying “Approve repair and test plan” to `call_YjEVUBnStGodDTDM4BPyqK4e`. No commit/push/PR/hosted or live-provider operation authorized.

## Observed cause and evidence

GitHub Supabase CI run `38907869478`, Playwright job `116995929701`, failed `application-withdrawal.spec.ts` on the initial attempt and both retries: expected cover letter `Synthetic AI-assisted letter`, received empty. The supporting `saveApplicationDraft` helper still clicks Generate and expects immediate replacement, omitting the explicit preview adoption required by accepted AID-002. Source inspection supports a stale test expectation; no timing diagnosis or weakened product policy is proposed. Ten other critical cases passed in that run; database and race jobs passed.

Successful unit CI run `38907869677` artifact `vitest-reports-1` (110,985 bytes, not expired) records branch coverage **1,750/1,970 = 88.83%**. Actual uncovered branches include AI preview controls (0/4), Applicant route failure paths (21/30), HR route failure paths (28/39), bounded provider body absence and HR excerpt/empty-source handling. Select cases for observable behavior; do not mock impossible states just to tick counters or change thresholds/exclusions.

## Concrete proposal and plan

1. Reproduce the current withdrawal browser failure locally on this unchanged PR branch, using synthetic local Supabase fixtures and mocked AI. No shared database reset or hosted test. Keep the observed CI failure if infrastructure prevents local reproduction.
2. Repair the withdrawal helper to assert the separate preview, assert the letter remains unchanged before adoption, click Use this draft, then continue the existing private résumé/withdrawal lifecycle assertions. Keep timeouts/retries/assertion strength; audit all other Generate-draft helpers for the same omission. Split helpers if necessary for source-size rules.
3. Include the dedicated `ai-draft-adoption.spec.ts` journey in the critical PR browser script so explicit adoption is covered on each PR, not only full scheduled runs.
4. Add focused unit cases for preview Use/Replace labels, busy/blank adoption controls and edit/discard callbacks; Applicant/HR malformed-body/unavailable-target/provider-disabled/reservation-failure/invalid-output/final-audit/provider-throttling failures; bounded transport body absence; and valid HR long Unicode excerpts/empty sources. Assert status, no-store/error redaction, withholding, skipped provider calls and fixed human authority as relevant. Reuse existing test fixtures; no new runtime behavior.
5. Run focused tests, full unit coverage with the original V8 include/report policy, offline 48-case evals, typecheck, scoped lint/format and the full critical Chromium selection. Compare actual covered/total branches to the exact CI baseline and disclose OS/instrumentation differences. Aim for useful improvement, not a guaranteed cosmetic percentage; no live evaluation calls.
6. Obtain separate read-only review, fix/recheck findings, present results for separate student acceptance and archive the no-product-delta follow-up. Commit/push only after a later explicit instruction; this work does not create another PR automatically.

## Scope and design omission

Allowed: test fixtures/unit/browser tests, critical browser test script in `package.json`, this packet/workflow indexes and dated logs. Excluded: application/server/SQL behavior, env/keys, deployment, threshold changes, personal reflections, #98 docs, new model calls and new branches. This restores/tests accepted AID-002 and SEC-006/007/010; no requirement delta or architecture change, so separate design/canonical sync is N/A. If reproduction shows a product defect or a changed contract is needed, return with that evidence before expanding scope.

## Acceptance criteria

- TC-01: withdrawal journey exercises preview/no implicit replacement/adoption and completes its original retained-withdrawal/private-file checks; original failure and recheck are recorded.
- TC-02: dedicated adoption journey runs in critical PR selection with no skipped synthetic tests silently called passed.
- TC-03: new meaningful denial/failure/UI branches pass and coverage change is measured without instrumentation-policy changes, ignored branches, model calls or removed assertions.
- TC-04: source/data/privacy boundaries and #98 work are preserved; checks, reviewer independence and human decisions remain explicit.

## Actual tasks and checks

- [x] TC-01 RED: unchanged withdrawal test reproduced locally on Windows/Node 24 using Webpack at port 3011, failing after 41.5 seconds with the same empty cover-letter assertion. The initial Turbopack attempt stopped before the test because the shared node_modules junction leaves its filesystem root; this was a worktree tooling limitation, not a product failure.
- [x] Repair helper with preview, unchanged letter, explicit adoption and adopted-letter assertions; retain all original lifecycle/privacy assertions. Audit found the Applicant and application-details helpers already adopt previews correctly.
- [x] TC-02: add dedicated adoption journey to `test:e2e:critical`; final full critical run passed 12/12, including adoption, with no skipped fixtures.
- [x] TC-03: four focused unit files initially passed 41 tests; final focused rerun passed 42 tests; full V8 coverage passed 609 tests across 100 files. Branches **1,778/1,970 = 90.25%**, versus CI baseline **1,750/1,970 = 88.83%**: 28 additional covered branches with equal totals. Windows local and Linux CI are different environments; a remote rerun is pending. Lines 94.37%, statements 93.29%, functions 92.99%. No include/exclude/threshold changes.
- [x] `node node_modules/vitest/vitest.mjs run --config vitest.ai-evals.config.ts`: 48/48 offline cases passed; zero live calls.
- [x] `node node_modules/typescript/bin/tsc --noEmit`: passed. Scoped ESLint on all five changed/new test files: passed.
- [x] Full critical Chromium recheck: **12/12 passed**, exit 0, 2.9 minutes, using normal Turbopack/default port and local dependencies. Repaired withdrawal passed its complete original lifecycle (37.6 seconds); dedicated adoption and profile/resume journeys passed. Final scoped Prettier and evidence links passed; `git diff --check` passed with only CRLF notices.
- [x] Separate read-only [independent review](handoffs/independent-review.md) returned with no blocking source finding. One low Unicode fixture weakness was fixed with exact surrogate-cutoff assertions and independently rechecked (4/4); final full 609-test rerun retained 90.25% branches. Reviewer did not author tests; mocked/unit limits remain recorded.
- [x] Paul separately accepted with recorded limits on 16 October 2026 (Asia/Singapore), replying **Accept with recorded limits** to `call_WynfZAYqfrAboIlmkt6mDtfF`. Canonical sync N/A: no product delta. Complete packet archived after acceptance; commit/push remain unauthorized.

The browser invocation loads the root local env without copying or displaying it, uses `PLAYWRIGHT_BASE_URL=http://127.0.0.1:3011` and `PLAYWRIGHT_SERVER_COMMAND=node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3011`, then runs the exact eight critical files through `node --env-file=C:/Projects/CS3227-2610-MP3/.env.local node_modules/@playwright/test/cli.js test`. Original RED artifacts are ignored under `test-results/pr96-red-browser-webpack`; green artifacts use `test-results/pr96-green-critical`. Synthetic accounts are created/cleaned by the existing fixtures. Database/production/hosted/provider settings were not changed. A production build is N/A for this test/script-only repair; the baseline CI build passed, and no new build result is claimed.

Session evidence: [dated summary](../../../logs/2026-10-16-pr96-browser-coverage.md).

## Browser follow-up attempts

The complete eight-file critical run at port 3011 exited 1: **8 passed, 4 failed**, zero skipped. The dedicated adoption, anonymous AI denial, client signup mismatch, HR review, HR dashboard and three listing cases passed. Failures: no-JavaScript signup hardcodes `localhost:3000`; confirmation mail redirects to the default `localhost:3000`; withdrawal passed the repaired AI assertions but then lost the initial résumé download after a Next dev `Manifest file is empty` error; profile résumé upload returned `Request not allowed`. The latter origin rejection is consistent with the default application URL using port 3000; the manifest/upload failure is not proven to share that cause. These failures are not relabelled as passing or fixed by weaker checks.

A fresh isolated run at the unoccupied default `http://localhost:3000`, using `next dev --webpack --port 3000`, tested withdrawal and dedicated adoption without concurrent unit coverage: **1 passed, 1 failed**, exit 1. Adoption passed again; withdrawal passed the repaired AI steps then failed initial résumé download, with the UI reporting PDF checking temporarily unavailable. This does not establish a passing lifecycle. Original artifacts remain under the ignored `test-results/pr96-green-critical`; isolated results use `test-results/pr96-isolated-withdrawal`.

To remove the worktree tooling constraint, inspected the exact node_modules junction and deleted only that verified junction nonrecursively, retaining root dependencies. `corepack pnpm install --offline --frozen-lockfile --ignore-scripts` then installed 649 packages locally with no downloads or lockfile change. The normal Turbopack critical recheck uses `PLAYWRIGHT_BASE_URL=http://localhost:3000`, `PLAYWRIGHT_SERVER_COMMAND=node node_modules/next/dist/bin/next dev --port 3000`, and the same eight test files; output `test-results/pr96-turbopack-critical`. **12/12 passed**, exit 0, 2.9 minutes. No product/runtime config changes were made to accommodate local tooling.

## Final readiness and limits

Publication authorization: Paul explicitly requested **commit and push, create PR** on 16 October 2026 (Asia/Singapore), after accepting the follow-up. PR #96 was verified OPEN with head `feat/94-95-ai-security-evals` and base `develop`; publish this repair there and update its evidence instead of opening a duplicate. Commit/push execution is pending at this pre-publication record; remote checks, merge and release remain separate.

TC-01–04 have local check/source evidence above; independent review has no unresolved blocking source finding. Passing the final run does not erase the earlier failed attempts. Local Linux/Vercel and remote CI reruns remain unverified; tests use synthetic data and mock AI and do not establish model quality or hosted behavior. Existing live evaluation limits remain unchanged. Main workspace status still contains the original #98 documentation changes and old profile packet, untouched by this repair. No product/schema/credentials/reflection changes, no canonical delta, no new model calls. Paul accepted with recorded limits via `call_WynfZAYqfrAboIlmkt6mDtfF` on 16 October 2026 (Asia/Singapore). Complete packet archived at `workflow/archive/2026-10-16-pr96-browser-coverage/`; canonical sync is N/A for this test-only follow-up. Commit/push, remote CI rerun, merge and release remain pending.
