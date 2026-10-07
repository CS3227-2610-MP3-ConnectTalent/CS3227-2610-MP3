# Feature record: Local Supabase database checks in CI

Status: implemented; verification and review pending

Owner: Pending assignment in issue #11; requester identity/role not supplied

Spec version: [ProductSpec v0.7](../../ProductSpec.md)
Date: 2026-10-07

## Metadata and artifact links

- Change ID/classification: `2026-10-07-local-supabase-ci`; CI configuration / process-only.
- GitHub issues: [#11](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/11), existing pgTAP CI acceptance; issue owner unassigned.
- Branch/commits/PR: `chore/setup-deployment`; baseline `c0dd8a5`; no commit or PR created by this task.
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: None; no product behavior change.
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v0.7, 2026-10-07; OPS-003 is related operational context only.
- Archive path: Pending acceptance and closeout.

## Approval checklist

- [x] Existing issue #11 identified as the pgTAP CI acceptance context; issue ownership remains unassigned.
- [x] Scope/design/plan approval source: user directly requested the supplied local-only workflow on 2026-10-07. Requester name and student role were not supplied.
- [x] Workflow source and whitespace checks complete; YAML parser and GitHub Actions run remain pending/blocked as recorded below.
- [ ] Independent review and human acceptance pending.
- [ ] Applicable guides/session summary and pre-PR closeout pending.
- [ ] Canonical product sync is N/A; archive and PR pending.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion and canonical requirement ID | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| local-supabase-ci-01 | Issue #11 pgTAP CI; OPS-003 context only | A PR to `develop` or `master` receives a database-check job that starts local Supabase, resets migrations/seed, and runs SQL tests. | Workflow source inspected; GitHub Actions execution pending. |
| local-supabase-ci-02 | Issue #11; OPS-001 context only | Workflow uses local mode and no hosted credentials; no remote target is contacted. | Source inspection confirms explicit `--local` flags and no credentials; no remote target was invoked. |
| local-supabase-ci-03 | Issue #11 pgTAP CI | Both current SQL test files are executed by the Supabase CLI. | Pending Actions test output. |

## Agent handoffs

No subagents were assigned. Implementer self-review is not independent review.

## Implementation and tests

Changed files: `.github/workflows/supabase-checks.yml` and the five files in this packet.

Commands and results:

- Manual workflow review: passed; PR targets are `develop` and `master`, there are no path filters or secrets references, reset and test commands explicitly use `--local`, and permissions are read-only for repository contents.
- PowerShell trailing-whitespace scan over the new workflow and packet files: passed.
- PowerShell workflow-contract scan: passed after correcting an initial check-script typo that expected `supabase/start` instead of the workflow's `supabase start`; no repository edit was needed for that correction.
- `git diff --check`: no findings in tracked changes. The new workflow and packet files are untracked, so a separate whitespace scan was also run for them.
- YAML parser check attempted through `python -`, but the configured Python launcher failed before starting Python: `uv trampoline failed to spawn Python child process (permission denied)`. YAML parsing is therefore not independently verified in this environment.
- Supabase CLI docs reviewed: `supabase test db --local` is a supported local test invocation. The current Supabase changelog breaking-change entries reviewed were unrelated to this workflow.
- Local stack and pgTAP tests: not run. The intended execution environment is the GitHub-hosted runner; the actual Actions run is pending until this branch is pushed and a PR targets `develop` or `master`.
- Application tests: N/A for this workflow-only change.

Security/adversarial cases and results: Source inspection confirms no secrets or hosted Supabase credentials are referenced. Reset and test commands both use local mode; no linked project command is present.

Known limitations: GitHub Actions execution cannot be claimed until the workflow runs. YAML parser validation was blocked by the Python launcher. GitHub branch protection must separately require the check if desired.

| Date / environment / commit | Exact command or manual check | Exit/result and counts | Output/evidence link | What this proves / does not prove |
| --- | --- | --- | --- | --- |
| 2026-10-07 / local Windows checkout / `chore/setup-deployment` | Manual workflow inspection; PowerShell trailing-whitespace scan; `git diff --check`; attempted YAML parser via `python -` | Source review and whitespace scan passed; `git diff --check` had no tracked-file findings; YAML parser unavailable due launcher permission error | Current workflow and local command output | Confirms intended local-only commands and whitespace; does not prove YAML parser acceptance or a GitHub Actions run. |

## Review and decision

- Reviewer identity and independence: Pending separate reviewer execution.
- Findings/resolutions: Pending.
- Human decisions: User requested the bounded workflow on 2026-10-07; requester identity and issue owner assignment remain unknown. Student acceptance of the final evidence is pending.
- Documentation/reflection updates: Pending closeout; no product guide change planned for this CI-only task.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-07 / current task | Pending `logs/` summary before PR | Local Supabase CI request, issue #11 trace, design and implementation. | Implementation and Actions run pending. |

## Canonical sync and archive

- Accepted delta/human decision: No product delta; student acceptance pending.
- Canonical sync commit/files/version/date: N/A, process/configuration change only.
- Sync verification: N/A; no spec delta.
- Archive decision/date/path: Pending student decision and closeout.
- Navigation repairs after moving: Pending archive decision.
- Outstanding work/limitations: Independent review, human acceptance, actual Actions run, owner assignment, and pre-PR closeout remain pending.
