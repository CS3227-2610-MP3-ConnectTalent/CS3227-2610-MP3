# Tasks: Vitest coverage report action

- Change/issues: `2026-10-14-vitest-coverage-action`; [#72](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72)
- Plan/record: [plan.md](plan.md); [record.md](record.md)
- Status/owner: accepted and archived; PR submission pending; Johnwz123

## Before implementation

- [x] T00 — Johnwz123 approves action-based coverage-only report, job-scoped `pull-requests: write`, and custom implementation removal. Evidence: proposal approval record, 2026-10-14, this conversation.

## Ordered implementation

- [x] T01 — Implement the report action and exact attempt-scoped JSON artifact; retain read-only PR CI and trusted default-branch report workflow. IDs: VCA-AC-01/02/03. Files: `.github/workflows/ci.yml`, `.github/workflows/test-report.yml`, `vitest.config.ts`. Evidence: source/diff inspection and `git diff --check` are recorded; workflow YAML parser and hosted report remain pending.
- [x] T02 — Remove custom report scripts/tests and update active CI docs. ID: VCA-AC-04. Files: `scripts/ci/`, `tests/ci/`, `README.md`, `CONTRIBUTING.md`. Evidence: active reference scan, removed-file inventory, and `git diff --check` are recorded.

## Review and closeout

- [x] T03 — Separate reviewer verifies VCA-AC-01 through VCA-AC-04, including token scope and artifact mapping; records exact revision and findings. Evidence: [T03 reviewer handoff](handoffs/T03-independent-review.md); hosted proof remains pending.
- [x] T04 — Johnwz123 records post-change acceptance after review. Evidence: record.md and 2026-10-14 closeout summary; hosted comment verification remains pending.
- [x] T05 — Write dated implementation/closeout logs; confirm no product spec delta; archive the complete packet after acceptance and prepare issue-linked PR submission. Evidence: archived record, archive/index links, dated summaries, and final PR body from the submission step.

## Post-submission review

- [x] T06 — Address PR #80 review comment [4269047250](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/80#discussion_r4269047250): revalidate the current PR head around the upstream action and unavailable-status writes, correct observed stale publication, push the fix, reply, and resolve the thread. Evidence: [head-race review summary](../../../logs/2026-10-14-vitest-coverage-action-head-race-review.md); hosted workflow parsing/runtime remains pending until the updated workflow reaches the default branch.
