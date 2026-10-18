# Feature record: role navigation and logout

Status: accepted with recorded limits; canonical v1.2 synced and complete packet archived before submission. Owner: Paul Cheng. Date: 2026-10-09.

- Issue: [#36](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/36).
- Branch: `fix/36-role-navigation-logout` from updated `develop` `dd5e613`; no new commit, push or PR.
- [Proposal](proposal.md), [delta](specs/accounts-and-roles.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- IDs: ACC-002/003, accepted ACC-005, SEC-001/002; nav36-AC-01–05.

## Actual decisions and evidence

Paul requested changes on a new branch and authorised issue creation if needed. His explicit follow-up on 2026-10-09 prioritised navigation/logout before application-form improvement. He subsequently approved the named #36 proposal, ACC-005 delta, design and plan via conversation reply “Approve as written” on 2026-10-09, before product implementation. This is implementation approval, not acceptance or source-control submission authorisation.

Static inspection of `src/app/page.tsx` confirmed unconditional Sign in/My applications links. Logout was found on Applicant/HR list pages, but not public/job/detail navigation. The public job detail offers Apply without a role-dependent display check. Existing `signOut()` ignores the provider's returned error. These are source observations, not observed browser passes/failures.

`git pull --ff-only origin develop` reported already up to date at `dd5e613`. GitHub issue #36 was created and `git switch -c fix/36-role-navigation-logout` succeeded. At intake, one Codex execution performed drafting and no independent reviewer had run; the later actual review is documented below.

Intake checks: packet Markdown targets and `git diff --check` passed. Proposed ACC-005 has not been synced to the canonical spec.

Environment context: merged AI code reads enablement and privileged server configuration absent from `.env.example`; the teammate owns the example-file follow-up. Credentials pasted in conversation are excluded from every artifact. No pasted credential values were used or copied, and no live LLM/hosted calls were made for this packet. Existing local-only test credentials are used privately for synthetic browser fixtures.

## Implementation and observed checks

`src/lib/account-navigation.ts` resolves verified user and current profile into guest/unavailable/generic signed-in/Applicant/HR display states. A shared header in the root layout supplies account links/logout on public and protected pages. Duplicate page controls were removed; breadcrumbs remain. Public job detail withholds Apply for HR and unsupported states. Logout handles returned provider and thrown failures with generic root-page retry feedback. Existing server guards, RLS and logout scope remain unchanged.

| Command/evidence | Result and limits |
| --- | --- |
| Focused Vitest before implementation | Initial sandbox execution failed to spawn a worker (`EPERM`), infrastructure only. Escalated run then failed 13/16 behavior assertions: ten resolver states against a guest-only stub and three existing logout failures. |
| `corepack pnpm exec vitest run tests/unit/account-navigation.test.ts tests/unit/sign-out.test.ts` after implementation | Passed 16/16. Covers supported roles, unverified/missing/unknown profile, forged metadata, provider/profile transport failures and logout success/failure. |
| Focused local Playwright before UI changes | Failed on missing Account navigation; this was the expected behavior failure. |
| Focused local Playwright after UI changes | Passed 1/1; later expanded to Applicant application detail, HR job/application detail and logout/protected-route denial; expanded scenario passed in the regression run. |
| `corepack pnpm test:unit` | Passed 18 files / 91 tests, including existing AI/auth/action regressions. |
| `corepack pnpm typecheck`; scoped ESLint; `git diff --check` | Passed. Final scoped lint includes the expanded browser test. Repository-wide lint was not rerun because the known nested worktree/generated-output issue is outside this change. |
| `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/account-navigation.spec.ts tests/e2e/job-listings.spec.ts tests/e2e/hr-job-management.spec.ts tests/e2e/hr-application-review.spec.ts tests/e2e/applicant-applications.spec.ts tests/e2e/password-recovery.spec.ts` | Passed 11/11 locally in 1.9 minutes. Navigation, browsing, Applicant, HR jobs/review and recovery covered; AI browser responses mocked. A development-server shutdown emitted an ELIFECYCLE line after tests passed; the Playwright command exited 0. No live model calls. |
| `corepack pnpm build` | Passed after browser server stopped: compile, TypeScript and all route generation completed. Generated `next-env.d.ts` had no diff. |
| Database tests/advisors | N/A: no SQL, grants, migration or database authorization change. Browser tests exercise existing local profile/session boundaries. |
| Hosted checks | Not run; no deployment for this branch. |

Separate read-only reviewer `/root/navigation_independent_review` checked the final source/tests and independently reran focused units 16/16 and whitespace checks. No blocking implementation/security finding. Low stale-packet-status finding was corrected and independently rechecked as resolved. Browser/build were not independently rerun; their results above are implementer-run evidence. See [review handoff](handoffs/independent-review.md). Separate human acceptance and canonical sync/archive are recorded below; source-control submission was subsequently authorised.

## Acceptance and limits

All nav36-AC-01–05 have local unit/browser evidence. Identity/profile failures and generic states are unit-covered; browser fixtures cover supported roles, public/application/HR detail navigation, role denial and logout. Logout errors are unit-covered and the browser asserts the fixed retry message; a real hosted-provider outage was not injected. No cross-user cache is used. Copied access-token revocation follows the provider's existing behavior and is not established by clearing this browser session. No hosted environment has been changed or tested for #36.

Student acceptance: Paul Cheng, 2026-10-09, explicit “Accept with recorded limits” reply to the #36 acceptance question. The question identified 91 units, 11 browser tests, typecheck, scoped lint/build and independent review, with hosted preview pending. This is separate from the earlier “Approve as written” implementation decision.

Accepted sync: ACC-005 clause and all five scenarios copied without behavior changes into `workflow/specs/accounts-and-roles.md`; ProductSpec and capability index updated to v1.2, 9 October 2026. Exact clause/scenario equivalence checked before archive. Entire packet moved to `workflow/archive/2026-10-09-role-navigation-logout/`. Sync/archive are included in the final closeout commit; its hash is available in Git/PR evidence, not self-referenced here.

Submission authorisation: Paul explicitly requested closeout, commit, push and a PR into develop on 2026-10-09. Latest develop PR #37 (`089e8bb`) was fast-forwarded onto this branch without conflict or changing `.env.local`. No hosted test, merge or release is authorised by PR creation. Application-form fields were selected for a separate proposal; no form implementation is included.

Session summaries: [navigation intake](../../../logs/2026-10-09-role-navigation-intake.md) and [implementation](../../../logs/2026-10-09-role-navigation-implementation.md). Student verification of generated summaries remains pending. See also [closeout summary](../../../logs/2026-10-09-role-navigation-closeout.md).

## Final closeout checks

On 2026-10-09, exact accepted ACC-005 clause/scenario equivalence passed before archive; all seven required packet artifacts were preserved. Final local Markdown-target check passed for 273 links across packet, guides, canonical/index files and summaries. Final diff inspection confirmed only #36 source/tests and its closeout evidence; `git diff --check` passed. No runtime changes were introduced during closeout, so earlier implementation checks remain the behavior evidence. The PR #37 fast-forward affected only environment example/evidence files. `.env.local` and generated `next-env.d.ts` have no tracked diff. Final submission follows these checks; hosted preview remains Not run.
