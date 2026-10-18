# #108 release history and scheduled profile test repair

- Owner: Paul Cheng. [Issue #108](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/108), blocked release [PR #107](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/107).
- Baselines: develop `1f6d87224aeb04194961919f59499f83f7fddb9d`; master `d48f6990d8148f38cda64d6693aaf3f3063bdffc`. Main workspace remains on `docs/98-mp2-lessons-quality`; unrelated untracked old profile packet must stay untouched.
- Status: Paul approved the concrete plan and branch via **Approve plan and branch**, reply to `call_sX04OlST00nYNAzfo8JIu3fM`, on 18 October 2026 (Asia/Singapore). Created `fix/108-release-history-profile-test` in `.worktrees/108-release-history-profile-test` from fetched develop `1f6d872`; unchanged master/ancestor/tree proofs rechecked. At implementation approval, commit/push remained unauthorized; later acceptance/publication authority is recorded below. Repository PR merging and deployment remain unauthorized.

## Observed diagnosis

Scheduled Supabase CI run `39105713901` on 18 October failed `profile-resume.spec.ts` (profile prefill, private PDF, submission freeze and HR access) at helper `profile-resume-journey.ts:37`. The unqualified `getByRole("status")` expected Profile saved but resolved to navigation announcements before save feedback appeared. Initial and both retries failed; **40 other tests passed**. Another identical save assertion exists in the helper. This supports a stale test selector; do not infer a broken save or remove accessible announcements. Other failures, if exposed, need their own evidence before expansion.

Read-only Git proof:

- `git rev-parse origin/master^{tree} 2bd734c^{tree}` returns identical tree **27bc59e000b6278a31310e1cc8994df6b1bcc7e4** for both.
- `git diff --shortstat origin/master 2bd734c` is empty.
- `git merge-base --is-ancestor 2bd734c origin/develop` exits 0.

Current master therefore contributes no unique file content beyond an exact development ancestor; the conflicts arise from duplicated squash ancestry, not master-only file changes. A history-only merge preserving the current develop tree is justified by those proofs. If either remote moves, recheck the proof before applying it; do not generalize to changed baselines.

## Proposal and design

Restore existing APP-006 profile save/prefill and APP-007 private PDF/snapshot verification; preserve navigation announcements, security policies and user behavior. No new product delta or canonical sync/version bump. Test behavior changes only to identify actual save feedback, never `.first()`/timeouts masking a wrong result.

Use a new **`fix/108-release-history-profile-test`** branch from updated develop in an isolated worktree. Reconcile master with a reviewed history-only merge (`git merge --no-commit -s ours origin/master`) **only after rechecking exact tree/ancestor proof**. Verify the merge changes zero files before the test/evidence repair. This deliberately retains accepted development changes while adding the already-represented master ancestry. It is not permission to discard unknown master changes, reset branches, force-push, commit directly to develop/master or merge the release PR.

Separate application architecture design is N/A because application/SQL/authorization behavior is preserved. Git-history design and permitted test repair are specified here; runtime/product fixes require evidence and approval before scope expansion.

## Ordered implementation/check plan

1. Record concrete approval and explicit branch permission; create the isolated issue branch/worktree from fetched develop, preserving other worktrees/main files. Recheck remote baselines/tree equality/ancestor proof.
2. Reproduce the unchanged failing profile browser test locally using synthetic local Supabase fixtures and normal Next dev. Preserve exact RED; if Docker is unavailable, record blocker rather than claiming reproduction. No shared reset, hosted writes or live LLM calls.
3. Perform the justified history-only master merge and verify no file/tree delta from develop. Keep commit pending explicit authorization.
4. Repair both profile-save feedback assertions with a scoped/content-specific locator and retain actual reload-persistence, frozen existing application, private file and cross-role denial checks. Add discriminating assertion evidence if needed; no UI/validation-policy changes, no skipped tests or weaker timeouts.
5. Run the focused profile journey then **all** Playwright cases (scheduled-equivalent, not just critical selection). Run full unit coverage, typecheck, scoped lint/format, whitespace checks and production documentation build. Record actual numerator/denominator and failures; do not reuse prior 90.25% as a fresh result. No new live eval calls; old budget exhausted.
6. Obtain actual separate read-only integration/test review; fix/recheck findings. Record a dated summary, then request separate human acceptance and archive with canonical sync N/A.
7. Publication requires explicit commit/push/PR authorization. Submit the issue branch to develop; human integration must use **Create a merge commit**, preserving the master parent. Squash/rebase would discard this ancestry repair. The subsequent develop-to-master release PR should also retain history with a merge commit. After human integration, existing PR #107 can be reevaluated against master. Do not merge/deploy master or apply hosted migrations.

Allowed changes: Git ancestry, the two stale browser save assertions and directly relevant test evidence, this packet/log/index navigation. Application, SQL, secrets/env, CI policy/thresholds, reflection prose, production settings and live calls are excluded.

## Acceptance criteria / risk and rollback

- REL-01: master is an ancestor of the repair tree; zero application/config/schema delta versus the verified development baseline. Preserve all original source/tests/docs before bounded test repair.
- REL-02: original RED and focused GREEN recorded; real profile save and subsequent full private-file/frozen-history journey verified without ambiguous status matches.
- REL-03: full scheduled-equivalent browser results and unit/static/site checks recorded truthfully; separate review/acceptance and no live/hosted operations.
- REL-04: pre-PR packet/log/issue traceability complete; no claim PR creation establishes final release approval.

## Actual task/evidence checkpoint

- [x] Re-fetched and rechecked unchanged develop/master hashes and complete tree/ancestor proof. Created the approved isolated branch/worktree. Original main workspace and older untracked profile packet preserved.
- [x] `git merge --no-commit --no-ff -s ours origin/master` succeeded; both cached and working `git diff --exit-code HEAD` were empty immediately afterward. MERGE_HEAD is `d48f699`. Final master ancestry awaits an authorized merge commit; no branch-head change is claimed yet.
- [x] Original browser RED: `node --env-file=C:/Projects/CS3227-2610-MP3/.env.local node_modules/@playwright/test/cli.js test tests/e2e/profile-resume.spec.ts --output test-results/108-profile-red`, normal Next dev at localhost:3000. Exit 1; 11.4-second case failed on the same strict status-selector ambiguity as CI. Docker initially unavailable; Paul explicitly said he would start it, then local Supabase started without reset. CLI status output was withheld for credential safety.
- [x] Repair: two assertions only in `tests/e2e/support/profile-resume-journey.ts`, scoped to `main form` status with exact `Profile saved.` content and exact text assertion. No `.first()`, timeout inflation, UI change or removed persistence/privacy assertions. Helper blob `25ac6e20ce3b05fa041bc85f94107ee4536cacff`.
- [x] Focused GREEN: same command, output `test-results/108-profile-green`; exit 0, **1/1 passed**, 1.6 minutes. Full profile/private-file/submission/HR lifecycle completed.
- [x] Full units: `node node_modules/vitest/vitest.mjs run --coverage`, **642/642**, 103 files. Branches **1,938/2,165 = 89.51%**, statements 92.28%, functions 91.29%, lines 93.55%. Runtime includes later HR filter changes relative to the earlier 609-test measurement; do not claim 90.25% on this revision. Coverage policy unchanged.
- [x] Scoped ESLint on repaired helper passed; initial typecheck before site output generation passed.
- [x] Full scheduled-equivalent browser run: same env and CLI with no file selector, output `test-results/108-full-chromium`; first run **40 passed, 1 failed**, exit 1, 7.0 minutes, no skips. Repaired profile passed; HR job creation failed due to the local schema mismatch documented below. Final schema-aligned full recheck under `test-results/108-full-chromium-schema-aligned` **passed 41/41, zero skipped**, exit 0, 6.2 minutes; no code/test changes were made between those full runs. HR job management passed in 20.0 seconds and repaired profile in 36.6 seconds.
- [x] Documentation build: initial shared-site-dependency junction compiled client/server but failed all six static routes with undefined DocItem context. Replaced only verified junction nonrecursively, preserving root dependencies; isolated `npm ci --offline --ignore-scripts --no-audit --no-fund` installed 1,390 packages without source/lock changes. **Isolated production build passed**. No documentation source repair authorized or made.
- [x] Final typecheck after clearing generated site output: a concurrent attempt picked up downloaded `.ts` asset copies under `website/build/assets/files` and failed relative-import checks. Followed Developer Guide's existing clear-before-app-check guidance with `node node_modules/@docusaurus/core/bin/docusaurus.mjs clear` from website, then `tsc --noEmit`, helper ESLint and scoped Prettier **all passed**. No tsconfig exclusions changed.
- [x] Final separate read-only review and evidence reconciliation returned with no source/design blocker; actual dated summary linked. Reviewer reran only static/whitespace checks, not runtime suites. REL-01 committed ancestry remains incomplete until an authorized merge commit.
- [x] Paul separately accepted and authorized publication via `call_2wOndANslWGM2IQqKx9C3AXq` on 18 October; complete packet archived, canonical sync N/A. Commit/push/PR execution and fresh remote CI remain pending at this checkpoint; repository merge/release are separate gates.

Actual separate read-only reviewer `/root/release108_review` confirmed Git proof, empty cached diff and the bounded two-assertion change; found no source defect. It reproduced diff whitespace checks, not browser tests; `pnpm` was absent from its PATH. Runtime/closeout conclusions remain pending final outputs. Review is independent of implementation, with shared context disclosed.

## Full-suite local setup diagnosis

The first local 41-case run exposed an HR job-create failure at `/hr/jobs/new?error=save`, while the repaired profile case passed. Read-only `supabase migration list --local` showed two existing source migrations missing from the Docker database: `20261015000000_scheduled_job_times.sql` and `20261016000000_applicant_reapply.sql`. Existing schema therefore lacked the current scheduling RPC contract. This local setup differs from fresh CI replay, where HR job management passed in the original scheduled run. At that diagnosis checkpoint, reviewed the exact existing migrations and current CLI help and planned to apply only those pending local migrations after all tests finished, without reset or hosted access. The completed application/recheck follows below. No SQL source or application change proposed. An initial sandbox CLI help call failed writing its user telemetry cache; retry with normal authorized CLI execution succeeded. No token or database password was printed.

After the first full run completed and fixtures cleaned up, `corepack pnpm exec supabase migration up --local` applied exactly the two reviewed migrations above. `migration list --local` then showed all 14 source migration IDs applied to the local Docker database. No reset, source SQL edits, hosted link/push, credential output or production operations. The final full browser run on this aligned schema passed 41/41, including HR job creation, without source changes, supporting the local schema-mismatch diagnosis.

Session summary: [18 October repair log](../../../logs/2026-10-18-release-history-profile-test.md). [Actual separate review](handoffs/independent-review.md). Paul separately accepted the local repair and authorized commit/push/opening its PR via **Accept and publish repair PR**, source `call_2wOndANslWGM2IQqKx9C3AXq`, on 18 October 2026 (Asia/Singapore). Complete packet archived after that decision; canonical sync N/A. Commit execution and ancestry verification remain pending at this pre-publication record. Repository merging and release remain unauthorized.

GitHub repository settings were read (not modified): merge commits, squash and rebase are all allowed. Therefore the human can select **Create a merge commit** for the repair PR and later release. This is an integration prerequisite, not a claim of repository merge/deployment authorization. A squash merge of the repair would preserve its test edit but lose the master ancestry and fail to resolve release PR #107's history conflict.

Separate reviewer confirmed this prerequisite is technically necessary. Repository-level permission does not establish branch-specific protection/check satisfaction; those gates remain for repository review. No automatic merge is proposed.

## Final local readiness

| Criterion | Actual evidence / remaining boundary                                                                                                                                                                                                                                                               |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| REL-01    | Exact baseline-tree/ancestor proof independently checked; history-only merge staged no file changes. Local src/SQL/CI/config/locks remain identical to develop. Commit is now authorized; final committed master ancestry must be verified after execution.                                                        |
| REL-02    | RED reproduced unchanged; two exact scoped assertions repaired; focused GREEN and final full profile journey passed. Persistence/file/role assertions retained.                                                                                                                                    |
| REL-03    | Full Chromium 41/41, units642/642, site build, final typecheck/lint/format and independent source review passed. First full run40/41, initial site/static failures and local migrations retained above. Coverage89.51% unchanged policy. No Linux/remote CI or hosted release check newly claimed. |
| REL-04    | Issue, approval, dated log and actual reviewer linked. Paul separately accepted and authorized publication on 18 October; complete packet archived. Commit/push/PR execution pending at this pre-publication record. No repository merge or production authority.                                                                                                                                 |

Repair rollback and publication must preserve ancestry; use a merge commit for the eventual repair PR. Do not squash/rebase it into develop. Paul accepted this local state with recorded limits. That decision does not claim the existing remote release PR is already unblocked or authorize merging it.

Rollback before publication: abandon the isolated uncommitted merge only if needed/authorized, preserving evidence; other workspaces untouched. After publication, use reviewed Git ancestry/content changes, not a production reset; no database rollback introduced. A successful merge history alone does not establish hosted migration, Auth/SMTP or production readiness.
