# Feature record: CI test matrix

Status: accepted and archived; PR #56 open; all ten PR #56 review threads resolved after follow-up review and current-head checks

Owner: Johnwz123

Spec version: ProductSpec at baseline `09b1213`; no product delta

Date: 2026-10-10

## Metadata and artifact links

- Change ID/classification: 2026-10-10-ci-test-matrix; process/tooling only
- GitHub issues: [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/55)
- Branch/commits/PR: `feat/55-ci-test-matrix`; baseline `09b1213`; implementation commit `96245bd`; post-acceptance corrections through `c85aefb`; PR #56 open at https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/56
- Proposal: `proposal.md`
- Design: `design.md`
- Deltas: none; no Applicant/HR behavior changes
- Implementation plan/tasks: `plan.md`; `tasks.md`
- Baseline: `origin/develop` `09b1213` on 2026-10-10
- Archive path: `workflow/archive/2026-10-10-ci-test-matrix/`

## Approval checklist

- [x] Issue #55 created and assigned to Johnwz123.
- [x] Human approved the recommendations in chat on 2026-10-10; proposal/design/plan approval is recorded before implementation.
- [x] Implementation and relevant checks complete; record exact commands/results below.
- [x] Independent review complete; findings and rechecks recorded.
- [x] Student post-review acceptance separately recorded: Johnwz123 accepted the reviewed implementation on 2026-10-10 in chat with “Looks good, I accept.” The same response authorized sync/archive and PR creation.
- [x] Contributor guides and dated session summary handled at closeout; see [closeout summary](../../../logs/2026-10-10-ci-test-matrix-closeout.md).
- [x] No product delta: this process/tooling change alters no product behavior or canonical requirement, so product-spec sync is N/A.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / requirement | Observable outcome | Evidence/result/limitation |
| --- | --- | --- | --- |
| CI-AC-01 | #55; process-only | App CI remains blocking with explicit read-only permissions. | Static pass: app and Supabase workflows declare `contents: read`; required app checks remain ordinary blocking steps. Hosted status-check/branch-protection behavior not yet observed. |
| CI-AC-02 | #55; process-only | Pinned local DB lint, migration reset and pgTAP block on failures. | Static pass: pinned Supabase CLI `2.119.0`, `db reset --local`, `db lint --local --fail-on error`, and `test db --local` are ordered blocking steps. Hosted database checks passed on `c85aefb` in run `38071141002`; local Docker/DB execution remains unavailable. |
| CI-AC-03 | #55; process-only | All five existing race scripts execute sequentially against local Supabase. | Static pass: `test:integration` maps all five existing scripts in order with `&&`; workflow creates local fixture credentials and resets local DB. Hosted race suites passed on `c85aefb` in run `38071141002`; local Docker runtime remains unavailable. |
| CI-AC-04 | #55; process-only | Critical Chromium tests run on PRs; complete E2E runs nightly/on demand; local test credentials prevent common skips. | Static pass: conditions select critical specs on PR/push and all specs on schedule/manual; browser env requires/maps local publishable key and service-role fixture key. Hosted critical journeys passed on PR #56. The complete scheduled/manual suite passed on `5dd802e` (run `38068989966`; 19 tests). Local browser runtime remains unavailable because Docker access is denied. |
| CI-AC-05 | #55; process-only | Vitest JUnit and coverage are summarized/uploaded without a threshold. | Pass: local `pnpm test:unit:coverage` ran 30 files/161 tests; lines 51.33%, branches 41.58%, statements 46.12%, functions 48.00%. CI-mode rerun produced JUnit/coverage outputs and summary helper output; CI config uploads artifacts and sets no threshold. |
| CI-AC-06 | #55; process-only | Contributor docs match workflow triggers and actual check matrix. | Pass: README, CONTRIBUTING, and Developer Guide updated and searched for stale CI/test command descriptions; both workflow YAML documents parse; `git diff --check` exits 0. |
| CI-AC-07 | #55; process-only | No hosted Supabase credentials/applicant data; permissions remain read-only. | Static pass: local stack and generated local keys only, keys masked before startup logs are printed, no `secrets.` references or `pull_request_target`, permissions read-only. Review observed synthetic fixtures only. Hosted workflow jobs use the disposable local stack; detailed log redaction was not independently inspected. |

## Agent handoffs

