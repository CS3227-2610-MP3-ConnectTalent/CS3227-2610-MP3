# Proposal: application form controls and withdrawal

- Issues: [#49](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/49), [#50](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/50); owner Paul Cheng, Applicant/HR pipeline.
- Date/status: 2026-10-10; approved by Paul “Approve as written”, then separately accepted locally “Accept with recorded limits”; synced to v1.5 and archived. Original proposal-stage gate wording below is preserved; see [record](record.md) for actual later decisions/results.
- Branch/baseline: feat/49-50-application-form-withdrawal, updated develop 24b1da8; [ProductSpec](../../ProductSpec.md) v1.4.
- Classification: #49 UI defect/usability plus bounded recovery behavior; #50 new lifecycle/authorization behavior, elevated data/race risk.
- Affected requirements: APP-002/003/007/008, AID-002, SEC-001/009, AIS-001. Deltas below own the changed rules.

## Intent and evidence

User requested a visibly clickable résumé upload control, removal of Cancel interrupted upload and duplicate My applications above the résumé, and AI drafting within the application form. Source confirms native file chooser disabled before a saved draft, permanently visible cancel control, duplicate link and ApplicantAiDraft rendered after the application form. The AI component itself contains a form, so merely moving it would introduce invalid nested forms. User also asks for status/view/withdraw options and proposes retained/soft-deleted application data. Current list already displays review status and detail links; withdrawal does not exist.

## Scope and proposed decisions

1. Use an accessible styled Choose PDF button/input and a distinct styled Upload/Replace button, visible disabled feedback and explicit save-draft guidance. Keep optional PDF-only 1 MiB, draft-only mutation and authenticated downloads. Remove the permanent cancellation button; explicit retry/replacement recovers a stale pending operation safely, retaining tracked cleanup tombstones and the last finalized file. No silent removal of a successfully attached file.
2. Remove the duplicate page-level My applications link; preserve global Applicant navigation.
3. Place AI notes/generation beside the cover letter within the one application form; refactor the AI component to a non-form section with type=button actions. Notes have no submitted name and are excluded from application writes. Generation never saves/submits. Existing allowed AI inputs, output validation and human verification stay unchanged.
4. Add View and confirmed Withdraw for owned submitted applications. Terminal Withdrawn is an Applicant lifecycle overlay with withdrawn_at/withdrawn_by; retain submission_state, prior HR review status, letters, contact/background snapshots, notes/events and file references. Do not physically delete rows/files. Owner may withdraw after job closure, regardless of current HR status. Repeated withdrawal is idempotent; no undo/reapply to the same job in this release.
5. Applicant and HR lists/detail show Withdrawn prominently instead of the prior review status. HR can read submitted withdrawn history but cannot add notes/change status/generate new AI summaries after withdrawal. Drafts stay private. Existing authorized attachment downloads continue for record inspection.

## Non-goals and alternatives

No blanket soft deletion of jobs/accounts/notes/files, draft deletion, retention scheduler, reapplication, reinstatement, resume parsing/AI, SMTP or hosted rollout. Hard deletion loses evidence and is rejected. Adding withdrawn to HR-controlled review_status confuses role ownership; choose a separate lifecycle flag. Keeping withdrawn data readable preserves the existing record-access contract, while actionable HR processing is blocked. A permanent recovery control violates the requested UI; recovery belongs to explicit retry/replacement instead.

## Acceptance criteria

| ID | Requirement | Given / when / then and required evidence |
| --- | --- | --- |
| AC-01 | APP-007 | Saved owned open-job draft: keyboard-operable styled chooser and upload; invalid/oversized PDF feedback, previous file/text retained; browser + validation tests. Unsaved/submitted controls explain restrictions. |
| AC-02 | APP-002, AID-002 | One application form contains AI section; no nested form or extra My applications link; mocked Generate updates editable letter without any save/submission; browser test. |
| AC-03 | APP-007 | Interrupted/lost-response upload followed by explicit retry/replacement reconciles/retires only its owned staging operation and retains prior ready file; fault tests and real Storage check. No permanent cancel button. |
| AC-04 | APP-008 | Owner confirms withdrawal on submitted record (also closed job); timestamp/actor stored, list/detail Withdrawn, retained content unchanged; DB + browser tests. Cancel confirmation does nothing. |
| AC-05 | SEC-001 | Nonowner/HR/anonymous/unverified/draft withdrawal denied by server and DB; owner content visible, HR drafts hidden; direct RPC/HTTP checks. |
| AC-06 | APP-003/008, AIS-001 | HR sees withdrawn submitted history, but note/status/summary writes denied; no provider call for withdrawn summary; DB + mocked AI tests. |
| AC-07 | APP-008 | Duplicate withdrawal reconciles safely; withdrawal versus HR action serializes, later action denied; races and freeze checks. No second application/restore/delete permitted. |
| AC-08 | Presentation | 390/1440 widths, focus, disabled/error states and regression of profile/letter save/submit/file actions; browser evidence. |

## Artifacts and gates

[Application delta](specs/applications-and-review.md), [security delta](specs/security-and-privacy.md), [HR AI delta](specs/hr-ai-summary.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md).

Paul's request authorizes issue/branch creation and preparation. Concrete proposal/deltas/design/plan approval remains required under AGENTS.md before product code/schema/tests are changed. Proposed terminal/no-reapply and withdrawn-history policies require that approval. Independent review and separate acceptance follow implementation. No commit/push/PR/hosted action authorization inferred.
