# Feature record: PR #110 review follow-ups

## Intake and scope

- Change: `2026-10-19-pr110-review-followups`
- Issues: #115, #116, #117, #118
- Branch: `fix/115-pr110-review-followups`
- Baseline: `develop` `3c9ba769f536679a3f546b5e5fbf5a254f059104`
- Requirements: APP-001/005/007/008/009/010; JMG-004
- Classification: behavior corrections restoring already-accepted behavior
- Student owner: unassigned for triage; requester identity/role is not confirmed in this chat context
- Requester approval: on 2026-10-19, requester instructed the contributor to create a branch from `develop`, fix necessary PR #110 review findings, and open a PR to `develop`; promotion to `master` remains a separate manual step. This approves the bounded repair scope, not final acceptance of the implementation.

## Review-comment disposition

| PR #110 thread          | Finding                                                   | Current `develop` disposition                                                                                                                                                |
| ----------------------- | --------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PRRT_kwDOU4zYRs6tqsx5` | Preserve HR timezone in scheduled timestamps              | Already addressed on baseline; `hr-job-input.ts` validates offset-bearing browser values and uses `utcDateTimeLocalToIso` for no-JavaScript local values. No change planned. |
| `PRRT_kwDOU4zYRs6tqsx9` | Preserve pending filter choices                           | Confirmed present in `hr-application-filters.tsx`; remediation assigned to #115.                                                                                             |
| `PRRT_kwDOU4zYRs6tqsx_` | Oversized pages fall back to page 1                       | Confirmed present in `hr-application-search.ts`; remediation assigned to #115. Existing test assertion currently expects the contrary behavior and must be aligned.          |
| `PRRT_kwDOU4zYRs6tqsyA` | Refresh application revision after uncertain résumé write | Confirmed local attachment state initializes once from props; remediation assigned to #116.                                                                                  |
| `PRRT_kwDOU4zYRs6tqsyC` | Explain new application after withdrawal                  | Confirmed incorrect wording in `withdrawal-control.tsx`; remediation assigned to #117.                                                                                       |
| `PRRT_kwDOU4zYRs6tqsyE` | Count expired scheduled jobs as closed                    | Confirmed dashboard uses persisted status; remediation assigned to #118.                                                                                                     |

## Implementation and verification

- Implementation handoff: primary Codex contributor applying `mp3-implementer`; no delegated implementation agent. See `handoffs/T01-implementer.md`.
- Changed files: `src/app/hr/page.tsx`, `src/components/application-form.tsx`, `src/components/hr-application-filters.tsx`, `src/components/use-hr-application-navigation.ts`, `src/components/withdrawal-control.tsx`, `src/lib/application-attachment.ts`, `src/lib/hr-application-filter-state.ts`, `src/lib/hr-application-search.ts`, `src/lib/hr-dashboard.ts`, focused unit tests for application attachment, filter navigation, pagination, dashboard status and withdrawal copy, updated dashboard/filter test mocks, workflow index, and this packet.
- Implementation/evidence commits: `b9c448e713a5083c833be1b461c2179c4303f555` (`fix(portal): address PR #110 review findings`), `43ac993` (`docs(workflow): record PR #110 review evidence`), and `1b95de2` (`fix(portal): cover PR #110 review follow-ups`) are pushed to `origin/fix/115-pr110-review-followups`. The branch is based on `develop` at `3c9ba769f536679a3f546b5e5fbf5a254f059104`; the current remote `develop` still points to that commit.
- RED evidence: against the `develop` baseline, pagination failed because page 999 returned page 3; the dashboard test received Published 2 / Closed 0 instead of Published 1 / Closed 1; filter-state tests failed before the merge/sync helpers existed; attachment tests failed before the reconciliation helper existed; and the withdrawal test failed against the old confirmation wording.
- GREEN evidence: `bun node_modules/vitest/vitest.mjs run tests/unit/hr-application-pagination.test.ts tests/unit/hr-application-filters.test.ts tests/unit/hr-application-filter-state.test.ts tests/unit/application-attachment.test.ts tests/unit/hr-dashboard.test.ts tests/unit/withdrawal-confirmation.test.tsx tests/unit/hr-application-filter-edge-cases.test.tsx tests/unit/application-form-layout.test.tsx tests/unit/hr-dashboard-page.test.tsx` passed: 9 test files, 42 tests.
- Static checks on the final source/test tree: `bun node_modules/typescript/bin/tsc --noEmit` passed (exit 0); changed-file ESLint passed (exit 0); Prettier check for all changed source/tests and the packet passed (exit 0); `git diff --check` passed. A post-packet-edit Prettier check initially flagged three formatting-only files; they were formatted and the complete check passed. After the independent-review packet update, the packet-only Prettier check flagged `plan.md`; it was formatted and the final packet check passed. The exact file lists are recorded in `handoffs/T01-implementer.md`. An earlier lint run found file-size limits; helpers/navigation were split into focused modules, after which final lint passed. The Vite native-config warning appeared during Vitest but did not fail tests. `pnpm` was unavailable; direct Bun invocation required elevated access to installed package files.
- Hosted/runtime checks: no browser, database, hosted, or production smoke was run. Filter transition ordering has unit coverage of merge/sync decisions but no browser-level router race test.
- Security/privacy: no auth/RLS, data-access, storage, AI, or secret changes are planned. Applicant identity/application values are not used as fixtures or copied into logs.
- Runtime/hosted evidence: no production/hosted smoke is claimed.

## Review and decision

- Independent reviewer: separate read-only test-engineer execution (`/root/pr110_fix_review`) reviewed `3c9ba769f536679a3f546b5e5fbf5a254f059104..1b95de20158d3b24bea8c071b78f1a60b1054aaf`; did not implement or author tests and ran no tests/checks. Full findings and executed review commands are in `handoffs/T06-independent-review.md`.
- Findings/resolutions: reviewer initially found that the first `isPending`-only guard could accept a stale prop snapshot after transition idle. The filter now also requires semantic equality with parsed Next `useSearchParams()` before syncing `latestParams`. Final source re-review found no confirmed defects and verified the exact first-page assertion, guarded attachment reconciliation/hidden revision wiring, withdrawal copy, operational dashboard status, HR authorization boundary, and unchanged timezone fix. Two test-coverage limits remain: no mounted hook test exercises overlapping/canceled router transitions (P2 evidence gap), and no mounted form test asserts the hidden revision after refreshed props (P3 evidence gap). Reviewer said these limits do not establish defects; no browser, database, hosted, or production smoke is claimed.
- Human acceptance: pending separate student decision on the reviewed implementation commit `1b95de2`, actual checks, independent findings, and the documented P2/P3 coverage limits; requester authorization to implement/open is not recorded as acceptance.
- Canonical sync: N/A; accepted requirements already cover the desired behavior.
- Archive: pending acceptance and verified closeout.
- Dated session summary: pending final pre-PR closeout.
- PR to `develop`: pending required review, acceptance, archive/log closeout, and final checks. Merge to `develop`, master promotion, and deployment remain separate.
