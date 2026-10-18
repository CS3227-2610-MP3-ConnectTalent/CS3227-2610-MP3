# Design: Vercel-aware Supabase Auth redirect origin

- Change ID/issues: [2026-10-07-vercel-auth-redirects; #17](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/17)
- Owner/status/date: John Wong / @Johnwz123 (requesting user and issue assignee; student role not separately verified); approved for bounded implementation; 2026-10-07
- Inputs: [proposal.md](proposal.md); ProductSpec v0.7; ACC-001 and OPS-001
- Scope and components: shared helper `src/lib/supabase/site-url.ts`; signup action; Auth callback route; environment and setup docs.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Resolve origins in a shared server-only helper from trusted deployment configuration | Duplicated env logic; request Host; fixed URL per deploy | One policy avoids signup/callback drift. Request Host is not a trusted redirect source. | User approved following the proposed Supabase/Vercel guidance on 2026-10-07 |
| Use `VERCEL_PROJECT_PRODUCTION_URL` for production and `VERCEL_URL` for preview | Use generated deployment URL in all environments; static override | Production needs a stable origin; previews need their own runtime hostname. Existing protection means preview flows are team-only. | User approved the dynamic-origin recommendation; protection-mode observation is recorded in record.md |
| Keep `APP_SITE_URL` as a non-Vercel override and default local origin | Require it everywhere; ignore it entirely | Preserves custom local/non-Vercel setup without per-preview updates. | User approved on 2026-10-07 |

## Interfaces and data flow

Applicant signup validates its existing form input, obtains the server Supabase client, asks the shared helper for the trusted site origin, and sets `emailRedirectTo` to that origin plus `/auth/callback`. The callback exchanges the code through the existing Supabase server client and uses the same helper for its existing success and error destinations. No user data is added to logs or sent to a new service.

Origin source order: on Vercel production, use `VERCEL_PROJECT_PRODUCTION_URL`; on Vercel non-production, use `VERCEL_URL`; outside Vercel, use optional `APP_SITE_URL`, then `http://localhost:3000`. Vercel host values are normalized to HTTPS origins. If a Vercel deployment lacks the environment-specific hostname and no explicit trusted override is configured, fail clearly instead of redirecting a production/preview user to localhost. Never derive redirects from `Host` or forwarded-host request headers.

## Authorization and privacy impact

No authorization rule, cookie, session, or Supabase key changes. The helper is server-only, and Vercel variables remain unprefixed. Supabase's redirect allowlist continues to constrain possible Auth callback targets. Do not put the Vercel automation bypass secret in email links or client-visible variables. Existing Standard Deployment Protection remains enabled.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Missing Vercel host variable | Signup/callback does not silently redirect to localhost from a deployed app; report a configuration error to server handling. | Focused behavior/source review; pending |
| Malformed or non-HTTPS deployment host | Reject invalid deployment configuration rather than create a redirect to an arbitrary origin. | Focused behavior check; pending |
| Vercel preview is opened by a person without project access | Vercel Deployment Protection blocks the preview; this change does not bypass protection. Internal preview verification works only for users who can access the deployment. | Existing Vercel settings observed read-only; expected audience decision pending |
| Supabase rejects callback URL because it is not allowlisted | Existing signup/callback error behavior remains; operator must configure the documented allowlist. | Documentation review; pending |

## Migration and backward compatibility

No database/schema migration. `APP_SITE_URL` remains supported outside Vercel. Existing local Supabase URL and Auth confirmation configuration are unchanged. Hosted Supabase settings are operator-managed and are not modified here.

## Rollout and rollback

Deploy the code through the normal review workflow after the Supabase Auth allowlist includes actual production, localhost, and the documented Vercel preview wildcard. Roll back by reverting the helper/consumer/docs change; restore the prior `APP_SITE_URL` value in each environment if required. No data migration or destructive operation is involved.

## Review and unresolved decisions

- [ ] Interfaces and requirement IDs agree with proposal.
- [ ] Security, failure, migration, rollout and rollback assessed.
- Findings/owner/resolution: Vercel Standard Deployment Protection is enabled for preview deployments. This implementation assumes team-only preview flows and keeps the setting unchanged; external/public preview access requires a separate explicit security decision.
- Human approval: user approved the bounded recommendation on 2026-10-07. The account's student role is not independently verified. A request to change preview access is outside the approved scope.
