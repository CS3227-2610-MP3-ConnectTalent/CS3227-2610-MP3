# Implementation plan: CI test matrix

- Change/issues: 2026-10-10-ci-test-matrix; [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/55)
- Owner/status/date: Johnwz123; approved/in progress; 2026-10-10
- Approved inputs: `proposal.md`, `design.md`; no product delta
- Baseline and affected IDs: ProductSpec at baseline `09b1213`; process-only acceptance IDs CI-AC-01 through CI-AC-07
- Constraints: issue branch `feat/55-ci-test-matrix`; use `origin/develop` baseline; never use hosted Supabase or GitHub-hosted applicant data; keep issue #51 changes isolated; do not read/modify personal reflection files

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | none | Johnwz123 / student owner | Issue #55; all CI-AC | Approval of the issue proposal, design and plan is recorded from the user's implementation instruction. | `proposal.md` approval record; completed before implementation. |
| T01 | T00 | Johnwz123 / implementer | CI-AC-05 | `package.json`, `pnpm-lock.yaml`, `vitest.config.ts`, CI summary helper, `.github/workflows/ci.yml`, `.gitignore` if needed; add JUnit/V8 reports, baseline summary and artifacts without threshold. | Locked install, `pnpm test:unit --coverage`, summary/helper check, YAML check, artifact path review. |
| T02 | T00 | Johnwz123 / implementer | CI-AC-01/02/03/07 | `.github/workflows/ci.yml`, `.github/workflows/supabase-checks.yml`, `package.json`; explicit read permissions, pinned CLI, local DB lint/pgTAP, complete ordered integration command and local generated test credentials. | Workflow/static validation; local `supabase db lint --local --fail-on error`, `pnpm test:db`, `pnpm test:integration` if local Docker stack is available; inspect no hosted env. |
| T03 | T02 | Johnwz123 / implementer | CI-AC-04/07 | `.github/workflows/supabase-checks.yml`, `playwright.config.ts`, `package.json`; one-worker Chromium critical PR checks, full nightly/manual suite, required local credentials, test reports/artifacts. | Validate event conditions and local key guard; run critical/full E2E if local Supabase/Mailpit available; review results for unintended skips. |
| T04 | T01-T03 | Johnwz123 / implementer | CI-AC-06 | `README.md`, `CONTRIBUTING.md`, `docs/DeveloperGuide.md`; update check matrix, triggers, commands and limitations. | Markdown/link/content review and `git diff --check`. |
| T05 | T01-T04 | Separate reviewer execution | CI-AC-01 through CI-AC-07 | Read-only review of final diff, workflows, credential trust boundaries, check quality, docs and evidence; record actual findings in `handoffs/independent-review.md`. | Separate reviewer handoff and implementer rechecks. |
| T06 | T05 | Johnwz123 / student owner | CI-AC-01 through CI-AC-07 | Record separate acceptance/rejection/conditions in `record.md`. | Actual student decision; implementation approval alone is not post-review acceptance. |
| T07 | T06 accepted | Johnwz123 / closeout owner | Process-only | Confirm no spec delta; archive complete packet, update navigation, add dated `logs/` summary and final record evidence. | Link and scope checks; leave pending until student acceptance. |

## Integration and handoffs

`ci.yml` remains the app/unit workflow. `supabase-checks.yml` owns database, race and browser checks against local services. The local credential handoff is from the CLI process to the same GitHub job through a temporary env file and `GITHUB_ENV`; workflow logs and checked-in files must not contain the generated key. Existing app, database and browser tests remain unchanged unless a CI-specific guard/report integration is required. No product code or schema changes are planned.

## Approval and completion evidence

- [x] Human approved the recommended scope in chat on 2026-10-10 before implementation; see `proposal.md`.
- [x] No product spec delta; process-only.
- [ ] Implementation results and exact checks pending.
- [ ] Independent review and separate student acceptance pending.
- [ ] Closeout/archive and PR are later gates and are not authorized by implementation approval alone.
- Approval/date/source: Johnwz123, direct chat instruction, 2026-10-10.
- Changes to this plan: none yet.
