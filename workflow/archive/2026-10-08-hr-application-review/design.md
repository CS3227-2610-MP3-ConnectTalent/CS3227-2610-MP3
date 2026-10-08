# Design: HR application review and status actions

- Change/issue: `2026-10-08-hr-application-review`, [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Owner/status/date: Paul Cheng, **approved for implementation**, 2026-10-08.
- Inputs: [proposal](proposal.md), [ACC delta](specs/accounts-and-roles.md), [APP delta](specs/applications-and-review.md), [SEC delta](specs/security-and-privacy.md), [OPS delta](specs/deployment-and-operations.md), ProductSpec v0.7 at `551da67`.
- Scope: additive HR schema and policies, HR server authorization/queries/actions/pages, role-aware sign-in redirect, Applicant status display, tests and guides. Teammate AI endpoints and HR job-posting UI excluded.

## Decisions and alternatives

| Decision | Alternatives | Reason / tradeoff | Human decision |
| --- | --- | --- | --- |
| `applications.review_status` with `NULL` for drafts and `submitted` on first submission | Status only in HR-only table | Applicant must see own current status; row-level ownership already protects the application. | Approved with full packet 2026-10-08. |
| Separate append-only `application_notes` and `application_status_events` tables | Mutable note column or free-form status log | Keeps HR-only text out of the Applicant-readable row and preserves author/time of changes. Adds two narrow tables/policies. | Approved with full packet 2026-10-08. |
| Narrow `SECURITY DEFINER` RPCs for note append and status change; no direct browser write grants | Direct table updates under broad RLS | Centralizes verified HR, submitted-row and stale-write checks. Each function uses empty search path and schema-qualified calls. | Approved with full packet 2026-10-08. |
| Manual administrator promotion after verified Applicant signup | Public HR signup, service-role key in app | Reuses Auth while preventing self-promotion. A privileged, recorded manual operation is required in each environment. | Approved with full packet 2026-10-08. |
| Additive migration before preview smoke; old app remains compatible | PR-specific database branch or deploy new app before schema | All previews share Development Supabase under the team's topology. Compatibility is required while `develop` is still serving the old code. | Approved with full packet 2026-10-08. |

## Interfaces and data flow

1. A user signs in. The server obtains the verified Auth user and profile. Authorized HR is redirected to `/hr/applications`; Applicant goes to `/applications`. Public signup always creates an Applicant. A designated administrator later promotes a verified account to HR using a privileged manual database/dashboard operation; the app has no promotion form or service-role key.
2. `src/lib/hr-auth.ts` provides `requireHR()` by checking `auth.getUser()`, email verification and the current `profiles.role`. HR pages call it before queries. RLS independently checks the current verified HR role, so a guessed URL or RPC call cannot bypass the page check.
3. `/hr/applications` loads only `submission_state='submitted'` records with job title, applicant identifier, submitted time and current status. `/hr/applications/[id]` loads one submitted row, original/current letters, HR-only notes and status history. Missing, draft and unauthorized IDs use the same not-found behavior. No letter text goes into list data or logs.
4. A note form posts to a server action that validates text (proposed 1–2,000 characters), calls `append_hr_application_note(application_id, body)`, and redirects to detail. The database checks verified HR and submitted state, inserts author/time, and grants no direct note writes. Existing notes cannot be edited or deleted by browser roles.
5. A separate status form posts an explicit selected target and `review_revision` to `change_hr_application_status(application_id, target, expected_revision)`. The database locks the submitted application row, validates the target and expected revision, updates only `review_status`/`review_revision`, and inserts a status event with actor, target, time, from/to and success outcome. It never changes cover letters or Applicant submission state. Failed/stale requests return a generic reload message; the current state remains visible after reload.
6. Applicant list/detail selects `review_status` for the signed-in owner only. It never selects notes/status events. Existing Applicant save/submit/edit routes and job browsing remain available. HR AI summary later receives current letter plus revision from an authorized server read; it receives no notes and no status authority.

## Database and authorization

- Add `applications.review_status` (`NULL` draft, `submitted|in_review|shortlisted|rejected` for submitted) and `review_revision` with constraints. Backfill existing submitted applications before enabling the shape constraint. Replace the existing `submit_application` function **at the same signature** to initialize `review_status='submitted'` on direct submit and draft-to-submitted transition; old `develop` callers remain compatible. Applicant edits preserve status. The existing unique Applicant/job constraint remains.
- Add `application_notes(id, application_id, author_id, body, created_at)` and `application_status_events(id, application_id, actor_id, from_status, to_status, created_at, outcome)` with foreign keys and length checks. These tables have RLS enabled, authenticated HR-only SELECT policies, and no direct INSERT/UPDATE/DELETE grants to `anon` or `authenticated`. Notes and events remain visible for submitted applications after job closure. No note/letter text appears in status events.
- Harden `current_user_is_hr()` to require a verified Auth email as well as the HR profile. Revise the existing application SELECT policy so its owner branch requires the current **Applicant** role; its HR branch remains limited to submitted rows. This closes the promotion edge case in which an HR account still owns an old Applicant draft. The two new RPCs require verified HR internally, reject draft/missing rows and validate a controlled status vocabulary. Role checks cannot rely on user-editable metadata.
- HR promotion is a separate administrator-only runbook using the chosen environment's privileged dashboard/SQL access. It requires an already verified Auth user, verifies the target user ID and checks for existing Applicant applications before promotion; use a dedicated verified account with no Applicant applications for the first release. The operation changes only `profiles.role` and records who performed it. No browser route or `NEXT_PUBLIC_` secret for promotion. A test must prove Applicant direct profile writes and HR RPC calls are denied, and that an HR-promoted owner still cannot read a saved draft.
- The Applicant-readable `review_status` is a deliberate exception to HR-only status history. Database tests must show Applicant A sees their status but not notes/events or Applicant B's status. Anonymous users see none. Existing HR draft denial must remain true after the new migration.
- SEC-007 full operational audit remains broader than this slice. Status events record successful human changes; sanitized server logs should record actor/operation/target/time/outcome for attempted note/status actions without body or letter text. The record must state any missing failure-audit evidence honestly.

## Failure and adversarial behavior

| Case | Expected behavior and invariant | Planned evidence |
| --- | --- | --- |
| Applicant/anonymous calls HR action or guesses detail ID | No HR data returned; no note/status mutation | pgTAP grants/RLS/RPC denials, browser direct URL |
| HR requests a draft application | Not-found response; no draft text/notes | RLS and direct-ID browser check |
| Malformed/oversized note or invalid status | Server and database reject; no partial write | Zod/unit and pgTAP |
| Two HR users change status from same revision | One succeeds; second receives stale/reload result; events match committed state | Two-session or serial stale-revision database test |
| Job closes while HR reviews | Submitted application, status and notes remain readable; status/notes actions remain allowed for existing submission | Database and browser closed-job scenario |
| Shared Development Supabase lacks migration | HR page shows a generic unavailable state; no raw SQL/provider errors or private data. Preview smoke marked pending until migration. | Preview observation after team-controlled migration; local pre-migration compatibility check |
| AI text mimics instructions | Render as escaped text; no AI tool or status mutation in this slice | UI rendering test and server boundary inspection |

## Migration, environments and compatibility

The user-defined mapping is Vercel production (`master`) → Production Supabase and Vercel previews (all other branches, including `develop`) → Development Supabase. `src/lib/supabase/site-url.ts` already derives Vercel Auth callback origins from `VERCEL_PROJECT_PRODUCTION_URL` or `VERCEL_URL`; do not introduce a branch-specific `APP_SITE_URL` dependency. Hosted Supabase Auth must allow the actual preview callback origin for HR sign-in testing, subject to Vercel preview access controls.

Migration order: (1) write pgTAP denial/shape cases and observe a focused red result locally; (2) apply additive migration to local Supabase, verify existing Applicant flow and HR cases; (3) independent SQL/security review; (4) coordinated team application to Development Supabase with migration ID/time recorded; (5) preview smoke with synthetic HR/Applicant accounts. Until step 4, PR preview can build but HR data flows are not considered verified. Do not apply the migration to Production Supabase from a feature PR. At release, apply the reviewed migration to Production Supabase before deploying the `master` app that depends on it, then perform production smoke checks without real Applicant text in logs.

The additive schema and same-signature function replacement must preserve the deployed `develop` Applicant flow while Development Supabase is ahead. Verify that condition before the shared migration. If a preview issue occurs, revert the Vercel preview app or issue a reviewed forward database repair; do not drop notes/applications or reset the shared database. Production rollback is a release decision with a data-preserving forward repair or backup restoration plan.

## Review and approval

- [ ] Proposal, deltas, interfaces, migration order and requirements agree.
- [ ] Independent security/privacy reviewer has challenged RLS, grants, RPCs and rollout plan (planned; no run yet).
- [x] Student owner approved this design and plan before implementation.
- Approval source: explicit 2026-10-08 conversation reply “Approve as written (Recommended)” covering the full packet. Independent security review remains pending.
