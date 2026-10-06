# Tasks: Codex Agent Profiles and Contributor Guidance

- Change/issues: `2026-10-06-codex-agent-profiles-guidance`; [#13](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: In progress; student owner assignment pending

## Before implementation

- [x] T00a — Requester approved the proposal, design, profile inventory/permissions, and plan in chat on 2026-10-06. Evidence: [record.md](record.md); scope is limited to this packet.
- [ ] T00b — Assign/record the student owner and complete remaining issue triage for #13. Evidence: actual owner assignment in issue and [record.md](record.md). Do not infer a name; required before student acceptance and PR submission.

## Ordered implementation

- [x] T01 — Implementer creates root guidance. Depends on: T00a. IDs: `codex-guidance-AC-01`, `codex-guidance-AC-02`. Files: `AGENTS.md`, `CONTRIBUTING.md`. Verification: compare commands to actual `package.json`; inspect process and role/security rules; validate links/content. Evidence: local Markdown link targets resolve; commands and workflow claims checked against `package.json`, `.env.example`, and canonical process. Commit: pending.
- [ ] T02 — Implementer creates the approved Codex custom-agent profiles. Depends on: T00a. IDs: `codex-guidance-AC-03`, `codex-guidance-AC-04`. Files: `.codex/agents/*.toml` (six files from `design.md`). Verification: parse TOML, check required keys and names, check skill references and sandbox values; runtime discovery only if available. Evidence: exact parser/tool/result and limitations in [record.md](record.md).
- [ ] T03 — Implementer/documentation maintainer updates current navigation and explains how profiles, skills, contributor guidance, and workflow documents fit together. Depends on: T01, T02. IDs: all ACs. Files: `docs/DeveloperGuide.md`, `README.md`, relevant workflow indexes. Verification: validate relative links and claims against actual files. Evidence: paths/check results in [record.md](record.md).
- [ ] T04 — Separate read-only reviewer execution(s) examine correctness, policy boundaries, profile schema, and security/privacy claims. Depends on: T01–T03. IDs: all ACs. Files: review artifacts under the packet's `handoffs/` if created. Verification: record exact revision, inputs, reviewer independence, severity-ranked findings, dispositions and rechecks. Evidence: handoff(s) linked from [record.md](record.md).
- [ ] T05 — Student owner records acceptance or changes requested with date/source and outstanding limitations. Depends on: T04. Evidence: actual decision in [record.md](record.md).
- [ ] T06 — Implementer/documentation maintainer completes documentation/log closeout; integration/evidence lead checks readiness. Explain no product delta, write the dated summary, and archive the complete packet. Depends on: T05 and student owner assignment. Evidence: log, final static/link/whitespace checks, archive path in [record.md](record.md).
- [ ] T07 — Authorized contributor opens an issue-linked PR targeting `develop`, with `Closes #13`, packet and session links, and actual check results. Depends on: T06. Evidence: actual PR URL in [record.md](record.md); remains pending until created.

## Post-submission (separate decisions)

- [ ] T08 — Student owner records any merge, staging, release, or deployment decision and evidence as applicable; no such decision is part of PR creation.
