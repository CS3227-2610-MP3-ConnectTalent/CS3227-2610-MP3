# Tasks: scheduled full Playwright suite stability

- Change/issues: `2026-10-13-scheduled-e2e-stability`; [#71](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/71), related #55
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: local focused/full browser verification passed; accepted for PR submission with hosted scheduled confirmation pending; Johnwz123

## Before implementation

- [x] T00 — Student owner approved the proposal, design omission, and plan. Evidence: explicit decision/date/source recorded in `record.md`.

## Ordered implementation

- [x] T01 — Hosted run #55 provides the exact reproduction evidence for the historical strict-mode failure. The initial local attempt could not start because Docker was unavailable, and later focused runs did not reproduce that exact strict-mode failure.
- [x] T02 — Updated all three invalid-PDF helper assertions to target the exact validation notice. The default-timeout focused specs passed 2/2 on the final run.
- [x] T03 — Started the disposable local Supabase stack with synthetic fixtures. After a trace reproduced the submitted-letter stale-draft issue, added a non-user-facing hydration-ready marker and a bounded 20-second Playwright assertion default after traces showed server actions completing just beyond five seconds. Final `pnpm test:e2e` passed 20/20 in 10.3 minutes with no skips; the test-only service-role value stayed in the test process environment. See the [issue-specific review closeout](../../../logs/2026-10-13-scheduled-e2e-closeout.md).

## Review and closeout

- [x] T04 — Separate `test_engineer` execution `/root/review_ci_workflows` found no source defect. Its own run was 9 passed/11 skipped because the service-role test variable was unavailable; the changed submitted-letter test passed. The reviewer accepts the separate implementer 20/20 run as evidence but did not independently reproduce it. See [review handoff](handoffs/T04-independent-review.md).
- [x] T05 — Johnwz123 accepted the bounded selector implementation and authorized archive/commit/push/PR after the final Playwright run passed. Product sync is N/A; the complete packet is archived. A hosted scheduled run remains follow-up evidence.
- [x] T06 — Dated summary, archive, and pre-PR closeout are complete. The authorized PR to `develop` is created as the final contributor action; submission details are returned in the final response.
