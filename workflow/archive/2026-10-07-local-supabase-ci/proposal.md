# Proposal: Local Supabase database checks in CI

- Change ID: 2026-10-07-local-supabase-ci
- Issues: [#11](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/11); this implements its pgTAP CI acceptance slice.
- Owner: Pending assignment in issue #11; requester identity/role was not stated.
- Status: Approved scope, implementation in progress
- Date: 2026-10-07
- Baseline: ProductSpec v0.7, 7 October 2026; no product behavior delta.
- Affected capabilities: OPS-003 is relevant to release evidence; no canonical requirement change.
- Classification: CI configuration / process-only, bounded integration change.

## Intent, problem, and motivation

The existing CI workflow runs lint, typecheck, unit tests, and build, but does not start Supabase or execute the repository's pgTAP database tests. Issue #11 includes pgTAP in its CI acceptance checks. Add an isolated GitHub Actions job that starts a temporary local Supabase stack, resets it from migrations and seed data, then runs the SQL tests.

## Goals, non-goals, and scope boundaries

- Goals: Run database tests on pull requests targeting `develop` or `master`; replay the tracked migrations; use the local database explicitly; require no hosted project credentials.
- Non-goals: Change schema, migrations, seed data, test SQL, application code, deployment workflows, or GitHub branch protection settings.
- Users/roles: Repository contributors receive database-check status; no Applicant or HR behavior changes.
- Scope boundaries: Add one workflow and this change packet. Keep the existing application CI workflow unchanged. Do not use `--linked`, secrets, or a hosted Supabase project.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Add database steps to the existing `ci.yml` | One combined status; mixes Docker-backed database checks with app checks. | Rejected; a separate workflow gives the integration check a clear status and isolates failures. |
| Add a separate database workflow | Clear status and independent execution; starts another runner for the database stack. | Chosen; matches the requested Supabase workflow and issue #11's pgTAP acceptance. |

- Assumptions: GitHub-hosted Ubuntu runners provide Docker for the Supabase CLI local stack. The repository's existing SQL files are the intended pgTAP suite.
- Dependencies: Issue #11; `supabase/config.toml`, tracked migrations, seed file, and `supabase/tests/database/*.test.sql`.
- Risks: Local stack startup increases CI time and can fail if a migration, seed, or database test fails. All database actions are local to the runner.
- Open decisions: GitHub branch protection must separately mark the resulting check as required if desired; this change does not edit repository rules.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| local-supabase-ci-01 | Issue #11 pgTAP CI criterion; OPS-003 context only | Given a pull request targeting `develop` or `master`, when Actions runs, then a separate job starts local Supabase, resets from migrations, and runs the database tests. | Workflow source and a successful GitHub Actions run; contributor / issue owner. |
| local-supabase-ci-02 | Issue #11; OPS-001 environment separation context | Given the workflow executes, when it resets and tests, then it uses only the runner's local Supabase instance and no hosted project credentials or linked commands. | Workflow inspection and successful job log; contributor / issue owner. |
| local-supabase-ci-03 | Issue #11 | Given the current tracked SQL tests, when `supabase test db --local` runs, then both test files are discovered by the CLI. | Successful GitHub Actions test output; contributor / issue owner. |

- Spec deltas: None; no product behavior changes.
- Design: `design.md`.
- Plan and tasks: `plan.md`, `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed against the user's supplied workflow.
- [x] Proposal, no-product-delta rationale, design, and plan are bounded to the requested local CI job.
- Approver: Requesting user; name and student role were not supplied.
- Decision/date/source: Approved by direct implementation request in this conversation, 2026-10-07.
- Conditions: Branch filters follow repository PR targets (`develop`, `master`); database commands explicitly select local mode. GitHub branch protection remains a separate administrator action.
