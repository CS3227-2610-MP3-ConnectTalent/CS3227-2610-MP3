# Implementation plan: Conventional Commit titles for pull requests

- Change/issues: 2026-10-08-conventional-pr-titles; [#18](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/18)
- Owner/status/date: John Wong is requester; student ownership is unverified; approved / in progress / 2026-10-08
- Approved inputs: [proposal.md](proposal.md); no product delta; design omission recorded in proposal
- Baseline and affected IDs: ProductSpec v0.7; process-only criteria PR-TITLE-AC-01 through AC-03
- Constraints: modify current contributor/workflow files and this packet only; do not alter historical archive material, product code, issue labels, or repository settings

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T01 | Human approval | Contributor | PR-TITLE-AC-01 | `AGENTS.md`, `CONTRIBUTING.md`, `docs/DeveloperGuide.md`, `workflow/AgentProcess.md`, `.github/pull_request_template.md`: state the title format and examples | Content review and `git diff --check` |
| T02 | Human approval | Contributor | PR-TITLE-AC-02 | `.agents/skills/mp3-pr-submission/SKILL.md`, `.agents/skills/mp3-closeout-and-logging/SKILL.md`, `.agents/skills/mp3-integration-evidence-lead/SKILL.md`, `.codex/agents/integration_evidence_lead.toml`: require title-format preparation/readiness check | Skill/profile content review and `git diff --check` |
| T03 | T01-T02 | Separate reviewer | PR-TITLE-AC-03 | Inspect final policy diff and scope | Independent review handoff and findings/rechecks |
| T04 | T03 | Requesting human / student owner to confirm | All | Record acceptance decision and conditions | Dated human decision in record.md |
| T05 | T04 | Contributor | All | Complete log, archive packet, update navigation | Link/content checks, archive index, final diff |

## Integration and handoffs

The application/auth work tracked by #17 and this docs/process change tracked by #18 are linked in one PR after both packets reach their closeout gates. Do not edit historical archived workflow evidence.

## Approval and completion evidence

- [x] Human approved the proposal, no-delta/design-omission and this plan before process edits.
- [ ] `tasks.md` matches the ordered work and states acceptance evidence for each checkbox.
- [ ] Independent review and human acceptance are separate tasks with real decision evidence.
- [ ] Closeout includes the dated session summary and truthful limitations.
- [ ] Contributor flow ends with an issue-linked PR after closeout; merge/release remain separate human decisions.
- Approval/date/source: user request, 2026-10-08; see proposal approval record.
- Changes to this plan: none.
