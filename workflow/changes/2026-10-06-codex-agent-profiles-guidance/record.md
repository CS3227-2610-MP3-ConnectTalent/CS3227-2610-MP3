# Feature record: Codex Agent Profiles and Contributor Guidance

Status: proposed

Owner: Student owner unassigned; team assignment pending

Spec version: v0.6; no product behavior delta
Date: 2026-10-06

## Metadata and artifact links

- Change ID/classification: `2026-10-06-codex-agent-profiles-guidance`; documentation/process only
- GitHub issue: [#13 — Add project Codex agents and contributor guidance](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13); issue owner/triage pending
- Branch/commits/PR: `chore/setup-sdd`; packet draft commit pending; PR not opened
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: None; no product delta
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: `64f5e36` (`docs(workflow): record independent review outcomes`)
- Archive path: Pending disposition and human acceptance

## Approval checklist

- [ ] Issue triaged and scope/owner agreed; actual student assignment is pending.
- [ ] Student approved proposal, design/profile inventory and plan; pending.
- [ ] Implementation and checks complete; not started pending approval.
- [ ] Independent review complete; pending.
- [ ] Human acceptance recorded separately; pending.
- [ ] Guide/navigation/reflection updates and every session log linked; pending.
- [ ] Pre-PR closeout complete and contributor PR opened last; pending.
- [ ] Product delta sync before archive; N/A because this is documentation/process only.

For each unchecked gate: student owner/triage and approval are needed before implementation; review and acceptance follow implementation; log, archive and PR follow accepted closeout. No completion claim is made.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| `codex-guidance-AC-01` | Issue #13; process only | `AGENTS.md` is concise, accurate and links to deeper guidance. | Pending implementation and review. |
| `codex-guidance-AC-02` | Issue #13; process only | `CONTRIBUTING.md` documents actual setup/check commands and issue-first, SDD, role/UI, code-quality, security, Conventional Commit, and PR-last expectations. | Pending implementation and review. |
| `codex-guidance-AC-03` | Issue #13; process only | Six custom-agent TOMLs parse and satisfy documented required fields with narrow missions and mapped skill references. | Pending implementation and syntax/schema review; discovery not yet exercised. |
| `codex-guidance-AC-04` | Issue #13; process only | Documents and profiles keep human decisions and real agent execution evidence explicit. | Pending implementation and policy review. |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Product analyst / Codex | Issue #13, current workflow, package and guide facts | Draft scope and acceptance criteria in this packet; no student assignment inferred. | Student owner/triage and proposal approval pending. |
| Solution architect / Codex | Official Codex documentation, existing skills, workflow process | Draft layout, six-profile mapping, and permission boundaries in `design.md`. | Student design/plan approval pending. |
| Implementer, reviewers, integration lead | Planned roles only; no implementation execution claimed | Pending. | Pending actual identities, ranges, evidence and student decisions. |

No independent implementation review has been performed. This current drafting execution is not an independent reviewer execution.

## Implementation and tests

Changed files: Draft packet files only: `proposal.md`, `design.md`, `plan.md`, `tasks.md`, and this `record.md`.

Commands and results: Repository state and existing templates/guides/package scripts were inspected. No application checks have been run. TOML and contributor files do not exist yet.

Security/adversarial cases and results: Design-only assessment; no product security behavior changed. Profile boundaries remain proposed until human approval and later review.

Known limitations: Issue owner/triage and human approval pending; no Codex runtime discovery, agent run, independent review, student acceptance, archive, or PR is claimed.

| Date / environment / commit | Exact command or manual check | Exit/result and counts | Output/evidence link | What this proves / does not prove |
| --- | --- | --- | --- | --- |
| 2026-10-06 / local repository / `64f5e36` | Read current `workflow/AgentProcess.md`, templates, skill manifests, `package.json`, root README, Developer Guide and repository file inventory. | Completed; no application or profile checks run. | Current packet and source paths. | Confirms draft design inputs from tracked source; does not prove student approval, agent execution, Codex discovery, product behavior, or test results. |
| 2026-10-06 / official OpenAI docs | Read official Codex custom-agent and AGENTS.md docs. | Completed; links recorded in `design.md`/final guidance plan. | [Codex subagents and custom agents](https://developers.openai.com/codex/multi-agent/); [AGENTS.md custom instructions](https://developers.openai.com/codex/guides/agents-md/) | Supports current documented path/schema/instruction layering; does not prove the repository's local Codex runtime discovers these proposed files. |

## Review and decision

Reviewer findings and fixes: Pending; no implementation review yet.

Human decision and date: Pending student owner assignment and explicit proposal/design/plan decision.

Guide/reflection/log updates: `AGENTS.md`, `CONTRIBUTING.md`, Developer Guide, README, workflow navigation and dated summary are planned; none are implementation outputs yet.

- Reviewer identity and independence: Pending separate read-only review; current proposal/design drafting is self-review.
- Findings/resolutions: Pending.
- Human decisions: Pending issue triage, approval, and later acceptance.
- Documentation/reflection updates: Pending implementation.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-06 / active issue #13 session | Pending pre-PR summary at `logs/2026-10-06-codex-agent-profiles-guidance.md` | User request, official docs research, issue #13, packet drafting, later implementation/review/closeout to be summarized at completion. | Not yet written; no transcript-completeness claim. |

## Canonical sync and archive

- Accepted delta/human decision: Pending; documentation-only, no product delta expected.
- Canonical sync commit/files/version/date: N/A; explain no product behavior delta after approval.
- Sync verification: Pending process-only no-delta confirmation at closeout.
- Archive decision/date/path: Pending human acceptance and complete closeout.
- Navigation repairs after moving: Pending archive path/link check.
- Outstanding work/limitations: Assign/confirm student owner and record approval before implementation; complete implementation, review, acceptance, dated summary, archive, and issue-linked PR in order.
