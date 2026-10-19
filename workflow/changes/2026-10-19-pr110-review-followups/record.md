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
- Changed files: `src/components/hr-application-filters.tsx`, `src/lib/hr-application-search.ts`, `tests/unit/hr-application-pagination.test.ts` (updated existing expectation), `src/components/application-form.tsx`, `src/components/withdrawal-control.tsx`, `src/lib/hr-dashboard.ts`, `src/app/hr/page.tsx`, `workflow/changes/README.md`, and this packet.
- Local commit/push: pending.
- Tests: not run. The existing pagination assertion was changed to match APP-010 and now checks that the returned rows equal the first-page slice. No test result is claimed. T01 remains open because test-first RED/PASS evidence is absent.
- Static checks on the latest source: `bun node_modules/typescript/bin/tsc --noEmit` passed (exit 0); `bun node_modules/eslint/bin/eslint.js src/app/hr/page.tsx src/components/application-form.tsx src/components/hr-application-filters.tsx src/components/withdrawal-control.tsx src/lib/hr-application-search.ts src/lib/hr-dashboard.ts tests/unit/hr-application-pagination.test.ts` passed (exit 0); `bun node_modules/prettier/bin/prettier.cjs --check src/app/hr/page.tsx src/components/application-form.tsx src/components/hr-application-filters.tsx src/components/withdrawal-control.tsx src/lib/hr-application-search.ts src/lib/hr-dashboard.ts tests/unit/hr-application-pagination.test.ts workflow/changes/README.md workflow/changes/2026-10-19-pr110-review-followups` passed (exit 0); `git diff --check` passed. An initial lint run flagged a synchronous state update inside an effect; the implementation was changed to guarded previous-props reconciliation and lint passed afterward. `pnpm` was unavailable; direct Bun invocation required elevated access to installed package files.
- Hosted/runtime checks: not run. No application unit/browser/database suite was run in this session.
- Security/privacy: no auth/RLS, data-access, storage, AI, or secret changes are planned. Applicant identity/application values are not used as fixtures or copied into logs.
- Runtime/hosted evidence: no production/hosted smoke is claimed.

## Review and decision

- Independent reviewer: separate read-only test-engineer execution; final recheck of the latest current-URL guard is pending.
- Findings/resolutions: reviewer found that the first `isPending`-only guard could still accept a stale prop snapshot after transition idle. The filter now also requires semantic equality with parsed Next `useSearchParams()` before syncing `latestParams`; final recheck is pending.
- Human acceptance: pending separate review of the final diff and actual evidence; requester authorization to implement/open is not recorded as acceptance.
- Canonical sync: N/A; accepted requirements already cover the desired behavior.
- Archive: pending acceptance and verified closeout.
- Dated session summary: pending final pre-PR closeout.
- PR to `develop`: pending required review, acceptance, archive/log closeout, and final checks. Merge to `develop`, master promotion, and deployment remain separate.
