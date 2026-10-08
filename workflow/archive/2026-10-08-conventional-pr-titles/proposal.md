# Proposal: Conventional Commit titles for pull requests

- Change ID: 2026-10-08-conventional-pr-titles
- Issues: [#18](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/18)
- Owner: John Wong / @Johnwz123 is the requester; student ownership remains unverified and issue triage is pending
- Status: approved for implementation
- Date: 2026-10-08
- Baseline: [ProductSpec v0.7](../../ProductSpec.md)
- Affected capabilities: none; this is documentation/process-only
- Classification: narrow repository workflow clarification

## Intent, problem, and motivation

Commit subjects already use Conventional Commits, but PR titles are not consistently covered by the current guidance. Contributors need one clear title shape, examples, and a final check before opening a PR.

## Goals, non-goals, and scope boundaries

- Goals: require `type[optional scope][!]: description` for PR titles in contributor guidance, the PR template, the agent process, and the relevant PR readiness, closeout, and submission skills/profiles.
- Non-goals: change commit subject requirements, introduce title-lint automation or GitHub settings, alter issue labels/triage, or change product behavior.
- Users/roles: project contributors and reviewers.
- Scope boundaries: update only current workflow guidance; preserve historical archived packets and plans.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep PR titles unspecified | No change cost; titles remain inconsistent with commit history | Rejected because the user requested the existing standard to apply to PR titles. |
| Apply Conventional Commits format to PR titles | Small documentation change; makes titles consistent and reviewable | Chosen, using the established commit convention's structure. |

- Assumptions: the requested extension applies to future PR titles and does not imply repository-level enforcement.
- Dependencies: none.
- Risks: contributors may confuse PR title policy with individual commit subjects; guidance will show both separately.
- Open decisions: automated title enforcement is out of scope.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| PR-TITLE-AC-01 | #18; process-only | Given the contribution guidance, when a contributor prepares a PR, then current guidance consistently specifies `type[optional scope][!]: description` and gives examples. | Link/content review; contributor |
| PR-TITLE-AC-02 | #18; process-only | Given the PR-submission skill, when it prepares a PR, then it requires checking the title format before opening. | Skill content review; contributor |
| PR-TITLE-AC-03 | #18; process-only | Given this process change, no product behavior changes. | Scoped diff and no-product-delta record; reviewer |

- Spec deltas: none; no product requirement changes.
- Design: omitted because this is a bounded documentation/process clarification with no application, architecture, authorization, schema, AI, or integration changes.
- Plan and tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Evidence: [record.md](record.md).

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, no-delta/design-omission, and plan approved before process edits.
- Approver: requesting human (John Wong; student role not independently verified)
- Decision/date/source: approved in the user's 2026-10-08 request to update the development workflow, skills, and other relevant files to require Conventional Commit PR titles.
- Conditions: keep the PR-title policy distinct from the existing commit-subject policy; no automated enforcement is in scope.
