# Résumé-first/profile implementation — 10 October 2026

## Requests and decisions

Paul approved #53's concrete proposal/deltas/design/plan and branch creation. Created feat/53-unsaved-profile-resume carrying accepted uncommitted #49/#50 work. #52 remains deferred. No commit, push, PR or hosted operation was authorized.

## Work and actual checks

Implemented upload before Save using validated bytes followed by atomic blank private draft/reservation; moved résumé below work experience/above AI; added optional owner-only profile uploads and explicit independent application copies. File mutations preserve unsaved text and reconcile application ID/revision. CLI created/applied local migration 20261010080649. No local reset or user-data removal.

TDD: two focused composition tests and four database presence checks failed before implementation, then passed. Final full unit suite: 150 tests/28 files passed. Database suite: 331 checks/10 files passed. Typecheck, scoped ESLint and production build passed. Existing profile browser workflow passed; withdrawal and résumé-first browser flows passed on recheck. Expanded résumé-first browser test verifies direct upload without Save, invalid upload creates no draft, explicit profile copy, preserved typed fields, repeated same-page Save/Submit, owner isolation and unchanged application bytes after profile removal.

Four existing attachment races passed with actual lock waits. Three dedicated new races passed: first upload versus Save, profile finalization versus removal, removal versus finalization. Synthetic metadata race fixtures were cleaned using supported Storage APIs; browser tests exercised actual PDF bytes.

## Failures and corrections

- Sandbox unit-worker spawn EPERM: escalated local runner recheck passed.
- Second dev server could not start while Paul's localhost server held the Next dev lock: reused localhost:3000 without stopping it.
- Older global SQL metadata counts included an unrelated existing submitted application. Scoped counts to fixed fixture owner/path; all checks passed without deleting existing data.
- Browser profile fixture used applicant_id instead of user_id; corrected test query. Cold PDF-worker upload exceeded a five-second browser assertion; bounded 30-second wait recheck passed. An added Save test expected nonexistent success copy; replaced it with polling actual saved database state.
- Race harness treated empty expected-error string as success; actual terminal-state rejection was correct. Asserted its concrete error and reran successfully.
- Independent review raised possible stale revision after repeated Save. Focused repeated-save/submit browser test passed without a product repair; recorded as not reproduced. Whitespace findings fixed.

## Review and limits

Separate read-only reviewer /root/application_withdrawal_review ran 14 focused unit tests and inspected source, tests and built PDF tracing. No blocking source security finding; final race follow-up recorded in the handoff. Hosted rollout, clean-reset rehearsal, exhaustive race permutations and full accessibility audit remain pending. Cleanup retains tombstones/manual recovery; no guaranteed sweeper or malware scanner. Student acceptance and personal summary verification pending. No credentials or private applicant content recorded.

[Change record](../workflow/archive/2026-10-10-unsaved-profile-resume/record.md).
