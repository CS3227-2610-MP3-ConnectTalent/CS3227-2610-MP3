# Record: résumé upload before Save draft and private profile résumé (#53)

## Accepted closeout and submission authorization — 10 October 2026

Paul separately replied **“Accept with recorded limits”** to #53's concrete acceptance question. Local checks and independent review passed; hosted rollout, clean-reset and full accessibility remain pending. This is distinct from the earlier “Approve plan and create branch”. He also chose **“One combined PR”** for #49/#50/#52/#53 after explicitly requesting git add/commit and PR creation; the existing feat/52-required-applicant-profile branch carries the combined work. No hosted changes/merge/release authorized.

APP-006/007 and SEC-009 accepted additions were synced to canonical **v1.8**, 10 October 2026, preserving v1.7 required name/phone and strict ACC-006 onboarding. Older full-clause deltas remain historical bases, not permission to revert accepted #52. Profile-file exceptions remain authenticated, optional and independent of profile text completion. ProductSpec/spec index updated before complete archive at workflow/archive/2026-10-10-unsaved-profile-resume/. Existing IDs retained; no new IDs. No sync commit exists at this closeout stage.

The final combined revision's #52 record supplies superseding local evidence: 155 unit tests, 354 SQL checks, four browser flows and eleven races passed, plus typecheck/scoped lint/build; these are actual prior executions, not a new closeout rerun. The [independent #53 review](handoffs/independent-review.md) and final #52 review preserve separate execution and findings resolution. Best-effort file cleanup/manual tombstones, exhaustive concurrency and hosted/clean-reset/accessibility limits remain. [Closeout/submission summary](../../../logs/2026-10-10-combined-applications-submission.md) records static/archive checks and actual publication state. Earlier pending entries below are historical.

Paul Cheng; 2026-10-10; proposal prepared, concrete approval/new branch permission pending. [Issue53](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/53). [Proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md). Preparation on feat/49-50-application-form-withdrawal; v1.5 canonical unchanged, accepted uncommitted work preserved.

Paul approved #52 as written but answered its branch-permission question by prioritizing immediate résumé upload, section placement and optional profile files. Record #52 approval separately; do not treat the steering answer as branch permission or approval of this new concrete design. Current source requires application-ID FK/revision and saved draft; profile files are absent. Proposed first upload creates an internal private draft only for the file and preserves unsaved text, with no submission. Profile file copying is explicit and creates an independent snapshot.

Primary read actual components/pages/services/API/SQL definitions and used intake/proposal/design guidance in one execution. Created actual issue53 via body file. No source/test/SQL implementation, separate agent execution, canonical sync, new branch, commit/push/PR or hosted operation. Runtime tests N/A for preparation. [Dated summary](../../../logs/2026-10-10-resume-first-profile-intake.md) captures available interactions. Static checks recorded after execution; human personal verification of summary pending.

Preparation checks: 19 local targets passed across the complete seven-file packet plus intake summary (anchors not checked); `git diff --check` passed with existing newline-normalization notices. Branch remains feat/49-50-application-form-withdrawal. New feature code has not started; current source diff is the already accepted #49/#50 work.

## Concrete approval and implementation start (2026-10-10)

Paul replied “Approve plan and create branch” to the question naming the proposal, two deltas, design/plan, internal private record without typed-field saving, inline placement, optional profile PDF and explicit snapshot reuse (1 MiB). This approves the concrete packet and feat/53-unsaved-profile-resume carrying existing uncommitted work; no commit/push/PR/hosted operation inferred. Initial sandbox branch creation was denied by filesystem permissions; approved escalated retry used. Primary applies implementer/TDD and Supabase/Postgres guidance. #52 remains deferred.

## Implementation and review complete; acceptance pending

Current branch feat/53-unsaved-profile-resume; preparation statements above describe earlier stages. CLI-created migration 20261010080649 was applied locally through migration up; no hosted operation or reset. New private profile routes/lifecycle and first-upload allocation preserve unsaved fields, use independent file snapshots and enforce PDF/owner/freeze boundaries. [Implementation summary](../../../logs/2026-10-10-resume-first-profile-implementation.md) records actual failures/corrections and commands; [independent review](handoffs/independent-review.md) records separate execution and final follow-up.

| Check | Actual result and limits |
| --- | --- |
| Test-first composition/presence | Two unit composition and four SQL presence checks failed before implementation, then passed. |
| corepack pnpm test:unit | Passed: 150 tests, 28 files. Sandbox spawn failed first; escalated runner passed. |
| corepack pnpm exec supabase test db --local | Passed: 331 checks, 10 files; older counts scoped to their fixtures after local data caused global-count failures. |
| Browser profile/resume, withdrawal, resume-first-profile | All three local synthetic workflows passed, with direct upload before Save, invalid-no-draft, preserved typing, private profile, independent copy, repeated same-page Save/Submit and retained withdrawal. Corrections and rechecks in summary. |
| node tests/integration/profile-resume-races.mjs | Passed four existing attachment cases with observed lock waits. |
| node tests/integration/resume-first-profile-races.mjs | Passed three new first-upload/profile lifecycle cases with observed lock waits; corrected expected-error assertion first. |
| corepack pnpm typecheck; scoped eslint; corepack pnpm build | Passed. Final additional test lint passed with no warnings; all three upload routes traced. |
| Independent review | Separate reviewer ran 14 focused unit tests; source/trace/final whitespace inspection. No unresolved blocking finding. |
| git diff --check | Passed after EOF cleanup. |
| Hosted, clean-reset, full accessibility | Not run; separately recorded release limits. Exhaustive race permutations not claimed. |

Student acceptance remains pending. Canonical requirements remain v1.5; #53 is not yet synced/archived. #52 remains deferred and is not implemented. No commit/push/PR or deployment performed. Best-effort cleanup retains tracked tombstones/manual recovery; no malware scanning or scheduled sweeper claim.

## Combined submission preparation — 10 October 2026

Paul requested add/commit and PR creation and chose one combined PR for #49/#50/#52/#53. Product/tests/migrations committed as ad20725 on feat/52-required-applicant-profile. Final canonical baseline v1.8 incorporates separately accepted #53 and #52 without reverting onboarding. [Combined submission summary](../../../logs/2026-10-10-combined-applications-submission.md) records authorization, static checks and preserved limits. Docs/evidence commit and authorized push/PR follow; no merge, hosted migration or release implied. Prior pending/publication statements remain historical snapshots.
