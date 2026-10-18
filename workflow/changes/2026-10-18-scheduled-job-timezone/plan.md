# Implementation plan: Scheduled job timezone handling

- Change/issues: `2026-10-18-scheduled-job-timezone`; [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111)
- Owner/status/date: John (Johnwz123); approved / in progress; 2026-10-18
- Approved inputs: proposal.md, design.md, and `specs/job-management.md`; John approved browser-local interpretation/display with UTC storage in chat on 2026-10-18
- Baseline and affected IDs: ProductSpec v1.17 at `1f6d872`; JMG-004 and JOB-001; sched-tz-AC-01 through AC-04
- Constraints: no code before owner approval; preserve current UTC storage and server authorization; no database/schema/RLS changes; work only in issue #111 scope

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role     | Requirement and acceptance IDs | Exact files / expected change                                                                                                                                                          | Verification command or review / expected evidence                                                                                                                                                 |
| --------------- | ---------- | ---------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T00             | none       | John / student owner   | #111; all ACs                  | Approve browser-local input/display contract, UTC storage, and proposal/delta/design/plan                                                                                              | Approved in direct chat on 2026-10-18; recorded in record.md                                                                                                                                       |
| T01             | T00        | Implementer            | JMG-004; AC-01, AC-04          | `tests/unit/hr-job-input.test.ts`, new `tests/unit/local-date-time.test.ts`; add failing assertions for local→UTC, nonexistent DST wall time, timezone-less server input, and ordering | Focused tests fail on current server-local parsing before code; record actual failure                                                                                                              |
| T02             | T01        | Implementer            | JMG-004; AC-02                 | `src/lib/hr-job-input.ts`, new `src/lib/local-date-time.ts`, new `src/components/local-schedule-time.tsx`, `src/app/hr/jobs/job-editor.tsx`, tests                                     | HR entry/edit round-trip uses browser-local fields and hidden UTC instants                                                                                                                         |
| T03             | T00, T02   | Implementer            | JMG-004, JOB-001; AC-03        | HR/public job detail pages and `tests/unit/hr-job-pages.test.tsx`                                                                                                                      | Displays convert same UTC timestamp to local time with timezone label; server HTML has accurate UTC fallback                                                                                       |
| T04             | T01-T03    | Implementer            | all ACs                        | Focused changed tests and formatting/type/lint checks                                                                                                                                  | Bun direct Vitest command for the five changed test files; `bun node_modules/typescript/bin/tsc --noEmit`; `bun node_modules/eslint/bin/eslint.js`; Prettier `--check`; exact results in record.md |
| T05             | T04        | Separate reviewer      | all ACs; JMG-004, JOB-001      | Final issue-linked diff and test evidence                                                                                                                                              | Independent review artifact, actual reviewer and findings; pending                                                                                                                                 |
| T06             | T05        | John / student owner   | all ACs                        | Review final evidence and record acceptance or conditions                                                                                                                              | Actual separate decision in record.md; pending                                                                                                                                                     |
| T07             | T06        | Owner                  | accepted JMG-004 delta         | Sync approved delta to canonical `workflow/specs/job-management.md`, ProductSpec index and version; update `workflow/changes/README.md`, dated log and packet closeout/archive         | Compare canonical requirement against accepted delta; markdown/link/static checks; pending                                                                                                         |
| T08             | T07        | Authorized contributor | #111                           | Commit and open issue-linked PR to develop with `Closes #111`                                                                                                                          | Final status/CI evidence, PR link and accurate review/acceptance record; pending                                                                                                                   |

## Integration and handoffs

All edits stay in the HR parser/editor and HR/public job-detail display. Persistence and scheduling decisions are not touched. Client-side timezone conversion is isolated in focused helper/components; existing Server Actions and UTC RPC arguments remain the boundary. A separate reviewer execution and the student acceptance decision remain separate from implementation.

## Approval and completion evidence

- [x] Human approved the proposal, timezone delta, design, and plan before product implementation (John, direct chat, 2026-10-18).
- [x] tasks.md mirrors the ordered work and pending approval gate.
- [ ] Independent review and human acceptance are separate tasks with actual evidence.
- [ ] Closeout, guides/logs, canonical sync and archive are complete.
- [ ] Issue-linked PR opened after closeout.
- Approval/date/source: John approved browser-local interpretation/display and UTC storage by direct chat on 2026-10-18.
- Changes to this plan: none.