Independent read-only `test_engineer` review occurred in two passes and is recorded in [`handoffs/independent-review.md`](handoffs/independent-review.md). The first pass found the P1 public-key mapping defect and P2 schedule/manual documentation gap; the implementer fixed both. The separate second pass confirmed both resolved and found no further actionable P1/P2 issues. The reviewer did not run the workflow or local services. The post-submission re-review of `8e3361a` is linked from [the PR review-response summary](../../../logs/2026-10-11-pr-review-response.md); the new Auth-quota follow-up is recorded in [`handoffs/2026-10-11-auth-rate-limit-review.md`](handoffs/2026-10-11-auth-rate-limit-review.md).

## Implementation and tests

Changed files: `.github/workflows/ci.yml`, `.github/workflows/supabase-checks.yml`, `CONTRIBUTING.md`, `README.md`, `docs/DeveloperGuide.md`, `package.json`, `playwright.config.ts`, `pnpm-lock.yaml`, `vitest.config.ts`, `scripts/ci/write-vitest-summary.py`, `workflow/changes/README.md`, `workflow/archive/README.md`, the archived packet, and `logs/2026-10-10-ci-test-matrix-closeout.md`.

Commands and results: local frozen-lockfile install, unit coverage, CI-mode JUnit/coverage summary, typecheck, lint, critical Playwright listing, YAML parsing/static matrix assertions, and `git diff --check` passed as detailed below. Application behavior changes are N/A; this changes CI/test tooling. Local Supabase/DB/race/browser runtime checks and hosted Actions remain pending.

Security/adversarial cases and results: both workflows declare only `contents: read`; no `pull_request_target` or hosted `secrets.` references were found. The Supabase CLI starts a per-job local stack; publishable/anon/service-role/secret/JWT values are masked before captured startup output is printed. Browser client env uses the required `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` from local `PUBLISHABLE_KEY`. Separate reviewer confirmed the source mapping and synthetic fixtures. Hosted log redaction was not exercised.

Known limitations at original closeout: no local Supabase/Docker execution was possible because Docker API access is denied in this environment. A later build rerun was blocked because `pnpm`/Node were absent from the current shell PATH and the Node symlink target was outside the readable sandbox; an earlier build output reached Next.js compilation/typechecking, but its final exit result was not captured, so build is not claimed as passed. Hosted GitHub Actions and external branch-protection rules were unobserved at closeout. Post-submission runs and the new Auth-quota review finding are recorded below.

| Date / environment / commit | Exact command or manual check | Exit/result and counts | Output/evidence link | What this proves / does not prove |
| --- | --- | --- | --- | --- |
| 2026-10-10 / Windows PowerShell / worktree on `09b1213` | `pnpm install --frozen-lockfile` | Pass; pnpm 12.8.1 | Local command output | Lockfile and package manifest resolve together; not CI runtime proof. |
| 2026-10-10 / Windows PowerShell / worktree on `09b1213` | `pnpm test:unit:coverage` | Pass; 30 files, 161 tests; line 51.33%, branch 41.58%, statements 46.12%, functions 48.00% | Local Vitest output and `coverage/` | Exercises current unit suite and produces local V8 coverage; no quality threshold asserted. |
| 2026-10-10 / Windows PowerShell / worktree on `09b1213` | `CI=true pnpm test:unit:coverage`, then `python scripts/ci/write-vitest-summary.py` | Pass; JUnit reports 161 tests, 0 failures/errors/skips; helper includes 51.33% lines | `test-results/vitest-junit.xml`, `coverage/coverage-summary.json`, summary preview | Validates CI reporter and summary formats locally; does not prove Actions artifact upload. |
| 2026-10-10 / Windows PowerShell / worktree on `09b1213` | `pnpm typecheck`; `pnpm lint` | Typecheck pass. Lint exit 0 with two unused-disable warnings in generated coverage files because lint was run after coverage generation. | Local command output | Type correctness and lint success; generated reports are absent on a clean GitHub runner before the lint step. |
| 2026-10-10 / Windows PowerShell / worktree on `09b1213` | Critical Playwright package-script test discovery with `--list` (the original shell invocation was not retained) | Pass; 9 tests in 5 files | Playwright list output | Confirms critical spec discovery only; does not run browser journeys. |
| 2026-10-10 / Windows PowerShell / current worktree | Bun `js-yaml` parse plus static assertions for triggers, permissions, DB gates, script/spec paths, sequential race chain, and publishable key mapping; `git diff --check` | Pass; both workflows parse; 3 Supabase jobs and 1 app job; no whitespace errors (line-ending notices only) | Current worktree | Validates source/config structure only; not GitHub Actions execution. |
| 2026-10-10 / Windows PowerShell / current worktree | `docker ps --format '{{.Names}}'` | Not run: Docker API access denied | Local command error | Confirms the runtime environment could not access Docker; no local database, race, or browser suite was started. |
| 2026-10-10 / Windows PowerShell / current worktree | `pnpm build` rerun | Not run: `pnpm` not recognized in current shell; prior invocation output had no captured final exit | Local command output | Build status remains unverified; a successful compile/typecheck cannot be claimed. |

