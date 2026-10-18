# Feature record: HR job management

Status: locally accepted with recorded limits and archived. Owner: Paul Cheng (team ownership of HR posting workflow to confirm). Date: 2026-10-09.

## Scope and links

- Issue: [#8](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/8).
- Branch/baseline: `feat/8-hr-job-management` from updated `develop` `0a0f5c4`; no commit or PR yet.
- [Proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- Canonical requirements: [JMG-001–003](../../specs/job-management.md), [JOB-001–003](../../specs/public-job-listings.md), [APP-001/004](../../specs/applications-and-review.md), [SEC-001/002/007](../../specs/security-and-privacy.md); ProductSpec v1.0. No proposed product delta.
- Archive path: `workflow/archive/2026-10-09-hr-job-management/`, complete packet moved after the accepted no-delta check on 2026-10-09.

## Decisions and gates

- [x] User explicitly requested starting #8 with a new branch from `develop` on 2026-10-09. Branch created from updated `develop` `0a0f5c4`.
- [x] User resolved the teammate question on 2026-10-09: edits to submitted cover letters remain allowed until the job closes. No APP-004/SEC-001 change is proposed.
- [x] Paul Cheng approved the named #8 proposal/design/plan on 2026-10-09 via explicit conversation reply “Approve as written (Recommended)”. This is implementation approval, not acceptance, hosted migration, commit or PR authorization.
- [x] Test-first implementation and local security checks completed as recorded below. Hosted checks remain pending.
- [x] A separate read-only Codex security/privacy reviewer checked the uncommitted diff and rechecked its fixes, including the final unchanged-content assertion; see [handoff](handoffs/independent-review.md).
- [x] Paul Cheng separately accepted the local feature with recorded limits on 2026-10-09 by replying “Accept with recorded limits (Recommended)” to a question naming 107 database, 52 unit and 10 browser tests, race/build/review results, pending shared Development Supabase migration and preview testing, and no commit/push/PR/deployment authorization.
- [x] Guides/reflections and the dated session summary were updated. Canonical sync is N/A because this implementation matches existing accepted requirements; complete packet archived on 2026-10-09. PR, hosted migration and release remain pending.

## Acceptance evidence

| ID | Requirement | Result/evidence |
| --- | --- | --- |
| `jmg8-AC-01` | HR draft creation/edit, valid fields, public/Applicant denial | Local focused pgTAP 35/35, unit and browser flow passed. |
| `jmg8-AC-02` | Explicit publish, fixed published content, application eligibility | Local pgTAP and browser publish/detail passed. |
| `jmg8-AC-03` | Explicit close, no new writes, existing applications retained | Local pgTAP retention/edit denial, browser closure and three lock-contended race cases passed. |
| `jmg8-AC-04` | Server/RLS/grant denial and private-data-free audit | Local pgTAP covers all four RPCs for Applicant/unverified HR plus anonymous execute grants; browser checks Applicant direct route. Valid HR's malformed inputs now produce sanitized denial audit entries. Unauthorized requests stopped inside `requireHR()` are not yet captured by an application-level audit entry, so full SEC-007 coverage remains open. |
| `jmg8-AC-05` | Migration compatibility and truthful environment evidence | Local additive migration, all 107 pgTAP tests, 52 unit tests, 10 browser tests, typecheck and build passed. Shared Development Supabase migration and preview smoke were not run. |

## Agent, test and session evidence

One Codex conversation drafted and implemented this packet. A separate read-only Codex security/privacy reviewer checked the diff and rechecked fixes, as documented in the [handoff](handoffs/independent-review.md). The GitHub issue page could not be fetched in this session due tool network restrictions; the issue number and intent came from the user's link and existing canonical requirements.

Implementation: `supabase/migrations/20261009061131_hr_job_management.sql` adds verified-HR reads and private-schema privileged functions with public invoker RPC wrappers. `src/lib/hr-job-input.ts` validates fields and IDs; `src/lib/hr-jobs.ts` reads jobs through the verified HR session; `src/app/hr/jobs/` provides separate draft edit, Publish and Close forms. No hosted project was changed. The private-schema implementation follows current [Supabase database-function guidance](https://supabase.com/docs/guides/database/functions); server actions also check HR and do not log job/letter text.

| Local evidence | Actual result and limit |
| --- | --- |
| `corepack pnpm exec supabase test db --local supabase/tests/database/hr_job_management.test.sql` before migration | Failed 16/19 tests on absent functions/visibility; clean behavior-level red. Initial attempt without Docker was infrastructure blocked; a first test revision aborted on a missing function privilege lookup and was corrected before this result. |
| `corepack pnpm exec supabase migration up --local`, then focused pgTAP | Local migration applied; 19/19 passed, then expanded closure/application cases passed 24/24. Reviewer-requested denial and unchanged-content assertions brought the focused result to 35/35. |
| `corepack pnpm exec vitest run tests/unit/hr-job-input.test.ts` | Stub failed 2/3 assertions, then implementation passed 3/3. The earlier import-missing run was not counted as behavior-level red. |
| `corepack pnpm exec vitest run tests/unit/hr-job-actions.test.ts` | Stub failed 3/3 assertions, then implementation passed all 3. |
| `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/hr-job-management.spec.ts` | Before UI, failed on missing Manage jobs heading; after UI, reached closure but final Applicant denial saw sign-in because the test did not await Applicant sign-in. Test timing fixed; focused test passed. |
| `corepack pnpm test:db` | Passed 4 files / 96 pgTAP tests before review fixes, then 4 files / 107 pgTAP tests after added denials. An attempted `corepack pnpm test:db -- --local` was misparsed as a path and ran no tests; corrected invocation passed. The final unchanged-content assertion passed focused 35/35 and does not alter count. |
| `corepack pnpm test:unit`; full `node --env-file=.env.local node_modules/@playwright/test/cli.js test` | Passed 12 files / 52 unit tests and 10 browser tests. Browser fixtures were synthetic and removed. |
| `node tests/integration/application-races.mjs` | Passed duplicate-submit, HR-close-first and submit-first lock-wait races against local Docker. |
| `corepack pnpm exec supabase db advisors --local --type security --level warn --fail-on error` | No local security-advisor findings. This does not replace manual review. |
| `corepack pnpm typecheck`; `corepack pnpm build`; scoped `corepack pnpm exec eslint ...`; `git diff --check` | Passed. Final rebuild after reviewer fixes passed. Repository-wide `corepack pnpm lint` failed because ESLint traversed the nested `.worktrees/27-password-reset/.next` generated output (1,086 errors there); scoped lint and `corepack pnpm exec eslint . --ignore-pattern '.worktrees/**'` passed. |

Known limits: current local stack is the only database tested; shared Development and Production Supabase were untouched. Preview smoke, commit and PR are pending. Application-level audit does not capture requests rejected by `requireHR()` before a verified actor exists. The baseline has a local nested worktree that makes repository-wide lint fail; it is not part of this feature diff.

## Acceptance, canonical check and archive

- Human acceptance: Paul Cheng, 2026-10-09, explicit conversation reply “Accept with recorded limits (Recommended)” after separate independent review. This accepts local behavior and the stated evidence limits, not hosted rollout or source-control actions.
- Canonical check before archive: [JMG-001](../../specs/job-management.md) already requires HR draft create/edit and the three states; JMG-002 already requires explicit publish and fixed published/closed content; JMG-003 already requires close with retained applications. [JOB-001](../../specs/public-job-listings.md) already hides unpublished jobs, [APP-001/004](../../specs/applications-and-review.md) already gates submissions and edits on published status, and [SEC-001/002](../../specs/security-and-privacy.md) already fixes role and RLS/server boundaries. The implemented behavior and accepted packet introduce no new normative rule. Therefore no canonical edit, ProductSpec version bump or sync commit is needed; v1.0 remains current.
- Archive: entire packet was moved to `workflow/archive/2026-10-09-hr-job-management/` on 2026-10-09 after the no-delta check. `workflow/archive/README.md`, current guide/log links and the changes index were repaired; packet-relative canonical/log links retain the same depth. No commit or PR is authorized yet.

Session summary: [2026-10-09 HR job management implementation](../../../logs/2026-10-09-hr-job-management.md). Student verification of generated summary is pending.
