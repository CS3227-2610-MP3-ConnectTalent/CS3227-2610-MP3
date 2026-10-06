# Proposal: Codex Agent Profiles and Contributor Guidance

- Change ID: 2026-10-06-codex-agent-profiles-guidance
- Issues: [#13 — Add project Codex agents and contributor guidance](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/13)
- Owner: Student owner unassigned; team assignment pending
- Status: approved for bounded implementation by requester; student owner assignment pending
- Date: 2026-10-06
- Baseline: Product specification v0.6; no product behavior delta
- Affected capabilities: None. This is contributor guidance and Codex project configuration only.
- Classification: Documentation/process only; medium coordination risk because Codex profiles affect how delegated work is performed.

## Intent, problem, and motivation

The repository has Codex-discoverable workflow and specialist skills under `.agents/skills/`, but it does not yet provide project-scoped Codex custom-agent profiles, a root `AGENTS.md`, or a consolidated contribution guide. Contributors need clear, reusable instructions for delegating bounded analysis, design, implementation, verification, security review, and evidence closeout. They also need shared engineering expectations for Applicant and HR user experiences, application architecture, security, testing, commits, and PR submission.

OpenAI's current Codex documentation places project custom-agent TOML files in `.codex/agents/` and requires `name`, `description`, and `developer_instructions`. The repository already has role-specific skills which should remain the source of detailed workflow instructions rather than being copied into every profile.

## Goals, non-goals, and scope boundaries

- Goals:
  - Add a concise root `AGENTS.md` with repository-wide Codex and contributor rules, linking to the detailed contribution guide and workflow.
  - Add a detailed root `CONTRIBUTING.md` covering setup, architecture principles, security, testing, issue-first SDD, Conventional Commits, and PR-last closeout.
  - Add six narrow project-scoped Codex profiles under `.codex/agents/`, mapped to the existing six specialist skills.
  - Keep approval, acceptance, independent review, merge, and release decisions with the students; preserve separate Applicant and HR product boundaries.
  - Validate TOML syntax, links, required fields, instruction/profile-to-skill mappings, and the scoped diff.
- Non-goals:
  - Change application behavior, canonical product requirements, database schema, authentication, authorization, AI endpoints, dependencies, CI, deployment, or GitHub repository settings.
  - Add `.codex/config.toml`, pin a model, configure MCP servers, or change user/global Codex settings.
  - Claim that profile creation proves agents were spawned, Codex loaded the files, or multi-agent review occurred.
- Users/roles: Contributors and delegated Codex agents; no Applicant/HR runtime behavior changes.
- Scope boundaries: Root `AGENTS.md`, root `CONTRIBUTING.md`, `.codex/agents/*.toml`, workflow packet/evidence, and only necessary current navigation/log updates. Existing product source, database, and teammate-owned work are excluded.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Put every rule in root `AGENTS.md` | One place to find guidance; risks bloating every Codex task context and duplicating detailed workflow instructions. | Rejected. Keep root instructions concise and use `CONTRIBUTING.md` plus the canonical workflow for depth. |
| Put custom agents in `.agents/skills/` | Co-locates workflow assets; Codex documents a distinct `.codex/agents/` location for project-scoped custom agent TOML. | Rejected. Follow the documented custom-agent directory while retaining skills under `.agents/skills/`. |
| Add only one general-purpose custom agent | Simpler inventory; does not map the existing specialist stages and weakens role separation. | Rejected. Add six focused profiles matching the established specialist roles. |
| Add model, MCP, or global agent defaults now | Could make behavior more prescriptive; creates environment coupling and is unnecessary for role guidance. | Rejected. Omit optional settings and inherit the parent session configuration. |

- Assumptions: Current OpenAI Codex docs describe the relevant custom-agent directory and TOML schema; contributors may need to restart/start a new Codex session for discovery. Confirm all local claims during implementation against official docs.
- Dependencies: Issue #13 and its triage/student ownership decision; existing `.agents/skills/`, `workflow/AgentProcess.md`, templates and package scripts.
- Risks: Instructions can drift from existing workflow; profiles may appear to grant authority or prove execution; broad agent permissions can cause unintended edits. Mitigation: link to canonical skills/process, explicitly deny human decision authority, default analysis/review profiles to read-only, and document that active parent permissions can override profile defaults.
- Open decisions: Student owner assignment remains pending. The requester approved the six profiles, proposed boundaries, and workspace-write default for the implementer in chat on 2026-10-07; the requester's name and student role were not provided, so they are not inferred.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| codex-guidance-AC-01 | Issue #13; process-only | Given the repository root, when a contributor or Codex reads `AGENTS.md`, then concise shared rules point to deeper contribution and workflow documents without conflicting with them. | Link/content review by a student; static check recorded in `record.md`. |
| codex-guidance-AC-02 | Issue #13; process-only | Given a new contributor, when they follow `CONTRIBUTING.md`, then setup, architecture, Applicant/HR separation, shared-component principles, security, checks, issue-first SDD, Conventional Commits, and PR-last closeout are documented using actual repository commands and paths. | Link/content review by a student; command facts checked against `package.json` and existing guides. |
| codex-guidance-AC-03 | Issue #13; process-only | Given six delegated roles, when Codex reads `.codex/agents/*.toml`, then each profile has the documented required fields, a narrow mission, explicit decision boundaries, and links to its matching project skill. | TOML parser/schema/static review and actual file inventory recorded in `record.md`. |
| codex-guidance-AC-04 | Issue #13; process-only | Given any custom-agent profile, when a contributor uses it, then its presence does not imply a real execution, independent review, human approval, or permission to merge/release. | Cross-review of profiles against `workflow/AgentProcess.md`; status claims and known discovery limits recorded. |

- Spec deltas: None; no product behavior changes.
- Design: `design.md`.
- Plan and tasks: `plan.md` and `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [ ] Issue owner/triage, including student owner assignment, is complete; owner assignment remains pending.
- [x] Requester approved this proposal, design, profile inventory/permissions, and plan before implementation.
- Approver: User/requester; name and student role unavailable in the conversation
- Decision/date/source: Approved 2026-10-07 in the user reply “Looks good, go ahead”; issue #13 remains intake, not approval.
- Conditions: Do not infer or record student ownership. Obtain the assigned student owner's name before recording student acceptance or opening the PR.
