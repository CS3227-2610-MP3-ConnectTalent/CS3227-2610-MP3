# Tasks: Applicant accounts and applications

- Change/issues: `2026-10-07-applicant-applications`; [#6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6).
- [Plan](plan.md) / [record](record.md); status: approved and implemented locally, with further adversarial checks, independent review and student acceptance pending. Applicant owner Paul Cheng.

## Before implementation

- [x] T00 — User confirmed Applicant process ownership and approved the proposal/deltas/design/plan, 5,000-character bound and required email verification in the 2026-10-07 chat. Teammate AI revision handling remains a handoff.

## Ordered implementation

- [ ] T01 — Profiles, applications, transactional save/submit/edit boundary and RLS are implemented and 27 new pgTAP assertions pass. Database test-first red result was not captured because the CLI was initially unavailable; keep this evidence gap visible. IDs: ACC-001/002, APP-001/004, SEC-001/002; `app6-AC-01`–`07`.
- [x] T02 — Authenticated session, Applicant-only routes/actions, required email confirmation, matching password confirmation and browser denial flow implemented. The browser test exposed disabled confirmation in the running local Auth container, then passed after a data-preserving restart. The follow-up password test failed on the missing field, then passed after the server-side check was added. IDs: ACC-001/002/003, SEC-001/002; `app6-AC-01/05/06/08`.
- [x] T03 — Saved draft, explicit submission, edit-until-close and own views implemented. Input validation had an observable three-failure red run followed by green; Applicant browser flow passes. IDs: APP-001/002/004, AID-002; `app6-AC-02/03/05/07/08`.
- [ ] T04 — Challenge cross-user, anonymous, HR draft, role/status, duplicate, closure, race, stale revision, validation and privacy cases. Depends on T01–T03. IDs: SEC-001/002/008; `app6-AC-01/03/04/05/06/07/08`. Evidence: exact unit/db/browser/lint/typecheck/build results and limits in record.
- [ ] T05 — Update guides/reflections and give teammate the cover-letter/revision interface contract. Depends on T03/T04. Evidence: changed paths, checked links and actual teammate agreement in record.

## Review and closeout

- [ ] T06 — A separate reviewer examines the final diff and acceptance/security evidence; record actual reviewer identity, independence, findings, fixes and rechecks. Depends on T04/T05.
- [ ] T07 — Student owner records acceptance, rejection or conditions with date/source. Depends on T06.
- [ ] T08 — Sync only accepted ACC-001/APP-004/SEC-001 text to canonical specs, verify version/IDs/links, then archive the complete packet. Depends on T07; preserve rejection if not accepted.
- [ ] T09 — Complete all dated session logs and pre-PR record, then request separate Git instruction for commit/push/PR. Depends on T08. The issue-linked PR to `develop` is the last contributor action; merge, staging and release are separate gates.
