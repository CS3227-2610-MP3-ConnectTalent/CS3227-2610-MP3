# Implementation plan: PR #110 review follow-ups

- Change/issues: `2026-10-19-pr110-review-followups`; #115, #116, #117, #118
- Owner/status/date: Requester as student owner/verifier; accepted with stated limits, closeout in progress / 2026-10-19
- Approved inputs: `proposal.md`, `design.md` (bounded design omission), canonical `applications-and-review.md` and `job-management.md`
- Baseline and affected IDs: `develop` `3c9ba769f536679a3f546b5e5fbf5a254f059104`; APP-001/005/007/008/009/010; JMG-004
- Constraints: implement only the five findings still present; keep reviewer-finding #1 timezone code unchanged; no schema/auth/provider changes; do not merge or deploy to `master`.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / role                | Requirement and acceptance IDs   | Exact files / expected change                                                                    | Verification command or review / expected evidence                                                                                   |
| --------------- | ---------- | --------------------------- | -------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| T00             | none       | Requester / scope approval  | #115–#118; all PR110-AC          | Issues, proposal, design omission, plan, tasks, record                                           | Direct user instruction recorded before implementation                                                                               |
| T01             | T00        | Contributor                 | APP-010; PR110-AC-01             | Filter navigation, pagination, mounted filter transitions, pending search and clear cancellation | Four new mounted assertions failed against `develop`; full focused suite passed after fix                                            |
| T02             | T00        | Contributor                 | APP-005/007; PR110-AC-02         | Attachment identity/revision reconciliation and mounted form refresh                             | Both mounted tests failed against `develop`; full focused suite passed after fix; server checks unchanged                            |
| T03             | T00        | Contributor                 | APP-001/008; PR110-AC-03         | Withdrawal confirmation copy and focused rendering test                                          | Old wording failed the focused expectation; corrected copy passed                                                                    |
| T04             | T00        | Contributor                 | APP-009/JMG-004; PR110-AC-04     | Dashboard aggregation and per-job status derivation                                              | Expired/scheduled status case failed against baseline and passed after fix                                                           |
| T05             | T01–T04    | Contributor                 | PR110-AC-05 and all affected IDs | Final scoped diff, no change to timezone fix                                                     | 11 focused files / 47 tests, typecheck, changed-file ESLint, Prettier and `git diff --check` passed; exact invocations in handoff    |
| T06             | T05        | Separate reviewer execution | All PR110-AC                     | Read-only final diff and findings/recheck handoff                                                | Final range through `182b4a2` found no defect; P3 identity assertion gap closed; mocked-router P2 integration limit recorded          |
| T07             | T06        | Student owner               | All PR110-AC                     | Reviewed revision and actual evidence                                                            | Requester accepted with stated limits on 2026-10-19; see proposal and record                                                          |
| T08             | T07        | Contributor                 | No new deltas                    | Complete packet and archive navigation                                                          | Packet archived after acceptance; README navigation updated; no canonical sync needed                                                |
| T09             | T08        | Contributor                 | No new deltas                    | Dated closeout summary and links in record/index                                                | Summary completed before PR submission; tests and review limits recorded                                                             |
| T10             | T09        | Authorized contributor      | #115–#118                        | Issue-linked PR to `develop` as final contributor action                                        | Conventional Commit title/body and branch/check/review evidence; PR pending until submitted                                           |

## Integration and handoffs

Implementation occurs sequentially on `fix/115-pr110-review-followups`. One separate read-only reviewer will receive the final diff, approved scope, canonical clauses, actual command outcomes, and explicit test limitations. The reviewer must not edit implementation files.

## Approval and completion evidence

- [x] Requester approved the bounded fixes and `develop` target on 2026-10-19; exact source is recorded in `proposal.md` and `record.md`.
- [x] `tasks.md` matches the ordered work.
- [x] Independent review of the final implementation and test/helper follow-up is recorded.
- [x] Student owner acceptance with stated limits is recorded separately from the requester’s implementation-scope approval.
- [ ] Complete the closeout packet and dated summary, then open the issue-linked PR as the final contributor action.
