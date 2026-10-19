# Tasks: application and HR review regressions

- Change/issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Plan/record: `plan.md`; `record.md`
- Status/owner: in progress; student owner pending assignment

## Before implementation

- [x] T00 — User authorized fixes and PR preparation for these four reviewed issues in the 2026-10-19 chat. Evidence: `proposal.md` and `record.md`; dependencies: issues #120–#123.

## Ordered implementation

- [x] T01 — Keep the form revision aligned with its displayed field snapshot and advance it only after a successful résumé mutation. Depends on: T00. IDs: APP-005/form39-AC-06, review-AC-01. Files: `src/components/application-form.tsx`, `src/components/resume-panel-response.ts`, focused tests. Verification: red/green mounted/action tests and related résumé retries; full unit suite.
- [x] T02 — Reject the unused unscoped cancellation intent from application résumé URLs. Depends on: T00. IDs: APP-007/008, review-AC-02. Files: API route and route tests. Verification: red/green route denial; route, data, and lifecycle suites.
- [x] T03 — Cancel stale debounced searches on history restoration. Depends on: T00. IDs: APP-010, review-AC-03. Files: HR filters and mounted navigation tests. Verification: red/green mounted history test and HR navigation suite.
- [x] T04 — Render current and distinct original letter to Applicant. Depends on: T00. IDs: APP-002/003/004, review-AC-04. Files: Applicant detail page and page tests. Verification: red/green render test and Applicant page tests.
- [x] T05 — Integrate, review own diff, run checks, and record outcomes. Depends on: T01–T04. Verification: typecheck, lint, focused/full unit suite, Prettier, whitespace; browser/hosted checks remain unrun.

## Review and closeout

- [ ] T06 — Separate reviewer execution assesses final revision. Evidence: independent review handoff; pending because this environment disallows subagent delegation and current implementer cannot provide an independent review.
- [ ] T07 — Student owner records acceptance/conditions after evidence review. Pending.
- [ ] T08 — Record dated session log and complete pre-PR closeout; sync/archive only after acceptance; open issue-linked PR to `develop` last. Pending.
- [ ] T09 — Student records later merge/release decision as separate gates. Pending.
