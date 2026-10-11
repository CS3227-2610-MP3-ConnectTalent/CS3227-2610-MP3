# Agent handoff: <change-ID / task-ID / role>

Keep a filled handoff in the change packet (for example `handoffs/T01-implementer.md`) and link it from record.md. A named role or selected skill is not evidence that an independent agent ran.

- Issues/task/dependencies: <links, task ID, prerequisites and state>
- Human accountable owner: <student>
- Assignment: <role, actual agent/tool identifier, date; proposed / dispatched / completed>
- Goal and scope: <bounded deliverable; explicit non-goals>
- Allowed/excluded files: <exact paths and teammate-owned boundaries>
- Inputs supplied: <proposal, approved deltas, design, plan, canonical IDs, relevant code/tests/logs; baseline commit>
- Acceptance IDs: <exact IDs and success/failure/denial outcomes>
- Interfaces/coordination: <outputs consumed by whom; shared-file constraints; blocking dependencies>
- Required checks: <commands/reviews, expected outputs, evidence location; relevant categories only>
- Required response: <changed files, commit/range, actual commands/outcomes, assumptions, limitations, unresolved matters>
- Stop/escalation conditions: <scope conflict, missing approval, unsafe data, dependency mismatch; accountable decision owner>

## Returned evidence

| Artifact / file / commit   | Observed result                                | Assumption or limitation | Consumer / human verification |
| -------------------------- | ---------------------------------------------- | ------------------------ | ----------------------------- |
| <actual output or pending> | <command/review outcome, not inferred success> | <open question>          | <name, decision/date/source>  |

## Review independence and decision

- Implementer identity/range: <actual author/tool and baseline..head>
- Reviewer identity/context: <actual reviewer/tool; implementation role involvement; separate agent invocation or self-review>
- Independence: <what was independent, what was shared, any limitation; self-review must be labeled>
- Findings and resolutions: <severity, file/line, action, evidence or unresolved>
- Human decision: <accept / changes requested / pending; name/date/source>
