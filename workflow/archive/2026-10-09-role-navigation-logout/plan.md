# Plan: role navigation and logout

- Issue: #36. Owner: Paul Cheng. Status: implemented, reviewed and accepted locally; 2026-10-09.
- Baseline: `dd5e613`, ProductSpec v1.1. Branch: `fix/36-role-navigation-logout`.
- Inputs: [proposal](proposal.md), [design](design.md), [delta](specs/accounts-and-roles.md).

| Task | Depends on | Files/responsibility | Required evidence |
| --- | --- | --- | --- |
| T00 | none | Student approval of named proposal/delta/design/plan | Actual approval source/date recorded before coding. |
| T01 | T00 | New focused unit/browser navigation and logout tests | Observe intended missing behavior fail; infrastructure/import failures are not behavior evidence. |
| T02 | T01 | `src/lib/account-navigation.ts`, shared component, `src/app/layout.tsx` | Unit guest/Applicant/HR/unverified/missing/failure/spoofing states pass; role policy server-derived. |
| T03 | T02 | Product page headers, public job apply control, `src/app/auth/actions.ts` | Consistent logout/role links; action success/failure and browser protected-route denial pass. |
| T04 | T03 | Relevant tests, docs/UserGuide.md, docs/DeveloperGuide.md, Reflections.md | Unit suite, typecheck, build, scoped lint, focused browser flow and diff check; existing auth/role regression checks as needed. |
| T05 | T04 | Separate reviewer execution | Independent review of final diff, session/privacy and denial evidence; findings and rechecks recorded. |
| T06 | T05 | Student acceptance | Explicit acceptance separate from implementation approval/reviewer checks. |
| T07 | T06 | Canonical ACC-005 sync/version, archive, logs | Accepted sync before archive; complete dated summaries and links. |
| T08 | T07 | Source-control submission only when separately authorised | Commit/push/PR with actual evidence; PR to develop is final contributor action. |

No migration, local DB reset, external email/LLM call, hosted setting, secret provisioning or environment-example edit is planned. Supabase is involved only for authenticated session/profile reads and sign out. Local browser fixtures may use the existing local-only admin test setup; never hosted keys. Application form expansion is a separate follow-up. Paul later selected full name, verified email, optional phone and portfolio URL; no form implementation is approved by this packet.

Approval: Paul Cheng, 2026-10-09, explicit “Approve as written” reply for this complete packet, before product implementation. Independent review, separate acceptance and canonical v1.2 sync/archive completed; submission separately authorised, hosted validation/release pending.
