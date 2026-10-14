# Implementation plan: résumé upload failure diagnostics and recovery

- Change/issues: `2026-10-14-resume-upload-diagnostics`; #76, PR #77
- Owner/status/date: Paul; approved and accepted; T05 independent review complete; revised-timeout and hosted upload verification pending; 2026-10-14
- Approved inputs: `proposal.md`, `design.md`, no canonical delta
- Baseline and affected IDs: approved against ProductSpec v1.10 and integrated in v1.11; APP-006/APP-007, SEC-009
- Constraints: keep the 5-second deadline, 64/16 MiB worker memory limits, and 1 MiB file cap. Synthetic data only. Do not mutate Vercel/Supabase settings or production.

## Dependency-ordered work

| Task/order | Depends on | Owner/role           | Requirement and acceptance IDs | Files/expected change                                                                                                                     | Verification                                                                              |
| ---------- | ---------- | -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| T01        | None       | Codex implementer    | APP-007; AC-02/03              | Add failing tests for job upload consuming RPC path and safe preparation errors/privacy                                                   | Focused Vitest; observe intended failures                                                 |
| T02        | T01        | Codex implementer    | APP-007; AC-01                 | Add phase markers, parallel parser imports, timing-only timeout diagnostics while retaining worker budget                                 | Worker unit tests and synthetic PDF validation                                            |
| T03        | T01        | Codex implementer    | APP-007/SEC-009; AC-02/03      | Remove direct private-table read from job upload by consuming RPC result; validate object path; add safe typed errors and structured logs | First-upload/error/route tests; raw-detail exclusion                                      |
| T04        | T02,T03    | Codex implementer    | All                            | Run relevant focused suite, lint/typecheck, diff and build as feasible; update evidence and session summary                               | Record exact commands and limits                                                          |
| T04a       | T02,T04    | Codex implementer    | APP-007; AC-01                 | Verify the amended 5-second worker deadline and unchanged memory/file bounds                                                              | Bun focused runs passed 8 worker-error tests and 16 PDF-validation tests; full CI pending |
| T05        | T04        | Independent reviewer | APP-007/SEC-009                | Independent review of code and evidence                                                                                                   | Complete; see the separate T05 handoff; no blocking source defect was found               |
| T06        | T05        | Paul                 | All                            | Decide acceptance separately                                                                                                              | Acceptance recorded in chat on 2026-10-14; separate from runtime and hosted verification  |
| T07        | T05,T06    | Paul/Codex           | APP-007                        | Complete hosted Preview smoke and archive after verification                                                                              | Pending; synthetic smoke was skipped; no Vercel/Supabase settings changes                 |

## Integration and handoffs

This was a single implementer execution; no subagent was spawned. The T05 read-only review is recorded in the linked handoff. PR #77 existed before this diagnostics packet; subsequent review and evidence updates are being published to PR #77 under Paul's explicit direction. No independent re-review of the latest corrections is claimed.

## Approval and completion evidence

- [x] Human approved proposal, design and plan before implementation: Paul, chat, 2026-10-14.
- [x] `tasks.md` mirrors the ordered work.
- [x] Independent review completed; the separate T05 handoff records reviewer scope and findings. Paul accepted the implementation in chat on 2026-10-14; acceptance is separate from verification.
- [x] Session implementation and review evidence are recorded. PR #77 already existed before this follow-up; the approved corrections and closeout evidence are being added to that PR.
- Approval/date/source: “Sounds good, I approve. Please proceed.”, chat, 2026-10-14.
- Changes to plan: hosted 42501/23505 evidence led to a scoped implementation adjustment that uses the existing authorized RPC response; the user later approved a bounded increase of the PDF deadline from 3 to 5 seconds while preserving memory/file bounds. The user's exact local PDF was not inspected, and the deployed Preview upload smoke remains unverified.
