# Plan: #44 profile and résumé

Paul Cheng; 2026-10-09; awaiting approval. Inputs: [proposal](proposal.md), [design](design.md), [application](specs/applications-and-review.md), [security](specs/security-and-privacy.md), [overview](specs/product-overview.md) deltas. Baseline v1.3 at1667f2b; recheck updated develop before implementation. Current #42/#43 changes must be preserved; new implementation branch requires explicit permission.

| Task | Depends | Owner / scope | Requirements / evidence |
| --- | --- | --- | --- |
| T00 | None | Paul: concrete packet approval and explicit issue-linked branch authorization. | Actual decision; no inferred approval. |
| T01 | T00 | Primary: inspect current schema/Storage clients, installed Next guides, official parser/Storage docs; define exact operation/RPC contracts and old-client compatibility. Files: packet design/record, package.json/lock only when installing selected parser. | APP-001/006/007, SEC-009; document signatures/privileged helper and compatible rollout; reopen approval if scope changes. |
| T02 | T01 | Primary: failing DB/RLS/Storage ownership, freeze, snapshot, size/bypass and lifecycle/race tests, then migration/private bucket policies and functions. Files: new supabase/migrations/*_profile_resume.sql, supabase/tests/database/*profile_resume*.sql, tests/integration/*profile-resume*, tests/concurrency/*profile-resume*; config.toml only if required local bucket config. | AC-01/03/05/06/07/08/10. `corepack pnpm exec supabase test db`, focused real Storage integration and deterministic race commands; record exact red/green evidence. |
| T03 | T02 | Primary: failing profile/validation/prefill tests then focused src/lib/applicant-profile.ts, profile-input.ts, src/app/profile/, account-navigation.tsx and application input/form/data/actions/HR details changes. | APP-006; AC-01/02/03/09/10; focused Vitest and browser tests prove no draft overwrite or AI call. |
| T04 | T02,T03 | Primary: failing PDF/upload/download/failure tests then focused src/lib/application-resumes.ts, resume-input.ts, PDF validator, src/app/applications/[id]/resume routes/components and form/detail integration. | APP-007/SEC-009; AC-04–09. Boundary, direct Storage, lifecycle, cleanup and header tests; no AI module changes. |
| T05 | T03,T04 | Primary: synthetic browser profile→draft→PDF→submit→HR download at390/1440, legacy fixture and denied access; meaningful regression tests. Files: tests/unit/*profile*, *resume*, tests/e2e/profile-resume.spec.ts and existing relevant application tests. | All ACs; focused Vitest, DB/Storage/race/browser commands, typecheck, scoped lint, build. No hosted test claims. |
| T06 | T05 | Separate read-only reviewer dispatched through actual agent tool: final security/privacy and acceptance evidence reconciliation. Handoff under handoffs/independent-review.md. | All ACs; actual identity/independence/checks/findings, fixes/rechecks. No claimed runs from role labels. |
| T07 | T06 | Paul: separate acceptance with limits or changes requested. | Actual decision, separate from T00. |
| T08 | T07 | Primary: accepted canonical sync/version reconciliation then complete archive; update UserGuide/DeveloperGuide, Paul reflection only if new learning verified, dated logs, links. | Preserve limits and personal-verification status; guides describe implemented behavior only. |
| T09 | T08 | Authorized contributor: commit/push/issue-linked PR into develop only after explicit user instruction. | PR-last; hosted migration, release and later merge are separate gates. |

Allowed files are the focused paths above plus packet/evidence/index documentation. Exclude .env.local, live credentials, teammate AI/SMTP implementations, unrelated job/status rules and hosted settings. No concurrent writers planned. Developer owns implementation; reviewers are read-only and independently identify their checks. Database tests are required because this changes persistence/security; UI baseline regression is required because navigation/forms change. External AI evaluations are N/A because no AI feature change or extra content disclosure is intended.

Approval/completion pending. Commands listed here are planned, not observed results; record exact new integration/race script paths when created.

## Human approval record

Paul Cheng replied 'Approve as written' on 2026-10-09 to the explicit question naming the proposal, three deltas, design and plan. This supersedes pending approval wording above; branch permission and later acceptance remain separate. No implementation or canonical sync has occurred.
