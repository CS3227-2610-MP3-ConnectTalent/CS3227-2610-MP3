# Implementation plan: application and HR review regressions

- Change/issues: 2026-10-19-review-flow-regressions; #120, #121, #122, #123
- Owner/status/date: Student owner pending; approved for implementation; 2026-10-19
- Approved inputs: `proposal.md`, `design.md`; no spec delta
- Baseline and affected IDs: ProductSpec v1.18; APP-002/003/004/005/007/008/010
- Constraints: branch `fix/120-review-flow-regressions` from `develop`; use synthetic fixtures; no schema change; preserve clean baseline authorship.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role          | Requirement and acceptance IDs     | Exact files / expected change                                                                                                                                                                    | Verification command or review / expected evidence                                                                                    |
| --------------- | ---------- | --------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- |
| T01             | None       | Implementer                 | APP-005/form39-AC-06; review-AC-01 | `src/components/application-form.tsx`, `src/components/resume-panel-response.ts`, application form/retry tests; bind revision to field snapshot and reset state between identified applications. | Focused tests fail before repair and pass after; preserve new-draft values on first ID; run related retry and application tests.      |
| T02             | None       | Implementer                 | APP-007/008; review-AC-02          | application résumé API and route tests; reject the unused unscoped cancellation intent.                                                                                                          | Focused denial test fails before repair and passes after; run résumé route and lifecycle checks.                                      |
| T03             | None       | Implementer                 | APP-010; review-AC-03              | HR filter/navigation components and mounted navigation tests; cancel or invalidate search on history restore.                                                                                    | Mounted browser-history test fails before repair and passes after; run HR navigation tests.                                           |
| T04             | None       | Implementer                 | APP-002/003/004; review-AC-04      | Applicant detail page and page-render tests; show current and differing original letter.                                                                                                         | Render test fails before repair and passes after; run applicant page tests.                                                           |
| T05             | T01–T04    | Implementer                 | All                                | Final diff and packet/log evidence.                                                                                                                                                              | Typecheck, lint, focused/full unit tests, `git diff --check`; report unavailable/browser/hosted checks distinctly.                    |
| T06             | T05        | Separate reviewer execution | All                                | Read-only final source/diff and handoff.                                                                                                                                                         | First pass at `69987fb` found a P2 in review-AC-01; clean re-review on `257804b` is recorded in `handoffs/T06-independent-review.md`. |
| T07             | T06        | Student owner               | All                                | Review evidence.                                                                                                                                                                                 | User acceptance recorded 2026-10-19 before the first review report; see `record.md` for timing and scope.                             |
| T08             | T07        | Contributor                 | All                                | Dated session log, closeout, PR template.                                                                                                                                                        | Log, archive and indexes are complete; open issue-linked PR to `develop` as the final contributor action.                             |

## Integration and handoffs

T01–T04 can be implemented independently after the baseline. Review shared route and component contracts before editing. T05 integrates and runs final checks. T06 was a separate read-only reviewer execution; the first pass found one P2 and the recheck passed. T07 is the user's separate acceptance decision, recorded in the packet with its timing relative to the first review.

## Approval and completion evidence

- [x] User's 2026-10-19 request explicitly authorized the four repairs and requested commit, push and PR preparation within this scope.
- [x] `tasks.md` evidence checkboxes updated only after actual results.
- [x] Independent re-review of the corrected revision recorded before PR submission; user acceptance is recorded in `record.md`.
- [x] No canonical product delta; existing APP requirements are restored and sync is N/A.
- [x] Complete session summary before PR creation. Merge/release remain separate.
