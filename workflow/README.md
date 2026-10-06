# Development workflow

Start every future contributor change by creating one or more GitHub issues using the [feature](../.github/ISSUE_TEMPLATE/feature_request.yml), [bug](../.github/ISSUE_TEMPLATE/bug_report.yml), or [documentation/process](../.github/ISSUE_TEMPLATE/documentation_process.yml) form. Issue creation is intake, not approval to implement. Triage assigns configured labels and a student owner.

Follow the [agent process](AgentProcess.md): issue → change packet → proposal/spec/design/plan → human approval → TDD/implementation → independent review → human acceptance → spec sync/archive → dated session summary → PR creation. PR opening ends the contributor workflow; review, merge, staging and release are later gates. Complete the summary before opening the PR and link it in the [PR template](../.github/pull_request_template.md).

| Entry point | Purpose |
| --- | --- |
| [Product index](ProductSpec.md) | Product boundary and baseline |
| [Capability specifications](specs/README.md) | Canonical requirement IDs and behavior |
| [Agent process](AgentProcess.md) | Human gates, roles, evidence and branch/release policy |
| [Change templates](templates/ProposalTemplate.md) | Start a proposal; the [active-change guide](changes/README.md) lists all packet templates |
| [Codex custom-agent catalog](agents/README.md) | Named project-scoped subagents, sandbox defaults, mapping to skills, and evidence boundaries |
| [Codex skill catalog](skills/README.md) | Stage and specialist instructions, discovery and invocation |
| [Active changes](changes/README.md) | Proposed and in-progress packets |
| [Evidence records](records/README.md) | Preserved legacy and process records |
| [Archive](archive/README.md) | Complete packets after disposition and accepted spec sync |
| [Session logs](../logs/README.md) | Dated summaries and evidence limitations |

This is a project-owned workflow without an installed SDD toolkit. Specifications and skill files describe intended behavior and process; records establish what actually happened. Pending ownership and acceptance stay explicit. The [workflow setup](records/SDD-Multi-Agent-Workflow.md) is an approved process-only exception with no live issue or PR created during setup.
