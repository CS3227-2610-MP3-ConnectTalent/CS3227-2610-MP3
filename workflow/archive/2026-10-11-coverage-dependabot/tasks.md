# Tasks: coverage reporting and Dependabot

- Change/issues: `2026-10-11-coverage-dependabot`; [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58), [#59](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/59)
- Plans/record: [coverage/reporting plan](plan.md), [Dependabot plan](dependabot-plan.md), [record](record.md)
- Status/owner: implementation independently reviewed and accepted by the user on 2026-10-11; local format gate passes; packet archived; hosted workflow checks and PR submission remain pending; student owner pending issue triage

## Before implementation

- [x] T00 — User reviewed and approved both plans and approved inline implementation in chat on 2026-10-11. Coverage is an informational 90% target across all four metrics; unit-test failures continue to fail CI, while whether CI results are required for merging follows existing repository settings. Evidence: actual decision/date/source in `record.md`; dependencies: none.
- [x] T01 — Created issue-linked branch `chore/58-coverage-and-dependabot` from `c9678b6442326ebcf8a0ef3f653ac820966a8ad2` after default sandbox branch creation was denied and the reviewed elevated command succeeded. Evidence: branch and baseline SHA in `record.md`; dependencies: T00.

## Ordered implementation

- [x] T58-01 — Captured the four-metric baseline and file/branch gap map. Evidence: `record.md` and [coverage-baseline.csv](coverage-baseline.csv); exact command/result and metrics recorded. Baseline: 167 tests passed; lines 46.10%, statements 44.22%, branches 41.47%, functions 41.64%. Depends on: T01; acceptance: QG-AC-01/QG-AC-02.
- [x] T58-02 — Added behavior-focused tests across application data access, server actions, authorization, AI boundaries, auth pages, résumé operations, Applicant/HR pages, and UI states. Current source include scope is unchanged; no product behavior or spec changed. Latest complete Vitest run passed 334 tests across 60 files and reported at least 90% for all four metrics. Depends on: T58-01; acceptance: QG-AC-02.
- [x] T58-03 — Coverage remains report-only; the CI summary and artifact upload run with `always()`, with JUnit and coverage included when produced. The PR report marks each metric against 90% without configuring Vitest thresholds. Unit-test failures remain blocking. Acceptance: QG-AC-01/QG-AC-03.
- [x] T58-04 — Added bounded standard-library JUnit/coverage parsing, safe Markdown rendering, and parser tests for malformed, oversized, unavailable, and adversarial report inputs. Final helper suite: 28 passed. Acceptance: QG-AC-03/QG-AC-05.
- [x] T58-05 — Added default-branch `workflow_run` reporting that parses the exact run artifact, validates a sole current open PR including exact fork-repository/head matching, and creates or updates one bot marker comment. Mocked tests cover same-repository and fork associations, stale and unsafe PRs, empty workflow-run associations, pagination, malformed/missing data, failures, bounded reads, and ordering. A live existing workflow-run API record confirms matching PR/workflow head SHA with an empty association array, but no hosted comment rehearsal occurred; the new workflow must first reach the default branch. Acceptance: QG-AC-04/QG-AC-05.
- [x] T59-01 — Added weekly npm/pnpm and GitHub Actions version updates with grouped minor/patch changes, separate major updates, and a five-PR cap per ecosystem. No auto-merge or security-update setting changes. Acceptance: DEP-AC-01/DEP-AC-02.
- [x] T58-06/T59-02 — Updated README, CONTRIBUTING, Developer Guide, and packet evidence. After the full format gate identified 187 pre-existing unformatted files, applied `pnpm format`; the follow-up full check passes. Prettier ignores the three reflection documents. Acceptance: QG-AC-03/QG-AC-04/DEP-AC-01/DEP-AC-02.
- [x] T58-07a — Local verification: final `CI=true` run passed 60 Vitest files/334 tests; coverage is lines 94.80%, statements 93.89%, branches 90.05%, functions 94.63%; 28 Python CI-helper tests pass; lint, Next typegen, typecheck, and production build pass. A separate reviewer run had one PDF input timeout; the isolated file and later full run passed. Direct summary generation parses real JUnit and coverage output.
- [x] T58-07b — Resolved the full `pnpm format:check` failure by formatting the 187 listed repository files; the follow-up repository-wide check passes.
- [ ] T58-07c — Obtain PR CI results for the existing Supabase database, integration, and critical-browser jobs, and rehearse the PR comment workflow once available on the default branch. No hosted results are claimed.
- [x] T59-03a — Dependabot config passes changed-file Prettier and static semantic review for the npm and GitHub Actions ecosystems, weekly schedules, grouped minor/patch updates, and five-PR caps.
- [ ] T59-03b — Record GitHub's hosted Dependabot config check and repository security-update settings when accessible; observe the first scheduled update after merge. These are not available on this implementation branch.

## Review and closeout

- [x] T08 — Separate security and test reviewers assessed coverage/test evidence, CI workflow permissions, artifact trust boundaries, Dependabot schema, and acceptance outcomes. Handoffs record reviewer identity, independence, findings, fixes, rechecks, the transient timeout, and hosted-evidence limits. No unresolved source finding remains; hosted behavior is still open. Depends on final implementation checks.
- [x] T09 — User separately accepted the completed implementation on 2026-10-11 with no stated conditions; source and date are recorded in `record.md`.
- [x] T10 — Recorded no-product-spec-sync rationale; archived the complete accepted packet; repaired indexes and checked links.
- [x] T11 — Completed dated implementation and closeout summaries and linked them from the record. The summaries preserve the failed initial format check, successful formatting recheck, transient test timeout, hosted-validation limits, and branch/ruleset limitations.
- [ ] T12 — Submit one issue-linked PR to `develop` as the final contributor action, with `Closes #58` and `Closes #59`, archived packet, logs, review/acceptance evidence, and available CI results. PR submission remains pending; no PR was opened in this closeout. Do not claim merge enforcement or Dependabot security updates unless verified.

## Post-submission (separate decisions)

- [ ] T13 — Record later PR review, merge, first scheduled Dependabot update, deployment, or release only when each event occurs; none is implied by PR creation.