## Review and decision

- Reviewer findings and fixes: first independent pass reported (1) P1 wrong public key variable and (2) P2 omitted scheduled/manual DB/race trigger documentation. Both were fixed and confirmed by the second independent read-only pass; no additional P1/P2 findings. Details: `handoffs/independent-review.md`.
- Human decision and date: implementation scope approved before work; Johnwz123 separately accepted the reviewed implementation on 2026-10-10 with “Looks good, I accept.” The accepted decision authorizes sync/archive and PR creation; limitations are recorded above and in the review handoff.
- Guide/reflection/log updates: README, CONTRIBUTING and Developer Guide updated; dated summary completed and linked; personal reflections excluded and not opened.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-10 / current session | [CI test matrix closeout](../../../logs/2026-10-10-ci-test-matrix-closeout.md) | CI review, issue #55, proposal/design/plan, implementation, two-pass independent review, acceptance, no-product-delta sync and archive. | Acceptance and closeout recorded; local Docker suites/build final result and hosted CI remain unverified; PR submission was the next action. |
| 2026-10-11 / PR review response | [PR review-response summary](../../../logs/2026-10-11-pr-review-response.md) | Corrected the review findings, fixed Supabase CI, compared #55/#51 branches, obtained fresh review, and resolved all PR #56/#57 threads. | PR #56 app and Supabase checks passed on `c85aefb`; the earlier full manual suite passed on `5dd802e`. The Auth quota review and recheck are recorded in the follow-up handoff. |

## Canonical sync and archive

- Accepted delta/human decision: no product delta; Johnwz123 accepted the reviewed CI/tooling implementation on 2026-10-10.
- Canonical sync commit/files/version/date: N/A; no product specs or requirements changed.
- Sync verification: `git fetch origin develop:refs/remotes/origin/develop` succeeded; `origin/develop` remained at `09b1213f2f8105f9faf2e7f3a8efc534fb9c2902`, equal to the branch's pre-implementation base. No `workflow/specs/` or `workflow/ProductSpec.md` files changed. Product sync is N/A.
- Archive decision/date/path: authorized by Johnwz123's acceptance on 2026-10-10; complete packet archived at `workflow/archive/2026-10-10-ci-test-matrix/` before PR submission.
- Navigation repairs after moving: active index now reports no pending implementation packets and links to the archived record; archive index includes issue #55 and its handoff/summary.
- Outstanding work/limitations at archive time: PR submission was authorized and pending then; local Supabase execution and the local build final exit remain unverified. Hosted checks and PR submission were completed subsequently. External branch-protection configuration remains unverified.

## Post-submission review response (2026-10-11)

- PR #56 is open at https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/56. Nine original review threads were resolved after the complete independent re-review of `8e3361a` found no actionable P1/P2 issue and the source-head checks passed.
- Hosted CI run `38069707638` passed on `8e3361a`. Supabase CI run `38069707750` passed database checks, all five race suites, and critical PR Chromium journeys. The complete manual Playwright suite passed in run `38068989966` on `5dd802e` (19 tests); the workflow correctly skips the complete suite for pull-request events.
- Follow-up commit `c85aefb` raises only local `auth.rate_limit.sign_in_sign_ups` from 30 to 200, leaving hosted Auth unaffected. The prior full-suite run completed with 19 passed tests and no observed rate-limit failure at the previous setting; the change provides headroom for the reviewer's estimated 42 requests and two configured retries.
- New PR comment 4238453086 requested quota headroom. Separate reviewer `/root/ci_matrix_review` reviewed exact commit `c85aefb` and found no blocker; it confirmed the 200 setting gives 74 requests of arithmetic headroom over the estimated 126 requests (42 requests × three configured attempts) in the five-minute window. This is a configuration-based estimate; the prior full-suite run passed at 30, and the PR workflow does not run the complete suite.
- Current-head app CI run [38071140832](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38071140832) passed on `c85aefb`. Supabase CI run [38071141002](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38071141002) passed database checks, all integration race suites and critical PR Chromium journeys. Comment 4238453086 was resolved after those results and the independent review were recorded. Johnwz123's 2026-10-11 instruction authorizes correction and resolution after verification; no merge/release is authorized.
