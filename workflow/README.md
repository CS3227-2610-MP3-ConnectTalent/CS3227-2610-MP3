# Development workflow

This folder holds the project's own spec-driven development and basic multi-agent SE process. It does not use an SDD toolkit.

- `ProductSpec.md`: scope, role permissions, AI contracts, security rules, and acceptance criteria. Update it before implementing a changed requirement.
- `AgentProcess.md`: specialized agent roles, handoff records, review gates, and evidence requirements.
- `FeatureRecordTemplate.md`: record format for each actual feature slice and agent handoff.

For each feature slice, create a short record in this folder linking the spec version, implementation, tests, review findings, and human decision. Keep prompt/interaction summaries in `../logs/` and verify them before submission.
