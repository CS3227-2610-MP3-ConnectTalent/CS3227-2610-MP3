# Tasks: restore Vitest PR report comments

- Change/issues: `2026-10-13-vitest-pr-report`; [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72), related #58
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: bounded diagnostic implementation accepted for PR submission; hosted cause/recovery remains open under #72; Johnwz123

## Before implementation

- [x] T00 — Student owner approved the proposal, design, and plan. Evidence: explicit decision/date/source recorded in `record.md`.

## Ordered implementation

- [x] T01 — Added and ran the mocked HTTPError regression; it failed before the reporter change because the output omitted HTTP 403 and the safe GitHub message.
- [x] T02 — Added bounded, sanitized HTTP diagnostics and response cleanup. The focused redaction regression passes.
- [x] T03 — Ran the complete Python CI-helper suite (48 tests, all passed) and confirmed the reporter workflow's scoped permissions/artifact guards were not changed.
- [ ] T04 — Post-integration follow-up: after this diagnostic code reaches the default branch, capture the bounded API status/message and fix only the demonstrated in-repository cause. Stop if it requires external settings. This is intentionally outside this diagnostic PR.
- [ ] T05 — Post-integration follow-up: verify successful comment creation and update on the same PR and verify stale-head protections.

## Review and closeout

- [x] T06 — Separate `test_engineer` execution `/root/review_ci_workflows` reviewed API permissions, redaction, artifact handling, and hosted-check limits; fixed the P2 C1-control finding and confirmed it on recheck. See [review handoff](handoffs/T06-independent-review.md).
- [x] T07 — Johnwz123 accepted the bounded diagnostic implementation with hosted verification outstanding, as recorded in `record.md`. Product sync is N/A; the complete packet is archived while #72 remains open.
- [x] T08 — Dated session summary, archive, and pre-PR closeout are complete. The authorized PR to `develop` is created as the final contributor action; submission details are returned in the final response. T04/T05 remain post-integration follow-up under #72.
