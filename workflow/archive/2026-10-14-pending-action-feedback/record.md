# Evidence record: issue #81 pending action feedback

- Issue: [#81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Branch: `feat/81-pending-action-feedback`, created from updated `origin/develop` `f65f699` on 14 October 2026
- Owner: Paul Cheng
- Requirement proposal: [OVR-004](specs/product-overview.md); [proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md)
- Status: accepted locally with recorded limits on 15 October 2026; OVR-004 synced to canonical v1.11; complete packet archived; Paul explicitly requested commit, push and PR on 15 October 2026
- Session summary: [14 October pending action feedback](../../../logs/2026-10-14-pending-action-feedback.md)
- Closeout summary: [15 October pending action feedback](../../../logs/2026-10-15-pending-action-feedback-closeout.md)

## Intake and observations

Paul asked for a new branch and loading indicators to handle several-second Vercel responses, with sign-in especially troublesome and repeat clicks undesirable. Static audit of `develop` found sign-in, sign-out, reset request, HR note/status and job lifecycle submit buttons without pending feedback; signup/reset-password disable while pending but keep idle labels. Existing Applicant saving, résumé, withdrawal and AI flows already have local pending states. These are source observations, not a measured hosted latency diagnosis. No sensitive credentials or applicant content were inspected or recorded.

GitHub issue #81 was created from this request. GitHub CLI was authenticated under the user’s account; `origin/develop` was fetched, and the requested issue-linked branch was created. Unrelated untracked `workflow/changes/2026-10-09-profile-resume/` remained untouched.

## Gates and evidence

| Gate                                | Status and source                                                                                                                                                                                             |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Branch and issue                    | Done as above; branch creation authorized by Paul’s 14 October request.                                                                                                                                       |
| Proposal/delta/design/plan approval | Paul answered “Approve plan and implement” to the complete #81 packet on 14 October 2026 in this conversation.                                                                                                |
| Test-first implementation           | Focused sign-in unit test failed for missing “Signing in…” before code, then passed after the change. Implementation is local and uncommitted.                                                                |
| Independent review                  | Separate read-only `/root/pending_feedback_review` run completed on 14 October 2026; [handoff](handoffs/independent-review.md) records two findings fixed and rechecked, with no unresolved blocking finding. |
| Student acceptance                  | Paul answered “Accept with recorded limits” on 15 October 2026 to the separate post-review #81 question in this conversation. Hosted latency and full accessibility testing remain pending. |
| Spec sync/archive/log/PR            | OVR-004 synced to canonical [product overview](../../specs/product-overview.md) v1.11 on 15 October 2026 before the complete packet moved to `workflow/archive/2026-10-14-pending-action-feedback/`. Both session summaries are linked above; commit, push and PR were authorized later as recorded below. |

## Risks and limits

Pending UI prevents ordinary accidental repeat activation only. Direct requests, race behavior and authorization must continue to rely on existing server/database controls. A loading state cannot reduce Vercel/SoCLaaS/Supabase latency. No hosted experiment or timed request measurement has occurred.

## Local implementation and checks

The root Codex execution read the approved packet and Next.js 16 forms guide, wrote `tests/unit/pending-action-forms.test.tsx`, and observed a behavior failure: the sign-in page still rendered “Sign in” rather than “Signing in…” under simulated pending form status (`node node_modules/vitest/vitest.mjs run tests/unit/pending-action-forms.test.tsx`, exit 1, one intended failure). An initial Playwright red attempt was blocked by stopped local Supabase (`ECONNREFUSED 127.0.0.1:54321`); that was setup failure, not behavior evidence. Paul said he would start Docker; engine and project containers became available.

`src/components/pending-submit-button.tsx` now uses the nearest form's React `useFormStatus` to show an action-specific pending label, visual spinner and screen-reader status while disabling its submit button. Auth, account-navigation and HR server-action forms use it. Existing Applicant and AI pending state remains unchanged. No server action, RLS, storage, schema, AI, role or secret path was edited. The existing `client-state-components` test initially failed because it inspected a direct `<button>` and was updated to check the shared pending control's labels; the new unit test verifies its actual disabled state under pending status.

| Check, environment                                                                                                                                                             | Result and limit                                                                                                                                                                  |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `node node_modules/vitest/vitest.mjs run`                                                                                                                                      | Passed, 69 files / 394 tests after updating the reset-form structural test.                                                                                                       |
| `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/pending-actions.spec.ts` against a separately running local Next dev server and local Supabase | Passed, 2 Chromium cases: delayed sign-in pending/disabled/retry and native no-JavaScript sign-in. Invalid native email remained idle; intercepted pending request count was one. |
| Same Playwright command with `tests/e2e/hr-job-management.spec.ts tests/e2e/hr-application-review.spec.ts tests/e2e/password-recovery.spec.ts`                                 | Passed, 4 Chromium cases covering HR job lifecycle, HR note/status review, and Applicant/HR password recovery.                                                                    |
| `node node_modules/typescript/bin/tsc --noEmit`                                                                                                                                | Passed.                                                                                                                                                                           |
| Scoped `node node_modules/eslint/bin/eslint.js ...` and `node node_modules/prettier/bin/prettier.cjs --check ...`                                                              | Passed after formatting affected source/tests/packet.                                                                                                                             |
| `node node_modules/next/dist/bin/next build`                                                                                                                                   | Passed production build and TypeScript.                                                                                                                                           |
| DB/SQL migration tests                                                                                                                                                         | N/A: no database or policy file changed.                                                                                                                                          |
| Hosted Vercel latency, full assistive-technology and cross-browser testing                                                                                                     | Not run; local Chromium and unit checks do not prove those conditions.                                                                                                            |

Final rerun after the reviewer fixes: 394/394 unit tests, typecheck, scoped lint and production build passed. The delayed HR note/browser test passed 1/1, and the pending sign-in/no-JavaScript cases passed 2/2. The reviewer independently reran 13 focused unit tests and `git diff --check`, both passing.

Initial Playwright run with its own dev-server process printed one passing test but did not exit cleanly, so it was interrupted and not counted as a pass. A separately launched dev server and rerun produced exit 0 for both pending-action scenarios. An idle sign-in auth-page unit test exposed an empty status element; the assertion was updated for the persistent, initially empty `role="status"` live region, then passed.

The independent read-only reviewer identified two evidence gaps. First, a status region inserted only after pending begins may not be announced reliably. A focused unit check failed for the missing idle region; the shared control now renders a persistent empty live region, and the focused suite passed 13/13 on reviewer recheck. Second, a unit mock with both HR buttons pending did not prove separate form ownership. A delayed-note browser scenario now confirms Add note disables while Update status stays enabled and that a repeat click on Add note does not issue a second POST. Its first run failed because the test removed its request route before resolution (`Route is already handled`); moving route removal until after the note appeared resolved the test, and the complete HR review scenario passed 1/1. The reviewer reran focused unit tests and `git diff --check`, found no remaining blocking source issue, and noted hosted latency, full assistive-technology and other individually delayed action checks as limits.

## Acceptance and canonical sync

Paul separately answered “Accept with recorded limits” to the post-review #81 question on 15 October 2026. The question named passing local checks and independent review, with hosted latency and full accessibility testing still pending. This is distinct from the 14 October implementation-plan approval.

The accepted OVR-004 normative clause and its success/failure scenarios were copied without intended behavior change from [packet delta](specs/product-overview.md) to the canonical [product overview](../../specs/product-overview.md). [ProductSpec](../../ProductSpec.md) and the [spec index](../../specs/README.md) moved from v1.10 to v1.11, dated 15 October 2026. The User Guide explains pending feedback and retry, and the Developer Guide points to v1.11. This sync precedes full-packet archive; it does not establish merge or hosted release.

## PR submission authorization

After acceptance, sync and archive, Paul explicitly requested “git commit push and create a pr” on 15 October 2026. This authorizes submission of the #81 branch to `develop`; it does not grant PR review, merge, deployment or release approval. The archived packet and both linked session summaries were complete before PR preparation. The unrelated untracked profile/résumé packet is outside the staged scope.
