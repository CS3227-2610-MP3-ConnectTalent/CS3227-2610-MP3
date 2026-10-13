# Scheduled Playwright stability — review closeout — 2026-10-13

## Scope and decision

This log records issue #71's scheduled Supabase CI failure, the local E2E repair, and review responses for PR #73. The changes are limited to Playwright assertions/configuration and a non-user-facing readiness marker so the test waits until the controlled client form hydrates. Product behavior, schema, RLS, workflow schedule, and hosted data are unchanged; ProductSpec sync is N/A.

The user approved the issue packet, then authorized Playwright, archive, commit, push, and PR submission conditional on a clean final suite. The final 20/20 run met that condition. The user subsequently requested that PR review comments be addressed and pushed. This review response keeps the E2E work in its own issue-focused commit.

## Evidence and diagnostic history

- Historical Supabase CI run [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38223999064) failed twice because generic `role="status"` assertions matched validation and in-flight save messages. The submitted-letter check failed once and passed on retry. Push run [#65](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38365592473) passed PR-critical browser checks but skipped the scheduled/manual full suite.
- The original local attempt could not start because Docker was unavailable. After Docker started, the first focused run hit default five-second waits while local POSTs were still in flight. A temporary 20-second diagnostic expectation timeout passed both specs and was removed.
- A full run then passed 14 tests before Turbopack panicked. A trace of the submitted-letter case showed `.fill("Original submitted letter")` followed by `Original submitted letterFirst saved draft` in the controlled textarea and form body. The trace used synthetic local applicant data; the trace file was not committed.
- Before the readiness correction, the test-first check waiting for `form[data-hydrated="true"]` failed because the marker did not exist. The client component now exposes a non-visible marker through separate server/client snapshots: it stays false during SSR and initial hydration and becomes true after client hydration. The test uses Playwright `fill()` after hydration and checks the exact value again after submission. This preserves a real replacement-input assertion and avoids a platform-specific keyboard chord.
- The separate reviewer found no source issue in the selector change. Their own suite run had 9 passes and 11 fixture/service-condition skips because `TEST_SUPABASE_SERVICE_ROLE_KEY` was unavailable; the changed application test passed. They accepted the earlier separate 20/20 run as implementer evidence but did not independently reproduce it.

## Review corrections

- The three invalid-PDF assertions now filter `getByRole("status")` by the exact validation copy. They continue to fail if the message loses its live-region role, while excluding unrelated save statuses.
- The submitted-letter test waits for the hydrated form before replacing the saved draft with `fill()`, and checks the submitted result contains exactly the new letter. The `Control+A` sequence was removed, so the test does not depend on Windows/Linux keyboard mapping.
- The final local run before the PR review passed 20/20 without skips. The review response reran the full suite with the local service-role value passed directly to the test process; values are not logged or persisted.

## Review-run timing diagnosis and final verification

- The first post-review full run passed 19/20; the application-withdrawal test was still displaying “Saving your application…” when its five-second assertion expired. An isolated rerun exposed the same boundary on the save-draft and replacement-upload checks. Sanitized trace entries showed the save POST returned HTTP 200 after about 4.97 seconds and the intentionally interrupted replacement-upload POST returned HTTP 400 after about 6.75 seconds, after which the retry state was expected.
- A subsequent full run passed 17/20 and showed the same five-second boundary in three other Applicant journeys. Their error snapshots also showed saving controls disabled and a saving status, rather than an application error. This established that the timeout was shared by the local server-action assertions.
- Set Playwright's suite-wide `expect.timeout` to 20 seconds, matching the earlier focused diagnostic run. This remains a bounded test-only wait; it changes no application action or persistence behavior. The synthetic application-withdrawal journey passed in isolation during diagnosis.
- Final `pnpm test:e2e` passed **20/20** in 10.3 minutes with no skips, using the local Supabase service-role value only in the test process environment. This includes the hydration-ready submitted-letter check and all role-filtered invalid-PDF assertions.
- ESLint then flagged the initial effect-based readiness marker. It now uses `useSyncExternalStore` server/client snapshots; `pnpm lint` and `pnpm typecheck` pass, and the final marker-dependent Applicant file passed 3/3. The 20/20 suite run preceded this lint-driven hook refactor.

## Review and limits

PR #73's test-only adjustment comment was addressed by waiting for hydration and restoring the replacement-input assertion. The review's focused-commit request is handled by keeping this work in the #71 commit; the #72 reporter correction is a separate commit. The archive record and review links are issue-specific and resolve within the repository.

Review handoff: [independent #71 review](../workflow/archive/2026-10-13-scheduled-e2e-stability/handoffs/T04-independent-review.md).

The next hosted scheduled run remains integration evidence after merge. No merge, hosted project access, or deployment is claimed here.
