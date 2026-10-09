# Tasks: environment example

- Change/issues: `2026-10-09-env-example`; [#35](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/35)
- Plan/record: `plan.md`; `record.md`
- Status/owner: in progress; John

## Before implementation

- [x] T00 — John approved the bounded `.env.example` review/fix and PR scope in chat on 2026-10-09. Evidence: approval record in `proposal.md` and `record.md`.

## Ordered implementation

- [x] T01 — Inventory app, test/seed, Vercel, and Supabase config environment references. Depends on: T00. IDs: ENV-AC-02/03. Files: read-only source/config inspection. Verification: compare repository references and consumers. Evidence: `record.md`.
- [x] T02 — Make `.env.example` safe by default and clarify variable purpose/boundaries. Depends on: T01. IDs: ENV-AC-01/02/03. Files: `.env.example`. Verification: inspect exact file, check unique assignments/placeholders/credential exposure. Evidence: final diff and recorded checks in `record.md`.

## Review and closeout

- [x] T03 — Separate reviewer checks the final diff, scope, and key boundary. Evidence: `handoffs/independent-review.md` and `record.md`.
- [x] T04 — John records distinct acceptance after review. Evidence: his 2026-10-09 conditional instruction to proceed if no further issues were found; the condition was satisfied by the clean final recheck and is recorded in `record.md`.
- [x] T05 — Complete the dated summary and archive the packet with navigation repaired before PR creation. Evidence: `record.md`, the archived packet, and the session summary.
- [ ] T06 — Commit the archive/navigation closeout, push the branch, and create the issue-linked PR to `develop`. Evidence: final commit and PR URL in `record.md`.
