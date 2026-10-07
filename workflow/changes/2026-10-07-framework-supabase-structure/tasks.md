# Tasks: Framework and Supabase integration structure cleanup

- Change/issues: `2026-10-07-framework-supabase-structure`; [#16](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/16)
- Plan/record: `plan.md`; `record.md`
- Status/owner: In progress; requesting user approved scope; student owner assignment pending.

## Before implementation

- [x] T00 — Requesting user approves the reviewed scope and Next.js generated-file recommendation. Evidence: direct requests in this conversation, 2026-10-07; recorded in `proposal.md` and `record.md`.

## Ordered implementation

- [ ] T01 — Consolidate active Supabase session helper structure and remove unused duplicates. Depends on: T00. IDs: AC-01. Files: `src/lib/supabase/proxy.ts`, `src/proxy.ts`, `src/lib/client.ts`, `src/lib/server.ts`, `src/lib/middleware.ts`. Structural review and import search are complete; static typecheck/lint remain unverified because Node.js and pnpm are unavailable in this shell.
- [x] T02 — Follow Next generated type-file guidance. Depends on: T00. IDs: AC-02. Files: `.gitignore`, `.github/workflows/ci.yml`, Git index entry for `next-env.d.ts`. Verification: workflow orders `next typegen` before typecheck; local file-presence, ignored-state, and Git-index checks recorded in `record.md`.
- [x] T03 — Correct stale contributor project status. Depends on: T00. IDs: AC-03. Files: `CONTRIBUTING.md`. Verification: content matches the current Applicant flows in README and source.
- [x] T04 — Record exact outcomes and inspect scoped diff. Depends on: T01-T03. IDs: all. Files: `record.md`. Evidence: exact command outcomes, scoped diff review, and whitespace checks are recorded; T01 and independent review remain pending.

## Review and closeout

- [ ] T05 — Independent reviewer checks final diff, generated-file handling, helper boundaries, acceptance evidence, and scope. Depends on: T04. Evidence: separate review handoff; not yet performed.
- [ ] T06 — Student owner records acceptance or changes requested. Evidence: actual decision in `record.md`; owner assignment is pending.
- [ ] T07 — Complete dated session summary and pre-PR closeout when requested; archive only after the applicable acceptance and closeout gates. Evidence: log, archive path, and issue-linked PR remain pending.
