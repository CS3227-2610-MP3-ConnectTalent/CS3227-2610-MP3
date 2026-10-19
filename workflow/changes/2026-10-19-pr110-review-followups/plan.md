# Implementation plan: PR #110 review follow-ups

- Change/issues: `2026-10-19-pr110-review-followups`; #115, #116, #117, #118
- Owner/status/date: Unassigned for triage; approved / in progress / 2026-10-19
- Approved inputs: `proposal.md`, `design.md` (bounded design omission), canonical `applications-and-review.md` and `job-management.md`
- Baseline and affected IDs: `develop` `3c9ba769f536679a3f546b5e5fbf5a254f059104`; APP-001/005/007/008/009/010; JMG-004
- Constraints: implement only the five findings still present; keep reviewer-finding #1 timezone code unchanged; no schema/auth/provider changes; do not merge or deploy to `master`.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / role                | Requirement and acceptance IDs   | Exact files / expected change                                                                                                           | Verification command or review / expected evidence                                                                               |
| --------------- | ---------- | --------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| T00             | none       | Requester / scope approval  | #115–#118; all PR110-AC          | Issues, proposal, design omission, plan, tasks, record                                                                                  | Direct user instruction recorded before implementation                                                                           |
| T01             | T00        | Contributor                 | APP-010; PR110-AC-01             | `hr-application-filters.tsx`, `use-hr-application-navigation.ts`, `hr-application-filter-state.ts`, pagination helper and focused tests | RED observed against baseline; focused filter/navigation and pagination tests passed                                             |
| T02             | T00        | Contributor                 | APP-005/007; PR110-AC-02         | Application form attachment identity/revision synchronization and pure reconciliation helper                                            | RED observed before helper; focused attachment/form tests passed; server revision checks unchanged                               |
| T03             | T00        | Contributor                 | APP-001/008; PR110-AC-03         | Withdrawal confirmation copy and focused rendering test                                                                                 | Old wording failed the focused expectation; corrected copy passed                                                                |
| T04             | T00        | Contributor                 | APP-009/JMG-004; PR110-AC-04     | Dashboard aggregation and per-job status derivation                                                                                     | Expired/scheduled status case failed against baseline and passed after fix                                                       |
| T05             | T01–T04    | Contributor                 | PR110-AC-05 and all affected IDs | Final scoped diff, no change to timezone fix                                                                                            | 9 focused files / 42 tests, typecheck, changed-file ESLint, Prettier and `git diff --check` passed; exact invocations in handoff |
| T06             | T05        | Separate reviewer execution | All PR110-AC                     | Read-only final diff and findings/recheck handoff                                                                                       | Prior range was reviewed; re-review of the new test/helper follow-up commit remains pending                                      |
| T07             | T06        | Student owner               | All PR110-AC                     | Reviewed revision and actual evidence                                                                                                   | Separate acceptance decision required; pending until recorded                                                                    |
| T08             | T07        | Contributor                 | No new deltas                    | Complete packet, logs, archive and navigation                                                                                           | No canonical sync; archive and links checked after acceptance                                                                    |
| T09             | T08        | Authorized contributor      | #115–#118                        | Final closeout commit and issue-linked PR to `develop`                                                                                  | Conventional Commit title/body and actual branch/check evidence; PR remains pending until gates pass                             |

## Integration and handoffs

Implementation occurs sequentially on `fix/115-pr110-review-followups`. One separate read-only reviewer will receive the final diff, approved scope, canonical clauses, actual command outcomes, and explicit test limitations. The reviewer must not edit implementation files.

## Approval and completion evidence

- [x] Requester approved the bounded fixes and `develop` target on 2026-10-19; exact source is recorded in `proposal.md` and `record.md`.
- [x] `tasks.md` matches the ordered work.
- [ ] Independent review of the final test/helper follow-up and human acceptance remain separate pending tasks.
- [ ] Closeout and PR creation remain pending until their required evidence exists.
