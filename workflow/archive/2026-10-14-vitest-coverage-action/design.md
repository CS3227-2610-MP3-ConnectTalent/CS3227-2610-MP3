# Design: use the Vitest coverage report action

- Change/issues: `2026-10-14-vitest-coverage-action`; #72, related #58
- Owner/status/date: Johnwz123; approved for implementation; 2026-10-14
- Inputs: [proposal.md](proposal.md); ProductSpec v1.9; baseline `7bbf7af8aa6ddf27e596fd1e67609bc27e764efd`
- Scope and affected components/files: CI artifact producer, trusted `workflow_run` report workflow, Vitest coverage config, CI docs, and custom report helpers/tests

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Use `davelosert/vitest-coverage-report-action@v2` | Keep custom report client; use action in the privileged test job | User selected the upstream coverage action after the custom comment write failed. A separate trusted `workflow_run` preserves fork PR support without granting write permission to the test job. | User approved in this conversation on 2026-10-14 |
| Publish coverage summary only from the workflow-run report | Preserve custom JUnit counts and four metrics in one comment | The action does not report JUnit totals. Accept coverage-only output; the test step continues to print test results in CI logs. | User approved this scope on 2026-10-14 |
| Use exact run ID and run-attempt artifact name; grant job-only permissions | Download latest branch artifact; elevate workflow/repository default token permissions | Exact artifact provenance avoids selecting a newer or unrelated run. Required write scope remains local to the report job. | User approved the permission increase on 2026-10-14 |

## Interfaces and data flow

The `CI` workflow runs on PR code with read-only repository permission. Vitest writes `coverage-summary.json` and `coverage-final.json`; the upload step runs even after test failure and uploads only those files under the attempt-scoped artifact name. Their common upload root is `coverage`, so downloading to `coverage` places them at the explicit paths supplied to the report action. The separate `workflow_run` workflow checks out only the default branch with persisted checkout credentials disabled, downloads the named artifact from the triggering run ID using the triggering run attempt, and passes the downloaded JSON to the upstream action. The action writes the coverage report to the matching PR. Artifact contents are untrusted; no PR branch is checked out or executed by the privileged workflow.

## Authorization and privacy impact

The report job receives `actions: read` for cross-run artifact download, `contents: read` for default-branch checkout, and `pull-requests: write` for the PR comment. It has no `issues: write` permission and no workflow-wide write permission. The PR CI job has no comment-write scope. The coverage JSON contains source paths and coverage counters only; it does not include applicant records or secrets by design. No Applicant/HR data access, Supabase credentials, or hosted database operation is in this flow.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Unit tests fail after starting Vitest | Vitest exits nonzero; `reportOnFailure` writes coverage; artifact upload still runs; CI remains failed | VCA-AC-03; hosted run |
| CI fails before coverage output exists | Attempt artifact may be absent; the report workflow fails at download and produces no new comment | Workflow review and hosted failure-path evidence |
| Artifact is missing, malformed, or contains unexpected paths | Upstream action may fail to parse/report; source artifact remains untrusted and never executed | Independent action/workflow review; hosted report run |
| Report API rejects the token | Report job surfaces the action error; no broader token permissions are introduced automatically | Hosted report job logs, sanitized and reviewed |
| Fork PR run | Read-only CI can run; trusted default-branch workflow may write only its PR comment after matching the triggering run | Workflow event filter and hosted run |

## Migration and backward compatibility

No database, API, or product-data migration. The artifact keeps the current attempt-scoped name but contains only coverage JSON. JUnit XML and the custom test-count comment are removed. Existing comments are historical and are not deleted by this change; the action manages its own marked coverage comment going forward.

## Rollout and rollback

The `workflow_run` definition must reach the repository default branch before it can run as the reporter. After integration, a PR CI completion validates artifact download and comment creation/update. Rollback is a revert of the workflow/config/docs cleanup; existing CI test behavior remains the source of pass/fail status.

## Review and unresolved decisions

- [x] Verify the exact report job permissions, event guard, artifact run ID/name, and no-PR-checkout boundary; see the T03 handoff.
- [x] Verify uploaded path layout maps to the action's configured report paths; see the T03 handoff.
- [ ] Verify upstream action behavior and output against hosted evidence after default-branch integration.
- Findings/owner/resolution: separate reviewer found no blocking findings; hosted behavior remains pending. See T03 handoff.
- Human approval and acceptance: Johnwz123 approved the proposal/design/plan before implementation and accepted the reviewed implementation on 2026-10-14; hosted verification remains pending.
