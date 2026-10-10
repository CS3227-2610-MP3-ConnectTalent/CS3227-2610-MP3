# Record: required profile and phone (#52)

## Accepted closeout — 10 October 2026

Paul separately replied **“Accept with recorded limits”** to the #52 acceptance question after implementation, actual checks and independent review. This is distinct from “Approve plan and branch”. Accepted limits: hosted rollout, clean-reset rehearsal and full accessibility testing remain pending; exhaustive profile-edit concurrency is unverified. No commit/push/PR or hosted changes were authorized. #53 acceptance remains separate and pending.

Final [accepted-sync reconciliation](accepted-sync.md) implements the approved amendment, superseding the earlier unformatted-phone and incomplete-history exceptions. ProductSpec/spec index advance v1.6 → **v1.7**, 10 October 2026. Canonical accounts (ACC-001/005/006), public jobs (JOB-001/003) and applications (APP-005/006) were synced before archive; existing IDs retained and ACC-006 added. Earlier packet wording below is historical, not the final accepted contract. The whole packet moves to `workflow/archive/2026-10-10-required-applicant-profile/` with file/hash preservation evidence, while #53 stays active/unsynced.

[Closeout summary](../../../logs/2026-10-10-required-profile-closeout.md). Closeout performs static spec/ID/link/version/whitespace and archive checks only; no runtime behavior changes or application-suite rerun needed. Previous local passes remain implementation evidence, not new execution, CI, hosted deployment or release. No sync commit exists yet.

## Current implementation and approval — 10 October 2026

Paul replied **“Approve plan and branch”** to the concrete [onboarding amendment](onboarding-amendment.md), approving the stricter navigation/phone plan and `feat/52-required-applicant-profile` carrying existing work. Branch creation first failed on sandbox Git permissions, then succeeded with escalation. No commit, push, PR or hosted changes are authorized. Earlier deferred entries below are historical. Separate #52 and #53 acceptance remain pending; canonical v1.6 is unchanged.

Primary implementation covers ACC-001/006, JOB-001/003, APP-002/005/006 and their existing SEC boundaries: required profile validation, country dropdown/normalization, derived readiness, Auth callback/sign-in, navigation/proxy/page/action/SQL gates, new-form autofill and helper-copy removal. Profile/file/recovery/sign-out exceptions preserve secure onboarding. Contact/PDF AI exclusions remain. Guest jobs and HR are unaffected by Applicant readiness. Existing submitted fields are not backfilled.

### Observed local evidence

All checks use synthetic fixtures and local Supabase, not hosted projects. The CLI-created migration `20261010084617_required_applicant_profile.sql` was applied locally via migration up. A later revision-only guard correction was applied locally with CREATE OR REPLACE, matching the final migration source; this is not a clean-reset rehearsal.

| Check | Actual result and limits |
| --- | --- |
| `corepack pnpm test:unit` | Passed 155 tests /29 files; initial intended validation failures and outdated fixture failures were fixed/rechecked. |
| `corepack pnpm exec supabase test db` | Final pass: 354 checks /11 files, including 23 required-profile cases. Initial intended missing-profile validation failures observed. Same-content draft save initially bypassed readiness; revision check fixed it. Direct draft phone format parity initially failed; the guard now rejects malformed new/draft phones, retaining null drafts. An older new-draft fixture used 555; corrected to a normalized phone. Reviewer found unchanged legacy submitted phone could block withdrawal; three assertions reproduced/verified the correction. Initial fixture attempts omitted job_title or used the wrong withdrawal signature; corrected before observing intended failures. |
| `tests/e2e/required-profile.spec.ts` via Playwright | Passed 1 real signup/Mailpit verification flow: profile-only URLs/navigation/AI denial, optional profile PDF before completion, country code/number save, prefill/re-login, mobile/desktop layout. Initial timeouts traced to runtime country-label hydration differences and ambiguous label association; fixed with checked-in labels and explicit label/select association. |
| Playwright `profile-resume.spec.ts`, `resume-first-profile.spec.ts`, `application-withdrawal.spec.ts` | Passed 3 end-to-end regressions, including HR/other-owner PDF denial, retained withdrawal and unsaved-field preservation. New fixtures initially tried service-role table insertion, denied by private check-function privileges; corrected to the supported authenticated profile RPC without broadening grants. |
| `node tests/integration/resume-first-profile-races.mjs` | Passed 3 races with actual lock waits. |
| `node tests/integration/profile-resume-races.mjs` | Passed 4 races with actual lock waits. |
| `node tests/integration/application-withdrawal-races.mjs` | Passed 4 races with actual lock waits. |
| `corepack pnpm typecheck` | Passed on final source. |
| `corepack pnpm exec eslint` on changed onboarding modules and browser/unit tests | Passed; this is scoped lint, not a full repository lint claim. |
| `corepack pnpm build` | Passed; all pages/routes compiled. Build does not establish hosted behavior. |

