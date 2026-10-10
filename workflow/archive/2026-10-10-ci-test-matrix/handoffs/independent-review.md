# Independent review handoff: CI test matrix

## First review

- Reviewer: separate read-only `test_engineer` execution, delegated as `ci_matrix_review`.
- Scope: uncommitted issue #55 worktree against `origin/develop` `09b1213f2f8105f9faf2e7f3a8efc534fb9c2902`; workflows, package/scripts, test configs, relevant tests, packet, and documentation.
- Limitations: reviewer could not run Node/pnpm, YAML validation, tests, local Supabase/Docker, or hosted Actions. `git diff --check`, package JSON parsing, and script-path checks ran.

### Findings

1. **P1, expected browser CI failure:** workflow exported `NEXT_PUBLIC_SUPABASE_ANON_KEY`, while current app clients require `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. Fixed in the browser setup step by requiring local `PUBLISHABLE_KEY`, masking it, and exporting it under the application's required variable name. Implementer static recheck passed; independent confirmation pending.
2. **P2, trigger docs incomplete:** documentation said DB/race checks ran on PR/push and only identified nightly/manual full browser runs, though DB and integration jobs also have no event condition and therefore run on schedule/manual. README, CONTRIBUTING, and Developer Guide now state the actual triggers; design step 1 records the same behavior. The second independent review confirmed the correction.

The reviewer also noted that the initial package/docs static review found all five integration script paths, read-only workflow permissions, local-only fixture key flow, no hosted Supabase secret references, and the critical subset's credential-based skip guards. These were source observations, not runtime or hosted Actions proof.

### Post-fix verification

- Implementer parsed both workflow files with `js-yaml` through Bun and asserted event triggers, `contents: read`, database lint/pgTAP steps, five sequential integration scripts, five critical Playwright specs, local publishable-key guard/mapping, and absence of `pull_request_target`, hosted `secrets.` references, and the obsolete anon-key variable; passed on 2026-10-10.
- `git diff --check` passed after fixes (Git emitted line-ending conversion warnings only).
- The requested separate post-fix re-review is in progress. Record its result and any further rechecks below before requesting post-review student acceptance.

### Review scope disclosure

The reviewer reported that one broad read-only search inadvertently included `.env.example` and showed its public placeholder variable name only. The reviewer did not inspect `.env`, `.env.local`, `.env.dev`, personal reflections, or any secret values and made no repository edits.

## Second review

- Reviewer: same separate read-only `test_engineer` execution, re-triggered after fixes.
- Result: both first-review findings confirmed resolved. The reviewer verified the local `PUBLISHABLE_KEY` guard, masking of local publishable/anon/service-role/secret/JWT values before captured startup logs are printed, and mapping to `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. The reviewer confirmed README, CONTRIBUTING, Developer Guide, and design describe DB/race jobs on schedule/manual and critical/full E2E event conditions. No additional actionable P1/P2 findings were reported.
- Limits: review was static; local Supabase/CLI, test suites, GitHub Actions, and protected branch settings remain unobserved. The packet's acceptance/check evidence was still pending during reviewer recheck; implementation evidence is being recorded separately before the student acceptance gate.
