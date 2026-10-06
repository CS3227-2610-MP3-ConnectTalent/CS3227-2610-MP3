# Implementation plan: <short name>

Copy to `workflow/changes/<YYYY-MM-DD-short-name>/plan.md`.

- Change/issues: <date-name; #numbers and URLs>
- Owner/status/date: <student; draft / approved / in progress; YYYY-MM-DD>
- Approved inputs: <proposal.md; design.md or omission reason; specs/<capability>.md or justified no delta>
- Baseline and affected IDs: <canonical version/files; exact requirement and acceptance IDs>
- Constraints: <allowed files, excluded paths, authorship boundaries, environments, tools>

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| <T01> | <none or IDs> | <student; role/tool> | <JOB-001; change-AC-01> | <bounded edits> | <command, expected result and evidence path> |
| <T02> | <T01> | <owner/role> | <IDs> | <files> | <check and output location> |

For behavior changes, plan test-first work with the relevant unit/integration/browser/security cases and expected failure/pass evidence. For documentation-only work, use appropriate structure/link/content checks without claiming runtime verification. Add documentation, security review, migration, deployment and rollback tasks when relevant; explicitly explain N/A rather than running irrelevant work.

## Integration and handoffs

<Shared interfaces/files, sequential dependencies, task ownership, review baseline, and the handoff artifacts/context each role needs. Concurrent tasks must not write the same files without coordination. Use AgentHandoffTemplate.md for bounded assignments.>

## Approval and completion evidence

- [ ] Human approved the proposal, deltas, design/omission and this plan before product implementation.
- [ ] tasks.md matches the ordered work and states acceptance evidence for each checkbox.
- [ ] Independent review and human acceptance are separate tasks with real decision evidence.
- [ ] Closeout includes guide/reflection changes when relevant, every session log, and truthful limitations.
- [ ] Contributor flow ends with issue-linked PR after closeout; merge/release remain separate human decisions.
- Approval/date/source: <actual decision or pending>
- Changes to this plan: <reason, affected scope and renewed approval when required>
