# Tasks: Allow Applicants to Withdraw and Reapply

- Change/issues: `2026-10-16-applicant-withdraw-and-reapply`; [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Plan/record: `plan.md`; `record.md`
- Status/owner: accepted; John Wong (`Johnwz123`)

## Before implementation

- [x] T00 — Student John records approval of proposal, deltas, design, and plan. Evidence: Decision by John in chat on 2026-10-16 recorded in `record.md`; dependencies: None.

## Ordered implementation

- [x] T01 — Write failing pgTAP database tests in `supabase/tests/database/reapply_after_withdrawal.test.sql` for partial unique index and reapplication. Depends on: T00. IDs: `APP-001`, `APP-008`; `reapply-AC-01..03`. Verification: Observed failure before migration.
- [x] T02 — Create database migration in `supabase/migrations/20261016000000_applicant_reapply.sql` dropping constraint `applications_one_per_applicant_job`, creating partial unique index `applications_one_active_per_applicant_job`, and updating `write_application_details_v3`. Depends on: T01. IDs: `APP-001`, `APP-008`. Verification: `supabase db lint` and pgTAP pass.
- [x] T03 — Update `getOwnApplicationForJob` in `src/lib/applications.ts` to filter for active applications (`withdrawn_at IS NULL`). Depends on: T02. IDs: `APP-001`; `reapply-AC-01`. Verification: Unit test.
- [x] T04 — Add unit tests in `tests/unit/applications.test.ts` and `tests/unit/apply-page.test.tsx` verifying reapplication flow, draft prefill, and submission. Depends on: T03. IDs: `reapply-AC-01..05`. Verification: `pnpm test:unit`.
- [x] T05 — Run full static checks and test suites (`pnpm typecheck`, `pnpm lint`, `pnpm test:unit`). Depends on: T04. IDs: Quality gates. Verification: Exit 0 across all checks.

## Review and closeout

- [x] T06 — Independent Reviewer assesses git diff against `reapply-AC-01..05` and records report in `handoffs/independent-review.md`. Depends on: T05. Evidence: Verified in `handoffs/independent-review.md`.
- [x] T07 — Human owner John records acceptance decision in chat and `record.md`. Depends on: T06. Evidence: John approved in chat on 2026-10-16.
- [x] T08 — Integration Lead syncs accepted deltas to canonical specs (`applications-and-review.md`), advances ProductSpec baseline to v1.16, moves packet to `workflow/archive/2026-10-16-applicant-withdraw-and-reapply/`, and adds dated session summary in `logs/2026-10-16-applicant-withdraw-and-reapply.md`. Depends on: T07.
- [x] T09 — Authorized contributor opens issue-linked PR to `develop`. Depends on: T08. Evidence: PR [#91](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/91).

## Post-submission

- [ ] T10 — Human owner records merge/release decision. Evidence: PR merge to `develop`.

