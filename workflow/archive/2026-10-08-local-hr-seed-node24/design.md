# Design: local-only HR provisioning

Status: approved for implementation by Paul Cheng on 8 October 2026. Inputs: [proposal](proposal.md), [ACC-002](../../specs/accounts-and-roles.md), [SEC-001/008](../../specs/security-and-privacy.md), [OPS-001](../../specs/deployment-and-operations.md).

## Flow and trust boundary

`corepack pnpm seed:local-hr` runs a Node 24 script outside Next.js. It reads the ignored `.env.local` using Node's `--env-file`, requiring `NEXT_PUBLIC_SUPABASE_URL` to be exactly the configured local loopback endpoint (`http://127.0.0.1:54321` or `http://localhost:54321`), `TEST_SUPABASE_SERVICE_ROLE_KEY` from that local stack and a developer-chosen `LOCAL_HR_SEED_PASSWORD`. No service-role key is added to app code or a `NEXT_PUBLIC_` variable. The account address is fixed to `local-hr@example.test` to limit the script's ownership; output reports only success/failure and this synthetic address.

After validating inputs and endpoint **before client construction**, use the Supabase Auth admin API to find the exact synthetic account, creating it with confirmed email and an unknown random temporary password only if absent. Mark ownership in admin-only app metadata. Read the linked profile and check the application count with the local admin client. Refuse if the profile is missing unexpectedly or any application exists. Promote that new verified no-application account to HR, then set the developer's chosen password. A new account cannot submit as Applicant before promotion because its temporary password is unknown; reruns reuse only an existing marked HR account and reconcile its password. An existing marked Applicant account needs manual cleanup, not automatic re-promotion. Treat errors or unexpected duplicate matches as failures, never fallback to a hosted URL. Existing server checks/RLS continue to authorize HR pages and writes; the script confers no browser ability to assign roles.

`supabase/seed.sql` stays the synthetic job seed. The account command runs *after* `supabase start` or `supabase db reset`, because those commands run migrations/SQL seed. It never runs automatically in CI, previews, Development Supabase or Production Supabase. The earlier ad hoc local HR account was uniquely identified and demoted to Applicant after Paul chose role revocation; its authored note and status event were retained.

If promotion fails after account creation, the marked Applicant account retains an unknown temporary password and requires local administrator cleanup before retry. If setting the chosen password fails after promotion, a rerun can recover the marked HR account. Neither partial state exposes a usable known password.

## Failure, verification and rollback

Validate endpoint, key and password; test these guards with a mocked admin client and observe failures before implementation. Test create/rerun/application-denial and unmarked-account paths. With local Supabase available, verify one account, verified HR role and sign-in; a local pgTAP/browser regression may be used if needed. No schema migration or product spec sync is needed. Rollback is removal of the fixed synthetic account in *local* Auth only after confirming it has no dependent review records, or leaving the script unused; never reset unrelated local data just to remove it. Documentation recommends Node 24 but keeps pnpm 12.8.1 and CI unchanged.

## References and limits

Official Supabase local seeding guidance distinguishes SQL placeholders from login-capable Auth users: https://supabase.com/docs/guides/local-development/cli-workflows . Auth admin methods are server-only: https://supabase.com/docs/reference/javascript/auth-admin-listusers and https://supabase.com/docs/reference/javascript/auth-admin-updateuserbyid . A script cannot provision hosted reviewer access; [#21](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/21) was closed at the student's request.
