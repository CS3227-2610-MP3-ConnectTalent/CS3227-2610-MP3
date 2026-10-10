# Record: application form and withdrawal

Owner Paul Cheng; 2026-10-10; locally accepted with recorded limits, canonical v1.5 synced before complete archive. Issues [#49](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/49), [#50](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/50). Branch feat/49-50-application-form-withdrawal from updated develop24b1da8. [Proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).

## Intake snapshot (before approval)

Paul requested résumé button styling, removal of permanent interrupted-upload control and duplicate link, AI within form, and status/view/withdraw with retained data, explicitly requesting a new branch. Source confirms UI layout and standalone nested-form risk; application list already has status/detail links. No withdrawal feature exists. PR45/46/48 are merged per GitHub checks. Updated develop fast-forward was already current. Untracked old #44 proposal preserved, excluded from this work.

Primary used intake/spec/planning skills, git/gh read-only checks, created issues49/50 and authorized branch, then drafted this packet. One execution applying several skills; no separate reviewer/test run yet. Runtime/schema/product changes not made. No credentials/private data accessed. Canonical v1.4 unchanged. Proposed recovery and withdrawal rules await concrete approval; a request to make changes is not the recorded approval of this finished packet required by AGENTS.md.

[Session summary](../../../logs/2026-10-10-application-form-withdrawal-intake.md). Link/whitespace checks recorded after execution. No commit/push/PR/hosted authorization or result claimed. Independent review, separate acceptance and archive remain pending.

Preparation static check: first check found four copied canonical links needing destination-relative paths; corrected all copied canonical links and rerun passed (41 local targets, complete8-file proposal packet). git diff whitespace check passed. No runtime/schema checks run (proposal stage); no acceptance results claimed.

## Concrete approval (2026-10-10)

Paul replied “Approve as written” to the question naming #49/#50 proposal, three deltas, design and plan, including terminal confirmed withdrawal, retained HR history, no undo/reapply and safe upload recovery. This is the pre-implementation gate; independent review and separate acceptance remain later gates. Branch already explicitly authorized. No commit/push/PR/hosted authorization inferred. Primary applies implementer/TDD and Supabase/Postgres guidance; installed Next form/route guides read. Docker started by Paul; local containers confirmed. Supabase CLI created additive migration20261010072354_application_form_withdrawal.sql.

## Implementation and acceptance evidence (2026-10-10)

Primary Codex implemented T01–05 on the uncommitted working tree based on 24b1da8. One primary execution used several skills; those skills are not separate agents. SQL was applied only to local Docker Supabase. The independent reviewer below made no implementation edits. [Implementation session](../../../logs/2026-10-10-application-form-withdrawal-implementation.md) records actual red/green runs, failures and limits.

| Acceptance / check | Actual command or evidence | Result and limits |
| --- | --- | --- |
| AC01–03 form/upload/AI | Focused unit suites; [browser flow](../../../tests/e2e/application-withdrawal.spec.ts); existing profile-resume browser regression | Passed: one main application form, AI fills without writes, saved-draft guidance, real PDF upload/replacement, stale pending recovery retains text/file, no permanent cancel or duplicate link. Provider mocked; no hosted test. Existing profile regression includes invalid PDF and frozen-file controls. |
| AC04/05/07 withdrawal | [42 focused SQL assertions](../../../supabase/tests/database/application_withdrawal.test.sql), [action tests](../../../tests/unit/application-withdrawal-action.test.ts), local browser | Passed: confirmed owner submission, closure allowed, cancel does nothing, immutable actor/time and retained records, idempotency/lost-response reconciliation, draft/nonowner/anonymous/unverified/HR denial. |
| AC06 HR/AI | SQL note/status/quota/requirements guards; `tests/unit/ai-routes.test.ts`; Applicant/HR browser flow | Passed: retained HR notes/downloads, hidden processing controls, DB denial, no provider for unavailable withdrawn record, response eligibility recheck after in-flight generation. External requests already dispatched cannot be recalled. |
| AC07 races | `node tests/integration/application-withdrawal-races.mjs` | Passed four cases with observed lock waits: both note/withdraw and status/withdraw orderings; retained winning events. This does not prove every possible distributed interleaving. |
| AC08 layout/focus | Browser at 390/1440 px, keyboard focus/Enter confirmation and cancel | Passed final focused browser rerun (1 case). Full assistive-technology audit pending. |
| Unit regression | `corepack pnpm test:unit` | Passed 148 tests / 27 files. Earlier final run passed 147 before the added no-provider case. |
| Database regression | `corepack pnpm exec supabase test db --local` | Passed 296 assertions / 9 files, including 42 new checks. Transactional tests; no database reset. |
| Browser regression | `corepack pnpm exec playwright test tests/e2e/application-withdrawal.spec.ts tests/e2e/profile-resume.spec.ts tests/e2e/account-navigation.spec.ts` with local process settings | Initial run: profile and navigation passed, withdrawal failed because test counted global sign-out form. Scoped to main. Next run observed genuine Retry-after-success defect; fixed and focused workflow passed. Final focused keyboard result recorded below/session. No claim of one all-green combined run. |
| Typecheck, scoped lint, build | `corepack pnpm typecheck`; ESLint on changed/new src/tests; `corepack pnpm build` | Passed. Build establishes compilation, not deployment. |
| Independent verification | [Handoff](handoffs/independent-review.md) | Separate `/root/application_withdrawal_review`, readonly security_privacy_reviewer. Independently ran 20 unit tests / 4 files and whitespace check; source reviewed SQL/permissions/retry/AI. LOW Retry visibility finding fixed and source rechecked; no unresolved blocking finding. DB/browser/races are implementer evidence. |

TDD evidence: form/retry/AI focused run failed four intended behaviors then passed 16; withdrawal action placeholder failed three intended cases then passed 21 across five focused files; four initial migration-presence checks failed then passed after migration. An invalid one-requirement AI fixture and missing pgTAP extension were harness failures, corrected before recording intended red evidence. Browser Retry expected 0/received 1 after successful upload established reviewer regression before its fix. See session for commands and sequence.

## Documentation, risks and remaining gates

[User Guide](../../../docs/UserGuide.md) and [Developer Guide](../../../docs/DeveloperGuide.md) explain actual local behavior and pending release. Retained withdrawal metadata is the minimal immutable event (application/actor/time); no separate content audit record is added. No private data/PDF/notes are added to AI inputs. Existing cancellation endpoint stays for compatibility; permanent UI control is removed. Cleanup retains deleting tombstones/manual recovery, with no scheduled sweeper. Withdrawal is not erasure.

Hosted migration/preview testing, clean-reset migration rehearsal and full accessibility audit are Not run. No hosted configuration, provider call, deployment or release occurred. Rollout: reviewed additive migration/guards before UI, Development preview smoke then separate release decision. Rollback retains all data and withdrawal guards; older UI may mislabel history or offer rejected actions, so assess compatibility before rollback. No global soft-delete behavior introduced.

Separate Paul acceptance remains pending. Canonical remains v1.4; no sync/archive until acceptance. No commit, push or PR authorization/result claimed. Preserve the unrelated untracked legacy #44 packet. Student verification of AI-authored summaries remains pending.

Final evidence preparation: local link check passed136 targets across this packet, both guides and implementation summary (heading anchors not checked); `git diff --check` passed. Scoped lint rechecked the final AI/browser test edits and passed. Branch verified feat/49-50-application-form-withdrawal. Final browser keyboard rerun passed1 case; together with earlier profile/navigation passes this covers three distinct browser workflows across the documented runs.

## Separate acceptance, canonical sync and archive (2026-10-10)

Paul replied **“Accept with recorded limits”** to the separate question presenting the implemented UI/résumé/terminal withdrawal behavior, 148 unit tests, 296 database checks, four race cases, browser/build/independent review results and the outstanding hosted rollout, clean-reset rehearsal and full accessibility audit. This is separate from his earlier implementation approval and explicitly authorizes spec sync/archive only. It does not authorize commit, push, PR or hosted operations. No personal verification of the AI-authored session summaries is inferred.

Accepted clauses synced to [applications-and-review.md](../../specs/applications-and-review.md) (APP-002/003/007 modified, APP-008 added), [security-and-privacy.md](../../specs/security-and-privacy.md) (SEC-001) and [hr-ai-summary.md](../../specs/hr-ai-summary.md) (AIS-001). [ProductSpec](../../ProductSpec.md) and [spec index](../../specs/README.md) advanced to v1.5, 10 October 2026. Existing AID-002 behavior was restored without adding a new requirement. Direct normalized clause comparison passed all six IDs, including exact APP-008 body and uniqueness, before archive. No sync commit exists: all changes remain uncommitted.

Complete packet destination: `workflow/archive/2026-10-10-application-form-withdrawal/`, including proposal/design/plan/tasks/record, three deltas and actual independent handoff. Same-depth move preserves relative evidence paths; current navigation repaired and final manifest/link checks recorded in [closeout summary](../../../logs/2026-10-10-application-form-withdrawal-closeout.md). Historical preparation/implementation statements above remain snapshots; this later decision supersedes their pending acceptance state. Hosted and operational limits remain unchanged. No merge, deployment or release claim.

Archive verification: nine files preserved with matching before/after SHA256 hashes at move time. Final link check passed372 local targets across packet, canonical specs/indexes, both guides and all three session summaries (anchors not checked); `git diff --check` passed. Later archive status annotations do not change accepted before/after clauses. No fresh application suite was necessary for this docs/spec-sync closeout; previous runtime results remain dated implementation evidence.

## Local setup follow-up (2026-10-10)

Paul's migration-up error exposed missing history records after prior direct SQL testing. Verified existing local schema and reran all296 DB checks successfully, then repaired only local versions20261009230000 and20261010072354 as applied. The original `migration up --local` command now succeeds with no pending migration. [Follow-up summary](../../../logs/2026-10-10-local-migration-history-repair.md) records cause, actual commands and limits. No schema rewrite/reset/hosted action or product-spec change; no commit/push/PR. This does not satisfy the pending clean-reset rehearsal or hosted validation.

## Combined submission preparation — 10 October 2026

Paul requested add/commit and PR creation and chose one combined PR for #49/#50/#52/#53. Product/tests/migrations committed as ad20725 on feat/52-required-applicant-profile. Final canonical baseline v1.8 incorporates separately accepted #53 and #52 without reverting onboarding. [Combined submission summary](../../../logs/2026-10-10-combined-applications-submission.md) records authorization, static checks and preserved limits. Docs/evidence commit and authorized push/PR follow; no merge, hosted migration or release implied. Prior pending/publication statements remain historical snapshots.
