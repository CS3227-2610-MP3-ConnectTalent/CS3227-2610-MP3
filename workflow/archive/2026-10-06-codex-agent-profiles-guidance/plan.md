# Implementation plan: Codex Agent Profiles and Contributor Guidance

- Change/issues: `2026-10-06-codex-agent-profiles-guidance`; [#13](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Owner/status/date: Issue #13 assignee `Johnwz123`; implementation, review, requester acceptance and archive complete; PR creation pending as the final contributor action; 2026-10-07
- Approved inputs: `proposal.md`, `design.md`, no product delta; requester approved in chat on 2026-10-07 (identity/student role unavailable)
- Baseline and affected IDs: Workflow baseline at `64f5e36`; process-only acceptance IDs `codex-guidance-AC-01` through `codex-guidance-AC-04`
- Constraints: Stay on the current branch as requested; do not create a worktree. No application, database, dependency, CI, global Codex, GitHub settings, deployment, or product-spec changes. Use Conventional Commits for coherent increments. Do not claim an agent ran or Codex discovered a file unless evidence supports it.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00a | None | Requester | All ACs | Requester approval of proposal, design, profile inventory/permissions, and plan is recorded. | Actual approval source/date in `record.md`; requester name/student role unavailable. Approval permits this bounded implementation. |
| T00b | None | Issue assignee `Johnwz123` | Issue #13; all ACs | Record the live issue assignee and complete scope/ID triage. | Live issue #13 assigns `Johnwz123`; issue body records scope and acceptance criteria. |
| T01 | T00a | Implementer | AC-01, AC-02 | Create concise root `AGENTS.md` and detailed root `CONTRIBUTING.md`; use repository package commands and link to canonical workflow docs. | Compare commands to `package.json`/README, inspect all paths and role/security guidance, run Markdown link/content checks. |
| T02 | T00a | Implementer | AC-03, AC-04 | Create six standalone TOML profiles in `.codex/agents/`, using the approved fields and boundaries. | Parse all files as TOML; check required keys, unique names, skill path references and sandbox values; do not claim Codex runtime discovery unless exercised. |
| T03 | T01, T02 | Implementer/documentation maintainer | AC-01 through AC-04 | Update `docs/DeveloperGuide.md`, root `README.md`, and relevant workflow navigation with a file map, usage, source links, and limits. | Resolve links and terminology against current files; document where Codex agents differ from skills. |
| T04 | T01, T02, T03 | Security/privacy reviewer; test engineer | AC-01 through AC-04 | Independently review instructions, boundaries and TOML files; return handoffs/findings and recheck fixes. | Separate read-only review execution(s), exact commit range, findings/rechecks, and independence status linked from record. |
| T05 | T04 | Human requester / acceptance decision | AC-01 through AC-04 | Review the exact implementation/evidence and record acceptance or changes requested. | Requester explicitly accepted the reviewed revision in chat on 2026-10-07; name/student role unavailable. Live issue #13 assignee is `Johnwz123`; no identity mapping is asserted. Agent review does not substitute for this gate. |
| T06 | T05 | Implementer/documentation maintainer; integration lead checks readiness | Process-only closeout | State no product delta; update relevant docs/reflection as applicable; write/link dated summaries and archive the complete packet. | Static link/content checks, final diff review, `git diff --check`; retain true runtime-discovery/check limitations. |
| T07 | T06 | Authorized contributor | Process-only closeout | Commit final closeout and open issue-linked PR to `develop` as last contributor action, with `Closes #13`. | Actual final commit and PR URL; PR is pending until created. |

## Integration and handoffs

The same six roles as the existing skills are used to preserve consistent handoffs. Files are created sequentially to avoid overlapping edits. TOML profiles link to existing skills rather than duplicating their full policy. Reviewer executions receive the final diff, approved packet, relevant source and check evidence, and must disclose implementation involvement. The live issue assignee and requester acceptance are recorded separately; no mapping between the issue account and chat requester is inferred.

## Approval and completion evidence

- [x] Requester approved the proposal, no-delta scope, design, profile inventory and this plan on 2026-10-07; identity/student role unavailable.
- [x] Record the issue #13 assignee `Johnwz123`; requester acceptance is separately recorded in `record.md`, with requester name/student role unavailable.
- [x] Tasks and checks are evidence-linked in `record.md`; application behavior tests are N/A because no runtime/product behavior is changed.
- [x] Independent read-only review and requester acceptance are separate.
- [x] Closeout includes guide/navigation updates, both dated session summaries and complete archive path; links verified after archiving.
- [ ] Issue-linked PR is the final contributor action; merge/release remain later human decisions.
- Approval/date/source: Requester approved implementation with “Looks good, go ahead” and accepted archive/PR with “It is approved”, 2026-10-07. Requester name/student role unavailable; issue assignee `Johnwz123` verified live.
- Changes to this plan: None yet; any scope/profile-permission changes return to the approval gate.
