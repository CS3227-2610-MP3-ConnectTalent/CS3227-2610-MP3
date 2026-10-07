---
name: mp3-independent-verification
description: Use when assessing an implemented MP3 change against acceptance evidence and recording review independence and findings.
---

# Independent verification

## Trigger and inputs

Use after implementation or corrective work is ready for review. Read the [process](../../../workflow/AgentProcess.md), issues, approved proposal/deltas/design/plan, tasks, canonical clauses, implementation baseline..head, record and actual check evidence. Establish reviewer identity/run when known and their involvement in implementation.

## Bounded actions

1. Define reviewed revision, files, acceptance IDs, assumptions and exclusions in the [handoff](../../../workflow/templates/AgentHandoffTemplate.md). A separate reviewer execution is required to call this independent; selecting another role in the same execution does not satisfy that gate.
2. Trace each acceptance criterion to source and meaningful evidence. Inspect the actual diff, authorization/privacy and failure paths, test quality and maintainability. Reproduce relevant approved checks where available; documentation-only changes use structure/frontmatter/link/content checks with app tests N/A.
3. Review scoped security cases, including Applicant/HR denial, RLS/server boundaries, prompt injection, secrets/data minimization and safe logging where applicable. Separate source observations, runtime results and unverified environment/production assumptions.
4. Record prioritized findings with exact file/line, concrete trigger, impact, requirement/evidence and resolution owner. Verify fixes against the returned revision and record rechecks; unresolved or blocked checks remain visible.
5. Return review evidence for student acceptance. A technical recommendation is not the student's acceptance, repository approval, merge or release decision. If separate execution is unavailable, perform clearly labeled self-review, record missing independence and arrange a student or separate reviewer review before claiming the gate passed.

## Output and handoff

Return reviewer identity/context and independence limits, reviewed range/scope, acceptance coverage, actual commands/outcomes, findings/dispositions, rechecks and missing evidence. Link the review/handoff from the [record](../../../workflow/templates/FeatureRecordTemplate.md). Do not invent tools, models, run IDs or findings.

## Quality and evidence checks

Check that review covers the final revision, findings cite evidence, acceptance cases include relevant denial/failure paths, and every Passed/Failed/Not run/Blocked/N/A label is accurate. Preserve student decisions and authorship; role instructions do not spawn agents.

## Stop conditions

Stop claims of a passed verification gate for reviewer involvement, missing final inputs or unresolved required checks. A completed review may report blocking findings; keep their disposition and acceptance pending. Route scope changes back to approval. Do not self-approve implementation or approve/review/merge the contributor's own PR through this skill.
