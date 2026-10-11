# Proposal: <short name>

Copy to `workflow/changes/<YYYY-MM-DD-short-name>/proposal.md`. Replace placeholders with decisions or explicit pending/N/A explanations; a template is not evidence of approval.

- Change ID: <date-name>
- Issues: <#number and URL for every issue; linked dependencies>
- Owner: <student and product role>
- Status: <draft / awaiting approval / approved / superseded>
- Date: <YYYY-MM-DD>
- Baseline: <version; link to ../../ProductSpec.md>
- Affected capabilities: <canonical files in ../../specs/ and exact stable IDs>
- Classification: <behavior change / defect restoring existing requirement / documentation or process only; risk and size>

## Intent, problem, and motivation

<Who encounters what problem, current behavior/evidence, desired outcome, and why now?>

## Goals, non-goals, and scope boundaries

- Goals: <observable outcomes>
- Non-goals: <excluded behavior, data, roles, files, or adjacent work>
- Users/roles: <actors affected and permission boundaries>
- Scope boundaries: <owned components, allowed edits, teammate-owned areas excluded>

## Alternatives and dependencies

| Alternative                          | Benefit / cost / risk | Decision and reason  |
| ------------------------------------ | --------------------- | -------------------- |
| <including keeping current behavior> | <tradeoffs>           | <chosen or rejected> |

- Assumptions: <evidence or validation owner; unresolved assumptions explicitly pending>
- Dependencies: <issues, services, prerequisites, owners and blocking order>
- Risks: <security/privacy, data, operational, coordination; mitigation and owner>
- Open decisions: <question, decision owner, deadline or blocking gate>

## Acceptance evidence and artifacts

| Acceptance ID     | Issue criterion and canonical requirement IDs          | Given / When / Then outcome                        | Required evidence and owner                        |
| ----------------- | ------------------------------------------------------ | -------------------------------------------------- | -------------------------------------------------- |
| <change-ID-AC-01> | <#issue; JOB-001 or process criterion; canonical link> | <actor/input/action/observable success and denial> | <test, review, or document check; expected result> |

- Spec deltas: <one specs/<capability>.md per changed canonical capability; existing IDs for restoration; N/A with reason for docs-only>
- Design: <design.md; or omission reason for narrow work with no architecture, authorization, schema, AI or integration impact>
- Plan and tasks: <plan.md and tasks.md>
- Evidence: <record.md>

## Approval record

- [ ] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [ ] Proposal, deltas, design or omission reason, and plan agreed before product implementation.
- Approver: <human name/role>
- Decision/date/source: <approved / changes requested / pending; date and link to actual decision>
- Conditions: <constraints or follow-up required; do not treat issue creation as approval>
