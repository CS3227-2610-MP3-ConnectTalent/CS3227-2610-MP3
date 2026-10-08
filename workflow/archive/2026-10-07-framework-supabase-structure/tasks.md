# Tasks: Framework and Supabase integration structure cleanup

- ohange/issues: `2026-10-07-framework-supabase-structure`; [#16](https://github.com/oS3227-2610-MP3-oonnectTalent/oS3227-2610-MP3/issues/16)
- Plan/record: `plan.md`; `record.md`
- Status/owner: Implementation and local application checks recorded; final recheck/PR Actions pending; issue owner unassigned.

## Before implementation

- [x] T00 — Requesting user approves the reviewed scope and Next.js generated-file recommendation. Evidence: direct requests in this conversation, 2026-10-07; recorded in `proposal.md` and `record.md`.

## Ordered implementation

- [x] T01 — Consolidate active Supabase session helper structure and remove unused duplicates. Depends on: T00. IDs: AC-01. Files: `src/lib/supabase/proxy.ts`, `src/proxy.ts`, `src/lib/client.ts`, `src/lib/server.ts`, `src/lib/middleware.ts`. Structural/import review, typecheck, lint, and unit tests passed; independent reviewer found no functional defect.
- [x] T02 — Follow Next generated type-file guidance. Depends on: T00. IDs: AC-02. Files: `.gitignore`, `.github/workflows/ci.yml`, Git index entry for `next-env.d.ts`. Verification: workflow orders `next typegen` before typecheck; local file-presence, ignored-state, and Git-index checks recorded in `record.md`.
- [x] T03 — Correct stale contributor project status. Depends on: T00. IDs: AC-03. Files: `CONTRIBUTING.md`. Verification: content matches the current Applicant flows in README and source.
- [x] T04 — Record exact outcomes and inspect scoped diff. Depends on: T01-T03. IDs: all. Files: `record.md`. Evidence: exact command outcomes and review findings are recorded; one vendored upstream whitespace finding is documented.

## Review and closeout

- [x] T05 — Independent reviewer checked branch diff, generated-file handling, helper boundaries, acceptance evidence, and scope. Final artifact recheck found no functional defect or evidence misstatement; see handoff.
- [x] T06 — Requesting user explicitly accepted the reviewed work and recorded limitations on 2026-10-08. User name/student role was not supplied and is not inferred. Evidence: `record.md`.
- [x] T07a — Archive packet and verify links/indexes. Evidence: archived packet, archive index, and link check. No product-spec sync applies.
- [ ] T07b — Open the issue-linked PR as the final contributor action; close #16 and #23 on merge and reference #11 without closing its broader CI/CD work.
