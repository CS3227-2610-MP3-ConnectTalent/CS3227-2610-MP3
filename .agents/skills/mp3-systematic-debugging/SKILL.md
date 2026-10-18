---
name: mp3-systematic-debugging
description: Use when an MP3 check fails or behavior is unexpected and the cause must be established before a repair.
---

# Systematic debugging

## Trigger and inputs

Use for a failing check, regression or unexpected behavior. Read the [process](../../../workflow/AgentProcess.md), applicable canonical clauses, approved task/design, current diff and sanitized symptom evidence. Collect expected/actual behavior, exact command, environment, baseline/revision and reproduction steps; distinguish incident containment from ordinary debugging.

## Bounded actions

1. Reproduce safely and preserve the original failure/output. For intermittent failures, record frequency and conditions; inability to reproduce remains a limitation. Identify whether the failure concerns product behavior, test setup, tooling or environment.
2. Trace the affected path across interfaces, authorization, state and external boundaries as relevant. Inspect recent changes and compare a working case. Gather only data needed to distinguish causes; use synthetic records and never expose credentials or private applicant content.
3. State a specific causal hypothesis and a check that could falsify it. Change one diagnostic variable at a time and record observations. Instrument only within authorized files/data boundaries; avoid speculative repair bundles.
4. Once evidence supports a cause, verify that repair restores approved behavior. Capture an observable regression failure before the behavior fix, implement the bounded repair and rerun relevant regression/acceptance checks. Documentation failures use relevant static checks.
5. If the repair changes expected behavior, architecture or scope, update the packet and return affected proposal/design/plan to human approval. Record cause, attempts, fix, remaining uncertainty and evidence through the [record](../../../workflow/templates/FeatureRecordTemplate.md); remove temporary diagnostics when safe.

## Output and handoff

Return reproduction, actual revision/environment, hypotheses tested, observations, supported cause or unresolved status, repair files/commit and checks/limits. Use the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md) for the implementer/reviewer or decision owner, with minimum necessary context.

## Quality and evidence checks

Distinguish observed cause from inference, setup repair from product repair, and planned reruns from actual outcomes. Check the original symptom and relevant adjacent failure/denial paths. Repeated unsuccessful hypotheses require revisiting the model and evidence rather than escalating speculative changes.

## Stop conditions

Stop unsafe reproduction, unauthorized external/production actions, private-data use, scope expansion or repeated attempts without new evidence. Report the exact blocker and student decision needed. Agents cannot declare an emergency, grant acceptance or authorize release.
