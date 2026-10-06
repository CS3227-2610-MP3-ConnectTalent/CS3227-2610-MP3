# Tasks: Codex Agent Profiles and Contributor Guidance

- Change/issues: `2026-10-06-codex-agent-profiles-guidance`; [#13](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: Implementation and independent review complete; student owner assignment pending

## Before implementation

- [x] T00a — Requester approved the proposal, design, profile inventory/permissions, and plan in chat on 2026-10-07. Evidence: [record.md](record.md); scope is limited to this packet.
- [ ] T00b — Assign/record the student owner and complete remaining issue triage for #13. Evidence: actual owner assignment in issue and [record.md](record.md). Do not infer a name; required before student acceptance and PR submission.

## Ordered implementation

- [x] T01 — Implementer creates root guidance. Depends on: T00a. IDs: `codex-guidance-AC-01`, `codex-guidance-AC-02`. Files: `AGENTS.md`, `CONTRIBUTING.md`. Verification: compare commands to actual `package.json`; inspect process and role/security rules; validate links/content. Evidence: local Markdown link targets resolve; commands and workflow claims checked against `package.json`, `.env.example`, and canonical process. Commit: `cb673ff`.
- [x] T02 — Implementer creates the approved Codex custom-agent profiles. Depends on: T00a. IDs: `codex-guidance-AC-03`, `codex-guidance-AC-04`. Files: `.codex/agents/*.toml` (six files from `design.md`). Verification: Python stdlib `tomllib` parsed all six files; required keys, unique matching names, sandbox values, and 12 skill-reference occurrences to 11 unique local paths passed. Codex CLI v0.160.1 runtime delegation smoke check was attempted but blocked by network socket permissions; no spawned-agent handoff is claimed. Evidence: exact outcomes and limitations in [record.md](record.md).
- [x] T03 — Implementer/documentation maintainer updates current navigation and explains how profiles, skills, contributor guidance, and workflow documents fit together. Depends on: T01, T02. IDs: all ACs. Files: `docs/DeveloperGuide.md`, `README.md`, relevant workflow indexes. Verification: PowerShell resolved 150 local Markdown path targets across 13 changed/current documents; checked Developer Guide section anchors and profile mappings. Commit: `e8c6dc4`.
- [x] T04 — Separate read-only reviewer execution(s) examine correctness, policy boundaries, profile schema, and security/privacy claims. Depends on: T01–T03. IDs: all ACs. Files: [verification-review.md](handoffs/verification-review.md). Verification: reviewer `/root/codex_guidance_review` reviewed `17b73ba..e8c6dc4`, reported one P2 stale-metadata finding, and confirmed the corrections resolved it in a focused read-only recheck. Evidence: handoff linked from [record.md](record.md).
- [ ] T05 — Student owner records acceptance or changes requested with date/source and outstanding limitations. Depends on: T04. Evidence: actual decision in [record.md](record.md).
- [ ] T06 — Implementer/documentation maintainer completes documentation/log closeout; integration/evidence lead checks readiness. The no-product-delta explanation, dated summary, and final static/link/whitespace checks are recorded; archive the complete packet after T05 acceptance. Depends on: T05 and student owner assignment. Evidence: [session summary](../../../logs/2026-10-07-codex-agent-profiles-guidance.md), review handoff, and archive path in [record.md](record.md).
- [ ] T07 — Authorized contributor opens an issue-linked PR targeting `develop`, with `Closes #13`, packet and session links, and actual check results. Depends on: T06. Evidence: actual PR URL in [record.md](record.md); remains pending until created.

## Post-submission (separate decisions)

- [ ] T08 — Student owner records any merge, staging, release, or deployment decision and evidence as applicable; no such decision is part of PR creation.
