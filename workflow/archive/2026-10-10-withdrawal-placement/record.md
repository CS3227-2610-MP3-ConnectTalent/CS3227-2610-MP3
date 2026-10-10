# Record: withdrawal placement (#50 follow-up)

2026-10-10; Paul Cheng; proposal prepared, implementation approval pending. [Proposal](proposal.md), [design/plan](plan.md), [issue #50](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/50).

Source inspection confirms WithdrawalControl is rendered on My applications and inside application detail. Paul's correction specifies detail-only placement. Primary used intake/proposal guidance; no separate agent execution, code edits, runtime checks, acceptance, canonical sync or hosted actions in this preparation. #53 acceptance remains independently pending; #52 deferred.

Tasks: approval → focused browser red → remove list control → focused green/lint/typecheck → separate review → guide/log and separate acceptance → accepted sync/archive. Existing accepted #49/#50 and implemented #53 work must be preserved.

## Approval and implementation

Paul replied “Approve correction” to the question naming the concrete proposal/design omission/plan on 10 October 2026. Current branch retained; no new branch or Git publication authorized. The focused browser regression failed at the submitted list assertion: expected zero Withdraw application buttons, received one. Removed only the list WithdrawalControl import/render; retained the individual detail control and existing backend policies. Guide clarified View → detail → confirmed withdrawal. Canonical sync/archive and student acceptance remain pending; original preparation statements above describe that earlier stage.

## Checks and review

- `corepack pnpm exec playwright test tests/e2e/application-withdrawal.spec.ts`: failed intended list assertion before repair; after repair one passed (40.2 seconds total). Local synthetic fixtures, correct detail navigation, cancel/confirm, closed-job withdrawal, retained files/history and HR processing/privacy checks.
- `corepack pnpm typecheck`: passed.
- `corepack pnpm exec eslint src/app/applications/page.tsx tests/e2e/application-withdrawal.spec.ts`: passed.
- `git diff --check`: passed (newline-normalization notices only).
- [Independent review](independent-review.md): separate read-only execution, no findings. Runtime checks by implementer; reviewer source/whitespace check.
- Database/build reruns: N/A for this small render-only removal; no SQL/action/dependency changes. Hosted checks: not run.

[Dated summary](../../../logs/2026-10-10-withdrawal-placement.md). Implementation and review complete; student acceptance pending. No canonical sync/archive, commits, pushes or PRs yet. #53 acceptance remains separately pending; #52 deferred.

## Accepted closeout — 10 October 2026

Paul replied “Accept correction” to the separate acceptance question identifying the detail-only behavior, actual passed browser/typecheck/lint/review evidence and pending hosted testing. This is distinct from “Approve correction” before implementation. APP-008 placement synced to applications-and-review.md, ProductSpec and specs index at canonical v1.6 on 10 October 2026, before archiving the complete four-file packet to workflow/archive/2026-10-10-withdrawal-placement/. No sync commit exists; Git publication remains unauthorized.

Historical pending-stage statements above remain as chronology. Current state: accepted, synced, archived; hosted testing pending. #53 acceptance remains separately pending; no #53 delta synced. #52 deferred. [Acceptance closeout summary](../../../logs/2026-10-10-withdrawal-placement-closeout.md). Static closeout/link and preservation checks recorded after execution; application checks reused from this unchanged correction rather than rerun for documentation-only closeout.

Closeout checks passed: canonical APP-008 placement clause confirmed; all four packet files matched pre-move SHA256 hashes immediately after archive; 10 local links across packet and two session logs resolve (anchors not checked); git diff --check passed. Archive path stayed within the verified workspace. Current navigation updated; historical preparation/pending statements retained as chronology.

## Combined submission preparation — 10 October 2026

Paul requested add/commit and PR creation and chose one combined PR for #49/#50/#52/#53. Product/tests/migrations committed as ad20725 on feat/52-required-applicant-profile. Final canonical baseline v1.8 incorporates separately accepted #53 and #52 without reverting onboarding. [Combined submission summary](../../../logs/2026-10-10-combined-applications-submission.md) records authorization, static checks and preserved limits. Docs/evidence commit and authorized push/PR follow; no merge, hosted migration or release implied. Prior pending/publication statements remain historical snapshots.
