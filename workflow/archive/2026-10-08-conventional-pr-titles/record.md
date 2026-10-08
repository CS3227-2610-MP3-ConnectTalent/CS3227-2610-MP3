# Feature record: Conventional Commit titles for pull requests

Status: archived after requester acceptance; edits and static review complete; PR pending

Owner: John Wong / @Johnwz123 is the requester; student ownership is not independently verified

Spec version: [ProductSpec v0.7](../../ProductSpec.md); no product delta

Date: 2026-10-08

## Metadata and artifact links

- Change ID/classification: 2026-10-08-conventional-pr-titles; documentation/process
- GitHub issue: [#18](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/18); open, unassigned, and without labels/type; triage remains unconfirmed
- Branch/commits/PR: `feat/17-18-auth-redirects-pr-titles`; policy commit [213fb96](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/213fb963eab1f386cfc13391f925b1fedd57e742), shared guide change also included in auth commit [db032ed](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/db032ed463b7ba2beda3d2e44fd90e1f5fd8f25e); archive closeout commit is in branch history; PR pending.
- Proposal: [proposal.md](proposal.md)
- Design: omitted; bounded documentation/process update, no product architecture, application, or integration change
- Deltas: none; no product requirement change
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v0.7, commit `2fad6ed`
- Archive: complete at `workflow/archive/2026-10-08-conventional-pr-titles/` on 2026-10-08.

## Approval checklist

- [x] Scope and plan approved in the user's direct 2026-10-08 request.
- [ ] Issue triage and student ownership are not confirmed.
- [x] Relative links across the touched workflow/packet Markdown resolve after archive; wording was checked for the same format. A PowerShell scan checked 23 current/archived Markdown files; a trailing-whitespace scan checked 14 new/updated Markdown files. `git diff --check HEAD` and the staged closeout check pass (exit 0; line-ending warnings only).
- [x] Separate independent review found no remaining findings after the #17 production signup coverage fix. The requesting human approved the policy and instructed archive/PR on 2026-10-08; student status is not independently verified.
- [x] Dated session summary and archive navigation complete.
- [ ] Issue-linked PR pending.
- [x] Product-spec sync is N/A because the change is process-only with no product delta.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion | Observable outcome | Evidence, result and limitation |
| --- | --- | --- | --- |
| PR-TITLE-AC-01 | #18; process-only | Current guidance and PR template specify `type[optional scope][!]: description` with examples and distinguish PR titles from commit subjects. | Passed: current guidance was content-reviewed and relevant local Markdown links resolve. |
| PR-TITLE-AC-02 | #18; process-only | PR-submission guidance checks title format before opening. | Passed: submission, closeout and readiness skill/profile include title preparation or validation. |
| PR-TITLE-AC-03 | #18; process-only | No product behavior or canonical requirement changes. | Passed: independent reviewer confirmed the title-policy edits make no product or canonical requirement changes. |

## Agent handoffs

See [combined independent review handoff](handoffs/independent-review.md). The reviewer read the current PR-title guidance and found it consistent across the root, contributor guide, Developer Guide, agent process, template, skills and evidence-lead profile.

## Implementation and tests

Changed files: `AGENTS.md`, `CONTRIBUTING.md`, `docs/DeveloperGuide.md`, `workflow/AgentProcess.md`, `.github/pull_request_template.md`, `.agents/skills/mp3-pr-submission/SKILL.md`, `.agents/skills/mp3-closeout-and-logging/SKILL.md`, `.agents/skills/mp3-integration-evidence-lead/SKILL.md`, `.codex/agents/integration_evidence_lead.toml`, and the active/archive navigation. Commits: `db032ed463b7ba2beda3d2e44fd90e1f5fd8f25e` (shared Developer Guide change) and `213fb963eab1f386cfc13391f925b1fedd57e742` (policy guidance and skills/profile).

Commands and results: a PowerShell link scan checked 23 current/archived Markdown files and found no missing relative targets; a trailing-whitespace scan checked 14 new/updated Markdown files. Content review confirmed the format is consistent across contributor guidance, root guidance, process, template, skills, and the evidence-lead profile. Python `tomllib` parsed `.codex/agents/integration_evidence_lead.toml` successfully. `git diff --check HEAD` and the staged closeout check passed with exit 0; only line-ending warnings were emitted.

Security/adversarial cases: N/A; process wording only. No settings or access rules changed.

Known limitations: policy is documented but no automated PR-title enforcement is introduced. Issue triage and student ownership remain unconfirmed.

## Review and decision

- Reviewer identity and independence: `/root/independent_auth_review`, separate read-only test-engineer execution; no implementation/test authorship and no edits.
- Findings/resolutions: no remaining finding on #18; the only review finding applied to #17 test coverage and was resolved/rechecked.
- Human decisions: user explicitly accepted the workflow policy and instructed archive/PR on 2026-10-08. Student role is not independently verified.
- Documentation/reflection updates: workflow files updated; the current dated session summary and packet links are complete.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-08 / active session | [session summary](../../../logs/2026-10-08-supabase-auth-and-pr-title-closeout.md) | Issue #18 intake, policy edits, tests and closeout | Static checks, independent review, archive and navigation passed; PR pending |

## Canonical sync and archive

- Accepted delta/human decision: no product delta; user approved the process scope on 2026-10-08.
- Canonical sync commit/files/version/date: N/A; no product requirements changed.
- Sync verification: N/A confirmed; the independent reviewer found no product or canonical requirement changes.
- Archive decision/date/path: user directed archive after checks; complete packet archived to `workflow/archive/2026-10-08-conventional-pr-titles/` on 2026-10-08.
- Navigation repairs after moving: active and archive indexes plus relative links checked; historical 2026-10-07 log wording remains unchanged.
- Outstanding work: PR opening remains the final contributor action. Issue #18 is open, unassigned, and without labels/type; student ownership/triage remain unverified.
