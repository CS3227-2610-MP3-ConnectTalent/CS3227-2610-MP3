# Proposal: report unit coverage and automate dependency updates

- Change ID: 2026-10-11-coverage-dependabot
- Issues: [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58) (coverage and PR report); [#59](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/59) (Dependabot)
- Owner: pending issue triage; no owner is recorded on the issues
- Status: proposal/design and implementation plans approved; implementation independently reviewed and accepted by the user on 2026-10-11; packet archived on 2026-10-12; hosted validation and PR submission pending
- Date: 2026-10-11
- Baseline: ProductSpec v1.8; `develop` at `c9678b6442326ebcf8a0ef3f653ac820966a8ad2`
- Affected capabilities: none; process/tooling change
- Classification: process/tooling only; medium size because coverage backfill, CI reporting, and dependency automation have separate acceptance outcomes

## Intent, problem, and motivation

The current unit-test workflow does not publish an updating PR comment containing both test counts and coverage. The team chose a 90% project-wide target for lines, statements, branches, and functions, with meaningful tests/refactoring to reach it; coverage below target will be reported but will not fail CI or act as a merge gate. Unit-test failures continue to fail CI. Whether a CI result is required for merge depends on repository settings, which this change does not modify. Separately, dependency changes are currently not proposed on a scheduled cadence.

The work will improve meaningful unit coverage toward the four-metric target, report test results and coverage in one maintained PR comment, and configure weekly Dependabot version updates for pnpm dependencies and GitHub Actions. Coverage remains informational in CI.

## Goals, non-goals, and scope boundaries

- Goals:
  - Reach the 90% project-wide objective for line, statement, branch, and function coverage within the current Vitest source scope, and report each metric without failing CI when coverage is below target.
  - Add or refactor meaningful unit tests to reach all four thresholds without weakening or gaming the measured source scope.
  - Keep JUnit and machine-readable coverage outputs as CI artifacts, including when tests fail, and preserve existing workflow summaries/artifacts.
  - Maintain one PR comment with unit-test counts/status and all four coverage metrics; update it on subsequent runs for the same PR.
  - Safely report fork and same-repository PR runs without checking out or executing PR code in a privileged workflow; unit-test failures continue to fail CI, with merge enforcement left to existing repository settings.
  - Configure weekly Dependabot version updates for root pnpm dependencies and GitHub Actions; group minor/patch updates and leave major updates separate.
- Non-goals: product behavior or ProductSpec changes; integration/E2E coverage thresholds; changing test-suite ownership or triggers; automatic dependency merging; changing protected-branch settings; claiming security alerts/Dependabot security updates are enabled without checking repository settings.
- Users/roles: repository contributors and maintainers; no Applicant or HR behavior or data changes.
- Scope boundaries: Vitest configuration, unit tests and testable source refactoring, the existing unit-test CI workflow, a narrowly scoped reporter workflow/helper, `.github/dependabot.yml`, and only relevant contributor/CI documentation. Do not change unrelated test suites or historical decisions.

## Alternatives and dependencies

| Alternative                                                                          | Benefit / cost / risk                                                                                                                  | Decision and reason                                                                                              |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Enforce 90% coverage as a merge-blocking global gate                                 | Makes the target mechanically enforceable; could block merges while existing coverage is being improved                                | Rejected by the user; report the four metrics and target in the PR comment without blocking merges on coverage.  |
| Report four global metrics against a 90% target and add meaningful tests to reach it | Gives reviewers current coverage and supports meaningful coverage improvements without making the percentage a CI or merge gate        | Selected; coverage below target is informational, while unit-test failures remain blocking.                      |
| Exclude difficult source files to reach the target faster                            | Can hide untested production code and weaken the meaning of the report                                                                 | Rejected; tests/refactoring should close the actual gaps. Any proposed source-scope change returns for approval. |
| Use `davelosert/vitest-coverage-report-action` directly in the PR workflow           | Convenient coverage comment; would add a third-party action and does not supply the combined JUnit test-count report by itself         | Rejected for this design; a small repo-owned reporter will publish both artifacts.                               |
| Use GitHub's native Code Coverage display as the complete report                     | Native integration; its coverage display does not meet the requirement for a single comment with test counts and four coverage metrics | Rejected as the sole reporting mechanism.                                                                        |
| Use a default-branch `workflow_run` reporter that reads artifacts only               | Supports a combined comment and fork PRs; requires careful treatment of artifacts and a narrowly write-capable token                   | Selected; no untrusted PR code is checked out or executed in the privileged workflow.                            |
| Add Dependabot updates for every ecosystem                                           | Broader update coverage; unrelated ecosystems can create noise and exceed this change's scope                                          | Rejected; configure the actual project ecosystems only: npm (pnpm lockfile) and GitHub Actions.                  |

- Assumptions: current Vitest coverage scope and report outputs are confirmed during implementation; root `pnpm-lock.yaml` is handled by Dependabot's npm ecosystem; the repository can run the approved reporter workflow on its default branch.
- Dependencies: issues #58 and #59; current `develop` baseline; GitHub Actions artifacts and comments; Vitest coverage output.
- Risks: the four-metric 90% objective may expose substantial untested branching; tests can become brittle if written against internals; untrusted PR artifacts can target privileged reporting code; dependency PR volume can distract maintainers. Mitigate with behavior-focused tests, strict source-scope preservation, artifact/schema validation and PR/SHA correlation, and grouped minor/patch updates with a bounded open-PR count.
- Open decisions: issue owner/triage remains pending; repository-level Dependabot security-update settings require separate verification by an authorized maintainer.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                                                                      | Required evidence and owner                                                                                         |
| ------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------- |
| QG-AC-01      | Issue #58; process-only                       | Given the existing Vitest source scope, when unit tests pass but a global coverage metric is below 90%, then CI remains successful for coverage and the PR report labels that metric below target. Unit-test failures continue to fail CI.       | CI run and PR report showing coverage below target is informational and test failure remains blocking; implementer. |
| QG-AC-02      | Issue #58; process-only                       | Given source paths below a threshold, when tests/refactoring are added, then they exercise meaningful behavior and bring all four metrics to at least 90% without unapproved exclusions or coverage-scope reduction.                             | Coverage output, changed-test review, and full test results; implementer/reviewer.                                  |
| QG-AC-03      | Issue #58; process-only                       | Given unit tests pass or fail, when CI completes, then JUnit and machine-readable coverage artifacts remain available and existing summaries are preserved.                                                                                      | Workflow artifact configuration and successful/failing-run evidence; implementer.                                   |
| QG-AC-04      | Issue #58; process-only                       | Given a PR unit-test run completes, when its result and coverage artifacts are valid and associated with the current PR head, then one marked PR comment reports status/counts and all four coverage metrics and later runs update that comment. | Reporter behavior, permissions review, and PR run evidence for update and failure paths; implementer/reviewer.      |
| QG-AC-05      | Issue #58; process-only                       | Given a fork PR, stale run, malformed/missing artifact, or ambiguous PR association, when the reporter runs, then it never executes PR code, never reports a false pass, and skips or reports unavailable using the documented safe behavior.    | Workflow security review and negative-path tests/rehearsal; reviewer.                                               |
| DEP-AC-01     | Issue #59; process-only                       | Given the root pnpm project and GitHub Actions workflows, when weekly Dependabot version updates run, then minor/patch updates are grouped per ecosystem and major updates remain individually reviewable.                                       | Parsed configuration and GitHub config validation; implementer.                                                     |
| DEP-AC-02     | Issue #59; process-only                       | Given Dependabot proposes updates, then the configuration bounds open update PR volume and does not auto-merge, ignore packages, or alter repository security settings.                                                                          | Configuration review and repository-settings evidence or explicit pending status; implementer/reviewer.             |

- Spec deltas: N/A; this is repository tooling and contributor-process work, with no product behavior changes.
- Design: `design.md`; CI artifact trust and permission boundaries warrant a design.
- Plan and tasks: [coverage/reporting plan](plan.md), [Dependabot plan](dependabot-plan.md), and [shared tasks](tasks.md); approved for inline implementation on 2026-10-11.
- Evidence: `record.md`.

## Approval record

- [x] User approved the initial proposal/design and revised the coverage policy in chat on 2026-10-11; approver identity/role is not independently recorded.
- [ ] Implementation plan reviewed and approved before implementation.
- Decision/date/source: initial 90% four-metric objective and revised report-only coverage policy approved in this conversation on 2026-10-11; both implementation plans were then approved for inline execution on 2026-10-11.
- Implementation acceptance/date/source: the user accepted the completed implementation in chat on 2026-10-11 with “I accept the completed implementation, please proceed”; no conditions were stated. This is separate from proposal and plan approval.
- Approver identity/role: not independently recorded in this packet; issue owner/triage is pending.
- Conditions: preserve all four 90% coverage objectives as report-only; continue adding meaningful tests toward the target; report only from validated artifacts; never execute PR code in the privileged reporter; keep Dependabot limited to pnpm/npm and GitHub Actions with weekly grouped minor/patch updates.
