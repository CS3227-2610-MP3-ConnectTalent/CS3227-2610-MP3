# Feature record: signup password usability (#20)

Status: accepted locally by Paul Cheng on 2026-10-08; canonical v0.9 sync completed before archive. PR, hosted validation, merge and release pending.

Owner: Paul Cheng, Applicant workflow. Starting baseline: ProductSpec v0.8 and [ACC-001](../../specs/accounts-and-roles.md); branch `feat/9-hr-application-review` from `develop` commit `551da67`, with #9 saved locally as `47c4a3f` before #20's `ffc945f` commit.

## Traceability and decisions

- Issue: [#20](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/20), created 2026-10-08 from the preserved [issue body](issue-body.md). The user requested implementation before the issue was created. This is a process deviation, not issue-first evidence.
- Proposal: [proposal](proposal.md); proposed [ACC-001 delta](specs/accounts-and-roles.md); retrospective [design](design.md), [plan](plan.md) and [tasks](tasks.md).
- The user requested the behavior in this conversation, then separately requested issue tracking, evidence, independent review and a commit. No prior human approval of the #20 packet exists; no claim of approval before implementation is made. The #9 approval and acceptance do not extend to this follow-up.
- Separate student acceptance of #20: Paul Cheng explicitly wrote “accept 20” in this conversation on 2026-10-08, after the separate review and local checks. His following message requested completion of #20 closeout and one #9/#20 PR. This is local feature acceptance, not approval of hosted deployment or release.
- Accepted ACC-001 wording was compared with the implementation and synced to [canonical v0.9](../../specs/accounts-and-roles.md), [ProductSpec](../../ProductSpec.md) and the [spec index](../../specs/README.md) on 2026-10-08 before this complete packet was archived at `workflow/archive/2026-10-08-signup-password-ux/`. Hosted validation, PR, merge and release: pending.
- Branch is shared with #9 because the user had previously required explicit instruction before creating a new branch, and none was given for #20. Keep its commit distinct from #9.

## Acceptance and checks

| ID | Expected behavior | Evidence and actual result |
| --- | --- | --- |
| `signup20-AC-01` | Client-side mismatch shows error, retains email and does not submit. | Focused Playwright test passed; server unit test asserts no Supabase client call. |
| `signup20-AC-02` | Server mismatch without JavaScript retains email and creates no account. | Focused server-action unit test failed on old signature and passed after implementation; JavaScript-disabled Playwright case passed. |
| `signup20-AC-03` | Password visibility toggle is accessible and non-submitting. | Focused Playwright toggle assertion passed; reviewer inspected `type="button"`, label and pressed state. |
| `signup20-AC-04` | Matching signup and existing Applicant/HR flow still work. | Complete local Playwright suite 7 passed, including Applicant verification and HR flow; unit suite 8 files/30 tests passed. |

| Command/check | Actual result and limits |
| --- | --- |
| Initial focused Playwright run before client implementation | Blocked by sandbox `spawn EPERM`; no observed client behavior red. |
| `corepack pnpm exec vitest run tests/unit/auth-redirects.test.ts` before/after server fallback | Old signature failed (`formData.get is not a function`); revised action passed 5 tests. This is interface/behavioral red for the new action contract, not proof of browser behavior. |
| Focused JavaScript-disabled Playwright case | Passed; local Next.js/Supabase only. |
| `corepack pnpm test:e2e` with local service-role key | Passed 7 browser tests; no hosted preview result. The key was not printed or recorded. |
| `corepack pnpm test:unit` | Passed 8 files/30 tests. |
| `corepack pnpm lint`, `corepack pnpm typecheck`, `corepack pnpm build` | Passed. An earlier sandboxed build failed to spawn TypeScript; approved outside-sandbox retry passed. |
| `git diff --check`, `git diff --cached --check` | Passed before and after staging the closeout; staged scope contains #9/#20 closeout only, with #21 demo drafts excluded. |

## Independent review and limits

Separate read-only reviewer `/root/final_diff_review` assessed the working tree against `551da67`; see [handoff](handoffs/independent-review.md). It found no confirmed #9 authorization bypass, identified the no-JavaScript signup email-loss path, and rechecked its fix in source. It did not independently run runtime suites. It also identified the missing #20 process gates and stale acceptance wording; issue #20, this retrospective packet, and doc corrections address only the recordable parts. The missing pre-implementation approval cannot be recreated. The student accepted the locally reviewed outcome with that deviation visible.

Server error state contains only email and error; passwords are not returned, logged or placed in URLs. Public signup remains Applicant-only; HR role assignment and database permissions are unchanged. No migration, AI call, hosted data or production operation is part of #20. The local synthetic HR account created for manual testing is not a repo artifact; its credentials are excluded from evidence.

## Documentation and session evidence

- [Signup follow-up summary](../../../logs/2026-10-08-signup-password-ux.md): user requests, implementation, tests, reviewer findings, issue and process limitations. Student verification of the generated summary is pending.
- [Acceptance and PR closeout summary](../../../logs/2026-10-08-signup-acceptance-closeout.md): distinct student acceptance, v0.9 sync, archive and final PR preparation. Student verification of this generated summary is pending.
- #9 local acceptance is recorded separately in the [archived #9 record](../../archive/2026-10-08-hr-application-review/record.md). The Developer Guide, User Guide and Reflections were corrected to match that accepted state.
- `next-env.d.ts` was inspected: its only change was generated `.next/dev/types` references; it was restored and excluded from the intended commit.
