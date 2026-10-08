# Proposal: local HR seed and Node 24 setup (#24, #25)

- Change ID: `2026-10-08-local-hr-seed-node24`
- Issues at approval: [#24 local HR seed](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/24), [#25 Node 24 docs](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/25); [#21 separate demo](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/21) was closed at Paul's request. Original #24 was later deleted; [#28](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/28) is the live replacement for its same approved scope. This post-approval link repair does not claim a new pre-implementation issue.
- Owner: Paul Cheng, Applicant/application workflow, with teammate local setup benefit.
- Status: approved for implementation by Paul Cheng on 8 October 2026.
- Baseline: [ProductSpec v0.9](../../ProductSpec.md), `develop` at `644bda6`; branch `chore/24-25-local-hr-seed-node24`.
- Affected rules: [ACC-002](../../specs/accounts-and-roles.md), [SEC-001/002/008](../../specs/security-and-privacy.md), [OPS-001/003](../../specs/deployment-and-operations.md). Local development tooling and documentation only; no proposed product behavior or canonical spec delta.

## Intent and scope

Each developer has a separate local Supabase. `supabase/seed.sql` seeds jobs but no login-capable HR account. Create one repeatable local-only command that provisions a synthetic verified HR account using the local Auth admin API and the existing profile rule. Update README and CONTRIBUTING to recommend Node 24 (CI already uses it) and explain Corepack's pnpm pin. Revoke the earlier manually created local synthetic account's HR role while retaining its authored review records, per Paul's later explicit decision. Keep the separate hosted demo plan retired.

No auto-login, public HR signup, hosted account creation, shared password, real applicant data, schema migration, AI call, CI runtime change or pnpm upgrade is included. Grader access remains an independent future decision.

## Alternatives, dependencies and risk

| Choice | Decision |
| --- | --- |
| Put Auth rows/password in `supabase/seed.sql` | Rejected: SQL placeholder Auth rows do not reliably give a login-capable user; a tracked password is inappropriate. Keep SQL seed for jobs. |
| Ask every teammate to sign up and run manual SQL | Works, but repeats role-promotion setup and is easy to get wrong. Keep the manual documented path for hosted administration. |
| Local-only Node admin script | Proposed: exact loopback URL guard, local service-role key from ignored configuration, fixed synthetic `.test` identity, rerunnable. |

Requires local Docker/Supabase for the runtime check. The local stack was unavailable at intake; the user said they would start Docker Desktop. Its earlier synthetic account was identified by UUID and email pattern; because it authored review records, Paul chose role revocation with history retained. Secrets and passwords stay out of tracked files, test output and GitHub evidence.

## Acceptance evidence

| ID | Observable outcome | Evidence |
| --- | --- | --- |
| `local24-AC-01` | On the local stack, the documented command creates a verified synthetic HR login that reaches `/hr/applications`. | Local admin readback and browser sign-in; no private data in logs. |
| `local24-AC-02` | Rerunning the command uses the same synthetic account, with no duplicate, and refuses promotion if any Applicant application exists. | Focused unit/integration checks and local readback. |
| `local24-AC-03` | Non-loopback URL, missing local admin key or missing password fail before an admin call. | Focused test-first checks. |
| `local24-AC-04` | No credential or service-role key is committed, printed in logs, or exposed to browser code. | Diff/secret inspection and independent review. |
| `setup25-AC-01` | README and CONTRIBUTING recommend Node 24 and explain Corepack vs directly installed pinned pnpm, consistent with CI/package.json. | Static content and link checks; application tests N/A for wording. |
| `cleanup24-AC-01` | The earlier uniquely identified local synthetic HR account loses HR access; its authored note/status event and other users remain. | UUID-scoped local profile update and before/after role/history counts. |

## Approval

- [x] Paul Cheng approved this proposal, the [design](design.md), [plan](plan.md) and [tasks](tasks.md) before implementation.
- Decision source/date: explicit “Approve as written (Recommended)” reply to the complete #24/#25 packet approval question in this conversation, 8 October 2026. The later local cleanup choice is recorded separately.
