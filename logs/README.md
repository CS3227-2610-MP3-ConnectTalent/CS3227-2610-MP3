# Development interaction summaries

Keep one dated summary per substantive development session, including analysis, planning, implementation, debugging, review and closeout. Use [SessionSummaryTemplate.md](SessionSummaryTemplate.md), saving the filled summary as `YYYY-MM-DD-topic.md`; use a distinct topic or suffix for separate sessions on the same date.

## Required coverage and closeout

Follow the [agent process](../workflow/AgentProcess.md). Complete each summary as a required pre-PR artifact, link every contributing session from the [feature record](../workflow/templates/FeatureRecordTemplate.md), and include those links in the [PR template](../.github/pull_request_template.md) when opening the PR. PR opening is the final contributor action; later review, merge and release have separate evidence. Record post-submission requests and fixes in a follow-up session summary.

Each summary must contain:

- Session date/time zone, scope, participants and available evidence, plus issue, change-packet, record, branch/commit and PR references or explicit pending/N/A reasons.
- A chronological summary of every substantive user prompt and follow-up, and every actual agent assignment, handoff and returned outcome. Include corrections, constraints and scope changes; summarize requests in plain language.
- Material tool actions and results, including failures, fixes and rechecks; decisions and their source; changed files and their purpose.
- Actual verification commands or manual checks, results and limits. Distinguish Passed, Failed, Not run, Blocked and N/A with reasons; planned checks are not completed checks.
- Open work, blockers, evidence gaps, responsible owners or unassigned status, and student verification status with reviewer, date, source and any conditions when actually supplied.

Logs are concise summaries, not transcripts or hidden reasoning. They support reflection and traceability alongside repository, command and review evidence; they do not replace it.

## Privacy, truth and preservation

Never copy credentials, API keys, tokens, private applicant data or sensitive full prompts into logs. Summarize necessary context using sanitized descriptions and safe evidence references; do not link to material that would expose those data publicly.

State what interaction evidence was available and any missing coverage. Do not claim to reconstruct unavailable historical prompts or invent interactions, outcomes, approvals, model identities or timestamps. Record unknown identities as unknown. Distinguish a planned role from an actual agent/tool/model run: one execution using several role skills is still one execution. Label self-review honestly; independent review and student acceptance need their own actual evidence.

Preserve existing summaries unless correcting a demonstrated factual error. A correction must identify the erroneous claim, supporting evidence, reason and correction date while preserving the history of the correction. New policy does not authorize rewriting older summaries to imply coverage they never had.
