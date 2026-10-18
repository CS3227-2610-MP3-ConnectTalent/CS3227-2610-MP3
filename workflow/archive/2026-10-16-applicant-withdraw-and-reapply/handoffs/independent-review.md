# Agent handoff: 2026-10-16-applicant-withdraw-and-reapply / T06 / independent reviewer

- Issues/task/dependencies: [#90 feat(applications): allow applicants to withdraw and reapply](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90); T06 follows implementation tasks T01–T05.
- Human accountable owner: John Wong (`Johnwz123`)
- Assignment: Independent Reviewer, separate subagent invocation (`d929e6b6-eaab-4fe2-9bf0-0b8b4614258c`), 2026-10-16.
- Goal and scope: Independent verification of commit range `eda874d..05d772d` against acceptance criteria `reapply-AC-01` through `reapply-AC-05`, authorization, RLS, immutable audit history, and security boundaries.
- Allowed/excluded files: Read-only review of changed files across database migrations, schemas, server queries, UI components, and unit/database tests. Excluded from authoring implementation code.
- Inputs supplied: Approved change packet `workflow/changes/2026-10-16-applicant-withdraw-and-reapply/` (`proposal.md`, `design.md`, `plan.md`, `tasks.md`, `record.md`, `specs/applications-and-review.md`), commit range `eda874d..05d772d`.
- Acceptance IDs: `reapply-AC-01`, `reapply-AC-02`, `reapply-AC-03`, `reapply-AC-04`, `reapply-AC-05`.
- Interfaces/coordination: Return review findings, independence statement, and quality evidence to student owner John Wong.
- Required checks: `pnpm typecheck`, `pnpm lint`, `pnpm test:unit`, diff analysis, and security boundary review.
- Stop/escalation conditions: Stop verification gate approval on test failure, lint violation, RLS loophole, or broken audit history.

## Returned evidence

| Artifact / file / commit | Observed result | Assumption or limitation | Consumer / human verification |
| ------------------------ | --------------- | ------------------------ | ----------------------------- |
| `pnpm typecheck` | Passed (exit code 0; `tsc --noEmit` found 0 errors) | Verified in worktree at commit `05d772d` | John Wong (`Johnwz123`) |
| `pnpm lint` | Passed (exit code 0; `$ eslint` reported 0 errors and 0 warnings) | Verified in worktree at commit `05d772d` | John Wong (`Johnwz123`) |
| `pnpm test:unit` | Passed (exit code 0; 91 test files, 538 tests passed) | Complete unit test suite verified | John Wong (`Johnwz123`) |
| `supabase test db` (pgTAP) | Local execution not run (Windows host Docker daemon unavailable); static inspection verified. Executed and confirmed passing in GitHub Actions CI "Database checks" (run 38874529048, 15 assertions testing sequential duplicate active insert rejection, RLS, and schedule window enforcement). | Local Docker daemon not running on Windows host; hosted CI executes database test suite | CI / student verification |
| Diff & Security Review (`eda874d..05d772d`) | Verified: partial unique index `applications_one_active_per_applicant_job` prevents multiple active applications; prior withdrawn applications remain frozen and immutable; sequential duplicate active insert rejection verified (`reapply_after_withdrawal.test.sql:93-101`); RPC advisory lock and unique index guard concurrent submissions | Verified via pgTAP sequential insert test and partial unique index | John Wong (`Johnwz123`) |

## Traceability of Acceptance Criteria & Security Boundaries

1. **`reapply-AC-01` (Draft new application after withdrawal on open job) — Verified**
   - **Data Access:** `getOwnApplicationForJob(jobId)` (`src/lib/applications.ts:70-84`) filters `.is("withdrawn_at", null)`. When only a withdrawn application exists for the job, it returns `null`.
   - **Apply Page UI:** In `src/app/jobs/[id]/apply/page.tsx`, when `getOwnApplicationForJob` returns `null`, the page pre-fills applicant profile data and presents a fresh, editable application form (`data-submitted="false"`, `data-application-id="null"`). Verified by `tests/unit/apply-page.test.tsx:156-165`.
   - **Database RPC:** `application_private.write_application_details_v3` (`supabase/migrations/20261016000000_applicant_reapply.sql:52-78`) looks up `WHERE applicant_id = v_user_id AND job_id = p_job_id AND withdrawn_at IS NULL`. Finding none, it executes the `INSERT` branch, creating a new draft without conflict.

2. **`reapply-AC-02` (Submit new application after withdrawal) — Verified**
   - **Submission State:** When submitting a new draft or direct submission via `write_application_details_v3` with `p_submit = true`, the RPC sets `submission_state = 'submitted'`, `submitted_at = now()`, `review_status = 'submitted'`, and `review_revision = 1`.
   - **Verification:** Tested in `tests/unit/applications.test.ts:103-128` and pgTAP `supabase/tests/database/reapply_after_withdrawal.test.sql:48-52, 69-72`.

3. **`reapply-AC-03` (At most one active application enforced) — Verified**
   - **Database Constraint:** `alter table public.applications drop constraint if exists applications_one_per_applicant_job;` followed by `create unique index if not exists applications_one_active_per_applicant_job on public.applications (applicant_id, job_id) where (withdrawn_at is null);` strictly enforces at most one active application per applicant per job at the Postgres storage layer.
   - **RPC Guard & Concurrency:** `write_application_details_v3` acquires `pg_advisory_xact_lock` on `(user_id, job_id)` and rejects any submission if an active application already has `submission_state <> 'draft'` (`raise exception 'Application already submitted'`).
   - **Verification:** Verified by pgTAP assertions in `supabase/tests/database/reapply_after_withdrawal.test.sql:6, 83-101`.

4. **`reapply-AC-04` (Audit history preservation & distinct records) — Verified**
   - **Immutability of Withdrawn Application:** Prior withdrawn rows retain their original submission data, timestamps (`submitted_at`, `withdrawn_at`), review states, and snapshots. Database trigger `guard_application_withdrawal` rejects any updates or deletes to rows where `withdrawn_at IS NOT NULL`.
   - **Applicant View:** `getOwnApplication(id)` does not filter on `withdrawn_at`, allowing applicants to inspect past withdrawn applications. `listOwnApplications()` retrieves all applications owned by the user, returning both withdrawn and active applications. Verified by `tests/unit/applications.test.ts:130-158`.
   - **HR View:** HR review queries and pages display both historical withdrawn applications and the active submitted application (`submission_state = 'submitted'`). Verified in pgTAP test `supabase/tests/database/reapply_after_withdrawal.test.sql:84-92` (`HR can read both submitted applications`).

5. **`reapply-AC-05` (Rejection on closed or un-opened jobs) — Verified**
   - **RPC Enforcements:** `write_application_details_v3`, `lock_resume_draft`, and `prepare_application_resume` each check `v_job.status <> 'published' OR (v_job.opens_at IS NOT NULL AND v_job.opens_at > clock_timestamp()) OR (v_job.closes_at IS NOT NULL AND v_job.closes_at <= clock_timestamp())`, raising `Job is not open for applications` (P0001).
   - **Verification:** pgTAP test `supabase/tests/database/reapply_after_withdrawal.test.sql:94-110` verifies that an applicant who withdrew their application cannot reapply once the job is closed.

## Review independence and decision

- Implementer identity/range: Author on branch `feat/90-applicant-withdraw-and-reapply`, commit range `eda874d..05d772d`.
- Reviewer identity/context: Independent Reviewer subagent (`d929e6b6-eaab-4fe2-9bf0-0b8b4614258c`), invoked as a separate review execution on 2026-10-16. No implementation authoring role or code modification performed.
- Independence: Fully separate reviewer execution. No shared state or implementation edits.
- Findings: None. Zero defects, zero lint warnings, zero test regressions. Implementation faithfully implements the approved proposal, design, and plan while respecting all security boundaries and audit preservation rules.
- Recommendation: **Approved** (all quality gates, acceptance criteria `reapply-AC-01` through `reapply-AC-05`, and security boundaries pass).
- Human decision: Accepted and approved by student owner John Wong in chat on 2026-10-16.
