# Implementation plan: use pnpm directly

- Change/issues: 2026-10-10-direct-pnpm; [#47](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/47)
- Owner/status/date: John; approved and in progress; 2026-10-10
- Approved inputs: proposal.md; design omission recorded there; no product spec delta
- Baseline and affected IDs: ProductSpec v1.4; no behavior IDs changed; OPS-003 is consistency context only
- Constraints: limit edits to README.md, CONTRIBUTING.md, docs/UserGuide.md, docs/DeveloperGuide.md, .env.example, playwright.config.ts, and packet/index evidence. Do not edit package.json, pnpm-lock.yaml, CI, archives, or logs in this stage.

## Dependency-ordered work

| Task ID / order | Depends on | Owner | Acceptance IDs | Exact files / expected change | Verification / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00: approve packet | None | John | DPNPM-AC-01..04 | proposal.md and this plan | Approved by John in chat on 2026-10-10 before implementation |
| T01: update active commands | T00 | John | DPNPM-AC-01..03 | README.md, CONTRIBUTING.md, docs/UserGuide.md, docs/DeveloperGuide.md, .env.example, playwright.config.ts; replace active corepack pnpm invocations with pnpm and state the direct pnpm 12.8.1 prerequisite | Review each changed command and confirm out-of-scope files remain untouched |
| T02: static closeout checks | T01 | John | DPNPM-AC-03..04 | Scoped files and final diff | Search active files for remaining Corepack invocations; confirm packageManager pin and CI are unchanged; run git diff --check; record exact results. Application tests N/A because product behavior is unchanged. |

## Integration and handoffs

No shared application interfaces or parallel implementation tasks. No migration, security, deployment, or rollback operation is involved. Historical logs and archived packets remain evidence of the commands actually used at the time.

## Approval and completion evidence

- [x] Human approved proposal, omission reason, and plan before T01.
- [x] T00-T02 evidence recorded in record.md.
- [x] Independent review and post-review student disposition complete; the earlier pre-review acceptance and the later disposition are both recorded.
- Approval/date/source: John approved in chat on 2026-10-10 (“Looks good, I approve. Please proceed.”).
- Changes to this plan: none.
