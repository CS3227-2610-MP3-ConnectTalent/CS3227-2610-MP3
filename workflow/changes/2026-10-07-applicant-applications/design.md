# Design: Applicant accounts and applications

- Change/issues: `2026-10-07-applicant-applications`; [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6), with HR review dependency [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Owner/status/date: Paul Cheng for Applicant behavior; user approved implementation in chat on 2026-10-07.
- Inputs: [proposal](proposal.md), [ACC-001 delta](specs/accounts-and-roles.md), [APP-004 delta](specs/applications-and-review.md), [SEC-001 delta](specs/security-and-privacy.md), [ProductSpec v0.6](../../ProductSpec.md) at `0200eb9`; ACC-001/002, APP-001/002, JMG-002/003, SEC-001/002/008, AID-002.
- Scope: authenticated Applicant UI, application storage/write boundary, own reads and tests. HR notes/status UI and SoCLaaS endpoints stay outside this packet.

## Decisions and alternatives

| Design point | Proposed approach | Alternative / tradeoff | Approval |
| --- | --- | --- | --- |
| Auth session | Supabase Auth with request-scoped SSR cookie client; validate the signed-in user on each protected server action | Browser-only session checks cannot protect server data; proposal awaits human approval. |
| Profile role | Database-created Applicant profile by default; no client role update grant; HR promotion only via controlled administration in later HR work | A client-supplied role would permit escalation; controlled HR mechanism remains #8/#9. |
| Draft and submit | One application row per Applicant/job, `draft` or `submitted`, with unique `(applicant_id, job_id)` | Separate draft and submitted tables duplicate ownership/uniqueness logic. |
| Letter revisions | Store current `cover_letter`, immutable `original_submitted_letter`, submission timestamp, current revision and update timestamp | Full history of every intermediate edit is larger scope; original plus current meets the agreed HR evidence need. |
| Writes | Narrow database functions for save, submit and edit, called by server actions using the user's session; revoke direct table writes | Raw client updates make lifecycle, original snapshot and job-state invariants easier to bypass. Functions need careful privilege review. |
| AI interface | A `cover_letter` textarea accepts generated text as a suggestion; Save Draft and Submit are separate explicit actions | Automatic submission would violate AID-002; avoiding automatic saving is a proposed handoff choice for the teammate's AI feature. |

These are proposed technical decisions. Supabase's [SSR guide](https://supabase.com/docs/guides/auth/server-side) describes cookie sessions; its [RLS guide](https://supabase.com/docs/guides/database/postgres/row-level-security) distinguishes table grants and row policies; its [database-function guide](https://supabase.com/docs/guides/database/functions) describes function privilege and `SECURITY DEFINER` hazards. Validate against the installed versions and local Next.js documentation before coding.

## Data and interfaces

1. `profiles`: `user_id` references `auth.users`, role defaults to `applicant`. Public signup cannot supply or update `hr`; a controlled admin step later manages HR assignment. Only the owner reads their profile in this slice.
2. `applications`: `id`, `applicant_id`, `job_id`, `submission_state` (`draft` or `submitted`), current `cover_letter`, nullable immutable `original_submitted_letter`, `submitted_at`, `updated_at`, and `revision`. A unique `(applicant_id, job_id)` constraint enforces one row. A draft has no `submitted_at` or original; a submitted row has both. Submitted text must be nonblank; the user approved a maximum of **5,000 characters** for both draft and submitted text. The teammate must consume this agreed field bound.
3. Signup checks password confirmation on the server before calling Supabase Auth; mismatches do not create an account. Email verification is required before sign-in/protected actions. Protected Next.js server actions check the authenticated user and Applicant role, parse the form with Zod, then call one narrow database function through that user's Supabase client. No service-role key reaches the browser or ordinary request path. Local Supabase routes confirmation mail to the local mail viewer; staging/production require their own SMTP and callback configuration.
4. Save Draft inserts/updates only the owner's draft while the job is published. Submit locks/checks the selected job and moves that row to submitted once, storing the first submitted text as original. Edit Submitted locks/checks that the job is still published and updates current text/revision only; it never alters the original or HR status. Writes on closed/draft jobs fail atomically. A supplied `expected_revision` rejects stale edits instead of silently overwriting another tab's changes.
5. Reads use RLS: Applicant reads their own draft/submission; HR reads submitted applications only when HR authorization is present; no one except a controlled administrator can alter role assignment. A closed job's title can be shown to the owner of an existing application without exposing its full unpublished detail to the public.
6. The teammate's AI draft can fill the same textarea and must not invoke Save Draft or Submit by itself. The HR AI summary should use the current letter and its revision; it must recompute if the Applicant edits later. The original snapshot remains available for human review. This interface must be agreed with the teammate before either AI feature is integrated.

The write functions may need `SECURITY DEFINER` to lock a job and mutate tightly restricted columns. If used, each function must set an empty `search_path`, schema-qualify objects, check `auth.uid()` and the Applicant profile inside the function, revoke default `EXECUTE` from `public`/`anon`, and grant only `authenticated`. The application table still has RLS for reads and no direct client write grant. An independent security reviewer must inspect the exact SQL and test direct RPC invocation as another user. An invoker-only design can replace this if it satisfies the same database invariants and tests.

## Failure and denial behavior

| Case | Required outcome | Evidence target |
| --- | --- | --- |
| Anonymous or HR caller uses Applicant action | Reject before row load or mutation | `app6-AC-01/05/06`, server and database tests |
| Applicant B requests A's draft or submission | No letter, original, or status returned | `app6-AC-05`, RLS/browser tests |
| Applicant attempts to assign HR or change review status | No privilege or status change | `app6-AC-01/06`, database tests |
| Duplicate or concurrent submit | One row and one original snapshot; clear already-submitted outcome | `app6-AC-03`, database tests |
| Job becomes draft/closed before a write | Save/submit/edit denied; existing readable record unchanged | `app6-AC-04/07`, database/concurrency tests |
| Blank/oversized text or stale revision | Reject without partial write; show actionable form error | `app6-AC-02/07/08`, unit/browser tests |
| Network or server failure | Show retryable error without claiming success; retry cannot duplicate a submission | `app6-AC-03/08`, integration/browser tests |

## Migration, rollout and rollback

Add new profile/application objects after the existing jobs migration. No production applicant data exists yet according to the current guide; validate this again before deployment. Tests create synthetic Auth users and jobs and do not write real letters into seed data. Apply and test locally, then stage against a separate Supabase project before production. If migration or authorization checks fail before deployment, stop rollout. Once real applications exist, rollback requires a reviewed forward migration and a protected data backup; do not drop user records to revert UI behavior.

## Open review items

- [x] User approved the full design and APP-004/SEC-001 deltas on 2026-10-07.
- [x] User approved the 5,000-character bound and required email verification. Teammate AI revision handling remains an integration handoff.
- [x] Require confirmation link callback before sign-in; configure staging and production redirect URLs separately at deployment.
- [ ] Independent reviewer challenges function privileges, row policies, race handling, and letter privacy after implementation.
- Human approval: 2026-10-07 chat. Reviewer findings and implementation results remain pending.
