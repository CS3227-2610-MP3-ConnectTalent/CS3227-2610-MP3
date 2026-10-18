# Withdrawal placement correction — 10 October 2026

Paul requested Withdraw application inside each individual application rather than My applications. Primary inspected actual source: controls were present in both places. Prepared #50 follow-up proposal/design omission/plan; Paul explicitly replied “Approve correction”. Current feat/53-unsaved-profile-resume branch and existing uncommitted work preserved.

TDD: added browser assertions for no list withdrawal controls, correct View navigation and one detail control. Before repair the focused test failed expected0/received1 on the submitted list. Removed only the list WithdrawalControl import/render and updated the user guide. Focused local synthetic browser flow then passed (one test, 40.2 seconds total), including cancellation without persistence, confirmation, withdrawal after closure, retained data/files and HR processing/privacy checks. Typecheck, scoped ESLint and git diff --check passed. No new database checks needed for unchanged SQL and authorization.

Separate read-only /root/application_withdrawal_review inspected bounded source, tests, docs and whitespace. No findings; browser/type/lint evidence was implementer execution rather than reviewer execution. Hosted validation and student acceptance pending. No new branch, commit, push, PR or hosted operation. No credentials/private applicant data in this summary; personal verification of this AI-generated summary remains pending.

[Change record](../workflow/archive/2026-10-10-withdrawal-placement/record.md).
