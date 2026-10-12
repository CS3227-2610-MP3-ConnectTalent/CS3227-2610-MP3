# Feature record: coverage reporting and Dependabot

Status: implementation independently reviewed and accepted by the user on 2026-10-11; packet archived on 2026-10-12 as pre-PR evidence; repository formatting and final local checks pass; hosted PR checks remain pending

Owner: pending issue triage

Spec version: 1.8 — [ProductSpec](../../ProductSpec.md)
Date: 2026-10-11

## Metadata and artifact links

- Change ID/classification: `2026-10-11-coverage-dependabot`; docs/process and CI tooling only
- GitHub issues: [#58 coverage and PR report](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58); [#59 Dependabot](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/59); separate outcomes, one related packet
- Branch/commits/PR at archive time: `chore/58-coverage-and-dependabot` was created from `c9678b6442326ebcf8a0ef3f653ac820966a8ad2` after the normal sandbox denied `.git` writes; no commit or PR existed when the packet was archived. See the PR-preparation summary for later submission evidence.
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: none; product behavior is unchanged
- Implementation plan/tasks: [coverage/reporting plan](plan.md), [Dependabot plan](dependabot-plan.md), [shared tasks](tasks.md); approved for inline implementation on 2026-10-11
- Baseline: ProductSpec v1.8 dated 2026-10-10; `develop` commit `c9678b6442326ebcf8a0ef3f653ac820966a8ad2`
- Archive path: `workflow/archive/2026-10-11-coverage-dependabot/`

## Approval checklist

- [x] Issues exist and are linked; issue owner/triage remains pending.
- [x] User approved the written proposal/design, revised report-only coverage policy, and both implementation plans in chat on 2026-10-11; inline implementation is authorized.
- [x] Implementation changes and scoped verification complete; the full-repository formatting gate passes, while hosted workflow checks remain pending as recorded below.
- [x] Independent security and test reviews complete; findings and rechecks are recorded in the linked handoffs.
- [x] Human acceptance recorded separately on 2026-10-11.
- [x] Relevant guide updates and both dated session logs complete.
- [x] Pre-PR closeout complete: no product sync required; packet archived with links repaired.
- [ ] Issue-linked PR submitted at archive time; this archived record is the pre-PR snapshot.
- [x] Product sync: N/A because no product behavior changes; the change adds CI/reporting and documentation tooling only.

User approved the four 90% metrics as a report-only target in chat on 2026-10-11. Meaningful tests/refactoring should reach the target, but coverage below 90% will not fail CI or act as a merge gate. Unit-test failures continue to fail CI; whether CI results are required for merges depends on existing repository settings and is unverified. User approved both implementation plans and inline execution in chat on 2026-10-11. Approval also covers artifact-only PR reporting and the Dependabot scope; repository settings are not part of the approved change.

## Requirement and acceptance criteria

See [proposal acceptance evidence](proposal.md#acceptance-evidence-and-artifacts) for QG-AC-01 through QG-AC-05 and DEP-AC-01 through DEP-AC-02. Implementation, independent review, and separate user acceptance are recorded below. Hosted workflow behavior remains unverified.

## Baseline coverage map

The initial direct pnpm 12.8.1 run passed 167 tests across 32 files. Global coverage was 46.10% lines (746/1,618), 44.22% statements (789/1,784), 41.47% branches (567/1,367), and 41.64% functions (202/485). The unchanged `src/**/*.{ts,tsx}` scope contains 97 files; 50 have zero line coverage and 43 have uncovered branches with zero branch coverage. Full per-file totals, percentages, and uncovered counts are in [coverage-baseline.csv](coverage-baseline.csv). The executable reports remain under ignored `coverage/`; this CSV is the committed baseline evidence.

## Agent handoffs

The primary agent performed implementation and verification as recorded in the [implementation handoff](handoffs/implementer.md). Separate read-only reviewer agents completed security and test reviews; their scopes, findings, rechecks, independence limits, and unverified hosted behavior are recorded in [security review](handoffs/security-review.md) and [test review](handoffs/test-review.md). Neither reviewer edited implementation files.

## Implementation and tests

Changed files include CI/workflow configuration, the Dependabot configuration, Python report parsing and PR-comment helpers, focused Vitest and Python tests, contributor guidance, the active-change index, and this packet.

Commands and results, using Node v24.16.0 and the installed pnpm 12.8.1 executable directly because pnpm is not on the normal PowerShell PATH:

- `CI=true pnpm test:unit:coverage --reporter=dot`: final full rerun passed 60 Vitest files and 334 tests. Lines 94.80% (1,534/1,618), statements 93.89% (1,675/1,784), branches 90.05% (1,231/1,367), and functions 94.63% (459/485). All four approved targets were reached without changing the `src/**/*.{ts,tsx}` scope or configuring a failing coverage threshold. Vite emitted its existing `configLoader: 'native'` warning. A separate reviewer run had one transient timeout in the existing PDF input test (333 passed, one failed); an isolated file run and this later complete CI-mode run passed.
- `python -m unittest discover -s tests/ci -p "test_*.py" -v`: final helper suite passed all 28 parser and mocked GitHub reporter tests. It includes trusted-workflow-path, empty-association fallback, bounded-read, and stale different-SHA regressions.
- `python scripts/ci/write-vitest-summary.py` with `WORKFLOW_STATUS=success`: parsed the generated JUnit/coverage artifacts and rendered 334 passed, zero failed/errors/skipped, plus all four metrics and target statuses.
- `pnpm lint`, `pnpm exec next typegen`, `pnpm typecheck`, and `pnpm build`: passed.
- `pnpm format:check`: the initial check failed on 187 pre-existing unformatted files. Running `pnpm format` formatted those files; the subsequent repository-wide check passed. `.prettierignore` excludes `Reflections.md`, `JohnReflections.md`, and `PaulReflections.md`, so those files were not included by Prettier.
- Changed-document and packet Markdown checks passed: 165 relative links across 13 files; no trailing whitespace; `git diff --check` passed.
- After the repository-wide formatting fix, the final CI-mode full unit suite passed again: 60 files and 334 tests with lines 94.80%, statements 93.89%, branches 90.05%, and functions 94.63%. The Python helper suite passed all 28 tests. `pnpm lint`, Next.js type generation, `pnpm typecheck`, `pnpm build`, and `git diff --check` also passed on the final pre-PR tree. Lint reported two warnings for generated files under `coverage/` and no errors.
- Workflow tests use mocked GitHub API responses; no live PR comment update or fork workflow run has been observed. GitHub's Dependabot config check has not run because there is not yet a PR.

Security/adversarial cases and results: parser tests reject malformed, oversized, DTD/entity, inconsistent, non-finite, and out-of-range reports. Mocked reporter tests cover same-repository and fork PR associations, stale/unsafe/ambiguous associations, missing workflow-run PR associations, bounded reads, pagination, comment upsert and ordering, and API failures. An independent review found and confirmed fixes for workflow identity validation, unbounded file reads, stale cross-SHA updates, and pending-run replacement. GitHub run 38072407716 provides one real example where `workflow_run.head_sha` equaled the PR head SHA while the workflow-run `pull_requests` list was empty; the new reporter's hosted end-to-end behavior remains unobserved.

Known limitations: a separate reviewer CI-mode run timed out once in the existing PDF input test; an isolated file run and later complete CI-mode runs passed. Existing Supabase, integration, and critical-browser workflows have not run for this branch and remain hosted PR CI evidence. The workflow-run reporter must be installed on the default branch before a hosted rehearsal. GitHub Dependabot configuration acceptance and repository-level security-update settings remain unverified. The report workflow uses a source-repository-and-branch concurrency group with `queue: max`; GitHub caps a group's pending queue at 100, so an extreme burst for one branch could still drop a report. One live existing CI run supports the head-SHA association but does not validate the new comment workflow. Earlier read-only ruleset inspection showed active rulesets for `develop` and `master` with empty required-status-check lists; the classic branch-protection endpoint returned 403, so separate classic required checks could not be ruled out. This change does not modify repository settings or make coverage a merge gate.

## Review and decision

Reviewer findings and fixes: separate security and test reviewers found risks in workflow identity, artifact byte bounds, stale cross-SHA report ordering, and workflow concurrency. Focused fixes and regressions were reviewed; see [security review](handoffs/security-review.md) and [test review](handoffs/test-review.md). The inherited repository-wide format failure was fixed during closeout and the full formatter gate now passes. No live comment, fork workflow, hosted Dependabot validation, or complete hosted CI run was observed.

Human decision and date: written proposal/design and both implementation plans approved on 2026-10-11; the user separately accepted the completed implementation with “I accept the completed implementation, please proceed” on 2026-10-11. No conditions were stated.

Guide/reflection/log updates: README, CONTRIBUTING, Developer Guide, and dated session summaries updated. Personal reflection documents remain outside scope and are excluded from Prettier.

## Session evidence index

| Date / session                   | Summary log link                                                                         | Work / prompts / decisions covered                                                                                                                                       | Verification status / missing coverage                                                                                                                                       |
| -------------------------------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-11 / implementation      | [implementation summary](../../../logs/2026-10-11-coverage-dependabot-implementation.md) | Issues #58/#59; report-only coverage decision; 90% four-metric objective; Dependabot; CI report helper; independent review/fixes                                         | Local unit, 28 helper tests, lint, type, build, and initial format checks recorded; the full format check initially failed on 187 files. Hosted checks remained unavailable. |
| 2026-10-12 / closeout            | [format and closeout summary](../../../logs/2026-10-12-coverage-format-closeout.md)      | User acceptance; reproduce and fix the full-repository formatting failure; update acceptance and archive evidence                                                        | `pnpm format:check` passes after `pnpm format`; `git diff --check` passes. No application tests rerun after formatting-only edits; hosted behavior remains unverified.       |
| 2026-10-12 / PR preparation      | [PR preparation summary](../../../logs/2026-10-12-coverage-dependabot-pr.md)             | User authorized proceeding to PR; refresh base/issue/PR state; run final local CI-equivalent checks                                                                      | Final unit, helper, lint, type, build and format checks pass. Hosted Supabase, integration, browser and reporter checks await the PR.                                        |
| 2026-10-12 / PR review follow-up | [PR review follow-up summary](../../../logs/2026-10-12-coverage-pr-review-followup.md) | Correct approval evidence, link follow-up, and use Renovate for pnpm 12 updates while Dependabot covers Actions | Hosted validation limits and the Mend GitHub App prerequisite are recorded. |
| 2026-10-12 / merge and PR review round 2 | [follow-up summary](../../../logs/2026-10-12-coverage-pr-review-followup-2.md) | Sync develop, resolve documentation conflicts, fix five inline comments, and record two additional security findings | 39 helper tests and formatting passed; hosted checks and QG-AC-05 disposition remain pending. |
| 2026-10-12 / PR review round 3 | [round 3 follow-up summary](../../../logs/2026-10-12-coverage-pr-review-followup-3.md) | Address five new review comments; scope artifact names to rerun attempts, retain valid partial reports, harden malformed JSON/JUnit handling, and constrain Renovate grouping | A 47-test helper run passed before this session; the fresh rerun could not start because the Python launcher could not spawn its child. Final hosted checks and QG-AC-05 disposition remain pending. |

## Additional PR review follow-up and develop sync — 2026-10-12

After PR #61 received five additional inline comments, the branch was synchronized with `develop` at `7a2ff4d8464c6b23b023dfd09c5b5ed70b7a1e10`; merge commit `a2c44e01d9706fd32ccf2dfb2fbc800abf775cfc` resolved conflicts in `docs/DeveloperGuide.md`, `workflow/archive/README.md`, and `workflow/changes/README.md`. The five comments were corrected in commit `e194ef497cc1aaccd5d585d8908b2292d39d569f`, answered, and re-queried as resolved. The session details and actual hosted/local evidence are in the [round 2 follow-up summary](../../../logs/2026-10-12-coverage-pr-review-followup-2.md).

A separate security recheck also identified that test and coverage artifacts are supplied by the PR's mutable CI workflow and are not independently attested. That limitation is now disclosed in the generated comment and contributor guides. The parser/downloader code does not authenticate the artifact producer; whether this disclosure satisfies QG-AC-05 remains pending user disposition. The reviewer additionally found and verified a fix for dangling destination symlinks. See the [follow-up security handoff](handoffs/pr-review-followup-2-security.md). No hosted Actions run was reported for `e194ef4`; current local and hosted evidence is in the linked session summary.

## PR review round three — 2026-10-12

Fresh review of PR #61 found five unresolved comments ([4244946924](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/61#discussion_r4244946924), [4244946930](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/61#discussion_r4244946930), [4244946936](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/61#discussion_r4244946936), [4244946941](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/61#discussion_r4244946941), [4244946943](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/61#discussion_r4244946943)). Fixes cover attempt-scoped artifact selection, nonempty allowlisted partial artifacts, JSON decoder `ValueError`, Renovate preset grouping, and a nested-JUnit false-green regression found by the separate test reviewer. Code corrections are in `f5dbc2e`; evidence is in `f157c37`. Each of the five threads was replied to and re-queried as resolved. For `f157c37`, CI run 38212731072 and Supabase CI run 38212731085 passed; Vercel passed and PR #61 was mergeable. The CI job included format, lint, type generation, typecheck, unit tests, report-helper tests, and build. Supabase CI included database checks, integration race suites, and critical Chromium PR journeys; the scheduled/manual full browser suite was skipped. Details and remaining limits are in the [round 3 follow-up summary](../../../logs/2026-10-12-coverage-pr-review-followup-3.md) and [test-review handoff](handoffs/test-review.md). The QG-AC-05 provenance decision remains with the user.

## Canonical sync and archive

- Accepted delta/human decision: no product delta; approved design and implementation plan, no spec sync required.
- Canonical sync commit/files/version/date: N/A for process/tooling only.
- Sync verification: N/A for process/CI tooling changes with no product-spec delta.
- Archive decision/date/path: accepted implementation archived on 2026-10-12 at `workflow/archive/2026-10-11-coverage-dependabot/`; no product delta, so canonical spec sync was N/A.
- Navigation repairs after moving: updated `workflow/changes/README.md` and `workflow/archive/README.md`; packet and session-summary links checked.
- Outstanding work at archive time: obtain hosted CI and Dependabot checks and rehearse the reporter after it reaches the default branch; complete issue-linked PR submission. This record remains the pre-PR snapshot. Issue owner/triage remains unassigned.

## Post-submission review amendment — 2026-10-12

PR review confirmed GitHub Dependabot supports pnpm through v10, while this repository is pinned to pnpm 12.8.1. To preserve the approved developer and CI package-manager version, npm/pnpm dependency updates are assigned to Renovate; Dependabot remains configured for GitHub Actions. The new Renovate configuration limits itself to the npm manager, schedules weekly checks, groups minor/patch updates, and caps concurrent PRs at five. The Mend Renovate GitHub App must be installed for this repository before scheduled package update PRs can start. This amendment records a post-submission correction; the archive's original closeout remains a pre-PR snapshot. GitHub's Dependabot config validation passed on commit `4f2e9e9`; Vercel passed and Supabase Preview was skipped because no Supabase branch was associated. The Actions API showed no workflow runs for that commit. PR metadata reported `mergeable_state: dirty`; base synchronization was not part of this review follow-up.
