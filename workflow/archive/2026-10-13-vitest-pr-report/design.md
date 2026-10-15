# Design: restore Vitest PR report comments

- Change/issues: `2026-10-13-vitest-pr-report`; #72, related #58 QG-AC-04/05
- Owner/status/date: Johnwz123; approved for implementation; 2026-10-13
- Inputs: [proposal.md](proposal.md); ProductSpec v1.9; current `develop` source and hosted run evidence
- Scope and affected components/files: `.github/workflows/test-report.yml`, `scripts/ci/report_vitest_pr.py`, focused Python tests, and CI docs only if needed

## Decisions and alternatives

| Decision                                                       | Considered alternatives                                                                           | Reason and tradeoffs                                                                                                                                                                                                                                                                     | Human approval reference                                                   |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Keep the repo-owned reporter for this repair                   | Replace it with davelosert action; immediately widen token permissions; ignore API write failures | The custom reporter already combines JUnit counts and coverage, validates bounded artifacts, correlates the current PR head, and prevents older reports overwriting newer reports. The failing server response is hidden, so replacement or permission changes would guess at the cause. | Johnwz123 approved this design on 2026-10-13 in this ChatGPT conversation. |
| Log bounded status and sanitized GitHub message for API errors | Print the entire HTTP body/headers; preserve the generic-only error                               | A small safe error category is enough to choose the next repair while keeping secrets and untrusted report content out of logs.                                                                                                                                                          | Pending                                                                    |

## Interfaces and data flow

The `workflow_run` event starts a default-branch reporter after CI completes. The workflow downloads only the triggering run's attempt-scoped report artifact. The Python parser validates bounded JUnit/coverage files, identifies exactly one open PR matching repository/branch/head SHA, fetches existing marked comments and current PR metadata, then uses the Issues API to create/update one comment. The reporter does not check out or execute the PR branch. Artifacts remain untrusted data.

The proposed diagnostic changes only the Python HTTP error path. It should record the HTTP status and a bounded safe GitHub `message` value after control-character removal; do not log the token, authorization header, request body, whole response body, applicant data, or artifact text. A demonstrated authentication/scope error may require a job-level permission edit; do not broaden workflow/repository defaults without the matching response and review.

## Authorization and privacy impact

The job currently grants `actions: read`, `contents: read`, `issues: write`, and `pull-requests: read`. The REST create-comment endpoint accepts Issues write or Pull requests write. The reporter handles synthetic test counts and coverage only, but the artifact producer is a PR workflow and remains untrusted. Keep job-level least privilege and keep PR code unexecuted. No Applicant/HR data or service-role credentials are part of this flow.

## Failure behavior

| Failure / adversarial input                 | Observable outcome / state guarantees                                                             | Verification                                          |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| GitHub API returns HTTP error               | Reporter remains failed; log contains bounded status and safe API message only                    | VPR-AC-01 mocked HTTPError test                       |
| Missing/malformed/oversized report artifact | Existing validated unavailable/failure behavior remains; no false pass                            | Existing report parser/downloader tests and VPR-AC-03 |
| Stale PR head or older workflow run         | No write or overwrite of newer report                                                             | Existing ordering/head tests and VPR-AC-03            |
| PR artifact contains adversarial text       | It is parsed as bounded data, never executed or echoed as arbitrary response data                 | Existing parser/security tests and reviewer check     |
| Current comment POST still fails            | Job remains failed with enough evidence to isolate response category; do not mark reporting fixed | Hosted report run; VPR-AC-02                          |

## Migration and backward compatibility

No database/schema/API migration. Preserve existing comment marker/metadata format, artifact names and attempt scoping. If the confirmed cause requires a permission change, keep it at the reporter job and review the exact effective scopes before the hosted check.

## Rollout and rollback

Workflow changes take effect when the approved issue-linked change reaches the default branch. The next PR-triggered CI completion provides the hosted reporter check. If diagnostics reveal a repository-level setting or external policy issue, stop source changes and return an operations handoff. Rollback is a revert of the reporter/workflow change; existing artifacts and comments remain unchanged.

## Review and unresolved decisions

- [ ] Confirm report parser tests prove status/message bounds and no secret/body leakage.
- [ ] Confirm current-head/stale-run behavior remains unchanged.
- Findings/owner/resolution: pending independent review.
- Human approval: Johnwz123 approved this design on 2026-10-13 in this ChatGPT conversation.
