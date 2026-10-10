# Proposal: use pnpm directly

- Change ID: 2026-10-10-direct-pnpm
- Issues: [#47](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/47), follow-up to closed issue #25
- Owner: John (GitHub account Johnwz123)
- Status: approved for implementation
- Date: 2026-10-10
- Baseline: ProductSpec v1.4; no product behavior delta
- Affected capabilities: none. OPS-003 is relevant only as documentation-consistency context.
- Classification: documentation and tooling configuration only; low risk

## Intent and motivation

Current setup materials call commands through Corepack even though CI uses pnpm directly. Contributors who install the repository-pinned pnpm version themselves can already use direct pnpm commands, but the instructions and Playwright's default web-server command continue to require Corepack.

## Goals, non-goals, and scope

- Goal: make active setup instructions, environment examples, and the Playwright default web-server command invoke pnpm directly.
- Goal: say explicitly that contributors should install pnpm 12.8.1, matching the existing packageManager pin.
- Non-goals: change the pnpm version, packageManager field, lockfile, dependencies, CI workflow, or GitHub Pages deployment.
- Non-goals: rewrite archived packets or historical session logs.
- Scope: README.md, CONTRIBUTING.md, docs/UserGuide.md, docs/DeveloperGuide.md, .env.example, and playwright.config.ts.
- Users/roles: contributors and developers; no Applicant or HR behavior changes.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep Corepack examples and use direct pnpm only as an option | No edits, but local guidance remains inconsistent with CI and still assumes Corepack | Rejected by the requested change |
| Replace active Corepack invocations with direct pnpm and retain the exact pin | Small documentation/configuration change; contributors must have the pinned pnpm installed | Proposed |

- Assumption: pnpm 12.8.1 remains the intended local and CI package-manager version, as declared in package.json.
- Dependencies: issue #47 is assigned to John; no application, database, hosted service, or deployment dependency.
- Risks: a missed active reference could leave setup paths inconsistent. Search active source/configuration references after editing; leave historical evidence intact.
- Open decisions: none identified.

## Acceptance criteria

| Acceptance ID | Issue criterion | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| DPNPM-AC-01 | #47: direct commands throughout current materials | Given a contributor follows setup or verification instructions, when they run the documented commands, then the command prefix is pnpm and the required version is stated as 12.8.1. | Scoped content scan and changed-file review; John |
| DPNPM-AC-02 | #47: remove the Corepack prerequisite from active tooling | Given the default Playwright server command is used, when Playwright starts the app, then it invokes pnpm directly. | Static config review; John |
| DPNPM-AC-03 | #47: preserve package-manager and historical evidence | Given the docs/tooling updates are made, then package.json, pnpm-lock.yaml, CI, archived packets, and historical logs remain unchanged. | Scoped diff review; John |
| DPNPM-AC-04 | #47: documentation/tooling checks | Given the final diff, when relevant content scans and git diff --check run, then active Corepack references are absent and whitespace checks pass. | Exact command results in record.md; John. Application tests: N/A, no product behavior changes. |

## Design and specification disposition

Design document omitted: this is a narrow edit to existing setup prose, environment comments, and one existing Playwright command string. It changes no application interface, data flow, authorization, schema, AI boundary, or deployment integration. No capability delta is proposed; ProductSpec remains v1.4.

## Approval record

- [x] Human approval of this proposal, the omission reason, and plan recorded before editing the scoped materials.
- Approver: John, student owner
- Decision/date/source: approved in chat on 2026-10-10 (“Looks good, I approve. Please proceed.”)
- Conditions: preserve historical logs and archive evidence; keep packageManager at pnpm 12.8.1.
