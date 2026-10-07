# Session summary: <YYYY-MM-DD — topic>

Copy to `logs/YYYY-MM-DD-topic.md` and follow the [log policy](README.md). Replace placeholders with actual evidence or explicit pending/unknown/N/A reasons. Complete before PR opening; link this summary from the change record and PR. Adjust relative links for the destination. Do not include secrets, private applicant data, sensitive full prompts or hidden reasoning.

## Session metadata and links

- Date, time range and time zone: <actual; unknown where unavailable>
- Session identifier and scope: <identifier if available; substantive work covered>
- Student owner and participants: <actual names/roles; unassigned where applicable>
- Evidence available and missing coverage: <visible interactions, handoffs, command outputs, commits; unavailable history and limits>
- GitHub issues: <every number/URL or explicit pending/N/A reason>
- Change packet and feature record: <links; final archive path when available>
- Branch and commits: <actual branch, baseline..head, relevant commits>
- PR: <pending before opening; actual number/URL only when known>
- Related session summaries: <links or N/A>

## Chronological interactions and handoffs

Include every substantive user prompt/follow-up and actual agent assignment, handoff and return in order. Include corrections and changed constraints. Use sequence numbers when times are unavailable; summarize requests without copying sensitive text. Link detailed handoff evidence when available.

| Sequence / actual time | Source / recipient | Request or handoff summary | Actual response, outcome and evidence | Decision / follow-up / limitation |
| --- | --- | --- | --- | --- |
| <1 / known time or unknown> | <user → agent, coordinator → implementer, reviewer → coordinator> | <goal, constraints, inputs or returned findings> | <action/result and safe reference; pending if unresolved> | <scope change, next owner, missing context> |

## Tool and agent executions

Record actual runs and material tool actions, including failures and retries. A planned role is not an execution; mark any unexecuted assignment planned/pending. One agent applying multiple role skills remains one run. Do not infer a model name; use unknown when unavailable.

| Role / assignment state | Actual agent, tool, model / run identifier | Inputs and scope | Material actions, output and outcome | Evidence / independence / limits |
| --- | --- | --- | --- | --- |
| <role; planned / dispatched / completed> | <known identifiers or unknown; no actual run if planned> | <task and safe input links> | <commands/actions; observed failures, fixes, returns or pending> | <handoff/commit reference; self-review or separate reviewer evidence> |

## Decisions and changed files

| Decision | Source / decision maker / date | Reason, scope and conditions | Outstanding action / owner |
| --- | --- | --- | --- |
| <actual decision or pending> | <interaction/evidence reference; student approval separately> | <brief rationale and approved boundaries> | <next step or none> |

| Changed file / commit | Purpose and observed change | Requirement / task / evidence link |
| --- | --- | --- |
| <path; added / modified / removed> | <concrete result> | <ID/link or process-only N/A reason> |

## Verification evidence

Record exact commands or manual checks that actually occurred, including failed attempts and subsequent rechecks. Explain Not run, Blocked and N/A; planned checks do not establish a pass. Documentation checks do not establish application behavior or deployment success.

| Date / environment / commit | Exact command or manual check | Status and observed result | Evidence reference | Scope and limitations |
| --- | --- | --- | --- | --- |
| <actual context or unknown> | <invocation or bounded review> | <Passed / Failed / Not run / Blocked / N/A; exit, counts or reason> | <safe output/path/link> | <what was checked and what remains unverified> |

## Open work, blockers and limitations

- Outstanding work and owner: <task, next step, assigned student/agent or unassigned>
- Blockers and missing evidence: <cause, affected gate and evidence needed; none if actually clear>
- Review findings and disposition: <severity, file/line, fixes/rechecks or pending; self-review distinguished from independent review>
- Approval, acceptance, archive, PR, merge and deployment status: <actual states and sources; do not infer later gates from completed work>
- Historical interaction coverage: <explicit gaps; no claim to reconstruct unavailable prompts>

## Student verification

- Status: <pending / verified / changes requested / accepted with conditions>
- Student verifier and date: <actual name/date or pending>
- Evidence inspected and verification performed: <files, interactions, commands/results, review and limits>
- Decision source and conditions: <actual student statement/reference; pending until supplied>
- Remaining concerns and next owner: <concrete work or none>

An agent may prepare this section but cannot grant student verification or acceptance. A completed check, log or PR does not establish a human decision.
