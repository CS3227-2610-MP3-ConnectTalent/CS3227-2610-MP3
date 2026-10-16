# Design: Allowing Applicants to Withdraw and Reapply

- Change ID/issues: `2026-10-16-applicant-withdraw-and-reapply`; [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Owner/status/date: John Wong (`Johnwz123`); draft awaiting approval; 2026-10-16
- Inputs: `proposal.md`; `specs/applications-and-review.md`; ProductSpec baseline v1.15 (`2a56ba1`)
- Scope and affected components/files:
  - Database schema & RPC: `supabase/migrations/`
  - Database verification: `supabase/tests/database/`
  - Application logic: `src/lib/applications.ts`
  - Unit tests: `tests/unit/applications.test.ts`, `tests/unit/apply-page.test.tsx`

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Partial unique index `WHERE withdrawn_at IS NULL` | 1. Table constraint `(applicant_id, job_id)`<br>2. Physical row deletion<br>3. Soft-delete flag | Constraint prevents reapplication. Physical deletion breaks data retention and audit requirements. Partial unique index cleanly enforces that at most one active application exists per applicant per job while preserving historical withdrawn rows. | Pending student approval |
| Scope `write_application_details_v3` to `withdrawn_at IS NULL` | Separate reapplication RPC | Keeping a unified RPC for application drafting and submission maintains single responsibility and eliminates redundant code. | Pending student approval |
| Scope `getOwnApplicationForJob` to active (non-withdrawn) | Return array or latest application | `/jobs/[id]/apply` needs the current editable/submitted active state. Individual historical applications remain directly queryable via `getOwnApplication(id)` and `listOwnApplications()`. | Pending student approval |

## Interfaces and data flow

```
Applicant -> GET /jobs/[id]/apply -> getOwnApplicationForJob(id) [WHERE withdrawn_at IS NULL]
   |
   +--> If previous application was withdrawn:
          - getOwnApplicationForJob returns null
          - Prefills profile data
          - Renders fresh application form
   |
   +--> POST save/submit -> write_application_details_v3(p_job_id, ...)
          - SELECT ... FOR UPDATE WHERE applicant_id = user AND job_id = p_job_id AND withdrawn_at IS NULL
          - Since existing is null (prior was withdrawn), executes INSERT
          - Partial unique index ensures no concurrent active application
          - Returns new application UUID
```

## Authorization and privacy impact

- **Role checks:** Unchanged. Only `authenticated` users with verified `applicant` role can create, edit, or withdraw their own applications (`require_verified_applicant()`).
- **Data retention:** Withdrawn applications are never physically deleted or modified on reapplication. Their original submission snapshots, timestamps, and HR review history remain immutable and visible to the applicant in their history list (`/applications`) and to HR in the review queue (`/hr/applications`).
- **Privacy:** Past withdrawn applications cannot be accessed or manipulated by other applicants (RLS enforces `applicant_id = auth.uid()`).

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Concurrent double-submit after withdrawal | One insert succeeds; second insert hits partial unique index `applications_one_active_per_applicant_job` and fails | pgTAP concurrency test |
| Reapply to closed or scheduled job | `write_application_details_v3` checks `v_job.status = 'published'` and schedule window, throwing `Job is not open for applications` | Unit and pgTAP tests |
| Attempt to edit prior withdrawn application | `guard_application_withdrawal` trigger rejects any mutation to rows with `withdrawn_at IS NOT NULL` with `42501 Withdrawn applications are locked` | Existing trigger & pgTAP |

## Migration and backward compatibility

1. Drop existing constraint:
   ```sql
   ALTER TABLE public.applications DROP CONSTRAINT applications_one_per_applicant_job;
   ```
2. Create partial unique index:
   ```sql
   CREATE UNIQUE INDEX applications_one_active_per_applicant_job
     ON public.applications (applicant_id, job_id)
     WHERE (withdrawn_at IS NULL);
   ```
3. Update `application_private.write_application_details_v3` to query `where applicant_id = v_user_id and job_id = p_job_id and withdrawn_at is null`.
4. Update `application_private.lock_resume_draft` (if applicable) to check `withdrawn_at is null`.

Existing data: All currently active applications have `withdrawn_at IS NULL`. Any previously withdrawn applications have `withdrawn_at IS NOT NULL`. The migration is 100% non-destructive and backward compatible.

## Rollout and rollback

- Rollout: Apply database migration via standard migration replay. Deploy application code changes.
- Rollback: Revert `write_application_details_v3` and recreate `applications_one_per_applicant_job` unique constraint (provided no applicant has two active applications, which the partial index already guarantees).

## Review and unresolved decisions

- [x] Interfaces and requirement IDs agree with deltas and proposal.
- [x] Security, failure, migration, rollout and rollback impacts assessed.
- Findings: None.
- Human approval: Pending student owner review in chat.
