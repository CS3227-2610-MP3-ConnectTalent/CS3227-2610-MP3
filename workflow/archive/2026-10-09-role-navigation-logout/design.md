# Design: role navigation and logout

- Issue: #36. Owner: Paul Cheng. Status: approved for implementation. Date: 2026-10-09.
- Inputs: [proposal](proposal.md), [ACC-005 delta](specs/accounts-and-roles.md), ACC-002/003 and SEC-001/002.

## Components and data flow

Request → shared server navigation → focused account-navigation resolver → existing Supabase server client `auth.getUser()` → current user's `profiles.role` → minimal navigation state. Resolve only the current user; do not query applications, notes, other profiles or AI services. Authenticated but unverified/missing/unknown profiles get a generic signed-in state, logout and no dashboards. Failed identity verification must not grant role links; a failed profile lookup retains only the already verified user's generic account state.

A shared navigation component under `src/components/` is mounted in the root layout so product detail pages and error pages retain account controls. Remove duplicate account/logout controls from individual page headers while preserving page-specific breadcrumbs. The public job-detail page uses the same focused state resolver to omit its Applicant apply control for HR. Existing role guards remain independent and authoritative. Reuse verified reads within a request if needed, never a cross-user global cache.

Logout continues as a server action in `src/app/auth/actions.ts`. Check the provider result and handle transport failure. Success redirects to `/`; failure redirects with a generic logout-error indicator for visible feedback. Do not catch Next.js redirects as provider errors. Cookie changes must use the existing server-action client and must invalidate account navigation through the framework's cookie/render behavior, verified by a browser test.

## Alternatives and risks

Fixing only the home page would leave logout missing from detail pages. Separate copied role headers would duplicate session/role policy. A shared account navigation is chosen while Applicant and HR content/pages remain distinct. Public pages gain a small authenticated user/profile read; auth unavailability must not expose protected links or unnecessarily break public browsing. Neither browser storage nor user-editable metadata is trusted for role display.

## Verification, compatibility and rollout

Unit tests cover resolver states, role-query failure/metadata spoofing and logout success/failure. Local browser tests use synthetic users and verify role-specific navigation on home/detail pages, hidden HR apply control and guest state/protected-route denial after logout. Existing role and AI tests must still pass. Read the installed Next.js authentication/forms/cookies guides and current Supabase SSR/auth docs before implementation.

No SQL, schema, API signature or application-data migration. No hosted mutation or live AI requests. Rollback reverts the navigation and logout-action code. Hosted preview testing remains a later operation; local checks alone will not establish deployed behavior.

Human approval: Paul Cheng, 2026-10-09, explicit conversation reply “Approve as written” for this design and its linked proposal/delta/plan. Accepted behavior/canonical sync remain pending.
