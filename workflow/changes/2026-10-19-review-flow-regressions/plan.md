# Implementation plan: application and HR review regressions

- Change/issues: 2026-10-19-review-flow-regressions; #120, #121, #122, #123
- Owner/status/date: Student owner pending; approved for implementation; 2026-10-19
- Approved inputs: `proposal.md`, `design.md`; no spec delta
- Baseline and affected IDs: ProductSpec v1.18; APP-002/003/004/005/007/008/010
- Constraints: branch `fix/120-review-flow-regressions` from `develop`; use synthetic fixtures; no schema change; preserve clean baseline authorship.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role          | Requirement and acceptance IDs     | Exact files / expected change                                                                                                                    | Verification command or review / expected evidence                                                                     |
| --------------- | ---------- | --------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------- |
| T01             | None       | Implementer                 | APP-005/form39-AC-06; review-AC-01 | `src/components/application-form.tsx`, `src/components/resume-panel-response.ts`, application form/retry tests; bind revision to field snapshot. | Focused test fails before repair and passes after; run related retry and application tests.                            |
| T02             | None       | Implementer                 | APP-007/008; review-AC-02          | application résumé API and route tests; reject the unused unscoped cancellation intent.                                                          | Focused denial test fails before repair and passes after; run résumé route and lifecycle checks.                       |
| T03             | None       | Implementer                 | APP-010; review-AC-03              | HR filter/navigation components and mounted navigation tests; cancel or invalidate search on history restore.                                    | Mounted browser-history test fails before repair and passes after; run HR navigation tests.                            |
| T04             | None       | Implementer                 | APP-002/003/004; review-AC-04      | Applicant detail page and page-render tests; show current and differing original letter.                                                         | Render test fails before repair and passes after; run applicant page tests.                                            |
| T05             | T01–T04    | Implementer                 | All                                | Final diff and packet/log evidence.                                                                                                              | Typecheck, lint, focused/full unit tests, `git diff --check`; report unavailable/browser/hosted checks distinctly.     |
| T06             | T05        | Separate reviewer execution | All                                | Read-only final source/diff and handoff.                                                                                                         | Independent findings and rechecks recorded; if unavailable, mark missing and do not claim independent review.          |
| T07             | T06        | Student owner               | All                                | Review evidence.                                                                                                                                 | Record separate student acceptance/conditions; pending until actual decision.                                          |
| T08             | T07        | Contributor                 | All                                | Dated session log, closeout, PR template.                                                                                                        | Check requirements, archive only after acceptance and canonical sync decision; open issue-linked PR to `develop` last. |

## Integration and handoffs

T01–T04 can be implemented independently after the baseline. Review shared route and component contracts before editing. T05 integrates and runs final checks. T06 must be a separate reviewer execution; no subagent has been spawned. T07 is the student's separate acceptance gate.

## Approval and completion evidence

- [x] User's 2026-10-19 request explicitly authorized the four repairs and requested commit, push and PR preparation within this scope.
- [ ] `tasks.md` evidence checkboxes updated only after actual results.
- [ ] Independent review and separate human acceptance recorded before PR submission.
- [ ] No canonical product delta expected; verify and state this in closeout.
- [ ] Complete session summary before PR creation. Merge/release remain separate.
