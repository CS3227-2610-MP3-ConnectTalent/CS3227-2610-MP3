---
name: mp3-tdd-implementation
description: Use when implementing an approved MP3 behavior task with test-first evidence or an approved documentation task with static checks.
---

# Approved implementation

## Trigger and inputs

Use for one approved bounded task. Read the [process](../../../workflow/AgentProcess.md), task dependencies, proposal/deltas, design/omission, plan, canonical clauses, approval source/date, baseline and allowed/excluded files. Use the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md) to establish assignment and expected evidence.

## Bounded actions

1. Confirm the existing human approval covers proposal, deltas, design/omission and plan, and dependencies have evidence. Inspect current code/tests and preserve teammate-owned work. Do not repeat a valid approval request for unchanged scope.
2. For application behavior, write an observable focused test before implementation. Run it and confirm failure for the intended missing behavior; record command, environment, exit/output and reason. An infrastructure/import failure is not the required behavior failure.
3. Implement the smallest approved change, rerun the relevant check to green, then refactor with checks green. Include relevant denial/failure cases, docs and security checks from the approved task. Unexpected failures go to systematic debugging before speculative fixes.
4. For documentation/process-only tasks, use appropriate content/schema/frontmatter/link checks and mark application tests N/A with rationale. Do not introduce application changes to justify testing or claim runtime behavior from static checks.
5. Inspect the scoped diff, record actual results/failures/limitations and complete a task checkbox only when its evidence exists. Commit coherent checked increments using the process's Conventional Commit format when authorized; exclude unrelated work.

## Output and handoff

Return task/requirement/acceptance IDs, changed files, commit/range, observed failing and passing evidence or justified static checks, assumptions, blockers and next reviewer needs. Link results in the [record](../../../workflow/templates/FeatureRecordTemplate.md) and handoff. Supply a reproducible baseline to independent verification; implementation is not acceptance.

## Quality and evidence checks

Check that tests assert specified observable outcomes, the diff stays within approved files/scope, and commands actually ran against the returned revision. Separate Passed, Failed, Not run, Blocked and N/A. Use synthetic applicant fixtures and omit secrets/private data from evidence.

## Stop conditions

Stop affected edits for missing approval, scope drift, dependency mismatch, access restrictions or unsafe data. Record environmental blockers honestly. Never label self-review independent, claim student acceptance, or authorize merge/release.
