# Implementation plan: Local Supabase database checks in CI

- Change/issues: `2026-10-07-local-supabase-ci`; [#11](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/11)
- Owner/status/date: Requesting contributor; in progress; 2026-10-07. Issue owner remains unassigned.
- Approved inputs: `proposal.md`, `design.md`, no product delta.
- Baseline and affected IDs: ProductSpec v0.7; OPS-003 is contextual; no canonical change.
- Constraints: Add one CI workflow and packet files only. Do not change app CI, migrations, tests, seeds, production settings, or secrets.

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Requirement and acceptance IDs | Exact files / expected change | Verification command or review / expected evidence |
| --- | --- | --- | --- | --- | --- |
| T01 | User request and issue #11 | Requesting contributor | local-supabase-ci-01..03 | `.github/workflows/supabase-checks.yml`: PR checks on `develop`/`master`, local Supabase start/reset/test, read-only permission, no secrets/path filters. | YAML/actionlint if available; `git diff --check`; eventual Actions run confirms local pgTAP. |
| T02 | T01 | Implementer self-review | local-supabase-ci-01..03 | Inspect the workflow and packet for scope, local-only flags, and truthful evidence. | Final scoped diff and exact check results in `record.md`; independent review remains a separate gate. |

## Integration and handoffs

No parallel implementation. Existing `ci.yml` continues to run application checks; the new workflow reports a distinct database-check status. Supabase stack execution depends on Docker available on GitHub-hosted Ubuntu.

## Approval and completion evidence

- [x] User supplied the workflow design and requested implementation on 2026-10-07; branch mapping and local flags are recorded in `design.md`.
- [x] `tasks.md` maps the CI change to acceptance IDs.
- [x] Independent review and closeout summary are recorded. Student acceptance, packet archive, and PR remain separate pending gates.
- Approval/date/source: Direct user request and supplied Supabase workflow, 2026-10-07; requester name/role not provided.
- Changes to this plan: None.
