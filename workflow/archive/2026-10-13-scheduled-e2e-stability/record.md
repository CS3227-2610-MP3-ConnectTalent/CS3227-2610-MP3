# Feature record: scheduled full Playwright suite stability

Status: PR #73 is open; the issue-specific E2E correction and review responses are committed. A hosted scheduled rerun remains follow-up evidence.

Owner: Johnwz123; scope and ownership approved by the user on 2026-10-13.

Spec version: 1.9 — [ProductSpec](../../ProductSpec.md)
Date: 2026-10-13

## Metadata and artifact links

- Change ID/classification: `2026-10-13-scheduled-e2e-stability`; CI test-maintenance defect.
- GitHub issues: [#71](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/71); related accepted CI contract [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/55).
- Branch/commits/PR: `fix/71-72-ci-workflows`; PR [#73](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/73) is open. The E2E repair is in its own issue-focused commit.
- Proposal: [proposal.md](proposal.md).
- Design: no product design delta. The client form has a non-user-facing `data-hydrated` marker so E2E waits for event handlers before replacing its controlled value; this changes no visible behavior, authorization, data flow, schema, or workflow architecture.
- Deltas: none; no product behavior changes.
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Baseline: ProductSpec v1.9 dated 2026-10-13; `develop` commit `e1115a06a8798b5ddc23cf3d6c267dd4e1176297`.
- Archive path: [workflow/archive/2026-10-13-scheduled-e2e-stability](../../archive/2026-10-13-scheduled-e2e-stability); complete packet archived 2026-10-13 after local browser criteria passed. Hosted scheduled confirmation remains pending.

## Approval checklist

- [x] Issue #71 is linked, assigned to Johnwz123, and approved for implementation by the accountable user on 2026-10-13.
- [x] Human approval of proposal, design omission, and plan before implementation.
- [x] Selector and hydration-readiness test support are complete.
- [x] Focused and full-suite local browser evidence; final review-corrected run passed 20/20 on local Supabase with synthetic fixtures.
- [x] Independent review and student acceptance of the bounded implementation; reviewer limits are recorded below.
- [x] Dated summary and pre-PR closeout; guide updates are N/A for test-only work.
- [x] Complete packet archived after acceptance; product sync is N/A because this is test-only. Hosted scheduled confirmation remains follow-up evidence.

## Requirement and acceptance criteria

See [proposal.md](proposal.md#acceptance-evidence-and-artifacts) for SCHED-AC-01 through SCHED-AC-03. These restore the scheduled full-suite outcome expected by issue #55 acceptance criterion 4. No canonical product requirement is changed.

## Agent handoffs

Implementation assignment: [T01-T03 implementer handoff](handoffs/T01-implementer.md). Separate independent review: [T04 reviewer handoff](handoffs/T04-independent-review.md).

## Implementation and tests

Changed files: `playwright.config.ts`, `src/components/application-form.tsx`, `tests/e2e/support/profile-resume-upload.ts`, `tests/e2e/support/resume-first-profile-journey.ts`, and `tests/e2e/applicant-applications.spec.ts`. The invalid-PDF assertions filter the `status` role by exact résumé validation text, so they preserve the live-region assertion while excluding unrelated save statuses. The application form exposes a hydration marker through separate server/client snapshots; the submitted-letter test waits for that signal, uses `fill()` to replace the saved draft, and verifies the exact submitted letter. Playwright assertions use a 20-second default after trace evidence showed multiple local server actions completing between five and seven seconds.

Docker was available for local verification. The first focused run failed in later save/upload waits at the default five-second expectation timeout; traces showed local POST requests taking longer. A temporary diagnostic timeout of 20 seconds passed both specs and was not retained. An early full run then hit a Turbopack process panic after tests 1–14. After clearing generated Turbopack cache, the focused resume/profile command passed 2/2 and `pnpm test:e2e` passed 20/20 in approximately 5.9 minutes with no skips. The PR review response now waits for the form hydration signal before filling the saved draft; the updated Applicant scenario passed 1/1 after this correction. Full-suite verification with the local-only test variable is recorded in the [issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md).

PR review verification: two initial full reruns exposed default five-second assertions timing out while synthetic Applicant forms still showed a saving status. Trace evidence showed local save/upload requests completing after roughly five to seven seconds. After setting the Playwright assertion default to 20 seconds, the final full `pnpm test:e2e` run passed 20/20 in 10.3 minutes with no skips. The local service-role value was passed only to the test process; see the [issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md).

Observed hosted evidence:

- [Supabase CI scheduled run #55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38223999064), commit `84761e1`: database and integration jobs passed; full Playwright job failed with two repeated strict-mode errors and one submitted-letter assertion that passed on retry.
- [Supabase CI push run #65](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38365592473), commit `e1115a0`: database, integration, and PR-critical browser jobs passed; the complete scheduled/manual browser step was skipped.

Security/adversarial cases: current scope uses local synthetic fixtures only. No hosted Supabase project, secret-bearing environment file, or real applicant data was accessed. The separate reviewer run passed 9 tests and skipped 11 because the local service-role test variable was unavailable; the reviewer did not inspect any secret file and accepts the separate 20/20 implementer run as evidence.

Known limitations: the submitted-letter behavior was reproduced locally in a trace before the hydration wait: after `.fill("Original submitted letter")`, the controlled textarea and form body contained `Original submitted letterFirst saved draft`. That observation supports the test-readiness race hypothesis; the application data initialization itself was not changed. The generated trace file was not committed; its sanitized diagnostic observation is retained in the issue-specific closeout. A hosted scheduled full-suite run after integration remains pending.

## Review and decision

Reviewer findings and fixes: PR #73 review requested retaining the live-region role, waiting for hydration before replacement input, and avoiding `Control+A`. Assertions now filter `getByRole("status")` by the exact validation text; the submitted-letter test waits for `data-hydrated="true"` and uses cross-platform Playwright `fill()` instead of a keyboard chord. The 20-second assertion default full-suite run passed 20/20; after a lint-driven change from an effect-based marker to `useSyncExternalStore` snapshots, the marker-dependent Applicant file passed 3/3. The separate reviewer’s earlier run had 9 passed and 11 fixture/service-condition skips because `TEST_SUPABASE_SERVICE_ROLE_KEY` was unavailable; that run preceded the hydration marker. The reviewer had accepted the earlier implementer 20/20 run but did not independently reproduce it or inspect the trace. See the [review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md).

Human decisions and date: Johnwz123 approved the original proposal and plan on 2026-10-13, accepted the reviewed bounded implementation, and later authorized Playwright plus conditional archive, commit, push, and PR submission. In this turn the user authorized addressing PR review feedback and committing/pushing the fixes. The test-readiness marker is non-user-facing; the issue-specific code remains a test correction. PR #73 is open; a future hosted scheduled run remains integration evidence.

Guide/reflection updates: N/A for the test-only readiness marker and assertion timeout. The [issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md) records the full chronology and current PR state.

## Session evidence index

| Date / session              | Summary log link                                                                  | Work / prompts / decisions covered                                                      | Verification status / missing coverage                                                                                                      |
| --------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-13 / intake and implementation | [Issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md) | Records hosted evidence, approved scope, local reproduction, test changes, and review responses. | Historical hosted strict-mode failure; local focused and full runs passed before the review correction. |
| 2026-10-13 / independent review | [T04 independent review](handoffs/T04-independent-review.md) | Separate test-engineer review of selectors, submitted-letter test, and suite evidence. | Reviewer run was 9 passed/11 skipped; later hydration-corrected Applicant test passed 1/1. |
| 2026-10-13 / PR review response | [Issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md) | Applied the review comments, bounded E2E assertion waits, hydration-ready fill, and live-region assertions. | Full suite passed 20/20; after the lint-driven marker refactor, the Applicant file passed 3/3. Hosted scheduled confirmation remains pending. |

## Canonical sync and archive

- Accepted delta/human decision: bounded test-selector change accepted by Johnwz123 on 2026-10-13; no product delta.
- Canonical sync: expected N/A for test-only work.
- Archive decision/date/path: complete packet archived on 2026-10-13 at `workflow/archive/2026-10-13-scheduled-e2e-stability/` after local acceptance; product sync N/A.
- Outstanding work: observe a hosted scheduled full-suite run after integration. No application behavior or schema change is part of this packet.
