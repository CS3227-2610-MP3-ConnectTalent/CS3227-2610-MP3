# Proposal: Resolve Supabase Auth redirects from Vercel deployment URLs

- Change ID: 2026-10-07-vercel-auth-redirects
- Issues: [#17](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/17)
- Owner: John Wong / @Johnwz123 (requesting user and issue assignee; student role not separately verified)
- Status: approved for bounded implementation; team-only preview behavior follows existing protection
- Date: 2026-10-07
- Baseline: [ProductSpec v0.7](../../ProductSpec.md), `develop` at `2fad6ed`
- Affected capabilities: [ACC-001](../../specs/accounts-and-roles.md#acc-001-public-applicant-signup), [OPS-001](../../specs/deployment-and-operations.md#ops-001-separate-environments)
- Classification: deployment/auth integration behavior; bounded, moderate operational risk

## Intent, problem, and motivation

Signup currently builds the email-confirmation callback from `APP_SITE_URL`, which must be updated for each generated Vercel preview URL. The callback route also uses that fixed value for its post-verification redirects. This can send a user to the wrong deployment. The Vercel project currently has Standard Deployment Protection enabled for preview deployments, which limits who can open those callbacks.

## Goals, non-goals, and scope boundaries

- Goals: share one server-only trusted-origin resolver; use Vercel's production project URL in production and its deployment URL in previews; keep local development working without `APP_SITE_URL`; document the Supabase Auth redirect allowlist and preview protection behavior.
- Non-goals: change Applicant roles, verification policy, code exchange, post-login destinations, hosted Supabase settings, or Vercel deployment-protection settings; expose any Vercel variable to browser code.
- Users/roles: signup Applicants receive a callback to the deployment that initiated signup; existing server authorization and Applicant/HR boundaries remain unchanged.
- Scope boundaries: `src/lib/supabase/site-url.ts`, the signup and callback handlers, `.env.example`, `README.md`, `docs/DeveloperGuide.md`, and this packet. No `.env.local`, secrets, migrations, or hosted service settings.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep a manually set `APP_SITE_URL` in every Vercel environment | Simple; generated previews need a new value or a stable custom hostname | Rejected for the requested dynamic-preview behavior |
| Resolve origin from Vercel system variables, with local/non-Vercel fallback | Avoids per-preview configuration; preview callbacks remain subject to Vercel access protection | Proposed, with preview audience decision pending |
| Trust the request `Host` header | Automatically follows a request host; attacker-controlled hosts could influence auth email and callback destinations | Rejected; redirects use trusted deployment configuration only |

- Assumptions/evidence: Vercel's "Enable access to System Environment Variables" is on. Standard Deployment Protection is selected. A visible generated deployment URL ends in `john-wongs-projects-9a7f897d.vercel.app`; use the official Supabase wildcard form with that team/account slug.
- Dependencies: issue #17; Supabase Auth redirect allowlist configured by a project administrator; user decision on intended preview audience.
- Risks: incorrect origin can break verification links; exposing preview callbacks publicly would change the deployment's security boundary. Keep preview protection unchanged and document access limitation.
- Open decisions: if external Applicants must use a preview, this protected-preview design is insufficient; public preview access would require a separate explicit security decision and is outside this change. The current implementation assumes previews are internal/team-only, consistent with the existing Vercel protection setting.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| AUTH-REDIRECT-AC-01 | #17; ACC-001 | Given signup runs on a Vercel preview, when Supabase sends the email link, then its callback URL uses that deployment's HTTPS origin and `/auth/callback`. | Focused behavior check; implementation owner; pending |
| AUTH-REDIRECT-AC-02 | #17; ACC-001 / OPS-001 | Given signup or callback runs in production, when an origin is needed, then the stable Vercel project production URL is used. | Focused behavior check; implementation owner; pending |
| AUTH-REDIRECT-AC-03 | #17; ACC-001 | Given local development has no `APP_SITE_URL`, when signup or callback builds a URL, then it uses `http://localhost:3000`; an explicit trusted override remains available outside Vercel. | Focused behavior check; implementation owner; pending |
| AUTH-REDIRECT-AC-04 | #17; SEC-001 | Given any supported environment, when redirect targets are built, then both handlers use the same server-only resolver and do not use an unvalidated request `Host`. | Source review and focused behavior check; reviewer/implementer; pending |
| AUTH-REDIRECT-AC-05 | #17; OPS-001 | Given the operator configures hosted Supabase Auth, when redirect URLs are added, then docs identify production callback, local callback, and the Vercel preview wildcard, and explain Standard Protection's access constraint. | Documentation review; implementation owner; pending |

- Spec deltas: none proposed. ACC-001 already requires email verification; this change resolves the deployment callback origin and does not alter product policy.
- Design: [design.md](design.md)
- Plan and tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Evidence: [record.md](record.md)

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, no-delta decision, design, and plan agreed before implementation.
- Approver: John Wong (@Johnwz123), requesting user and issue assignee; student role not separately verified.
- Decision/date/source: direct user message on 2026-10-07 says to follow the Supabase and Vercel guidance after the dynamic-origin approach was proposed; interpreted as approval for the bounded code/docs change. Team-only preview behavior is the safe default from existing Standard Deployment Protection.
- Conditions: preserve Standard Deployment Protection; do not change hosted Supabase or Vercel settings in this task.
