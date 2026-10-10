# Tasks: CI test matrix

- Change/issues: 2026-10-10-ci-test-matrix; [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/55)
- Plan/record: `plan.md`; `record.md`
- Status/owner: archived with post-submission review follow-up; Johnwz123

## Before implementation

- [x] T00 — Johnwz123 records approval of proposal, design and plan. Evidence: `proposal.md`, approval source/date; dependencies: none.

## Ordered implementation

- [x] T01 — Configure Vitest JUnit/V8 coverage output, baseline summary, and CI artifacts. Depends on: T00. IDs: CI-AC-05. Files: `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, CI helper, `.github/workflows/ci.yml`, `.gitignore` if needed. Verification: unit coverage run and CI summary passed; YAML check passed. Evidence: `record.md`.
- [x] T02 — Add explicit least-privilege permissions; pin Supabase CLI; gate local schema lint and pgTAP; add sequential command for all five race scripts with local generated key. Depends on: T00. IDs: CI-AC-01/02/03/07. Files: `.github/workflows/ci.yml`, `.github/workflows/supabase-checks.yml`, `package.json`. Verification: static workflow/package review passed; local DB/integration runs not run because Docker API access is denied. Evidence: `record.md`.
- [x] T03 — Add one-worker Chromium critical PR subset and full scheduled/manual E2E against local Supabase/Mailpit; fail early when local credentials are unavailable and upload reports. Depends on: T02. IDs: CI-AC-04/07. Files: `playwright.config.ts`, `package.json`, `.github/workflows/supabase-checks.yml`. Verification: key guard and event conditions reviewed; critical test discovery passed; browser runtime not run because Docker API access is denied. Evidence: `record.md`.
- [x] T04 — Correct check/trigger documentation and record external branch-protection requirement. Depends on: T01-T03. IDs: CI-AC-06. Files: `README.md`, `CONTRIBUTING.md`, `docs/DeveloperGuide.md`. Verification: content/relative-link review and `git diff --check` passed. Evidence: `record.md`.

## Review and closeout

- [x] T05 — Separate reviewer execution reviews final diff, acceptance evidence, secrets/permissions and maintainability; implementer resolves/rechecks findings. Depends on: T01-T04. Evidence: `handoffs/independent-review.md`.
- [x] T06 — Johnwz123 records post-review acceptance/rejection/conditions independently from implementation approval. Depends on: T05. Evidence: `record.md`; accepted 2026-10-10 with no additional conditions stated.
- [x] T07 — After acceptance, record no product sync, archive full packet, update navigation, add dated session summary and prepare final record. Depends on: T06. Evidence: archive path and `logs/` link in `record.md`.
- [x] T08 — Open issue-linked PR as the final contributor action only after accepted closeout is complete. Depends on: T07. Evidence: [PR #56](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/56), with `Closes #55` in its description.

## Post-submission follow-up

- The nine original PR #56 review threads were resolved after the independent review of `8e3361a` found no actionable P1/P2 findings and CI/Supabase CI passed on that revision.
- Comment 4238453086 identified possible local Auth rate limiting in the full browser suite. Commit `c85aefb` increases only `auth.rate_limit.sign_in_sign_ups` in local Supabase config from 30 to 200. The separate review found no blocker, app CI run `38071140832` and Supabase CI run `38071141002` passed on `c85aefb`, and the thread was then resolved.
- User instruction on 2026-10-11 authorizes fixing review comments and resolving them after verification; merge/release remain separate decisions.
