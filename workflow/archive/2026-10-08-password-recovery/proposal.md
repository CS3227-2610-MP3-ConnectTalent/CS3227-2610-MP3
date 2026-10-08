# Proposal: email password recovery

- Change: `2026-10-08-password-recovery`; [issue #27](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/27)
- Owner: Paul Cheng; status: approved for implementation; date: 2026-10-08
- Baseline: [ProductSpec v0.9](../../ProductSpec.md), `develop` `eeebb75` (PR #26)
- Affected: [ACC-001/002](../../specs/accounts-and-roles.md), proposed ACC-004; [SEC-001/002](../../specs/security-and-privacy.md) and [OPS-001](../../specs/deployment-and-operations.md) remain linked boundaries
- Classification: security-sensitive behavior change

## Intent and bounds

Applicants and HR users who forget a password currently have no recovery path. Add one shared email-link flow from sign-in: request, generic acknowledgement, one-time recovery callback, and a form to set and confirm a new password. The account keeps its role. Local Mailpit supports testing; hosted delivery requires the team's SMTP and redirect configuration.

This excludes public HR signup, administrator resets, account creation, email change, auto-login after completion, a shared demo account and database migration. Keep in-progress #24/#25 local seed work separate.

## Choice and risks

Use Supabase Auth `resetPasswordForEmail`, PKCE code exchange and user-scoped `updateUser`; this reuses the cookie client and avoids a privileged key or bespoke token store. Reject service-role administrator resets for public self-service because the app would have to verify identity and handle privilege. Supabase email limits, delivery outages and callback allowlists can affect testing. A valid email code, not knowledge of the address alone, authorizes recovery.

## Acceptance

| ID | Outcome and evidence planned |
| --- | --- |
| `recovery27-AC-01` | Requesting reset for known or unknown email yields the same visible acknowledgement; known email receives a link to the deployment's callback. Test and local Mailpit check. |
| `recovery27-AC-02` | A valid unused link lets only its account set a matching valid new password; test callback/action and sign-in. |
| `recovery27-AC-03` | Invalid, missing, expired or reused links cannot establish a recovery session; unauthenticated users and invalid/mismatched passwords cannot update a password. Show retry path. Negative tests. |
| `recovery27-AC-04` | Applicant/HR role and record permissions stay unchanged; no password/token is logged, returned in action state, or sent to arbitrary redirect. Review and synthetic role readback. |
| `recovery27-AC-05` | Callback uses trusted local/preview/production origin and Supabase allowlist; origin tests and guide check. Hosted smoke is a later gate. |

Paul authorized the issue-linked branch and planning work, then explicitly answered “Approve as written (Recommended)” to the question linking this complete proposal, ACC-004 delta, design and plan on 8 October 2026. Shared behavior covers both roles. This approval permits implementation; separate feature acceptance remains pending.
