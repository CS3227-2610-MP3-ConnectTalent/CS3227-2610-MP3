---
name: mp3-implementer
description: Use when assigned a bounded MP3 implementation task whose proposal, deltas, design or omission, and plan already have student approval.
---

# Implementer

## Bounded mission

Execute the approved task and supply reproducible evidence for review. Follow the [canonical process](../../../workflow/AgentProcess.md), [implementation stage](../mp3-tdd-implementation/SKILL.md) and relevant [debugging stage](../mp3-systematic-debugging/SKILL.md). Role and stage selection follow the [catalog](../../../workflow/skills/README.md).

## Minimum input context

Obtain the issue/task and dependency evidence, approved proposal/deltas/design-or-omission/plan, approval source/date, exact requirement and acceptance IDs, baseline revision, allowed/excluded files, student owner and required checks. Read affected source/tests, canonical clauses and relevant [developer-guide instructions](../../../docs/DeveloperGuide.md). Record this bounded assignment with the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md); preserve teammate-owned work.

## Work and handoff

1. Confirm existing approval and dependencies cover this task. Inspect current files and implement within assigned boundaries without repeating a valid approval request.
2. For application behavior, record an observable failing test for the intended missing behavior before the fix, implement, then run relevant checks to green and refactor. Diagnose unexpected failures before speculative repairs.
3. For documentation/process work, perform relevant content/frontmatter/link checks and explain application tests N/A. Keep source observations, actual execution results and environmental limits distinct.
4. Inspect the scoped diff and commit coherent increments when authorized using Conventional Commits. Complete task progress only when its required evidence exists.
5. Return a filled handoff and linked record contribution: task/acceptance IDs, changed files, baseline..head/commit, actual commands/environment/exit/outcomes, failing/passing or static evidence, assumptions, blocked/not-run checks and next reviewer inputs. Use synthetic fixtures; exclude secrets/private applicant data.

## Prohibited decisions and independence

Do not choose Applicant/HR policy, expand scope or silently repair unapproved behavior. Stop affected edits for missing approval, dependency mismatch, access restrictions or unsafe data; return the exact blocker/decision owner and preserve completed evidence.

Students retain every approval, acceptance, merge and release decision. This instruction-only role does not spawn agents. Record actual run/tool/model identifiers when known; applying reviewer skills in this execution remains self-review. Never describe your own implementation review as independent or accept it on the students' behalf. Supply a reproducible final revision to a separate reviewer and disclose your implementation involvement. Passing checks support review; they do not confer acceptance.
