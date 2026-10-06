---
name: mp3-proposal-and-spec
description: Use when defining or revising an MP3 change proposal, acceptance criteria, or capability deltas before implementation.
---

# Proposal and specification deltas

## Trigger and inputs

Use after intake or when changed requirements reopen a proposal. Read the [process](../../../workflow/AgentProcess.md), triaged issues, packet record, [product index](../../../workflow/ProductSpec.md), affected canonical clauses and [ID/version conventions](../../../workflow/specs/README.md). Collect baseline, student owner, scope constraints and unresolved Applicant/HR decisions.

## Bounded actions

1. Fill the [proposal template](../../../workflow/templates/ProposalTemplate.md) in the packet with problem, goals/non-goals, role boundaries, alternatives, dependencies, risks and exact observable acceptance IDs. Identify decisions the students must resolve instead of choosing product policy for them.
2. For changed behavior, use the [delta template](../../../workflow/templates/SpecDeltaTemplate.md) once per affected capability. Include complete before/after rules, ADDED/MODIFIED/REMOVED classification and Given/When/Then success, denial and failure scenarios. Retain existing IDs, allocate unused IDs and preserve retirement history; keep cross-cutting rules in one canonical home.
3. A defect restoring specified behavior cites existing requirements; expected-behavior changes require a delta. Documentation/process-only work explicitly states no product delta. Keep proposed behavior in the packet until acceptance and canonical sync.
4. Reconcile issue criteria, proposal and deltas; obtain actual analyst/reviewer input when available and record ambiguity/findings honestly. Hand off to design/planning. Record the student's decision source/date and approved artifact scope only when supplied; proposal approval alone does not satisfy the complete design/plan gate.

## Output and handoff

Return proposal/delta paths, baseline and requirement/acceptance map, resolved and unresolved decisions, risks, actual review evidence and approval status. Link artifacts from the record and use the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md) for a bounded assignment.

## Quality and evidence checks

Compare every proposed rule with its current canonical clause, issue criterion and observable evidence requirement. Check IDs, normative language, scenario coverage and destination-relative links. Scenarios describe expectations; they are not observed passes.

## Stop conditions

Stop implementation handoff for ambiguous product behavior, conflicting IDs/specs, missing human decisions or expanded scope. Return affected artifacts to approval when requirements change. Do not edit canonical behavior, claim acceptance or authorize merge/release at this stage.
