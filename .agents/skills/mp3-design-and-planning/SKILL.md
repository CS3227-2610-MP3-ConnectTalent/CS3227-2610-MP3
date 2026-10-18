---
name: mp3-design-and-planning
description: Use when assessing an MP3 technical design or turning proposal and spec deltas into ordered implementation tasks.
---

# Design and planning

## Trigger and inputs

Use when a bounded proposal needs a design/plan, or new evidence changes them. Read the [process](../../../workflow/AgentProcess.md), issues, proposal, deltas, canonical IDs, baseline/source evidence, scope constraints and student decisions. The [packet guide](../../../workflow/changes/README.md) defines artifact locations.

## Bounded actions

1. Decide whether architecture, authorization, schema, AI, integration, risk or multiple modules require design. Use the [design template](../../../workflow/templates/DesignTemplate.md) when warranted; narrow work records an omission reason in proposal and record.
2. Compare alternatives against requirements. Trace interfaces, data/trust boundaries, authorization before data/external calls, privacy, failure behavior, compatibility, migration and rollout/rollback. Mark irrelevant areas N/A with reasons. Production actions and private-data prompts require the human review stated in the process.
3. Fill the [plan](../../../workflow/templates/ImplementationPlanTemplate.md) and [tasks](../../../workflow/templates/TasksTemplate.md) with matching IDs, dependency order, owners/roles, exact allowed/excluded files, expected outputs and verification evidence. Coordinate shared files; role selection alone is not delegation or proof of a separate run.
4. Plan observable failing-then-passing checks for application behavior, appropriate document/schema/link checks for documentation work, and relevant security/docs/rollback work. Include separate independent review, student acceptance, sync/archive, summaries and final PR tasks; later merge/release remain separate.
5. Present the coherent proposal, deltas, design/omission and plan for the student's decision. Record actual source/date, conditions and approved scope. Reuse valid existing approval; changed requirements or expanded scope require renewed approval of affected artifacts.

## Output and handoff

Return design or omission, plan/tasks/record links, dependency map, allowed files, acceptance/check requirements, risks and approval status. Use the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md) for each actual bounded assignment; dispatch only through an available authorized mechanism.

## Quality and evidence checks

Check requirement-to-task coverage, satisfiable dependencies, file ownership, checks that prove observable outcomes and explicit evidence for every checkbox. Separate proposed roles, actual runs, implementation approval and later acceptance.

## Stop conditions

Stop implementation for absent approval, unresolved product decisions, contradictory inputs, blocked dependencies or scope expansion. Preserve draft work and identify the accountable student; a design or checklist cannot grant acceptance, merge or release authority.
