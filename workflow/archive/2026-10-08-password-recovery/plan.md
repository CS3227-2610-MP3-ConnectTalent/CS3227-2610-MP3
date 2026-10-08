# Implementation plan: password recovery

- Change/issue: `2026-10-08-password-recovery`, [#27](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/27)
- Owner/status/date: Paul Cheng; approved for implementation; 2026-10-08
- Inputs: [proposal](proposal.md), [ACC-004 delta](specs/accounts-and-roles.md), [design](design.md)
- Baseline: `develop` `eeebb75`, ProductSpec v0.9; proposed ACC-004; existing ACC-001/002, SEC-001/002, OPS-001
- Bounds: #27 worktree only; leave #24/#25 checkout, hosted secrets and production settings untouched

| Task | Depends on | Files/result | Evidence |
| --- | --- | --- | --- |
| T00 human gate | Packet drafted | Record Paul's explicit decision on proposal, delta, design and plan | Decision source/date in record; no app code before approval |
| T01 request/callback red tests | T00 | Tests for generic known/unknown result, validated email, trusted redirect, recovery versus confirmation callback, invalid/reused code | Observe focused failures before code |
| T02 request/callback implementation | T01 | `src/app/auth/actions.ts`, callback, sign-in link, request page; focused helper if needed | Focused green, lint/typecheck |
| T03 update red tests | T00 | Tests for current user, password validation/match, no target ID, success/sign-out and failures | Observe focused failures before code |
| T04 reset form/action | T03, T02 | Reset page/form, `PasswordInput`, user-scoped `auth.updateUser`; no role write | Unit/integration and denial checks |
| T05 local mail/browser | T02–T04 | Synthetic Applicant and HR through Mailpit, invalid link, old/new sign-in | Actual browser/API evidence or specific throttle limit |
| T06 docs/review/acceptance | T05 | Guides/session log; separate security reviewer; Paul's distinct acceptance | Handoff, findings/fixes and record |
| T07 sync/archive/PR | T06 accepted | Sync ACC-004, archive packet, final checks; PR only if separately authorized | Actual paths/commands/PR; hosted smoke/release separate |

No database migration or AI tests are needed for this Auth-only feature. Hosted SMTP/redirect settings are rollout prerequisites, not local test results. Unit, browser, lint, typecheck and build checks apply. Review generated `next-env.d.ts` before closeout.

Approval: Paul Cheng's explicit “Approve as written (Recommended)” reply to the linked complete packet question, 8 October 2026. Earlier branch and planning authorization was separate; final acceptance remains pending.
