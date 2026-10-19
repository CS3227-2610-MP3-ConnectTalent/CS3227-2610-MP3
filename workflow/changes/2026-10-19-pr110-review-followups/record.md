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
| `PRRT_kwDOU4zYRs6tqsx9` | Preserve pending filter choices                           | Fixed on branch with latest-intent navigation state; mounted filter test covers rapid role/status changes and pending search with a filter transition.                       |
| `PRRT_kwDOU4zYRs6tqsx_` | Oversized pages fall back to page 1                       | Fixed on branch in `hr-application-search.ts`; pagination test asserts the exact first-page slice after page 999.                                                            |
| `PRRT_kwDOU4zYRs6tqsyA` | Refresh application revision after uncertain résumé write | Fixed on branch with guarded attachment reconciliation; pure revision tests and a mounted form refresh test cover the hidden revision and new application identity.          |
| `PRRT_kwDOU4zYRs6tqsyC` | Explain new application after withdrawal                  | Fixed on branch; focused confirmation rendering test checks current-record finality and supported reapplication wording.                                                     |
| `PRRT_kwDOU4zYRs6tqsyE` | Count expired scheduled jobs as closed                    | Fixed on branch using operational status; dashboard tests cover expired and future-scheduled jobs.                                                                           |

## Implementation and verification

- Implementation handoff: primary Codex contributor applying `mp3-implementer`; no delegated implementation agent. See `handoffs/T01-implementer.md`.
- Changed files: the above implementation paths plus `package.json`/`pnpm-lock.yaml` (dev-only Happy DOM test environment), `tests/unit/hr-application-navigation.test.tsx` (mounted filters/router transitions, pending debounce and clear cancellation), `tests/unit/application-form-refresh.test.tsx` (mounted refreshed hidden revision and identity), prior focused unit tests, updated dashboard/filter test mocks, workflow index, and this packet.
- Implementation/evidence commits: `b9c448e713a5083c833be1b461c2179c4303f555` (`fix(portal): address PR #110 review findings`), `43ac993` (`docs(workflow): record PR #110 review evidence`), `1b95de2` (`fix(portal): cover PR #110 review follow-ups`), `31cbf34` (`test(portal): cover mounted PR #110 review cases`), and `182b4a237815579748affef08c91e5fe1840fe5d` (`test(portal): assert refreshed resume identity`) are pushed to `origin/fix/115-pr110-review-followups`. The branch is based on `develop` at `3c9ba769f536679a3f546b5e5fbf5a254f059104`; the current remote `develop` still points to that commit.
- RED evidence: earlier baseline failures are summarized below. For the new mounted follow-up, temporarily restored the two affected components from `develop` and ran the new tests: 4 failed / 1 passed. Role/status navigation dropped the selected role; the search replacement dropped the selected status; refreshed props left the hidden revision at 2 instead of 3; and a changed application ID retained the old revision. The Clear filters test passed against baseline. Both source files were restored to the fix branch afterward, and the mounted tests passed.
- GREEN evidence: `bun node_modules/vitest/vitest.mjs run tests/unit/hr-application-pagination.test.ts tests/unit/hr-application-filters.test.ts tests/unit/hr-application-filter-state.test.ts tests/unit/application-attachment.test.ts tests/unit/hr-dashboard.test.ts tests/unit/withdrawal-confirmation.test.tsx tests/unit/hr-application-filter-edge-cases.test.tsx tests/unit/application-form-layout.test.tsx tests/unit/hr-dashboard-page.test.tsx tests/unit/hr-application-navigation.test.tsx tests/unit/application-form-refresh.test.tsx` passed: 11 test files, 47 tests.
- Static checks on the final source/test tree: `bun node_modules/typescript/bin/tsc --noEmit`, changed-file ESLint, Prettier check for package/lockfile plus changed source/tests, and `git diff --check` all passed (exit 0). Exact invocations are in `handoffs/T01-implementer.md`. A post-test packet formatting check initially flagged `plan.md` and `record.md`; both were formatted and the full final check passed. The Vite native-config warning appeared during Vitest but did not fail tests. Happy DOM is dev-only; local tests run under Bun because Node/pnpm shims are unavailable, while the repository-pinned pnpm 12.8.1 updated the existing lockfile. `happy-dom@21.0.3` requires Node >=20; repository contribution guidance and CI use Node 24.
- Hosted/runtime checks: no real browser, database, hosted, or production smoke was run. Mounted tests exercise the actual filter/form components in Happy DOM with a mocked Next router and mocked unrelated form children; this does not establish actual Next/browser navigation behavior.
- Security/privacy: no auth/RLS, data-access, storage, AI, or secret changes are planned. Applicant identity/application values are not used as fixtures or copied into logs.
- Runtime/hosted evidence: no production/hosted smoke is claimed.

## Review and decision

- Independent reviewer: separate read-only test-engineer execution (`/root/pr110_fix_review`) reviewed the initial implementation through `1b95de2`, then re-reviewed `3c9ba769f536679a3f546b5e5fbf5a254f059104..31cbf34d6df0f0852f0e65f3b6e3698fe6f8c4eb` and the final range `3c9ba769f536679a3f546b5e5fbf5a254f059104..182b4a237815579748affef08c91e5fe1840fe5d`; did not implement or author tests and ran no tests/checks. No source defect was found. The final review confirmed the refreshed application identity assertion is present and closes the earlier P3 test gap.
- Findings/resolutions: the initial isPending-only filter guard was strengthened to require semantic equality with parsed Next `useSearchParams()` before syncing `latestParams`. Mounted tests exercise rapid filter updates, a filter transition before the search debounce fires, Clear filters cancelling the timer, and an `ApplicationForm` receiving newer revision and identity props; the form test asserts the refreshed identity reaches the résumé panel. Independent review found no confirmed source defect. The remaining P2 validation limit is actual Next/browser interruption or out-of-order navigation, which the synchronous mocked router does not exercise. No real browser/Next navigation smoke is claimed.
- Human acceptance: pending separate student decision on the final reviewed code/test revision, actual checks, independent findings, and explicit Happy DOM/mock limits; requester authorization to implement/open is not recorded as acceptance.
- Canonical sync: N/A; accepted requirements already cover the desired behavior.
- Archive: pending acceptance and verified closeout.
- Dated session summary: pending final pre-PR closeout.
- PR to `develop`: pending required review, acceptance, archive/log closeout, and final checks. Merge to `develop`, master promotion, and deployment remain separate.
