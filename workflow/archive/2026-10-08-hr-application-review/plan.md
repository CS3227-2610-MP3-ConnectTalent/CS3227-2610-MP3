# Implementation plan: HR application review

- Change/issue: `2026-10-08-hr-application-review`, [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Owner/status/date: Paul Cheng, **approved for implementation**, 2026-10-08.
- Inputs: [proposal](proposal.md), [design](design.md), [ACC](specs/accounts-and-roles.md), [APP](specs/applications-and-review.md), [SEC](specs/security-and-privacy.md), [OPS](specs/deployment-and-operations.md) deltas; ProductSpec v0.7 at `551da67`.
- IDs: ACC-002, APP-002/003/004, JMG-003, SEC-001/002/007/008, OPS-001/003; `hr9-AC-01`–`07`.
- Allowed files: additive `supabase/migrations/20261008*_hr_application_review.sql`, relevant `supabase/tests/database/`, focused `src/lib/hr-*`, `src/app/hr/**`, Applicant status display, auth sign-in action, unit/browser tests and applicable guides/packet/logs. Exact new migration timestamp must be unique when created. Excluded: SoCLaaS endpoints/prompts, teammate AI files, HR job-management UI, production secrets and production database changes.
- Environment: local Supabase for implementation. Development Supabase migration is a later reviewed, coordinated team operation; Production Supabase is untouched by this feature branch. Vercel previews share Development Supabase and may be unready before its migration.

## Dependency-ordered work

| Task | Depends on | Owner / role | IDs | Expected files / output | Required check and evidence |
| --- | --- | --- | --- | --- | --- |
| T00: approval | Issue and complete packet | Student owner | all | `proposal.md`, four deltas, `design.md`, `plan.md`, `record.md` | Record actual approval/date/source and any transition-policy edits before product implementation. |
| T01: failing DB cases | T00 | Applicant workflow implementer, test engineer review later | ACC-002, APP-002/003, SEC-001/002; AC-01–06 | New `supabase/tests/database/hr_application_review.test.sql` | Capture red result for missing HR notes/status, HR draft denial, Applicant status/notes denial and HR RPC authorization, without touching shared Supabase. |
| T02: migration and privilege boundary | T01 | Implementer; security reviewer later | ACC-002, APP-002/003, SEC-001/002/007; AC-01–06 | Additive `supabase/migrations/20261008*_hr_application_review.sql`; status/notes/events, constraints, RLS including HR-promoted-owner draft denial, grants, narrow RPCs and same-signature Applicant submission update | `corepack pnpm test:db`; old Applicant tests still pass. Inspect grants and direct-RPC abuse. Verify existing `develop` Applicant behavior against migrated local DB. |
| T03: auth, queries and actions | T02 | Implementer | ACC-002, APP-002/003, SEC-001/002; AC-01–04/06 | `src/lib/hr-auth.ts`, `src/lib/hr-applications.ts`, `src/lib/hr-input.ts`, `src/app/hr/applications/actions.ts`, role-aware `src/app/auth/actions.ts` | Focused failing then passing unit tests for validation, status revision and redirects; server actions use user session and generic errors. Read installed Next.js docs before writing Next code. |
| T04: role pages and Applicant status | T03 | Implementer | APP-002/003, ACC-003, SEC-001; AC-02–05 | `src/app/hr/applications/page.tsx`, `src/app/hr/applications/[id]/page.tsx`, HR note/status forms, Applicant list/detail status display | Browser tests with verified HR, Applicant A/B and anonymous; direct draft/other-user URLs denied; note and status actions separate. |
| T05: adversarial and compatibility checks | T02–T04 | Test engineer/security reviewer as actually assigned | SEC-001/002/007, OPS-001; AC-01–07 | DB/unit/browser tests and review handoff | Stale status race, invalid/oversized note/status, Applicant role escalation, note privacy, closed-job access, old-app compatibility; lint, typecheck, unit, db, browser and build results. Do not claim CI preview smoke before migration. |
| T06: docs, admin runbook and team handoff | T04/T05 | Student owner | ACC-002, APP-003, OPS-001; AC-01/07 | `docs/UserGuide.md`, `docs/DeveloperGuide.md`, `docs/Reflections.md`, `README.md` as needed; packet handoffs | Describe actual HR flow, controlled HR promotion without secrets, preview migration gate and AI current-letter/revision contract; check links and text against implementation. |
| T07: independent review | T05/T06 | Separate reviewer, not implementer | all | `handoffs/independent-review.md`, `record.md` | Review final diff, RLS/grants/RPC, APP/SEC/OPS acceptance evidence and migration compatibility; record findings, fixes and rechecks. |
| T08: human acceptance and spec sync/archive | T07 | Student owner | ACC-002, APP-002/003, SEC-001, OPS-001 | `record.md`, canonical v0.8 files if accepted, complete `workflow/archive/2026-10-08-hr-application-review/` | Actual acceptance decision; compare accepted deltas, verify IDs/version/links, move whole packet. Pending until evidence. |
| T09: closeout and PR | T08 | Authorized contributor | #9; all ACs | Logs, final record, issue-linked PR to `develop` | Finish dated summaries and checks before PR. Commit, push and PR only on separate user instruction. Merge, shared Development Supabase migration, preview verification and release have separate decisions/evidence. |

## Rollout dependency outside the contributor PR

The SQL migration needs review before applying to the shared Development Supabase project. Applying it is an external environment mutation requiring a coordinated team action. The old `develop` app must still function against it; otherwise preview smoke is blocked and the design needs a compatibility repair. Only after the migration is recorded can the Vercel PR preview be tested against Development Supabase. The preview's Auth callback must be allowed and accessible to the tester. Production Supabase migration and Vercel `master` release are separate later gates. There is no PR-specific Supabase branch in the agreed topology.

## Handoffs and evidence rules

- The teammate's HR AI summary consumes only authorized submitted application data, current letter/revision and selected job requirements. It cannot read notes/status events or call HR status actions. Record an actual teammate agreement when obtained.
- The implementation owner may draft tests/code after T00 approval; planned analyst/architect/test/security roles are not actual agent runs. Use filled handoff artifacts when separate executions occur.
- Use synthetic HR/Applicant records. Do not record private letter/note text, credentials, Supabase service-role keys or production identifiers in tests/logs. A failing check remains a failing check until a recheck passes.
- Database red-first, unrelated AI tests, deployment smoke and CI status must be described with actual commands/results or marked pending/N/A. A PR build alone does not prove shared schema compatibility.

## Approval and completion

- [x] User selected four statuses, add-only notes, manual HR promotion and the branch/environment mapping on 2026-10-08.
- [x] Student owner approved complete proposal, four deltas, design and this plan, including status transitions and preview migration order.
- [ ] Independent review, acceptance, sync/archive, logs and PR recorded separately after implementation.
- Approval source/date: Paul Cheng's explicit “Approve as written (Recommended)” reply in this conversation on 2026-10-08. No feature acceptance or shared database migration is implied.
