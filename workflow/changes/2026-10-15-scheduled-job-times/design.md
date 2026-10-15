# Design: Scheduled job opening and closing times

- Change ID/issues: 2026-10-15-scheduled-job-times; [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Owner/status/date: John (Johnwz123); draft; 2026-10-15
- Inputs: proposal.md; specs/job-management.md; specs/public-job-listings.md; canonical JMG-001–003, JOB-001, APP-001
- Scope and affected components/files:
  - Database schema & migrations: `public.jobs` (add `opens_at`, `closes_at`, table constraint), RLS policy, RPCs (`create_hr_job_draft`, `edit_hr_job_draft`, `unpublish_hr_job`, `submit_application`, `save_application_draft`).
  - Input parsing & schemas: `src/lib/hr-job-input.ts`, `src/lib/hr-jobs.ts`.
  - HR UI & actions: `src/app/hr/jobs/actions.ts`, `src/app/hr/jobs/job-editor.tsx`, `src/app/hr/jobs/[id]/page.tsx`.
  - Public queries: `src/lib/jobs.ts`, `src/app/jobs/[id]/page.tsx`.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| -------- | ----------------------- | -------------------- | ------------------------ |
| Dynamic time-window evaluation in RLS and queries | External cron daemon (`pg_cron`, serverless cron) mutating `status` column | High reliability, 0 cron failure points, atomic consistency under row lock | Approved in brainstorming on 2026-10-15 |
| Optional inputs in Job Editor form | Separate modal or publication action | Unified form simplifies draft preparation and review | Approved in brainstorming on 2026-10-15 |
| Operational status badge ("Draft", "Scheduled", "Published", "Closed") | Keep status badge as "Published" with dates | Clear UX distinction between scheduled and active postings | Approved in brainstorming on 2026-10-15 |
| Allow reverting scheduled jobs to draft before `opens_at` | Permanent lock immediately upon clicking publish | Since no applicant can view or apply before `opens_at`, HR can safely make schedule adjustments or recall | Approved in brainstorming on 2026-10-15 |

## Interfaces and data flow

1. **HR Creation / Editing:**
   - HR inputs title, team, category, description, requirements, and optional `opensAt` / `closesAt` into `JobEditor`.
   - Form submitted to Server Action `createHRJobDraft` / `editHRJobDraft`.
   - `src/lib/hr-job-input.ts` validates ISO strings and ensures `closes_at > opens_at`.
   - Stored procedure writes to `public.jobs`.
2. **HR Publication & Scheduling:**
   - HR clicks "Publish job".
   - If `opens_at` is null or past/current, job is immediately active ("Published").
   - If `opens_at` is future, job enters "Scheduled" operational status.
   - If "Scheduled", HR has an action to "Revert to draft" which calls `unpublish_hr_job` RPC (allowed only while `opens_at > clock_timestamp()`).
3. **Public Viewing & Applications:**
   - Visitor browses `/jobs` or views `/jobs/[id]`.
   - Supabase RLS enforces:
     ```sql
     status = 'published'
     AND (opens_at IS NULL OR opens_at <= clock_timestamp())
     AND (closes_at IS NULL OR closes_at > clock_timestamp())
     ```
   - Applicant submits via `submit_application` RPC.
   - Stored procedure locks job row and validates that the job is currently within its active window; rejects if before `opens_at` or after `closes_at`.

## Authorization and privacy impact

- **Public / Anonymous / Applicants:**
  - Can only SELECT jobs where `status = 'published'`, `opens_at <= now()`, and `closes_at > now()`.
  - Future-scheduled jobs and closed jobs cannot be read via public queries or direct API requests.
- **HR:**
  - Verified HR accounts retain full SELECT access to all jobs across company (draft, scheduled, published, closed).
  - Can only edit drafts (or revert scheduled jobs before `opens_at`).
  - Cannot edit content of published/active or closed jobs.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --------------------------- | ------------------------------------- | ------------ |
| `closes_at <= opens_at` | Database CHECK constraint `jobs_schedule_window` rejects write; form input returns safe validation error | sched-AC-01 |
| Applicant attempts submission to future-scheduled job | `submit_application` RPC raises exception `Job is not open for applications` (P0001) | sched-AC-01 |
| Applicant attempts submission to expired `closes_at` job | `submit_application` RPC raises exception `Job is not open for applications` (P0001) | sched-AC-03 |
| HR attempts `unpublish_hr_job` after `opens_at` has elapsed | RPC raises exception `Published job has already opened` (P0001) | sched-AC-02 |
| Direct SELECT query for scheduled job by anonymous user | RLS returns 0 rows | sched-AC-01 |

## Migration and backward compatibility

- Existing jobs have `opens_at = NULL` and `closes_at = NULL`.
- `opens_at IS NULL` is treated as immediate opening once published; `closes_at IS NULL` is treated as open until manual close.
- Fully backward compatible with existing jobs and historical application records.

## Rollout and rollback

- Rollout: Apply new database migration via `supabase db push` / `supabase migration up`. Deploy application code.
- Rollback: Revert application code. If needed, a down migration drops columns `opens_at` and `closes_at` and restores original RLS policy. Existing applications remain completely unaffected.

## Review and unresolved decisions

- [x] Interfaces and requirement IDs agree with the deltas and proposal.
- [x] Security, failure, migration, rollout and rollback impacts assessed.
- Findings/owner/resolution: All core design decisions approved by student owner John on 2026-10-15.
- Human approval: Pending student sign-off on packet artifacts.