Existing SQL/browser/race fixtures now explicitly complete synthetic profiles when testing post-onboarding workflows. Legacy SQL fixtures disable only the new guard during setup, re-enable it immediately, and roll back; product code does not disable guards. No local reset, hosted migration or provider calls were performed for #52. Clean-reset, hosted preview, full accessibility and exhaustive profile-edit concurrency coverage remain pending.

[Implementation handoff](handoffs/implementation.md), [independent review](handoffs/independent-review.md), [implementation/session summary](../../../logs/2026-10-10-required-profile-implementation.md). Separate reviewer `/root/application_withdrawal_review` initially reproduced 22 focused unit tests, later 44 tests/5 files and checked 245 country entries. Approval/evidence wording was corrected. Its medium legacy-withdrawal finding was reproduced, fixed and independently re-reviewed; no unresolved blocking finding remains. Final scoped lint/typecheck/build passed, 33 packet/log relative links passed before final handoff creation, and git diff --check passed. Runtime checks remain implementer evidence unless explicitly independently reproduced. Student #52/#53 acceptance is pending; canonical sync/archive/publication are not authorized by review.

## Amended scope awaiting approval — 10 October 2026

Paul now requests required name/email/phone, country-code dropdown, profile-only onboarding navigation, new-application autofill and helper-copy removal. [Concrete amendment](onboarding-amendment.md) supersedes the earlier unformatted-phone and retained-history access exceptions. Earlier approval remains historical, not approval of this expansion. Amended implementation/branch authorization pending; canonical v1.6 unchanged. #53 separately unaccepted. No source/schema edits or Git/hosted operations in this preparation.

Paul Cheng, 2026-10-10; concrete packet approved, branch permission pending and implementation deferred by user's résumé-first priority. [Issue52](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/52). Prepared on feat/49-50-application-form-withdrawal, canonical v1.5; existing accepted uncommitted work preserved. [Proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).

Paul asked for required name/email/phone and profile completion after signup before seeing open roles. Source inspection confirmed optional saved name/phone, required submitted name only, current trusted verified email and no completion gate. Proposed interpretation retains guest browsing, gates signed-in Applicants and preserves own existing-history/withdrawal reads; the approval question must explicitly present this interpretation.

Primary used intake/spec/planning guidance and git/source/gh reads. First lookup used an incorrect plural profile-module path; corrected to actual applicant-profile.ts. First gh read failed on sandbox network proxy; escalated issue listing/create succeeded. Actual issue52 created via structured body file. No product code, tests or SQL changed; no new branch created. No actual independent reviewer/test run for this proposal. Canonical unchanged; no student approval/acceptance inferred. No secrets/private data copied.

[Intake summary](../../../logs/2026-10-10-required-profile-intake.md). Static preparation checks reported after execution. All runtime checks are N/A at proposal stage. Need concrete approval and branch permission before implementation under AGENTS.md/standing branch rule. No commit/push/PR/hosted action authorized.

Preparation checks: 26 local links passed across eight packet files and intake summary (anchors not checked); `git diff --check` passed with existing Git newline-normalization notices. The runtime diff remains the prior accepted #49/#50 implementation, not #52 coding. Canonical v1.5 unchanged.

## Approval and priority steering (2026-10-10)

Paul replied “Approve as written” to the question naming proposal, three deltas, design and plan, including preserved guest browsing. This records concrete implementation approval for #52, separately from future acceptance. In the branch-permission answer he instead asked to fix résumé upload before Save draft, move it after work experience/before AI, and add optional profile résumés. That is priority steering, not branch permission. #52 implementation waits while the new résumé packet is prepared; no code/schema or canonical changes. Profile résumé rules may need to be reconciled into this packet before later implementation, with affected policy changes returned to approval. #52 approval does not approve the new résumé design.

## Combined submission preparation — 10 October 2026

Paul requested add/commit and PR creation and chose one combined PR for #49/#50/#52/#53. Product/tests/migrations committed as ad20725 on feat/52-required-applicant-profile. Final canonical baseline v1.8 incorporates separately accepted #53 and #52 without reverting onboarding. [Combined submission summary](../../../logs/2026-10-10-combined-applications-submission.md) records authorization, static checks and preserved limits. Docs/evidence commit and authorized push/PR follow; no merge, hosted migration or release implied. Prior pending/publication statements remain historical snapshots.
