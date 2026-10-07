# Tasks: Local Supabase database checks in CI

- Change/issues: `2026-10-07-local-supabase-ci`; [#11](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/11)
- Plan/record: `plan.md`; `record.md`
- Status/owner: In progress; requester identity not provided; issue #11 unassigned.

## Before implementation

- [x] T00 — Requesting user supplied the workflow and asked for implementation. Evidence: current conversation, 2026-10-07. Student identity/role remains unspecified.

## Ordered implementation

- [x] T01 — Add a standalone local Supabase GitHub Actions workflow. Depends on: T00. IDs: local-supabase-ci-01..03. Files: `.github/workflows/supabase-checks.yml`. Verification: source and whitespace review completed; YAML parser could not run because the Python launcher was blocked; GitHub Actions run remains pending.
- [x] T02 — Record implementation evidence and self-review. Depends on: T01. Files: `record.md`. Verification: actual check outcomes and limitations recorded; GitHub Actions run remains pending until pushed and executed.

## Review and closeout

- [ ] T03 — Independent reviewer examines final workflow, local-only targeting, acceptance evidence, and failure cases. Evidence: actual separate review handoff and findings.
- [ ] T04 — Student owner records acceptance or changes requested. Evidence: actual decision in `record.md`; owner assignment is pending.
- [ ] T05 — Complete dated session summary, archive decision, and issue-linked PR closeout when authorized. Evidence: summary/log, archive path, and eventual PR URL. Product-spec sync is N/A because no product behavior changes.
