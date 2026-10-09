# Design: HR job management

- Change/issues: `2026-10-09-hr-job-management`; [#8](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/8).
- Owner/status/date: Paul Cheng; locally accepted with recorded limits; 2026-10-09.
- Inputs: [proposal](proposal.md), [ProductSpec v1.0](../../ProductSpec.md), JMG-001–003, JOB-001–003, APP-001/004, SEC-001/002/007. No product delta.

## Decisions and data flow

1. `public.jobs` remains the source of truth. Existing columns and constraints cover all required fields/states. An additive migration adds a verified-HR SELECT policy and narrow `SECURITY DEFINER` functions for create draft, edit draft, publish and close. Direct `INSERT`/`UPDATE`/`DELETE` privileges stay revoked for `anon` and `authenticated`. Functions use an empty search path, schema-qualified references, explicit `public.require_verified_hr()` and narrowly granted `EXECUTE` to `authenticated`.
2. Draft create accepts validated title, team, category, description and requirements and writes `status='draft'`. Draft edit locks its job row and accepts content only while draft. Publish locks the row, requires draft, sets `status='published'` and `published_at=now()` in one transaction. Close locks the row, requires published, sets `status='closed'`, and preserves `published_at` and referenced applications. No RPC reopens, deletes or edits published/closed jobs.
3. All mutation functions return a limited identifier/state response, not applicant data. Server actions authenticate/authorize with `requireHR()`, validate inputs with Zod and call the narrow RPC through the user-scoped Supabase client. Errors return a safe form message. They log actor, operation, job ID, time and outcome only; no descriptions, requirements, cover letters, credentials or HR notes.
4. Focused `src/lib/hr-jobs.ts` owns HR reads, `src/lib/hr-job-input.ts` owns validation, and `src/app/hr/jobs/actions.ts` owns actions. `/hr/jobs` lists all states, `/hr/jobs/new` creates a draft, and `/hr/jobs/[id]` edits a draft or displays fixed published/closed content with separate Publish/Close controls as appropriate. HR navigation links to these pages. Public `src/lib/jobs.ts` retains its published-only query.
5. Applicant save/submit/edit RPCs already lock the selected job row. Closing takes the same lock, so closure and Applicant writes serialize: whichever transaction locks first completes first; an Applicant write arriving after closure is denied. Existing applications remain attached to the closed job; Applicant and HR application reads continue under existing RLS.

## Authorization and failure behavior

| Case | Required outcome | Verification |
| --- | --- | --- |
| Anonymous, Applicant or unverified HR calls any job mutation | Denied by RPC role check; no table write permission; server route/action denies before reading private jobs | `jmg8-AC-01/04` DB and browser tests |
| Visitor requests draft or closed job ID | No public row/detail; verified HR still sees it | `jmg8-AC-01/03` RLS and browser tests |
| Missing/invalid field, unknown category or oversized text | Validation failure before RPC; database constraints remain a second boundary | `jmg8-AC-01` unit and DB tests |
| Stale form attempts edit/publish/close after another transition | Job-row lock and state check reject it; no content/status change | `jmg8-AC-02/03` DB tests |
| Close races Applicant submission or letter edit | Serialized on job row; once closed, later writes fail; existing submitted application remains readable | `jmg8-AC-03` integration test |
| RPC/database outage | Show retryable error without claiming success; transaction prevents partial state | `jmg8-AC-02/03` action test |

## Migration, rollout and rollback

The migration adds policies/functions without altering existing rows or breaking current Applicant/public queries. It needs local database permission tests and compatibility checks. The team's Vercel previews use shared Development Supabase, so a PR preview may fail until the reviewed migration is applied there. Record who applied it and preview smoke evidence; this packet does not authorize hosted changes. Production Supabase migration and Vercel release are later, separate actions.

Rollback before shared deployment: revert code and local migration during development. After a shared migration, revert app code first; added HR functions/policy can remain inert, or a reviewed follow-up migration may remove them. Do not delete jobs/applications to roll back. Never imply that reversing a migration restores already closed jobs; a human-controlled corrective operation would be needed.

## Review and approval

- [x] Student confirms design and ordered plan before implementation.
- [ ] Independent reviewer checks RLS/grants, state transitions, race behavior and evidence after implementation.
- Human approval/source/date: Paul Cheng, 2026-10-09, explicit conversation approval of the named #8 packet.
