# Design: unit coverage reporting, PR reporting, and Dependabot

- Change ID/issues: `2026-10-11-coverage-dependabot`; [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58), [#59](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/59)
- Owner/status/date: issue owner pending triage; approved by user in chat, 2026-10-11; implementation plans approved for inline execution
- Inputs: `proposal.md`; no product delta; ProductSpec v1.8; `develop` baseline `c9678b6442326ebcf8a0ef3f653ac820966a8ad2`
- Scope and affected components/files: `vitest.config.ts`, unit tests and testable source as needed, existing CI workflow, a report workflow/helper, `.github/dependabot.yml`, and relevant test/CI instructions

## Decisions and alternatives

| Decision                                                                                                          | Considered alternatives                                                           | Reason and tradeoffs                                                                                                                                                               | Human approval reference                                      |
| ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Report lines, statements, branches, and functions against a 90% global target without a coverage-based CI failure | Enforce a global merge gate; gate only new/changed code; report without a target  | User chose a visible 90% objective while keeping coverage informational. Unit-test failures remain blocking; a changed-code gate can be reconsidered after reviewing the baseline. | Revised coverage policy approved by user in chat, 2026-10-11. |
| Keep the current measured source scope and close coverage gaps with meaningful tests/refactoring                  | Exclude difficult modules or lower individual thresholds                          | Avoids hiding untested code; if the existing scope proves incorrect, return that proposed change for human approval.                                                               | Same approval, 2026-10-11.                                    |
| Have a default-branch `workflow_run` reporter parse JUnit and coverage artifacts and upsert one PR comment        | PR-workflow comment action; native Code Coverage alone; third-party Vitest action | One repo-owned comment can include test counts plus all four metrics and can avoid running PR code in a privileged context. It adds a small maintained component.                  | Same approval, 2026-10-11.                                    |
| Configure Dependabot for npm and GitHub Actions weekly, grouping minor/patch and leaving major updates separate   | Daily updates; one PR per patch/minor; automated merge                            | Weekly groups limit review noise while preserving major upgrades as separate decisions. Do not auto-merge dependencies.                                                            | Same approval, 2026-10-11.                                    |

## Interfaces and data flow

### Coverage and CI artifacts

1. The existing unit-test job runs Vitest with the current coverage include/exclude scope. Do not configure global thresholds that fail CI. Report `lines`, `statements`, `branches`, and `functions` against 90%; coverage below target is informational, while actual unit-test failures remain a blocking unit CI result.
2. Vitest emits JUnit plus machine-readable coverage data suitable for calculating the four global metrics. Upload both under a stable, documented artifact name even if the test command fails, while preserving current step/workflow summaries and artifacts.
3. Add behavior-focused unit tests and refactor testable source only when needed to meet each target. Do not remove files from the existing coverage scope, add blanket ignores, or substitute tests of private implementation details to inflate the result. Any scope exception requires a separate documented rationale and renewed approval.

### PR comment reporter and trust boundary

1. A separate reporter workflow runs on the default branch after the designated unit-test workflow completes. Its job uses only the required read scopes for workflow/run and PR metadata plus the smallest permission required to create/update a PR comment.
2. It resolves the PR from GitHub's workflow/run association and independently verifies repository, target branch (`develop` or `master`, matching current CI triggers), open state, and that the run head SHA is still the PR's current head. If no unique current PR matches, it does not comment.
3. It downloads only the expected report artifact for that exact workflow run. Artifact names, file list, size and expected schema are checked. JUnit and coverage files are treated as untrusted data: parse data only; reject DTD/entity processing and unexpected structures; never shell-evaluate artifact values.
4. The reporter does not check out, install, import, or execute PR source or artifacts. It uses trusted code from the default-branch workflow/repository and GitHub APIs for PR metadata. This preserves fork-PR support without granting the PR workflow write permissions.
5. It upserts a single comment identified by a stable HTML marker. The report shows the workflow result, test counts (passed/failed/skipped as available), and line/statement/branch/function percentages against their 90% target, with each coverage metric marked as meeting or below target. Coverage status is informational and does not fail the unit-test workflow. Failed/missing tests, absent artifacts, or malformed reports cannot be rendered as a test pass; display an explicit unavailable/error state or skip when association is unsafe.
6. A later run for the same PR updates the marked comment. Stale runs are ignored so an earlier commit cannot overwrite a report for the current head. The unit-test job continues to determine test pass/fail; the reporter is presentation and coverage status does not alter that result. Whether any CI status is required by repository merge settings is outside this design.

### Dependabot

Add `.github/dependabot.yml` with two update entries:

- `npm`, directory `/`, weekly schedule, covering the root `pnpm-lock.yaml`; group minor and patch version updates together; leave major updates separate.
- `github-actions`, directory `/`, weekly schedule; group minor and patch version updates together; leave major updates separate.

Set an open version-update PR limit of five per ecosystem, and do not configure ignored dependencies, auto-merge, or version pinning policy changes. Dependabot version updates are distinct from security-update alerts/PRs. Verify the repository-level security alert/update settings if access allows; otherwise document that status as pending for an authorized maintainer rather than claiming the YAML enabled it.

## Authorization and privacy impact

No product, applicant, or HR data is read or changed. The normal PR test workflow retains read-only repository permissions and does not receive comment-write permission. The default-branch reporter is the only component that needs comment-write permission; it handles untrusted artifact contents as data and must not execute PR code. The reporter must validate PR identity and head SHA before writing. No credentials, test payloads, or applicant content belong in the report.

## Failure behavior

| Failure / adversarial input                                                    | Observable outcome / state guarantees                                                                          | Verification                                                             |
| ------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Any coverage metric is below 90% while unit tests pass                         | Unit CI passes its coverage step and the PR comment marks the metric below target; artifacts remain available. | QG-AC-01; CI and report evidence.                                        |
| Unit tests fail but JUnit/coverage artifacts are produced                      | Unit CI fails; reporter clearly reports failed counts and does not present success.                            | QG-AC-03/04; failing-run evidence.                                       |
| Artifact is absent, oversized, malformed, or contains unexpected XML/JSON      | Reporter rejects it; no false-green report or unsafe execution occurs.                                         | QG-AC-05; negative-path tests/rehearsal.                                 |
| Workflow run has no unique matching open PR, targets another base, or is stale | Reporter makes no comment update for that run.                                                                 | QG-AC-05; mocked/API-path verification.                                  |
| Comment API call fails                                                         | Reporter job reports failure; unit CI result remains authoritative and unchanged.                              | Reporter failure-path verification.                                      |
| Dependabot encounters a package/ecosystem configuration error                  | GitHub reports configuration/update failure; no update is silently ignored or auto-merged.                     | Configuration validation and GitHub-reported diagnostics when available. |

## Migration and backward compatibility

No schema, runtime API, database migration, or product data changes. Existing unit tests and artifacts remain available; new report artifact names must be versioned or documented if changed. Dependabot adds proposals only and does not modify dependencies until a PR is reviewed and merged. Coverage below target does not create a required status failure; existing unit-test failures and other CI checks continue to behave as configured. This change does not alter branch-protection settings.

## Rollout and rollback

Roll out through the issue-linked PR to `develop`; the first CI runs will expose existing coverage gaps and may lead to additional test/refactor work toward the target. If the reporter fails independently, disable/revert only the reporting workflow while retaining coverage artifacts and ordinary unit-test enforcement. A low coverage percentage is reported for reviewer consideration and does not block merges. Reverting `.github/dependabot.yml` stops future version update scheduling; already-open Dependabot PRs require separate close/retain decisions.

## References

- [Vitest coverage configuration](https://vitest.dev/config/coverage)
- [GitHub Actions workflow-run security guidance](https://docs.github.com/en/actions/reference/security/securely-using-pull_request_target)
- [GitHub Actions artifact download permissions and cross-run support](https://github.com/actions/toolkit/blob/main/packages/artifact/README.md)
- [Dependabot version update configuration](https://docs.github.com/en/code-security/how-tos/secure-your-supply-chain/secure-your-dependencies/configure-version-updates)
- [Dependabot supported ecosystems](https://docs.github.com/en/code-security/reference/supply-chain-security/dependency-graph-supported-package-ecosystems)

## Review and unresolved decisions

- [x] Interfaces, issue criteria, and no-product-delta boundary reviewed against the proposal.
- [x] Reporter permissions and untrusted-artifact behavior reviewed at design level.
- Findings/owner/resolution: separate security and test reviews are complete; findings and rechecks are recorded in the [security handoff](handoffs/security-review.md) and [test handoff](handoffs/test-review.md). No unresolved source finding remains. The repository-wide formatter now passes after formatting the 187 previously unformatted files. Hosted workflow/Dependabot validation remains pending. Active repository rulesets for `develop` and `master` had empty required-status-check lists during the recorded read-only inspection. The classic branch-protection endpoint returned 403, so any separate classic required-check rule is unknown. This design excludes repository-setting changes; any future proposal to make coverage block merges requires a separate human decision and plan amendment.
- Human approval: revised report-only coverage policy, updated written proposal/design, and both implementation plans approved by user in chat on 2026-10-11.
