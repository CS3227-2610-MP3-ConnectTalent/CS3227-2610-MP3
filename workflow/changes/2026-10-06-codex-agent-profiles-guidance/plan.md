# Implementation plan: Codex Agent Profiles and Contributor Guidance

- Change/issues: `2026-10-06-codex-agent-profiles-guidance`; [#13](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Owner/status/date: Student owner pending assignment; draft; 2026-10-06
- Approved inputs: `proposal.md`, `design.md`, no product delta; approval pending
- Baseline and affected IDs: Workflow baseline at `64f5e36`; process-only acceptance IDs `codex-guidance-AC-01` through `codex-guidance-AC-04`
- Constraints: Stay on the current branch as requested; do not create a worktree. No application, database, dependency, CI, global Codex, GitHub settings, deployment, or product-spec changes. Use Conventional Commits for coherent increments. Do not claim an agent ran or Codex discovered a file unless evidence supports it.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | None | Student owner | Issue #13; all ACs | Assign/confirm issue owner and record approval of proposal, design, profile inventory/permissions, and this plan. | Actual dated decision linked in `record.md`; no implementation before this. |
| T01 | T00 | Implementer | AC-01, AC-02 | Create concise root `AGENTS.md` and detailed root `CONTRIBUTING.md`; use repository package commands and link to canonical workflow docs. | Compare commands to `package.json`/README, inspect all paths and role/security guidance, run Markdown link/content checks. |
| T02 | T00 | Implementer | AC-03, AC-04 | Create six standalone TOML profiles in `.codex/agents/`, using required fields and the exact approved boundaries. | Parse all files as TOML; check required keys, unique names, skill path references and sandbox values; do not claim Codex runtime discovery unless exercised. |
| T03 | T01, T02 | Integration/evidence lead | AC-01 through AC-04 | Update `docs/DeveloperGuide.md`, root `README.md`, and relevant workflow navigation with a file map, usage, source links, and limits. | Resolve links and terminology against current files; document where Codex agents differ from skills. |
| T04 | T01, T02, T03 | Security/privacy reviewer; test engineer | AC-01 through AC-04 | Independently review instructions, boundaries and TOML files; return handoffs/findings and recheck fixes. | Separate read-only review execution(s), exact commit range, findings/rechecks, and independence status linked from record. |
| T05 | T04 | Student owner | AC-01 through AC-04 | Review the exact implementation/evidence and record acceptance or changes requested. | Actual student decision/date/source; agent review does not substitute for this gate. |
| T06 | T05 | Integration/evidence lead | Process-only closeout | State no product delta; update relevant docs/reflection as applicable; write and link dated session summary; archive complete packet after disposition. | Static link/content checks, final diff review, `git diff --check`; retain true runtime-discovery/check limitations. |
| T07 | T06 | Authorized contributor | Process-only closeout | Commit final closeout and open issue-linked PR to `develop` as last contributor action, with `Closes #13`. | Actual final commit and PR URL; PR is pending until created. |

## Integration and handoffs

The same six roles as the existing skills are used to preserve consistent handoffs. Files are created sequentially to avoid overlapping edits. TOML profiles link to existing skills rather than duplicating their full policy. Reviewer executions receive the final diff, approved packet, relevant source and check evidence, and must disclose implementation involvement. The student owner supplies both approval and acceptance evidence; a pending name/decision is not inferred.

## Approval and completion evidence

- [ ] Student approved the proposal, no-delta scope, design, profile inventory and this plan before implementation.
- [ ] Tasks and checks are evidence-linked in `record.md`; application behavior tests are N/A because no runtime/product behavior is changed.
- [ ] Independent read-only review and human acceptance are separate.
- [ ] Closeout includes guide/navigation updates, dated session summary and complete archive path.
- [ ] Issue-linked PR is the final contributor action; merge/release remain later human decisions.
- Approval/date/source: Pending student owner assignment and decision.
- Changes to this plan: None yet; any scope/profile-permission changes return to the approval gate.
