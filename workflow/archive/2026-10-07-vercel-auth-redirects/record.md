# Feature record: Vercel-aware Supabase Auth redirects

Status: archived after requester acceptance; implementation, tests, and independent review complete; PR pending

Owner: John Wong / @Johnwz123 (requesting user and GitHub issue assignee; student role not separately verified)

Spec version: [ProductSpec v0.7](../../ProductSpec.md)
Date: 2026-10-07

## Metadata and artifact links

- Change ID/classification: 2026-10-07-vercel-auth-redirects; deployment/auth integration behavior
- GitHub issue: [#17](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/17); issue is open and assigned to Johnwz123; no labels/type are set; formal student triage remains unconfirmed.
- Branch/commits/PR: `feat/17-18-auth-redirects-pr-titles`, branched from local `develop` at `2fad6ed`; auth implementation commit [db032ed](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/db032ed463b7ba2beda3d2e44fd90e1f5fd8f25e), policy commit [213fb96](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/commit/213fb963eab1f386cfc13391f925b1fedd57e742); archive closeout commit is in branch history; PR pending.
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: none proposed; ACC-001 verification behavior and OPS-001 environment separation remain unchanged.
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v0.7 dated 2026-10-07; baseline commit `2fad6ed`
- Archive: complete at `workflow/archive/2026-10-07-vercel-auth-redirects/` on 2026-10-08.

## Approval checklist

- [x] Scope, design, and plan approved by the requesting human's direct instruction to follow the Supabase/Vercel guidance; student role is not independently verified. Existing Standard Protection defines previews as team-only for this implementation.
- [ ] Issue labels/type and student-role assignment are still not recorded on the GitHub issue.
- [x] Focused behavior tests were added and passed; full unit suite, lint, typecheck, and production build passed. Tests were added after the existing implementation, so no intended-behavior red result was observed; the first test run instead exposed a missing Vitest resolution for Next's `server-only` marker, fixed with a Vitest-only alias.
- [x] Separate independent review completed and one low coverage finding resolved/rechecked. The requesting human explicitly accepted the scoped changes on 2026-10-08 and directed tests/closeout; student role is not independently verified.
- [x] Guides and current session summary are updated and linked.
- [x] Pre-PR closeout and packet archive are complete; issue-linked PR is pending.
- [x] Canonical sync is N/A because no product delta was proposed; the complete packet is archived.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement | Observable outcome | Evidence, result and limitation |
| --- | --- | --- | --- |
| AUTH-REDIRECT-AC-01 | #17; ACC-001 | Vercel preview signup targets that preview's HTTPS `/auth/callback`; access remains team-only under Standard Protection. | Passed: full 25-test suite includes preview signup URL and resolver selection. Runtime deployment/protection not tested. |
| AUTH-REDIRECT-AC-02 | #17; ACC-001 / OPS-001 | Production signup and callback use the stable production project URL. | Passed: production signup asserts `VERCEL_PROJECT_PRODUCTION_URL` wins over a conflicting `VERCEL_URL`; callback and resolver production selection are also covered. Runtime deployment not tested. |
| AUTH-REDIRECT-AC-03 | #17; ACC-001 | Local setup works without `APP_SITE_URL`, using localhost; trusted non-Vercel override remains available. | Passed: resolver tests cover localhost default, normalized local override, and rejecting insecure remote override. |
| AUTH-REDIRECT-AC-04 | #17; SEC-001 | Both handlers use one server-only resolver and never trust request Host for redirects. | Passed: signup and callback tests assert configured origins; callback tests supply a hostile request origin and confirm redirects stay on the configured origin. |
| AUTH-REDIRECT-AC-05 | #17; OPS-001 | Guides document exact Supabase redirect entries and Vercel Standard Protection limits. | Passed: updated setup guides were manually reviewed; no remote settings changed. |

## Agent handoffs

Independent reviewer execution: [combined review handoff](../2026-10-08-conventional-pr-titles/handoffs/independent-review.md). Reviewer `/root/independent_auth_review` used the `test_engineer` role in a separate read-only execution, did not author implementation/tests, and made no edits. One low coverage finding was resolved by adding a production signup call-site test; the reviewer rechecked that source but did not rerun the tests.

## Implementation and tests

Changed files: `src/lib/supabase/site-url.ts`, `src/app/auth/actions.ts`, `src/app/auth/callback/route.ts`, `tests/unit/supabase-site-url.test.ts`, `tests/unit/auth-redirects.test.ts`, `vitest.config.ts`, `.env.example`, `README.md`, `docs/DeveloperGuide.md`, active packet index and packet artifacts.

Commands and results (Windows PowerShell, Node.js v24.16.0, installed project dependencies):

- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\vitest\vitest.mjs' run tests/unit/supabase-site-url.test.ts`: passed, 10 tests. The first attempt failed before tests loaded because Vitest could not resolve Next's `server-only` marker; mapping it to Next's compiled empty marker in `vitest.config.ts` fixed test resolution.
- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\vitest\vitest.mjs' run tests/unit/auth-redirects.test.ts`: passed, 4 tests after adding the production signup case identified in independent review.
- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\vitest\vitest.mjs' run`: passed, 25 tests across 6 files after the review coverage correction.
- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\eslint\bin\eslint.js'`: passed (exit 0).
- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\typescript\bin\tsc' --noEmit`: passed (exit 0).
- `& 'C:\Program Files\nodejs\node.exe' '.\node_modules\next\dist\bin\next' build`: passed with Next.js 16.3.8; compile, TypeScript, static generation, and finalization succeeded.

The first focused test run occurred after the implementation already existed. It did not establish a test-first failure for the behavior; the import-resolution failure was a test-harness issue. Independent review found a low coverage gap because signup had no production call-site case; the added case passes and reviewer recheck confirmed the finding is closed. Vitest prints a non-fatal native config-loader compatibility warning. The unit tests, typecheck, and build do not verify a deployed Vercel/Supabase flow.

Security/adversarial cases: Vercel Deployment Protection page read-only observation shows Vercel Authentication enabled with Standard Protection. The Environment Variables page shows "Enable access to System Environment Variables" enabled. No settings were changed. Secret values and `.env.local` were not accessed.

Known limitations: Supabase Auth project settings were not changed. Public Applicant email verification on protected previews does not work for recipients without Vercel project access. The user was offered a preview-scope choice; the implementation uses team-only previews under the current setting. The user can still steer this assumption.

## Review and decision

- Reviewer identity and independence: separate reviewer `/root/independent_auth_review`, read-only test-engineer run; handoff linked above.
- Findings/resolutions: one low finding for missing production signup call-site coverage was resolved with a production-origin signup test and rechecked by reviewer. Design preserves deployment protection and uses no callback bypass secret.
- Human decisions: user approved the changes and requested tests, archive and PR on 2026-10-08; the tests passed and review has no remaining findings, so the directed closeout proceeds. No security-setting changes are included. Student role is not separately verified.
- Documentation/reflection updates: `.env.example`, `README.md`, and `docs/DeveloperGuide.md` updated and manually reviewed; the current dated session log is complete and linked below.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-07 / implementation session | [session summary](../../../logs/2026-10-07-vercel-auth-redirects.md) | Issue #17 intake, Vercel protection/system-variable observations, user direction, source and guide edits. | Implementation was present; tests and review had not yet been run. |
| 2026-10-08 / test and closeout session | [session summary](../../../logs/2026-10-08-supabase-auth-and-pr-title-closeout.md) | User acceptance, unit coverage, verification, independent review and archive. | Unit/lint/typecheck/build and archive checks pass; review finding closed; PR pending. |

## Canonical sync and archive

- Accepted delta/human decision: no product delta proposed; user said the changes looked good and approved on 2026-10-08, directing tests before archive/commit/PR. Those checks passed and independent review has no remaining finding. Student role is not independently verified.
- Canonical sync commit/files/version/date: N/A; no product requirement change.
- Sync verification: independent reviewer confirmed no product spec change; canonical sync is N/A.
- Archive decision/date/path: user directed archive after tests; complete packet archived to `workflow/archive/2026-10-07-vercel-auth-redirects/` on 2026-10-08 after final link and whitespace checks.
- Navigation repairs after moving: active index removed both completed packets; archive index and packet links checked. The 2026-10-07 historical log retains its earlier packet path as historical evidence.
- Outstanding work: PR opening. Current preview assumption is team-only; a later request for public previews needs separate security approval. Issue triage labels/type and student role remain unverified.
