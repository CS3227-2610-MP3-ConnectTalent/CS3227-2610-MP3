# Tasks: application and HR review regressions

- Change/issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Plan/record: `plan.md`; `record.md`
- Status/owner: post-submission follow-up; student owner pending formal assignment

## Before implementation

- [x] T00 — User authorized fixes and PR preparation for these four reviewed issues in the 2026-10-19 chat. Evidence: `proposal.md` and `record.md`; dependencies: issues #120–#123.

## Ordered implementation

- [x] T01 — Keep the form revision aligned with its displayed field snapshot, reset state between identified applications, and advance revision only after a successful résumé mutation. Preserve values when a new draft first receives its ID. Depends on: T00. IDs: APP-005/form39-AC-06, review-AC-01. Files: `src/components/application-form.tsx`, `src/components/resume-panel-response.ts`, focused tests. Verification: red/green mounted/action tests and related résumé retries; full unit suite.
- [x] T02 — Reject the unused unscoped cancellation intent from application résumé URLs. Depends on: T00. IDs: APP-007/008, review-AC-02. Files: API route and route tests. Verification: red/green route denial; route, data, and lifecycle suites.
- [x] T03 — Cancel stale debounced searches on history restoration. Depends on: T00. IDs: APP-010, review-AC-03. Files: HR filters and mounted navigation tests. Verification: red/green mounted history test and HR navigation suite.
- [x] T04 — Render current and distinct original letter to Applicant. Depends on: T00. IDs: APP-002/003/004, review-AC-04. Files: Applicant detail page and page tests. Verification: red/green render test and Applicant page tests.
- [x] T05 — Integrate, review own diff, run checks, and record outcomes. Depends on: T01–T04. Verification: typecheck, lint, focused/full unit suite, Prettier, whitespace; browser/hosted checks remain unrun.

## Review and closeout

- [x] T06 — Separate reviewer execution assessed `114ba259` after the earlier identity fixes and CI-driven revision correction. The final reviewer passed six focused files/27 tests and found no new source defect. Hosted CI remains pending. Evidence is in `handoffs/T06-independent-review.md`.
- [x] T07 — User recorded “I accept and approve. Please proceed” on 2026-10-19. This preceded the independent finding; the user authorized proceeding with the review-driven correction within #122's existing acceptance behavior.
- [x] T08 — Pre-PR dated log, complete packet archive and canonical sync N/A were completed; issue-linked PR #124 is open against `develop`. Post-submission review and CI follow-ups are recorded separately.
- [ ] T09 — Student records later merge/release decision as separate gates. Pending.
- [ ] T10 — Confirm final hosted CI and obtain fresh student acceptance of the reviewed, corrected revision. Keep acceptance pending until a student decision is recorded.
