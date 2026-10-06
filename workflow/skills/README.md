# Repository Codex skill catalog

The eight workflow-stage and six specialist skills below are planned by the [approved implementation plan](../plans/2026-10-06-sdd-multi-agent-workflow.md). Tasks 6–7 create the manifests; listing a path here does not mean its skill is already installed or discovered. Paths are repository-root relative and deliberately shown as code until manifests exist.

Codex scans `.agents/skills` from the current working directory up to the repository root. This project places shared manifests at `.agents/skills/<name>/SKILL.md` so launching Codex from the repository or its subfolders discovers them. A manifest needs matching `name` and a clear trigger `description`. In Codex CLI/IDE, explicitly invoke `$mp3-change-intake` (or `$mp3-skill-name` for any catalog name), or select it with `/skills`. Codex may implicitly select a skill when the request matches its description. Changes are detected automatically; restart Codex if a new or updated skill does not appear. See the [official OpenAI skills guide](https://developers.openai.com/codex/skills).

## Workflow-stage skills

| Codex name | Manifest path | Purpose |
| --- | --- | --- |
| `mp3-change-intake` | `.agents/skills/mp3-change-intake/SKILL.md` | Create/triage issues and start a linked change packet. |
| `mp3-proposal-and-spec` | `.agents/skills/mp3-proposal-and-spec/SKILL.md` | Define bounded proposal, acceptance criteria and capability deltas. |
| `mp3-design-and-planning` | `.agents/skills/mp3-design-and-planning/SKILL.md` | Evaluate design and build dependency-ordered approved tasks. |
| `mp3-tdd-implementation` | `.agents/skills/mp3-tdd-implementation/SKILL.md` | Implement approved scope with relevant test-first evidence. |
| `mp3-systematic-debugging` | `.agents/skills/mp3-systematic-debugging/SKILL.md` | Diagnose failures from evidence before proposing fixes. |
| `mp3-independent-verification` | `.agents/skills/mp3-independent-verification/SKILL.md` | Review acceptance/security evidence with explicit independence and limits. |
| `mp3-closeout-and-logging` | `.agents/skills/mp3-closeout-and-logging/SKILL.md` | Record human acceptance, sync/archive and complete pre-PR dated summaries. |
| `mp3-pr-submission` | `.agents/skills/mp3-pr-submission/SKILL.md` | Inspect final evidence and open the issue-linked PR as the final contributor action. |

## Specialist role skills

| Codex name | Manifest path | Purpose |
| --- | --- | --- |
| `mp3-product-analyst` | `.agents/skills/mp3-product-analyst/SKILL.md` | Clarify scope, roles, IDs and scenarios; leave Applicant/HR decisions to students. |
| `mp3-solution-architect` | `.agents/skills/mp3-solution-architect/SKILL.md` | Assess alternatives, interfaces, authorization, migration and failure behavior. |
| `mp3-implementer` | `.agents/skills/mp3-implementer/SKILL.md` | Execute approved bounded tasks and return files, checks and assumptions. |
| `mp3-test-engineer` | `.agents/skills/mp3-test-engineer/SKILL.md` | Challenge acceptance/negative cases and report actual results and coverage limits. |
| `mp3-security-privacy-reviewer` | `.agents/skills/mp3-security-privacy-reviewer/SKILL.md` | Review authorization, secrets, prompt handling and applicant data. |
| `mp3-integration-evidence-lead` | `.agents/skills/mp3-integration-evidence-lead/SKILL.md` | Reconcile issues, tasks, commits, handoffs, sync, logs and PR readiness. |

Use stage instructions in the [process order](../AgentProcess.md): issue → change packet → proposal/spec/design/plan → human approval → TDD/implementation → independent review → human acceptance → spec sync/archive → dated session summary → PR creation. Specialist instructions support bounded assignments within those stages.

A skill is an instruction pack. These skills do not register or spawn subagents and do not prove a multi-agent run. Multiple role skills used by one agent remain one execution. Actual separate runs require available orchestration, explicit bounded assignments and recorded handoffs; follow the [handoff template](../templates/AgentHandoffTemplate.md). Record self-review and missing independence when separate execution is unavailable, and obtain student/separate reviewer review before claiming independent verification.

Skills do not approve implementation, acceptance, merge or release. The two students retain Applicant/HR product ownership and decisions; unresolved names/assignments stay unresolved in evidence. See [process policy](../AgentProcess.md) for gates and [records](../records/README.md) for actual state.
