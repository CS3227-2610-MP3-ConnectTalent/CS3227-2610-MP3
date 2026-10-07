# Tasks: Applicant accounts and applications

- Change/issues: `2026-10-07-applicant-applications`; [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6).
- [Plan](plan.md) / [record](record.md); status: accepted locally by Applicant owner on 2026-10-07, canonical v0.7 synced, archive complete after move. PR/merge/release pending.

## Before implementation

- [x] T00 — User confirmed Applicant process ownership and approved the proposal/deltas/design/plan, 5,000-character bound and required email verification in the 2026-10-07 chat. Teammate AI revision handling remains a handoff.

## Ordered implementation

- [x] T01 — Profiles, applications, transactional save/submit/edit boundary and RLS are implemented and 27 new pgTAP assertions pass. Database test-first red result was not captured because the CLI was initially unavailable; this process evidence gap remains. IDs: ACC-001/002, APP-001/004, SEC-001/002; `app6-AC-01`–`07`.
- [x] T02 — Authenticated session, Applicant-only routes/actions, required email confirmation, matching password confirmation and browser denial flow implemented. The browser test exposed disabled confirmation in the running local Auth container, then passed after a data-preserving restart. The follow-up password test failed on the missing field, then passed after the server-side check was added. IDs: ACC-001/002/003, SEC-001/002; `app6-AC-01/05/06/08`.
- [x] T03 — Saved draft, explicit submission, edit-until-close and own views implemented. Input validation had an observable three-failure red run followed by green; Applicant browser flow passes. IDs: APP-001/002/004, AID-002; `app6-AC-02/03/05/07/08`.
- [x] T04 — Local cross-user, anonymous, HR draft, role, duplicate, closure, true lock-contended races, stale revision, validation and retry cases checked. HR status/audit remain #9 scope; literal network-drop browser retry and staging are untested. Exact results in record. IDs: SEC-001/002/008; `app6-AC-01/03/04/05/06/07/08`.
- [x] T05 — Guides/reflections updated and textarea/length/revision contract documented in implementer handoff. Teammate acceptance of that contract is not recorded; coordinate before AI integration.

## Review and closeout

- [x] T06 — A separate read-only reviewer examined commit `f7ddb94`, database permissions and follow-up. Findings and rechecks are in `handoffs/independent-review.md`.
- [x] T07 — Applicant owner accepted the working local flow on 2026-10-07 and instructed acceptance/sync/archive in this conversation; stated scope limits remain in record.
- [x] T08 — Accepted ACC-001/APP-004/SEC-001 text synced to v0.7 canonical specs and complete packet archived; version/IDs/links checked. Sync commit pending separate Git instruction.
- [ ] T09 — Dated summaries and pre-PR record updated; Git submission requires separate user instruction. The issue-linked PR to `develop` is the last contributor action; merge, staging and release are separate gates.
