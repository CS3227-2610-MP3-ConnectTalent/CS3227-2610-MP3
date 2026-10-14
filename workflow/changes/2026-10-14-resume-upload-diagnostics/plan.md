# Implementation plan: résumé upload failure diagnostics and recovery

- Change/issues: `2026-10-14-resume-upload-diagnostics`; #76, PR #77
- Owner/status/date: Paul; approved, timeout revision implemented; final verification pending; 2026-10-14
- Approved inputs: `proposal.md`, `design.md`, no canonical delta
- Baseline and affected IDs: ProductSpec v1.10; APP-006/APP-007, SEC-009
- Constraints: current checkout `fix/76-resume-validation-errors`; sandbox blocks `.git` writes, so no new branch/commit/push. Keep the 5-second deadline, 64/16 MiB worker memory limits, and 1 MiB file cap. Synthetic data only. Do not mutate Vercel/Supabase settings or production.

## Dependency-ordered work

| Task/order | Depends on | Owner/role           | Requirement and acceptance IDs | Files/expected change                                                                                                                     | Verification                                                                             |
| ---------- | ---------- | -------------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| T01        | None       | Codex implementer    | APP-007; AC-02/03              | Add failing tests for job upload consuming RPC path and safe preparation errors/privacy                                                   | Focused Vitest; observe intended failures                                                |
| T02        | T01        | Codex implementer    | APP-007; AC-01                 | Add phase markers, parallel parser imports, timing-only timeout diagnostics while retaining worker budget                                 | Worker unit tests and synthetic PDF validation                                           |
| T03        | T01        | Codex implementer    | APP-007/SEC-009; AC-02/03      | Remove direct private-table read from job upload by consuming RPC result; validate object path; add safe typed errors and structured logs | First-upload/error/route tests; raw-detail exclusion                                     |
| T04        | T02,T03    | Codex implementer    | All                            | Run relevant focused suite, lint/typecheck, diff and build as feasible; update evidence and session summary                               | Record exact commands and limits                                                         |
| T04a       | T02,T04    | Codex implementer    | APP-007; AC-01                 | Verify the amended 5-second worker deadline and unchanged memory/file bounds                                                              | Focused worker/PDF checks; currently blocked by unavailable Node/pnpm runtime            |
| T05        | T04        | Independent reviewer | APP-007/SEC-009                | Independent review of code and evidence                                                                                                   | Separate run/handoff pending; do not self-claim                                          |
| T06        | T05        | Paul                 | All                            | Decide acceptance separately                                                                                                              | Acceptance recorded early in chat on 2026-10-14; independent review may prompt follow-up |
| T07        | T05,T06    | Paul/Codex           | APP-007                        | Sync/archive only if accepted; prepare hosted Preview smoke after authorized publication                                                  | Pending; no Vercel/Supabase settings changes                                             |

## Integration and handoffs

This is a single implementer execution; no subagent was spawned. The checkout is shared and clean at baseline, but `.git` is read-only in the sandbox. Reviewer must receive the exact final diff, tests, and hosted log evidence with personal identifiers excluded.

## Approval and completion evidence

- [x] Human approved proposal, design and plan before implementation: Paul, chat, 2026-10-14.
- [x] `tasks.md` mirrors the ordered work.
- [ ] Independent review is pending; Paul accepted the implementation in chat before review on 2026-10-14.
- [x] Session implementation log and local check evidence recorded; pre-PR closeout remains pending.
- Approval/date/source: “Sounds good, I approve. Please proceed.”, chat, 2026-10-14.
- Changes to plan: hosted 42501/23505 evidence led to a scoped implementation adjustment that uses the existing authorized RPC response; the user later approved a bounded increase of the PDF deadline from 3 to 5 seconds while preserving memory/file bounds. The user's exact local PDF and a fresh Vercel Preview deployment were not available for verification.
