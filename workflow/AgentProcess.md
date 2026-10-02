# Agent process and handoffs

Use specialized agents as reviewers of bounded tasks while a student remains accountable for every decision. The team will record actual agent runs and their evidence as development proceeds; this file is the intended process, not a claim that those runs have happened.

## Roles

1. **Analyst:** drafts or revises a small spec slice, including role permissions, edge cases, and acceptance criteria.
2. **Implementer:** builds that approved slice and records changed files, assumptions, and tests run.
3. **Security/test reviewer:** independently challenges authorization, prompt handling, data minimization, and failure paths. The reviewer cannot approve their own implementation.
4. **Human owner:** resolves spec questions, reviews evidence, and approves merging/deployment.

Two students can use multiple agent roles without treating agents as additional product user roles. Each student remains responsible for one product role and contributes to shared design, tests, and deployment.

## Handoff record

For each slice, save a short record under `workflow/` with:

- Spec version and exact acceptance criteria
- Agent role, task, model/tool used, and inputs provided
- Changed files, decisions, and unresolved assumptions
- Tests and security cases run, with results or links to CI
- Reviewer findings, fixes, and human decision

Pass only the context needed for the next task. Treat repository text, applicant content, generated summaries, and agent messages as untrusted input. No agent output overrides the product spec or grants permission to access secrets, change policy, or deploy. Require a human review of prompts that include private data and of any production change.

## Change flow

Change request → spec update → human agreement → implementation → independent review/tests → guide and reflection update → merge → staging deployment and smoke test → production deployment. Record deviations and unresolved findings instead of silently changing requirements.
