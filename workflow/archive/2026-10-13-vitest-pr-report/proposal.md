# Proposal: restore Vitest PR report comments

- Change ID: `2026-10-13-vitest-pr-report`
- Issues: [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72); related accepted report contract [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58)
- Owner: Johnwz123; scope and ownership approved on 2026-10-13
- Status: approved for implementation
- Date: 2026-10-13
- Baseline: ProductSpec v1.9; `develop` at `e1115a06a8798b5ddc23cf3d6c267dd4e1176297`
- Affected capabilities: none; CI/reporting tooling only
- Classification: CI reporter defect; medium risk because the workflow writes to pull requests using a privileged token

## Intent, problem, and motivation

Vitest PR report runs download and validate the exact CI run's bounded artifacts and render a job summary, but the final GitHub API POST that creates the PR comment fails. Run [#15](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38362345721) reports only `GitHub API POST request failed`. The Python reporter currently discards the HTTP status and GitHub error message, so the exact remote cause is not established.

The workflow token log showed `issues: write` and `pull-requests: read`. GitHub's create-issue-comment endpoint accepts either Issues write or Pull requests write, so the current evidence does not prove that a missing permission is the cause. The safe next step is to expose bounded, sanitized error detail, then correct the demonstrated cause while retaining current artifact and stale-run protections.

## Goals, non-goals, and scope boundaries

- Goals:
  - Preserve enough safe GitHub API error detail to distinguish authorization, validation, resource, and rate-limit failures without logging a token, headers, or full response body.
  - Fix the specific cause established by the next diagnostic run.
  - Retain the single marked comment, current-head check, run ordering, artifact bounds, untrusted artifact parsing, and no-PR-code-execution boundary.
  - Verify creation and update of the same PR comment in a hosted report run.
- Non-goals: change the four coverage metrics or 90% informational target; change the main CI test workflow; broaden repository-wide token defaults; check out or execute PR code; modify repository Actions settings without a separately approved operational plan.
- Users/roles: repository contributors and reviewers; no Applicant/HR behavior or data changes.
- Scope boundaries: `.github/workflows/test-report.yml`, `scripts/ci/report_vitest_pr.py`, its focused tests, and related CI documentation only if the demonstrated fix requires it.

## Alternatives and dependencies

| Alternative                                                             | Benefit / cost / risk                                                                                            | Decision and reason                                                                                                                                                                                |
| ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Keep the repository-owned reporter and diagnose the exact POST response | Preserves combined test counts and four coverage metrics, and retains current artifact/head/stale-run safeguards | Recommended; this is the smallest route to repair the accepted contract                                                                                                                            |
| Replace it with `davelosert/vitest-coverage-report-action@v2`           | Less custom coverage-report code; its README supports a `workflow_run` artifact pattern                          | Not selected for this packet: the action reports coverage, not the required JUnit test totals by itself; it also requires PR-comment write access and does not explain the current failed response |
| Add more token permissions immediately                                  | Could help if the response is an authorization failure                                                           | Rejected without evidence; current `issues: write` is an accepted permission for this REST endpoint                                                                                                |
| Treat comment failure as non-fatal                                      | Would stop the report workflow from being red                                                                    | Rejected; it would hide a broken accepted reporting outcome                                                                                                                                        |

- Assumptions: the report workflow runs from the default branch, has read access to the exact triggering run artifact, and keeps PR code unexecuted.
- Dependencies: issue #72; existing `workflow_run` reporter and GitHub Actions API; a later hosted PR report run is required to establish the actual response.
- Risks: diagnostics must not expose token/header data or untrusted artifact content; any permission change must remain job-scoped and minimum necessary. If the response points to repository settings, stop and request a separate authorized operations change.
- Open decisions: implementation evidence, independent review, student acceptance, and PR closeout remain pending.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                                                                    | Required evidence and owner                                                 |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| VPR-AC-01     | Issue #72; restores #58 QG-AC-04              | Given GitHub rejects an API request, when the reporter logs the failure, then the log includes a bounded status and safe error message sufficient to diagnose the category without printing the token, request headers, or full response body. | Focused Python tests for HTTP errors and redaction; implementer/reviewer.   |
| VPR-AC-02     | Issue #72; #58 QG-AC-04                       | Given valid reports for an open current PR head, when the workflow completes, then one marked comment contains test totals/status and all four metrics, and later runs update that comment.                                                    | Hosted report workflow run and PR comment; implementer.                     |
| VPR-AC-03     | Issue #72; #58 QG-AC-05                       | Given stale/ambiguous PR associations, malformed artifacts, or failed API writes, when the reporter runs, then it does not claim a false report success, execute PR code, or overwrite a newer head's report.                                  | Existing and focused negative-path tests plus independent review; reviewer. |

- Spec deltas: none; issue #58 is process/tooling and product behavior is unchanged.
- Design: [design.md](design.md).
- Plan and tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Evidence: [record.md](record.md).

## Approval record

- [x] Issue scope, affected acceptance IDs, and ownership triaged.
- [x] Human approved proposal, design, and plan before implementation.
- Approver: Johnwz123
- Decision/date/source: explicit approval in this ChatGPT conversation on 2026-10-13.
- Conditions: none recorded
