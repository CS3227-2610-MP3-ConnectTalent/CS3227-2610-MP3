---
name: mp3-change-intake
description: Use when starting or triaging an MP3 feature, defect, or documentation change before its proposal exists.
---

# Change intake

## Trigger and inputs

Use for a new change or an issue needing triage. Read the [process](../../../workflow/AgentProcess.md), [product index](../../../workflow/ProductSpec.md), relevant [canonical specs](../../../workflow/specs/README.md), and [packet guide](../../../workflow/changes/README.md). Collect the request, existing issue/reproduction evidence, baseline, constraints, dependencies and student owner; leave unknown ownership explicit.

## Bounded actions

1. Classify behavior change, restoration of an existing requirement, or documentation/process work. Inspect affected source/specs and identify exact IDs, Applicant/HR boundaries, scope, non-goals, risks and observable acceptance criteria.
2. Draft the matching [feature](../../../.github/ISSUE_TEMPLATE/feature_request.yml), [bug](../../../.github/ISSUE_TEMPLATE/bug_report.yml), or [documentation/process](../../../.github/ISSUE_TEMPLATE/documentation_process.yml) issue. Create it only through an available authorized mechanism; otherwise return the filled draft and record creation pending. Do not invent issue numbers, labels or links.
3. After issue triage, start the dated packet using the packet guide and [record template](../../../workflow/templates/FeatureRecordTemplate.md). Propagate real issue IDs/URLs and dependencies. For future feature work, follow the process's updated develop baseline and issue-linked branch convention; preserve any explicitly authorized checkout exception.
4. Hand off the bounded scope to proposal/spec preparation. Intake does not authorize implementation. A production emergency exception requires the student's actual authorization and evidence under the process; do not declare it yourself.

## Output and handoff

Return classification, issue draft or actual URL, packet/record path, baseline, affected IDs, owner, dependencies, acceptance criteria, risks and unresolved decisions. Use the [handoff template](../../../workflow/templates/AgentHandoffTemplate.md) for an actual assignment; a selected skill does not spawn an agent.

## Quality and evidence checks

Check issue-to-packet traceability, reproducible sanitized defect evidence, scoped criteria and correct relative links. Distinguish actual issue creation from preparation. Preserve teammate authorship and existing evidence; exclude secrets/private applicant data.

## Stop conditions

Stop dependent work for missing issue triage, conflicting specs, unresolved product decisions, unavailable authorization or access restrictions. Record the blocker and student decision needed; continue authorized analysis/drafting. Never infer implementation, acceptance, merge or release approval from an issue.
