# Feature record: restore Vitest PR report comments

Status: PR #73 is open with the issue-specific reporter diagnostic and review correction committed; hosted API cause and report recovery remain open under issue #72.

Owner: Johnwz123; scope and ownership approved by the user on 2026-10-13.

Spec version: 1.9 — [ProductSpec](../../ProductSpec.md)
Date: 2026-10-13

## Metadata and artifact links

- Change ID/classification: `2026-10-13-vitest-pr-report`; CI/reporting defect.
- GitHub issues: [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72); related accepted report contract [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58).
- Branch/commits/PR: `fix/71-72-ci-workflows`; PR [#73](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/73) is open. The reporter change is in its own issue-focused commit.
- Proposal: [proposal.md](proposal.md).
- Design: [design.md](design.md).
- Deltas: none; report and CI tooling only.
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Baseline: ProductSpec v1.9 dated 2026-10-13; `develop` commit `e1115a06a8798b5ddc23cf3d6c267dd4e1176297`.
- Archive path: [workflow/archive/2026-10-13-vitest-pr-report](../../archive/2026-10-13-vitest-pr-report); complete packet archived 2026-10-13 as an accepted bounded diagnostic slice with VPR-AC-02 still open.

## Approval checklist

- [x] Issue #72 is linked, assigned to Johnwz123, and approved for implementation by the accountable user on 2026-10-13.
- [x] Human approval of proposal, design, and plan before implementation.
- [x] Focused tests and safe error diagnostics pass locally; hosted comment creation/update evidence remains pending.
- [x] Independent review and student acceptance of the bounded diagnostic implementation; hosted recovery remains open.
- [x] Dated summary and PR closeout; guide updates are N/A for CI tooling.
- [x] Complete packet archived after acceptance of the bounded diagnostic slice; product sync is N/A because no product behavior changes. VPR-AC-02 remains open for post-integration hosted verification.

## Requirement and acceptance criteria

See [proposal.md](proposal.md#acceptance-evidence-and-artifacts) for VPR-AC-01 through VPR-AC-03, restoring issue #58 QG-AC-04/05. No canonical product requirement is changed.

## Agent handoffs

Implementation assignment: [T01-T05 implementer handoff](handoffs/T01-implementer.md). Separate independent review: [T06 reviewer handoff](handoffs/T06-independent-review.md).

## Implementation and tests

Changed files: `scripts/ci/report_vitest_pr.py` and `tests/ci/test_report_vitest_pr.py`. HTTP errors now report only status plus a bounded, normalized GitHub `message`; the exact token is redacted, other response fields/headers/body are omitted, and the response is closed.

Verification:

- RED: `python -m unittest discover -s tests/ci -p "test_report_vitest_pr.py" -k http_error -v` failed before the implementation because the error omitted `HTTP 403` and the API message.
- GREEN: the same focused regression passed after the change, including redaction, bounds, control-character, body/header non-disclosure, and response cleanup assertions.
- PASS: `python -m unittest discover -s tests/ci -p "test_*.py" -v` — 49 tests passed after the PR review correction.
- PASS: `git diff --check`.
- REVIEW RED: mocked `IncompleteRead` response escaped the safe fallback before the review fix.
- REVIEW GREEN: the reporter catches `http.client.IncompleteRead`, emits the generic bounded fallback, and closes the response; the focused regression and final 49-test helper suite pass.

Observed hosted evidence:

- [Vitest PR report run #15](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38362345721): report artifact was downloaded and validated; the job summary rendered 357 passing tests and coverage metrics; the final GitHub API POST failed.
- The workflow log recorded `actions: read`, `contents: read`, `issues: write`, and `pull-requests: read`. The reporter's Python error path reduces all HTTP errors to a generic method failure, so status, message, and exact cause remain unknown.
- GitHub's REST create-comment documentation allows either Issues write or Pull requests write for this endpoint; permission absence is not established by the current logs.

Security/adversarial cases: retain the existing no-PR-checkout/no-PR-execution design, attempt-scoped artifacts, bounded parser, current-head check, and stale-report ordering. Never log the token, full headers, full API body, or artifact content.

Known limitations: no hosted write retry was performed. The exact GitHub API status/message from run #15 is still unknown. The reporter workflow checks out the default branch, so this branch cannot run its changed reporter from a PR-triggered `workflow_run`; the diagnostic code must reach the default branch first. No repository or organization setting or permission was changed, and comment creation/update remains unverified.

## Review and decision

Reviewer findings and fixes: the separate reviewer found that C1 control characters could reach stderr; the sanitizer now removes C0, DEL, and C1 characters, with the U+009B regression confirming the correction. PR #73 review also identified `http.client.IncompleteRead` escaping the diagnostic fallback. The added regression failed before the fix; after catching this exception, it passes and confirms response cleanup. The complete Python suite passed 49 tests with this correction. VPR-AC-01 and local mocked VPR-AC-03 pass. VPR-AC-02 hosted create/update evidence remains unavailable.

Human decisions and date: Johnwz123 approved the proposal, design, and plan on 2026-10-13 and accepted the diagnostic implementation with hosted verification outstanding. The user later authorized archive, commit, push, and PR submission conditional on passing Playwright, then requested addressing and pushing PR review fixes. PR #73 is open; the authorization does not mark VPR-AC-02 complete or close issue #72.

Guide/reflection updates: N/A for CI tooling. The [issue-specific review closeout](../../../logs/2026-10-13-vitest-pr-report-closeout.md) records the evidence and remaining hosted limitation.

## Session evidence index

| Date / session              | Summary log link                                                                  | Work / prompts / decisions covered                                                                         | Verification status / missing coverage                                                  |
| --------------------------- | --------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 2026-10-13 / intake and implementation | [Issue-specific review closeout](../../../logs/2026-10-13-vitest-pr-report-closeout.md) | Records the failed hosted POST, bounded diagnostics, security controls, and approval. | Local mocked checks pass; the exact hosted API response remains unknown. |
| 2026-10-13 / independent review | [T06 independent review](handoffs/T06-independent-review.md) | Separate test-engineer review and recheck of diagnostics, redaction, and workflow safety. | C1 sanitizer finding resolved; hosted comment create/update remains unverified. |
| 2026-10-13 / PR review response | [Issue-specific review closeout](../../../logs/2026-10-13-vitest-pr-report-closeout.md) | Added incomplete-response fallback and regression test in the issue-focused commit. | Focused test passes; full Python suite result is recorded in the closeout log. |

## Canonical sync and archive

- Accepted delta/human decision: bounded CI diagnostic change accepted by Johnwz123 on 2026-10-13; no product delta.
- Canonical sync: N/A for CI/reporting tooling with no product behavior change.
- Archive decision/date/path: complete packet archived on 2026-10-13 at `workflow/archive/2026-10-13-vitest-pr-report/` after acceptance of the diagnostic slice; product sync N/A.
- Outstanding work under issue #72: integrate the diagnostic reporter on the default branch, observe a later hosted report run, fix the demonstrated API cause or obtain an operations decision, and verify create/update and stale-head behavior. This PR references #72 without closing it.
