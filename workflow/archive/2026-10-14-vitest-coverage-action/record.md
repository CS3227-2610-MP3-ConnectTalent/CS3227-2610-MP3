# Feature record: Vitest coverage report action

Status: accepted by Johnwz123 on 2026-10-14 and archived; review fixes were pushed to open PR #80, and all ten review threads currently known have been replied to and resolved. Hosted verification remains open until the updated workflow runs from the default branch.

Owner: Johnwz123. Scope approved by the user on 2026-10-14.

Spec version: 1.9 — [ProductSpec](../../ProductSpec.md)
Date: 2026-10-14

## Metadata and artifact links

- Change ID/classification: `2026-10-14-vitest-coverage-action`; CI/reporting tooling defect.
- GitHub issue: [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72); related accepted contract [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58).
- Branch: `fix/72-vitest-coverage-action`.
- Latest implementation commit: `48b69220e863d9a606718c5d693b1a9fe7a1f1dc`; subsequent review documentation commits are linked from the session summaries.
- Pull request: [#80](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80), open against `develop`.
- Proposal: [proposal.md](proposal.md).
- Design: [design.md](design.md).
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Deltas: none; no product behavior changes.
- Baseline: `develop` commit `7bbf7af8aa6ddf27e596fd1e67609bc27e764efd`.
- Earlier packet: [2026-10-13 diagnostic packet](../2026-10-13-vitest-pr-report/record.md) remains historical and describes the previous custom-report design.

## Approval checklist

- [x] Issue #72 is linked; user approved switching to the upstream action and removing custom code on 2026-10-14.
- [x] Proposal, design, and plan approved before implementation; no product delta.
- [x] Implementation static checks and diff inspection recorded; see the evidence table below and implementer handoff.
- [x] Independent review recorded separately; see [T03 reviewer handoff](handoffs/T03-independent-review.md).
- [x] Post-change student acceptance recorded separately; see the human decision below and the closeout summary.
- [ ] Hosted comment creation/update verified after this workflow reaches the default branch.
- [x] Dated closeout log and complete packet archived before PR submission.

## Requirement and acceptance criteria

See [proposal.md](proposal.md#acceptance-evidence-and-artifacts) for VCA-AC-01 through VCA-AC-04. No canonical product requirement is changed. The accepted #58 comment contract included JUnit test totals; the user's later 2026-10-14 decision deliberately replaces that with coverage-only PR output.

## Agent handoffs

Implementation assignment and evidence: [T01/T02 implementer handoff](handoffs/T01-T02-implementer.md). Separate reviewer handoff: [T03 independent review](handoffs/T03-independent-review.md).

## Implementation and checks

Changed files: `.github/workflows/ci.yml`, `.github/workflows/test-report.yml`, `vitest.config.ts`, `README.md`, `CONTRIBUTING.md`, the `workflow/changes/` packet/index, removal of `scripts/ci/report_vitest_pr.py`, `scripts/ci/vitest_reports.py`, `scripts/ci/write-vitest-summary.py`, `tests/ci/test_download_vitest_artifact.py`, `tests/ci/test_report_vitest_pr.py`, and `tests/ci/test_vitest_reports.py`, plus restoration of `scripts/ci/download_vitest_artifact.py` as a bounded artifact-only helper during PR review.

Commands/results: see [T01/T02 implementer handoff](handoffs/T01-T02-implementer.md) and the later review summaries below. Static workflow/config inspection confirms the job-level `actions: read`, `contents: read`, `pull-requests: write`, exact triggering run ID and run-attempt artifact name, default-branch-only checkout, JSON paths, `reportOnFailure: true`, removal of the custom parser/comment writer/summary writer and their dedicated tests, and retention of one bounded artifact-only downloader. The later helper review inspected the exact file allowlist and ZIP/file size gates, but no local automated helper tests were run. `git diff --check` passed. Full YAML parsing was unavailable locally because the Python shim failed to spawn its child process with permission denied; `actionlint` and Node are not installed. Application tests were not run; this is a config/docs-only change.

Application tests: N/A for this workflow/configuration and documentation-only change. Unit-test pass/fail behavior remains unchanged; static checks and later hosted workflow evidence are relevant.

Known limitations: the action's actual PR comment formatting, association, and hosted authorization remain unverified until a report run executes after the workflow reaches the default branch. The PR comment no longer includes JUnit test totals; those remain in the CI logs.

| Revision/environment | Exact command or check | Result and limits |
| --- | --- | --- |
| Baseline hosted workflow; run [#38419328159](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38419328159) | Vitest PR report workflow | Artifact download completed; comment POST failed with HTTP 403 `Resource not accessible by integration`. This is the observed reason for replacing the custom reporter. |
| Working tree on `fix/72-vitest-coverage-action` | `git diff --check` | Passed; no whitespace errors. This does not validate workflow execution. |
| Working tree on `fix/72-vitest-coverage-action` | `rg -n 'report_vitest_pr|vitest_reports|write-vitest-summary|test-results/vitest-junit' .github scripts tests README.md CONTRIBUTING.md` | No active custom reporter/parser/summary or JUnit artifact references remain. `download_vitest_artifact.py` is intentionally excluded from this removal scan and is retained only as the bounded extractor invoked by the trusted report workflow. |
| Windows local environment | `python -c "import yaml; print('PyYAML', yaml.__version__)"`; `Get-Command actionlint, python, node` | YAML parser not run: Python shim reported `uv trampoline failed to spawn Python child process` / permission denied; actionlint and Node were not found. |

## Review and decision

Reviewer findings and fixes: the separate pre-submission reviewer found no blocking issue at that revision. Subsequent PR review found additional workflow hardening and archive-accuracy issues; those were fixed in follow-up commits and documented below. The revised VCA-AC-04 is satisfied by source inspection: the custom parser/comment/summary implementation and dedicated tests are gone, while one size-bounded artifact extractor remains. YAML parsing, actionlint, runtime behavior, and hosted comment creation/association remain unverified; see [T03 reviewer handoff](handoffs/T03-independent-review.md) and the linked review summaries.

Human decision and date: proposal/design/plan approved on 2026-10-14. Johnwz123 accepted the reviewed implementation on 2026-10-14 via the user response “Accept; proceed with closeout and PR,” with hosted comment verification remaining pending after the workflow reaches the default branch.

- Reviewer identity and independence: separate `test_engineer` execution `/root/review_ci_workflows` (GPT-6), reviewed the uncommitted worktree over baseline `7bbf7af8aa6ddf27e596fd1e67609bc27e764efd`; no implementation involvement and no files changed.
- Findings/resolutions: no blocking findings. The reviewer caught two stale packet status lines during review; both were corrected before the final handoff. YAML parse/runtime/hosted proof remains open.
- Human decisions: post-change acceptance recorded above; hosted verification remains a condition to close issue #72.
- Documentation/reflection/log updates: `README.md` and `CONTRIBUTING.md` are updated; implementation and closeout summaries are linked below.

## Post-submission review follow-up (2026-10-14)

The user requested investigation of the missing PR coverage comment and authorized addressing the PR review comments, pushing the fixes, and resolving the threads. The hosted evidence identifies the live failure: CI run [#38506123829](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38506123829) passed and uploaded an 82,653-byte `vitest-reports-1` artifact. Its report run [#38506198290](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38506198290) still executed the old default-branch Python reporter, which rejected the new coverage-only artifact contents and then failed its comment POST with HTTP 403 `Resource not accessible by integration`. The action workflow change in this PR is not active until it reaches `develop`, because `workflow_run` uses the default-branch workflow definition.

All five unresolved review findings were assessed as valid. The follow-up adds an explicit unique-PR association and newest-run guard, marks coverage unavailable when the exact artifact is missing, checks that the upstream action actually created or updated its marker comment, and updates the stale Developer Guide description. The upstream action remains responsible for rendering the coverage report. See the [PR review follow-up summary](../../../logs/2026-10-14-vitest-coverage-action-pr-review-followup.md) for the full thread mapping, changed files, check results, and commit.

After `a5b1348` was pushed, CI run [#38513939941](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38513939941) and Supabase CI [#38513939995](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38513939995) passed, including Database checks, Playwright Chromium, and integration race suites. The associated reporter run [#38514026387](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38514026387) still checked out the current `develop` workflow and failed in the old Python reporter; it therefore does not exercise the pushed upstream-action workflow.

## Additional PR review follow-up (2026-10-14)

The user asked to align the reporter with the upstream action's example and address three new PR comments. The action README's fork configuration uses the separate `workflow_run` reporter and requires that workflow to be present on the default branch. The new reporter keeps that trust boundary and continues to use the upstream action as its renderer. The upstream writer's source selects the first comment matching its marker without checking authorship, so the workflow now uses a repository-specific marker, selects only bot-owned report comments, and skips publication on an exact non-bot marker collision rather than changing a user's comment.

The report job now handles all eight documented completed workflow conclusions. It restores a small artifact-only downloader that caps the compressed ZIP at 8 MiB, inspects ZIP entries before extraction, accepts only the two expected coverage JSON files, and caps each file at 2 MiB. It does not parse or render coverage or post comments; `davelosert/vitest-coverage-report-action@v2` remains the renderer. The user-authorized fix was pushed as [48b6922](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/48b69220e863d9a606718c5d693b1a9fe7a1f1dc), and the PR description was updated.

CI [#38521659229](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38521659229) and Supabase CI [#38521659201](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38521659201) passed on `48b6922`. The latest Vitest report run [#38521767060](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38521767060) still checked out `develop` at `1613e38`; its old downloader rejected the coverage-only artifact and its old reporter received HTTP 403. It did not run the new action/helper, so hosted publication is still unverified. Local Python/YAML parsing was unavailable because the Python shim could not spawn its child process; `actionlint` and Node were also unavailable. `git diff --check` passed.

All three new review threads ([4267013890](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4267013890), [4267013898](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4267013898), [4267013904](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4267013904)) were replied to and resolved after the commit was pushed. The five earlier threads remain resolved. See the [additional PR review summary](../../../logs/2026-10-14-vitest-coverage-action-additional-pr-review.md) for full evidence and limitations. PR #80 remains open; no merge or issue closure is included.

## Further PR review follow-up (2026-10-14)

Two additional threads arrived after the prior documentation push. Review comment [4267499593](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4267499593) claimed that the action's comment uses the `marker-start-` body-injection marker. Inspection of upstream v2 [`src/writeSummaryToPR.ts`](https://github.com/davelosert/vitest-coverage-report-action/blob/885b209a662906e816e47a317b8d1390a0f6fa52/src/writeSummaryToPR.ts) shows that this marker pair is only for injecting coverage into the PR description; ordinary PR comments use `<!-- vitest-coverage-report-marker-${name} -->`. The PR body has no injection marker pair, so the workflow's `connecttalent` comment marker and its postcondition are correct. The thread was answered with this source distinction and resolved without a code change.

Review comment [4267499600](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4267499600) was valid. The archived proposal and record incorrectly stated that all downloader code had been removed. VCA-AC-04 and the record now distinguish the removed report parser/comment writer/summary writer from the retained bounded artifact-only extractor. The proposal also records that this helper was a post-approval security hardening adjustment. The workflow still uses the upstream action as its only coverage parser and renderer.

These updates are documented in the [further review summary](../../../logs/2026-10-14-vitest-coverage-action-additional-pr-review.md). All ten known inline review threads are now recorded as resolved after their replies; PR #80 remains open and hosted publication remains unverified until the workflow reaches `develop`.

## Session evidence index

| Date / session | Summary log link | Work / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-14 / action migration | [Implementation summary](../../../logs/2026-10-14-vitest-coverage-action-implementation.md) | Replace custom Vitest report with upstream action under issue #72 | Static evidence and independent review recorded; YAML parser and hosted verification pending |
| 2026-10-14 / closeout | [Closeout summary](../../../logs/2026-10-14-vitest-coverage-action-closeout.md) | Record student acceptance, no-product sync, archive and PR preparation | Accepted with hosted report verification pending; static closeout checks recorded |
| 2026-10-14 / PR review follow-up | [Review follow-up summary](../../../logs/2026-10-14-vitest-coverage-action-pr-review-followup.md) | Diagnose the missing hosted coverage comment and address five PR review threads | Fixes pushed as `a5b1348`; all five threads replied to and resolved; CI and Supabase CI passed; hosted action verification remains pending after the workflow reaches `develop` |
| 2026-10-14 / additional PR review | [Additional review summary](../../../logs/2026-10-14-vitest-coverage-action-additional-pr-review.md) | Follow the upstream workflow pattern and address three new review comments | Workflow fix pushed as `48b6922`; the next two comments corrected marker-source analysis and archive evidence; all ten known threads resolved; hosted report still runs old `develop` workflow and remains unverified |

## Canonical sync and archive

- Accepted delta/human decision: no product delta; CI/reporting configuration only.
- Canonical sync: N/A.
- Archive decision/date/path: accepted and archived on 2026-10-14 at `workflow/archive/2026-10-14-vitest-coverage-action/`.
- Navigation repairs after moving: packet links and active/archive indexes updated and checked on 2026-10-14.
- Outstanding work: after integration, verify hosted comment creation/update and close issue #72 only when that evidence is available.
