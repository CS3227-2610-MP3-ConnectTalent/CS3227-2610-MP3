<!-- PR title policy: use Conventional Commits format `type[optional scope][!]: description`, for example `fix(auth): resolve Vercel redirects`. -->

## Issues and evidence

Closes #<!-- resolved issue number; repeat Closes #N for each resolved issue -->

- Change packet / final archive path:
- Feature record:
- Dated session summary links (complete before PR opening):

<!-- Create each summary from logs/SessionSummaryTemplate.md as logs/YYYY-MM-DD-topic.md; use a distinct topic/suffix for separate sessions on one date. Link every contributing summary here and from the feature record before opening the PR. -->

## Summary and scope

<!-- Describe the problem/result, goals/non-goals, components and requirement IDs. For process-only work explain no product delta. -->

## Tasks, agents and checks

<!-- Link tasks and actual handoffs. Name actual runs/tools/models when known; role skills alone do not prove separate agents or independent review. -->

| Check / acceptance ID | Command or evidence link | Result (Passed / Failed / Not run / Blocked / N/A) and limits |
| --------------------- | ------------------------ | ------------------------------------------------------------- |
|                       |                          |                                                               |

<!-- Explain Not run, Blocked and N/A; include failures and fixes/rechecks. -->

## Review, security/privacy and decisions

<!-- Identify independent reviewer and scope or state independence unavailable. Link findings, severity, fixes and outstanding concerns. Record human implementation approval and acceptance source/date. Explain authorization, AI/prompt, private data and secret impacts or justified N/A. -->

## Specs, docs, risks and rollback

<!-- Link accepted canonical sync and complete archive or explain no product delta. List docs/reflection/log updates, assumptions, dependencies, rollout/rollback and actual deployment state. -->

## Reviewer checklist

- [ ] Issues, requirement IDs, final packet/record and all pre-PR summaries are linked.
- [ ] Scope/design/plan approval and human acceptance are distinct recorded gates.
- [ ] Task/agent claims match actual evidence; independence and findings are explicit.
- [ ] Relevant checks/security/privacy cases have results and truthful limits.
- [ ] Accepted specs are synced before archive; docs/links reflect final paths.
- [ ] Risks, unresolved findings, rollback and deployment state are clear.

PR opening ends the contributor workflow. Repository review, merge, staging validation and release happen afterward with their own evidence and human decisions. PR creation does not establish merge, deployment or release. Follow `workflow/AgentProcess.md` for later gates.
