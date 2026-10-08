# Design: Local Supabase database checks in CI

- Change ID/issues: `2026-10-07-local-supabase-ci`; [#11](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/11)
- Owner/status/date: Issue owner unassigned; approved scope / in progress / 2026-10-07
- Inputs: `proposal.md`; no capability delta; ProductSpec v0.7, OPS-003 context.
- Scope and affected components/files: Add `.github/workflows/supabase-checks.yml`; preserve `.github/workflows/ci.yml`, migrations, seeds, tests, and deployment workflow.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Use a separate workflow with a distinct Database checks job. | Append steps to `ci.yml`. | Keeps Docker-backed database setup independently visible and does not serialize it with application checks. | User's supplied GitHub Actions steps and direct request, 2026-10-07. |
| Run on PRs targeting `develop` and `master`, without path filters. | Use `main`, or only `develop`. | Repository PR checks target `develop` and `master`; both match existing `ci.yml`. No path filters ensure every PR reports the check. | User's instruction to use repository PR targets; repository workflow/process. |
| Use explicit local CLI flags and no credentials. | Let a linked project or default CLI context determine the target. | Prevents any remote database target; `--local` is supported by the current Supabase CLI. | User's supplied security constraint; Supabase CLI reference. |

## Interfaces and data flow

GitHub pull request event → Ubuntu runner → checkout and Supabase CLI setup → `supabase start` creates the runner-local stack → `supabase db reset --local` recreates the local database and applies migrations/seed → `supabase test db --local` runs SQL tests under `supabase/tests/` → job status is reported to the pull request. There is no application request path, hosted project link, or secret input.

## Authorization and privacy impact

No Applicant/HR authorization behavior changes. The workflow has only `contents: read`; it uses no GitHub secrets or Supabase access token. Test fixtures are synthetic. Database reset and tests explicitly target the local runner.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Supabase CLI setup or local services fail | The job stops at the failing step and reports a failed check; no remote database is touched. | Workflow inspection and GitHub Actions run. |
| Migration or seed fails during reset | Database-check job fails before pgTAP tests. | GitHub Actions run on a migration change. |
| A pgTAP assertion fails | `supabase test db --local` exits nonzero and fails the job. | GitHub Actions test output. |

## Migration and backward compatibility

No database migration or application data is changed. The workflow consumes the existing migration and seed files. Local reset is destructive only to the ephemeral GitHub runner database.

## Rollout and rollback

The workflow runs for PRs targeting `develop` and `master`; it requires no secret configuration. Rollback is deleting the standalone workflow file. Marking the check required in branch protection is a separate administrator action.

## Review and unresolved decisions

- [x] Interfaces and requirement context match the proposal and issue #11's pgTAP CI slice.
- [x] Security, failure, migration, rollout, and rollback impacts assessed.
- Current Supabase references: [Automated testing using GitHub Actions](https://supabase.com/docs/guides/deployment/ci/testing) and [CLI `test db` reference](https://supabase.com/docs/reference/cli/supabase-test-db). The CLI reference documents `--local`; the current breaking-change entries reviewed did not change this local testing path.
- Findings/owner/resolution: Pending independent review; issue #11 owner is unassigned.
- Human approval: Direct user request and supplied workflow, 2026-10-07; name/role not stated.
