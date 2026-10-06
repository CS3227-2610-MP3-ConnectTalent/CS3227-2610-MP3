# Feature record: Codex Agent Profiles and Contributor Guidance

Status: in progress; requester approved implementation, student owner assignment pending

Owner: Student owner unassigned; team assignment pending

Spec version: v0.6; no product behavior delta
Date: 2026-10-06

## Metadata and artifact links

- Change ID/classification: `2026-10-06-codex-agent-profiles-guidance`; documentation/process only
- GitHub issue: [#13 — Add project Codex agents and contributor guidance](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13); student owner assignment pending
- Branch/commits/PR: `chore/setup-sdd`; packet draft commit pending; PR not opened
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: None; no product delta
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: `64f5e36` (`docs(workflow): record independent review outcomes`)
- Archive path: Pending disposition and human acceptance

## Approval checklist

- [ ] Issue triaged and student owner assigned; owner assignment is pending.
- [x] Requester explicitly approved proposal, design/profile inventory and plan in chat on 2026-10-06; requester's name/student role not provided.
- [ ] Implementation and checks complete; implementation is in progress.
- [ ] Independent review complete; pending.
- [ ] Human acceptance recorded separately; pending.
- [ ] Guide/navigation/reflection updates and every session log linked; pending.
- [ ] Pre-PR closeout complete and contributor PR opened last; pending.
- [ ] Product delta sync before archive; N/A because this is documentation/process only.

For each unchecked gate: student owner assignment remains pending and must be recorded before student acceptance and PR; review, acceptance, log, archive and PR follow implementation. Requester approval permits the bounded implementation but does not supply a student owner name or imply student acceptance.

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
| Primary Codex execution / proposal and design roles | Issue #13, current workflow, package/guides and official Codex documentation | Created the approved bounded packet; this is one execution, not multiple agents. | Requester approved in chat on 2026-10-06; name and student role unavailable; student owner assignment pending. |
| Implementer | Approved issue-linked packet and current repository | Implementation in progress; changes and checks are recorded below. | Student owner acceptance remains pending. |
| Separate reviewer and integration evidence lead | Planned, not yet dispatched | No review execution claimed yet. | Pending exact identity, range, findings, handoff and owner decision. |

No independent implementation review has been performed yet. The current primary execution is not an independent reviewer execution.

## Implementation and tests

Changed files: `AGENTS.md`, `CONTRIBUTING.md`, and approved packet files. Additional agent/config/navigation artifacts will be listed during closeout.

Commands and results: Inspected current process/templates/package scripts and `.env.example`; verified the documented setup/check commands exist. A PowerShell inline check resolved all local Markdown link targets in `AGENTS.md` and `CONTRIBUTING.md`. Application checks are not applicable to this documentation/configuration-only change; TOML/content/link checks for the remaining files are pending.

Security/adversarial cases and results: Design-only assessment; no product security behavior changed. Profile boundaries remain proposed until human approval and later review.

Known limitations: Student owner assignment pending. No Codex runtime discovery is claimed unless actually exercised; separate review, student acceptance, archive, and PR remain pending.

| Date / environment / commit | Exact command or manual check | Exit/result and counts | Output/evidence link | What this proves / does not prove |
| --- | --- | --- | --- | --- |
| 2026-10-06 / local repository / `64f5e36` | Read current `workflow/AgentProcess.md`, templates, skill manifests, `package.json`, root README, Developer Guide and repository file inventory. | Completed; no application checks run. | Current packet and source paths. | Confirms design inputs from tracked source; does not prove agent execution, Codex discovery, product behavior, or test results. |
| 2026-10-06 / local repository / `17b73ba` plus working tree | PowerShell inline local-Markdown-link check over `AGENTS.md` and `CONTRIBUTING.md`; inspected documented commands against `package.json` and `.env.example`. | Passed; all local link targets resolved and referenced package commands were present. | `AGENTS.md`, `CONTRIBUTING.md`, package scripts. | Checks link paths and command names only; does not validate anchors, execute app commands, or prove runtime Codex behavior. |
| 2026-10-06 / official OpenAI docs | Read official Codex custom-agent and AGENTS.md docs. | Completed; links recorded in `design.md`/final guidance plan. | [Codex subagents and custom agents](https://developers.openai.com/codex/multi-agent/); [AGENTS.md custom instructions](https://developers.openai.com/codex/guides/agents-md/) | Supports current documented path/schema/instruction layering; does not prove the repository's local Codex runtime discovers these proposed files. |

## Review and decision

Reviewer findings and fixes: Pending; no implementation review yet.

Human decision and date: Requester approved the bounded proposal/design/plan by chat reply on 2026-10-06; requester name and student role were not supplied. Student acceptance is pending.

Guide/reflection/log updates: `AGENTS.md`, `CONTRIBUTING.md`, Developer Guide, README, workflow navigation and dated summary are planned; none are implementation outputs yet.

- Reviewer identity and independence: Pending separate read-only review; current proposal/design drafting and implementation are one primary execution.
- Findings/resolutions: Pending.
- Human decisions: Pending issue triage, approval, and later acceptance.
- Documentation/reflection updates: Pending implementation.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-06 / active issue #13 session | Pending pre-PR summary at `logs/2026-10-06-codex-agent-profiles-guidance.md` | User request and approval, official docs research, issue #13, packet drafting, implementation/review/closeout. | Not yet written; no transcript-completeness claim. |

## Canonical sync and archive

- Accepted delta/human decision: Pending; documentation-only, no product delta expected.
- Canonical sync commit/files/version/date: N/A; explain no product behavior delta after approval.
- Sync verification: Pending process-only no-delta confirmation at closeout.
- Archive decision/date/path: Pending human acceptance and complete closeout.
- Navigation repairs after moving: Pending archive path/link check.
- Outstanding work/limitations: Assign/confirm student owner and record approval before implementation; complete implementation, review, acceptance, dated summary, archive, and issue-linked PR in order.
