# Design: email password recovery

- [Issue #27](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/27); Paul Cheng; approved for implementation; 2026-10-08
- Inputs: [proposal](proposal.md), [ACC-004 delta](specs/accounts-and-roles.md), ACC-001/002, SEC-001/002, OPS-001; baseline `develop` `eeebb75`

## Flow and interfaces

1. Shared sign-in links to `/auth/forgot-password`. Its public form validates email with Zod and calls Supabase Auth `resetPasswordForEmail`. `redirectTo` uses only `/auth/callback?flow=recovery` on `getAppSiteOrigin()`, never a caller-provided URL. Known and unknown email requests show the same neutral acknowledgement. Mail/throttle failures show a neutral retry message without account detail.
2. Supabase emails a one-time PKCE recovery link. The existing callback exchanges its code through `exchangeCodeForSession`. A fixed `flow=recovery` marker sends a successful exchange to `/auth/reset-password`; ordinary signup confirmation still goes to `/applications`. Missing/invalid code goes to a safe recovery error with a new-request link. No code/token is logged or reflected into a redirect.
3. `/auth/reset-password` requires `auth.getUser()` on the cookie client. A form uses accessible password inputs and confirmation. The server action rechecks the user, validates password length/match, calls user-scoped `auth.updateUser({ password })`, signs out, and redirects to sign-in with success only if sign-out succeeds. It accepts no target user ID/email and never writes `profiles.role`.

One flow serves Applicant and HR. Normal role-aware sign-in decides their subsequent pages. Form error state contains no passwords. A normal signed-in user visiting the reset form could change only their own password; if tests show a need to distinguish recovery sessions, add a bounded recovery marker and return the design for approval.

## Failure and privacy checks

| Case | Outcome and evidence |
| --- | --- |
| Unknown email | Same visible acknowledgement as known email; test account-enumeration behavior. |
| Malformed email or invalid/mismatched passwords | No Auth update; safe form error; no password in action state. |
| Missing, expired or reused code | No update from that code; show request-again path. |
| Open redirect attempt | Callback uses fixed internal destinations and trusted origin helper only. |
| Provider outage/throttle | Neutral retry; no account or credential details disclosed. |
| Password provider rejects the update | Safe retry error with no password in state. |
| Sign-out fails after update | State says the password changed but automatic sign-out failed; no success redirect. |
| Applicant after recovery | Existing server/RLS checks still deny HR access; role unchanged. |

## Environments and rollback

No schema migration. Local `supabase/config.toml` must allow both the ordinary `/auth/callback` and exact `/auth/callback?flow=recovery` redirect URLs and captures email in Mailpit; inspect the actual recovery template URL during testing. Each hosted Supabase project needs the exact recovery callback URL allowlisted and working SMTP before smoke testing. PR previews use Development Supabase, production uses Production Supabase; changing hosted settings remains a separate team operation. Rollback reverts app routes/actions; already changed test passwords cannot be rolled back, so use synthetic accounts. No SoCLaaS/AI boundary is involved.

Sources: [Supabase password reset](https://supabase.com/docs/guides/auth/passwords), [PKCE code exchange](https://supabase.com/docs/guides/auth/sessions/pkce-flow), [redirect allowlist](https://supabase.com/docs/guides/auth/redirect-urls). Read local Next.js 16 forms and route-handler docs before code edits.

Approval: Paul Cheng explicitly answered “Approve as written (Recommended)” to the linked complete packet question in this conversation on 8 October 2026. Feature acceptance remains separate.
