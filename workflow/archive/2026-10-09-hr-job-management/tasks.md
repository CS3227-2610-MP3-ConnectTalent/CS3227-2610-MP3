# Tasks: HR job management

- Change/issue: `2026-10-09-hr-job-management`; [#8](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/8).
- [Plan](plan.md) / [record](record.md). Status: locally accepted with recorded limits and archived. Owner: Paul Cheng; implementation assistance by Codex after approval.

- [x] T00 — Paul approved proposal, existing-spec interpretation, design and plan on 2026-10-09; recorded in `record.md` before product implementation.
- [x] T01 — Focused pgTAP failed 16/19 against the pre-change local database; command/result in `record.md`.
- [x] T02 — Local migration applied; focused 35/35 and full 107/107 database tests passed after review corrections.
- [x] T03 — Validation stub failed 2/3, action stubs failed 3/3; implementation passed 6/6 focused tests.
- [x] T04 — Browser scenario failed on missing HR page, then passed after UI and a test timing fix; full local browser suite passed 10/10.
- [x] T05 — Three contended race cases and closed-application reads passed locally; guides/reflection updated; typecheck, build and scoped lint passed. Repository-wide lint failed in an unrelated nested generated worktree; see record.
- [x] T06 — Separate read-only reviewer completed initial and fix rechecks; final focused pgTAP 35/35 passed. Findings and limits are in `handoffs/independent-review.md`.
- [x] T07 — Paul separately accepted the local feature with recorded limits on 2026-10-09; decision and source in `record.md`.
- [x] T08 — Compared accepted behavior to JMG/JOB/APP/SEC, found no canonical delta, completed the dated summary, moved the complete packet to archive and repaired current links/indexes.
- [ ] T09 — Only after explicit authorization, commit/push and open PR to `develop` with `Closes #8`; record actual PR and later merge/release separately.
