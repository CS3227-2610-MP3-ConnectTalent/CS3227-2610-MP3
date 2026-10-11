# Codex custom-agent profiles

This catalog maps the repository's six project-scoped Codex subagent profiles to the
existing workflow and specialist skills. Profiles are standalone TOML files under
`.codex/agents/`; Codex identifies each profile by its `name` field. Each file has the
required `name`, `description`, and `developer_instructions` fields and links to
the detailed procedure in `.agents/skills/`.

| Profile name                | Profile file                                   | Skill(s) to follow                                                                        | Default sandbox | Assignment                                                                                    |
| --------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | --------------- | --------------------------------------------------------------------------------------------- |
| `product_analyst`           | `.codex/agents/product_analyst.toml`           | `mp3-product-analyst`, plus `mp3-change-intake` or `mp3-proposal-and-spec` as appropriate | Read-only       | Map the issue, Applicant/HR boundaries, IDs, scenarios, assumptions, and student decisions.   |
| `solution_architect`        | `.codex/agents/solution_architect.toml`        | `mp3-solution-architect`, `mp3-design-and-planning`                                       | Read-only       | Analyze alternatives, interfaces, data flow, authorization, failure, migration, and rollback. |
| `implementer`               | `.codex/agents/implementer.toml`               | `mp3-implementer`, `mp3-tdd-implementation`, `mp3-systematic-debugging`                   | Workspace-write | Implement one approved bounded task and return actual files, checks, and limitations.         |
| `test_engineer`             | `.codex/agents/test_engineer.toml`             | `mp3-test-engineer`, `mp3-independent-verification`                                       | Read-only       | Challenge acceptance evidence and test quality; return findings without editing.              |
| `security_privacy_reviewer` | `.codex/agents/security_privacy_reviewer.toml` | `mp3-security-privacy-reviewer`, `mp3-independent-verification`                           | Read-only       | Review authorization/RLS, secrets, AI boundaries, applicant data, and logs.                   |
| `integration_evidence_lead` | `.codex/agents/integration_evidence_lead.toml` | `mp3-integration-evidence-lead`, `mp3-closeout-and-logging`                               | Read-only       | Reconcile issue-to-PR evidence and report missing closeout gates.                             |

## How to use profiles

In Codex, ask it directly to delegate a bounded assignment by profile name. For
example: “Use `product_analyst` to map issue #N to affected requirement IDs and
Given/When/Then cases. Return a handoff; do not implement.” Or: “Have
`security_privacy_reviewer` review the approved change at commit `<sha>` against its
acceptance IDs and return findings with file/line evidence.” Supply only the issue,
approved packet, scope, baseline, allowed files, and checks needed for that task.

Profile settings are defaults for the spawned session. The implementer can write in
the workspace; the analysis and review profiles are read-only. Codex documents that
subagents inherit the parent's live permission mode and that runtime overrides can
supersede the profile sandbox setting. A profile does not grant permission beyond the
active session or authorize an external action. Model and MCP settings are omitted so
profiles inherit the parent configuration without pinning a model or adding a service.

## Profiles and skills have different roles

- A custom-agent profile sets a named delegated role and session defaults.
- A skill under `.agents/skills/<name>/SKILL.md` provides the detailed stage/role
  procedure that the profile must follow.
- A prompt or profile file alone does not prove Codex spawned the profile. Record the
  actual run, inputs, outputs, reviewer independence, and handoff in the change record.
- One execution applying several skills remains one execution. A reviewer must run
  separately from the implementation to count as independent.
- Student approval, acceptance, merge, and release remain human decisions. Profiles
  can analyze or recommend; they cannot make those decisions.

The [agent process](../AgentProcess.md) defines lifecycle gates and handoffs; the
[skill catalog](../skills/README.md) lists every detailed procedure. This repository
does not set global `[agents]` defaults in `.codex/config.toml`.

## Codex documentation and runtime status

The [official Codex subagent guide](https://developers.openai.com/codex/multi-agent/)
documents project profiles in `.codex/agents/`, the required standalone TOML fields,
and supported session settings. The [AGENTS.md guide](https://developers.openai.com/codex/guides/agents-md/)
documents layered repository instructions. Codex versions can differ; check those
primary sources when revising profile syntax. Static file validation does not prove
that this repository's installed Codex client discovered or spawned the profiles.
Record the client/version and observed result if discovery is tested locally.
