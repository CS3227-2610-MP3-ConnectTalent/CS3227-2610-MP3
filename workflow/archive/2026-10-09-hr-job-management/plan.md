# Implementation plan: HR job management

- Change/issues: `2026-10-09-hr-job-management`; [#8](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/8).
- Owner/status/date: Paul Cheng; implemented and locally accepted with recorded limits; 2026-10-09.
- Inputs: [proposal](proposal.md), [design](design.md), canonical JMG-001–003, JOB-001–003, APP-001/004 and SEC-001/002/007. No new product delta.
- Branch/baseline: `feat/8-hr-job-management` from updated `develop` `0a0f5c4`.
- Constraints: no AI changes, no cover-letter rule change, no hosted DB mutation, no commit/push/PR without separate explicit authorization.

## Dependency-ordered work

| Task | Depends on | Owner | IDs | Files and deliverable | Evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | none | Paul | #8 | Approve proposal/design/plan and unchanged canonical policy | Actual conversation decision in [record](record.md) |
| T01 | T00 | Implementer | `jmg8-AC-01–04`; JMG/SEC | Add focused failing pgTAP cases for HR and Applicant permissions, transitions, draft/public visibility, immutable published/closed content and close preservation in `supabase/tests/database/` | Observe failure before migration; record exact command/result |
| T02 | T01 | Implementer | `jmg8-AC-01–04` | Add additive migration under `supabase/migrations/` with SELECT policy and narrow transactional RPCs; run migration/test suite | Focused pgTAP passes; no direct client job writes; schema and function review |
| T03 | T02 | Implementer | `jmg8-AC-01–04` | Add failing validation/action tests in `tests/unit/`, then `src/lib/hr-job-input.ts`, `src/lib/hr-jobs.ts`, `src/app/hr/jobs/actions.ts` | Focused Vitest fail/pass; server denies non-HR |
| T04 | T03 | Implementer | `jmg8-AC-01–03` | Add failing browser scenarios then HR list/new/detail pages and navigation under `src/app/hr/jobs/`, existing HR navigation components as needed | Playwright create/edit/publish/close and public visibility checks |
| T05 | T04 | Implementer | `jmg8-AC-03/05` | Verify close vs Applicant write and existing application reads in relevant DB/integration tests; update `docs/UserGuide.md`, `docs/DeveloperGuide.md` and applicable reflection | Focused race evidence, lint, typecheck, build, test results and accurate limits |
| T06 | T05 | Separate reviewer | all | Review final diff, DB grants/RLS, state/race handling, UI denial, tests and logs | Independent handoff with identity, findings and rechecks |
| T07 | T06 | Paul | all | Decide acceptance separately after review | Actual decision/conditions in record |
| T08 | T07 | Contributor | all | Verify no canonical delta, archive complete packet, link dated session summaries and check final diff | Archive/navigation/evidence checks; no false hosted claims |
| T09 | T08 | Contributor, only when authorized | #8 | Commit/push and open issue-linked PR into `develop` as final contributor action | Actual commits/PR URL; merge/release separate |

Read the relevant Next.js 16 guides from `node_modules/next/dist/docs/` before app code. Follow the Supabase/Postgres security guidance before SQL changes. Existing DB constraints and Applicant RPCs are dependencies, not files to rewrite. Teammate-owned AI modules are excluded. Runtime and security tests are required for this behavior change; docs-only static checking is insufficient. Development Supabase migration and preview smoke are a coordinated later operation and must remain pending until actually run. Production deployment is outside this PR.

## Approval

- [x] Student approves T00 and bounded implementation scope.
- Approval/date/source: Paul Cheng, 2026-10-09, explicit conversation reply “Approve as written (Recommended)” to the #8 packet question.
- Changes to scope require a revised packet and renewed student decision.
