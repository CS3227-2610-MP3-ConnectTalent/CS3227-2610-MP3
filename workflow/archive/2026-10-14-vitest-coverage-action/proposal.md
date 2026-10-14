# Proposal: use the Vitest coverage report action

- Change ID: `2026-10-14-vitest-coverage-action`
- Issues: [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72); related accepted report contract [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58)
- Owner: Johnwz123
- Status: approved for implementation
- Date: 2026-10-14
- Baseline: ProductSpec v1.9; `develop` at `7bbf7af8aa6ddf27e596fd1e67609bc27e764efd`
- Affected capabilities: none; CI/reporting configuration only
- Classification: workflow/tooling defect; medium risk because the reporting job writes to pull requests

## Intent, problem, and motivation

The repository-owned Vitest PR reporter still fails at the hosted GitHub comment write with HTTP 403 `Resource not accessible by integration` (report run [#38419328159](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38419328159)). Its custom artifact downloader, parser, comment updater, summary writer, and helper tests add maintenance burden. The user selected the maintained `davelosert/vitest-coverage-report-action@v2` and explicitly approved the job-level permission it requires.

The action reports coverage, not JUnit test totals. This follow-up therefore changes the PR comment to a coverage-only report. Test totals continue to appear in the Vitest CI job logs. The 90% global coverage target remains informational.

## Goals, non-goals, and scope boundaries

- Goals:
  - Use the upstream action to publish the Vitest coverage report from the trusted `workflow_run` workflow.
  - Grant only the required job-level `pull-requests: write`, alongside `actions: read` for artifact download and `contents: read` for default-branch checkout.
  - Download only the triggering CI run's attempt-scoped artifact.
  - Generate JSON summary and per-file coverage data, including when Vitest tests fail, while keeping failing tests as CI failures.
  - Remove the custom Python report/downloader/summary implementation and its focused tests.
  - Keep the report workflow on the default branch and do not check out or execute PR code.
- Non-goals: change application behavior, Supabase workflows, test selection, the 90% target, or repository-wide token defaults; retain JUnit totals in the PR comment.
- Users/roles: contributors and PR reviewers; no Applicant/HR data or permissions are involved.
- Scope: `.github/workflows/ci.yml`, `.github/workflows/test-report.yml`, `vitest.config.ts`, `scripts/ci/`, `tests/ci/`, `README.md`, `CONTRIBUTING.md`, and this issue packet/index/log.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep and continue debugging the custom reporter | Preserves JUnit counts in the comment, but retains a custom parser/downloader/comment API client after a hosted 403 | Rejected by the user in favor of the upstream action |
| Use `davelosert/vitest-coverage-report-action@v2` | Maintained coverage output with less repository-owned code; needs PR write permission; does not provide JUnit totals | Approved by the user; accept coverage-only comment and keep write permission scoped to this job |

- Assumptions: the hosted report run failed on its GitHub API comment write; the selected action's documented permission and input contract match the pinned major version. Independent review and the next hosted report run must verify the effective behavior.
- Dependencies: #72; the CI artifact must be produced by the exact completed run and attempt.
- Risks: the report job processes untrusted JSON produced by PR CI while holding comment-write permission. Mitigations: no PR checkout or execution, exact run/attempt artifact selection, job-only permissions, and action review.
- Resolved decision: Johnwz123 accepted the upstream coverage-only PR comment after implementation on 2026-10-14. JUnit totals remain in CI logs; hosted comment creation/update is still unverified until the workflow runs after reaching the default branch.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| VCA-AC-01 | #72; process-only CI criterion | Given a completed PR CI run, when the trusted report workflow runs, then it downloads only `vitest-reports-${{ github.event.workflow_run.run_attempt }}` from that exact run and invokes the upstream v2 action. | Workflow/YAML static review and hosted run; implementer then reviewer |
| VCA-AC-02 | #72; least-privilege process criterion | Given the privileged report job, when it posts the coverage comment, then only that job has `pull-requests: write`, with `actions: read` and `contents: read`; no PR code is checked out or executed. | Permission and source-flow review; implementer then reviewer |
| VCA-AC-03 | #72; coverage behavior | Given unit tests pass or fail after starting Vitest, when the report action runs, then overall coverage metrics are available, the 90% indicators remain informational, and unit-test failures still fail CI. | Config/workflow inspection and hosted report run; reviewer and student |
| VCA-AC-04 | #72; scope cleanup | Given the action-based implementation, when maintainers inspect CI/docs, then no custom Python PR reporter, artifact downloader, summary writer, or their dedicated tests remain, and documentation describes coverage-only PR output. | Repository-wide reference scan, diff review, static checks; implementer then reviewer |

- Spec deltas: N/A; CI/report tooling only, no product behavior changes.
- Design: [design.md](design.md).
- Plan and tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Evidence: [record.md](record.md).

## Approval record

- [x] Scope, issue criteria, affected IDs, alternatives, design, and plan approved before implementation.
- Approver: user / accountable student Johnwz123.
- Decision/date/source: approved on 2026-10-14 in this ChatGPT conversation: “switch to use davelosert/vitest-coverage-report-action@v2 instead and give it the necessary `pull-request: write` it needs, and then remove and clean up our custom implementation.” The GitHub permission key will use the platform spelling `pull-requests: write`.
- Conditions: keep permission job-scoped, preserve exact attempt-scoped artifact download, remove custom implementation, record the intentional loss of JUnit totals from PR comments, and keep hosted verification/student acceptance separate.
