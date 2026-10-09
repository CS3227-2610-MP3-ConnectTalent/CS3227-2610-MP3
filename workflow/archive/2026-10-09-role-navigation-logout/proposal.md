# Proposal: role navigation and logout

- Issue: [#36](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/36).
- Owner: Paul Cheng. Status: approved for implementation. Date: 2026-10-09.
- Baseline: ProductSpec v1.1, `develop` `dd5e613`, including merged PRs #32 and #34.
- Branch: `fix/36-role-navigation-logout`.

## Problem and intended result

The home page always shows Sign in and My applications. Logout is present on some role lists but absent on public and several detail pages. A signed-in user cannot consistently identify their role or navigate to its tasks. Public job details also offer an Applicant apply action to HR.

Provide a consistent account navigation with guest, verified Applicant and verified HR states. Add visible role labels and sign out on public and role pages. Preserve page-specific breadcrumbs and existing server/database access checks.

## Scope and decisions

- Guests: Careers, Sign in and Create account.
- Verified Applicant: Careers, Applicant label, My applications and Sign out.
- Verified HR: Careers, HR label, Application review, Manage jobs and Sign out; no Applicant apply control.
- Authenticated accounts without a verified supported role: generic signed-in state and Sign out, with no protected role links.
- Authentication/profile failures: fail closed for role links; show generic retry information where appropriate, without account details or credentials.
- Logout success returns to Careers with guest navigation; logout failure reports a generic retry error and does not claim success.

Non-goals: extra application fields, HR signup or self-service role switching, database/AI changes, `.env.example` changes owned by the teammate, audit issue #33, live LLM calls, hosted settings and rollout. Application-form improvements follow this slice after field requirements are decided.

| Acceptance ID | Requirement | Observable evidence |
| --- | --- | --- |
| nav36-AC-01 | Proposed ACC-005; ACC-003 | Guest home/job detail shows account access links and no role dashboards. |
| nav36-AC-02 | ACC-002/003/005; SEC-001 | Verified Applicant sees its label, own dashboard and logout on public/detail pages; HR links absent. |
| nav36-AC-03 | ACC-002/003/005; SEC-001 | Verified HR sees review/jobs/logout on public/detail pages; Applicant links and apply control absent. |
| nav36-AC-04 | ACC-005; SEC-002 | Logout success produces guest navigation and protected-route denial; provider failure produces generic retry feedback. |
| nav36-AC-05 | ACC-005; SEC-001/002 | Missing/unverified role and profile lookup failure expose no privileged controls; forged metadata does not confer HR links. |

Tests use synthetic local accounts. User/profile information stays server-side except the minimum role label and navigation. No migration is required. Rollback reverts the navigation/action changes; existing data is unaffected.

## Approval

- User authorised issue/branch preparation and prioritised navigation/logout on 2026-10-09.
- Paul approved this named proposal, ACC-005 delta, design and plan on 2026-10-09 by replying “Approve as written” to the packet approval question, before coding.
- Implementation is in progress; review and separate human acceptance remain pending.
