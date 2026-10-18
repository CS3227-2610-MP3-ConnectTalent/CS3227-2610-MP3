# Feature record: <short name>

Status: proposed / in progress / reviewed / released

Owner: <student and product role>

Spec version: <version and link>
Date: <YYYY-MM-DD>

Copy to `workflow/changes/<YYYY-MM-DD-short-name>/record.md` for new change packets. Legacy/process records may live under `workflow/records/`. Replace placeholders with actual evidence or explicit pending/N/A reasons. Adjust relative links for the destination; a checkbox or planned role is not proof of an execution or approval.

## Metadata and artifact links

- Change ID/classification: <date-name; behavior / defect restoration / docs-process>
- GitHub issues: <every #number and URL; dependencies; issue-first intake>
- Branch/commits/PR: <actual branch, baseline..head, commit links; PR pending until opened>
- Proposal: <proposal.md or approved legacy design reference>
- Design: <design.md or documented omission reason>
- Deltas: <every specs/<capability>.md; canonical file links and IDs; no product delta for docs-only>
- Implementation plan/tasks: <plan.md and tasks.md or linked approved setup plan>
- Baseline: <version/date and commit; distinguish current requirements from historical source version>
- Archive path: <pending / workflow/archive/<change-ID>/; sync evidence below>

## Approval checklist

- [ ] Issue triaged and scope agreed; actual issue/date/source recorded.
- [ ] Human approved proposal, deltas, design or omission, and plan before product implementation.
- [ ] Implementation and relevant checks complete with actual evidence below.
- [ ] Independent review complete; findings and unresolved matters recorded.
- [ ] Human acceptance recorded separately from implementation and review.
- [ ] Relevant guides/reflections updated and every session log linked.
- [ ] Pre-PR closeout complete; contributor PR opened last with issue links (record separately).
- [ ] Accepted canonical delta synced before complete packet archive; N/A reason for no behavior delta.

For each unchecked/N/A gate, record why, who must act, and what evidence is missing. Document authorized exceptions honestly; never invent an issue, approval, completed review or release.

## Requirement and acceptance criteria

List the exact spec clauses and observable success/failure cases, including role boundaries and AI security cases.

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation                |
| ------------------- | --------------------------------------------------- | ------------------------------------- | ---------------------------------------------- |
| <change-AC-01>      | <#issue; JOB-001 or process-only criterion>         | <Given / When / Then>                 | <actual command/output/review link or pending> |

Keep original release-acceptance item numbers where relevant; scope partial coverage explicitly. Link stable canonical IDs using workflow/specs/README.md conventions. A scenario describes expected behavior, not an observed pass.

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| ------------- | ---------------------- | ---------------------- | ------------------ |
| Analyst       |                        |                        |                    |
| Implementer   |                        |                        |                    |
| Reviewer      |                        |                        |                    |

Link filled handoff artifacts with inputs, allowed files, acceptance IDs, dependencies, assumptions, actual agent/tool identity, output/range, and human checks. List only real runs; mark planned roles pending. Identify self-review explicitly and do not count it as independent review.

## Implementation and tests

Changed files:

Commands and results:

Security/adversarial cases and results:
Known limitations:

| Date / environment / commit | Exact command or manual check | Exit/result and counts                 | Output/evidence link | What this proves / does not prove |
| --------------------------- | ----------------------------- | -------------------------------------- | -------------------- | --------------------------------- |
| <actual context>            | <exact invocation>            | <pass/fail/not run; failure and rerun> | <log/path>           | <scope and limitations>           |

For relevant test-first work, record the observed failing test and subsequent pass. For docs-only work, record document/link checks; do not claim product verification. Security cases should identify actor, allowed/denied action and observed result, or state N/A with rationale. Never log credentials or private applicant content.

## Review and decision

Reviewer findings and fixes:

Human decision and date:
Guide/reflection/log updates:

- Reviewer identity and independence: <who/tool, implementation involvement, fresh context, reviewed commit range; actual evidence or pending>
- Findings/resolutions: <severity, exact file/line, fix or reason deferred, verification link>
- Human decisions: <name/role, decision, date, source, conditions and remaining risks; pending until actual>
- Documentation/reflection updates: <paths, authorship boundaries, verified changes or pending/N/A>

## Session evidence index

List every session summary contributing to this change, including analysis, implementation, debugging, review and closeout. Describe any missing coverage; do not claim transcript completeness without evidence.

| Date / session    | Summary log link                            | Work / prompts / decisions covered | Verification status / missing coverage                  |
| ----------------- | ------------------------------------------- | ---------------------------------- | ------------------------------------------------------- |
| <date/session ID> | <relative link to logs/YYYY-MM-DD-topic.md> | <brief scope>                      | <verified / team verification pending / missing source> |

## Canonical sync and archive

- Accepted delta/human decision: <actual links or pending; docs-only: no product delta>
- Canonical sync commit/files/version/date: <actual evidence; retain IDs and record retirements>
- Sync verification: <compare accepted deltas to canonical files; IDs/version/links checks and outcomes>
- Archive decision/date/path: <human decision and entire packet destination or pending>
- Navigation repairs after moving: <current indexes and relative links; preserve historical evidence/log claims>
- Outstanding work/limitations: <owner, next evidence needed; deployment/student acceptance status separately>
