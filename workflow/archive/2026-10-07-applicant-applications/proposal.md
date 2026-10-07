# Proposal: Applicant accounts and applications

- Change ID: `2026-10-07-applicant-applications`
- Issue: [#6 — Applicant sign-in and one application per published job](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6). Dependency [PR #4](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/4) is merged; HR review is [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9).
- Applicant owner: Paul Cheng for the full application process, confirmed in this conversation. The teammate owns AI features.
- Status/date: approved for implementation by the user in this conversation on 2026-10-07.
- Baseline: [ProductSpec v0.6](../../ProductSpec.md), commit `0200eb9` on `develop` when this packet was drafted.
- Affected requirements: [ACC-001/ACC-002](../../specs/accounts-and-roles.md), [APP-001/APP-002](../../specs/applications-and-review.md), [JMG-002/JMG-003](../../specs/job-management.md), [SEC-001/SEC-002/SEC-008](../../specs/security-and-privacy.md), and [AID-002](../../specs/applicant-ai-draft.md).
- Classification: implementation of already specified product behavior, plus **proposed deltas** for signup verification/password confirmation in [ACC-001](specs/accounts-and-roles.md), saved drafts and post-submission editing in [APP-004](specs/applications-and-review.md), and role visibility in [SEC-001](specs/security-and-privacy.md). These would raise the baseline to v0.7 only if accepted and synced after implementation.

## Intent and scope

Applicants can currently browse jobs but cannot sign in or apply. Build the Applicant account and text-only application flow so a signed-in Applicant can write and save a cover-letter draft, explicitly submit once to a published job, then view and edit the submitted letter while that job remains published. Preserve the first submitted text for HR to inspect. Provide a stable `cover_letter` contract for the teammate's Applicant AI draft: generated text may fill the textarea, but must not save or submit an application by itself.

This packet covers Applicant signup/sign-in/sign-out, a saved draft, submission, later edits while the job is published, own-list/detail views, schema and RLS needed for those operations, and synthetic authorization tests. It does **not** implement SoCLaaS calls, HR job creation, HR notes/review/status actions, resume uploads, email automation, or app deployment. HR actions remain #8/#9; Applicant and HR AI remain #7/#10. Existing public job browsing remains available without sign-in.

## Choices and dependencies

| Choice | Proposed approach | Tradeoff / decision state |
| --- | --- | --- |
| Unfinished letter | Save one private draft per Applicant/job across visits | User chose this on 2026-10-07; draft must be hidden from HR and anonymous users. |
| Submitted letter | Allow Applicant edits while the job remains published; keep the original submission and latest text separately | User chose this on 2026-10-07. Freeze edits when the job closes. HR sees original and current text after submission. |
| Authentication | Supabase Auth email/password with password confirmation, required email verification and server-managed session cookies | User approved email verification, then requested matching password confirmation on 2026-10-07. Local confirmation mail is captured in the mail viewer. |
| Application persistence | One `applications` row per Applicant/job transitions from private draft to submitted; a separate immutable original snapshot plus current text/revision; database-enforced published-job eligibility | Guarantees submit-once, preserves HR evidence, and supports edits without creating a second application. |
| AI handoff | Teammate may write text into the same Applicant-owned `cover_letter` textarea; Save Draft and Submit are separate explicit actions | AI generation alone does not persist or submit. Coordinate length and insertion behavior before either feature is implemented. |

Risks: role escalation, cross-applicant reads, draft leakage to HR, bypassing published-job checks, duplicate/concurrent submissions, edits after closure, overwriting the original letter, stale HR summaries after an edit, leaking cover-letter text in logs, and a job closing during submission. The design and tests must cover these. Use only synthetic users and letters in development. The exact HR status vocabulary and controlled HR provisioning mechanism belong to #9/#8; this slice needs only an Applicant default and a draft/submitted lifecycle state. Editing must not change a future HR status automatically.

## Acceptance evidence

| ID | Requirements | Expected behavior and evidence |
| --- | --- | --- |
| `app6-AC-01` | ACC-001/ACC-002, SEC-001 | Public signup requires matching passwords and email verification, creates only an Applicant, and cannot assign HR. Test mismatch, unverified denial, signup and database role boundary. |
| `app6-AC-02` | APP-001/APP-004, SEC-002 | A signed-in Applicant saves a private draft, leaves, returns, and finds the same text; only an explicit Submit transitions it to a submitted application. Browser flow plus database row check. |
| `app6-AC-03` | APP-001/APP-004 | A second or concurrent submission cannot create another row; a submitted application cannot transition back to draft. Database and browser/API tests. |
| `app6-AC-04` | APP-001, JMG-002/JMG-003 | Draft/closed jobs cannot receive new applications, including direct requests and a close-versus-submit race. Database denial tests. |
| `app6-AC-05` | APP-002/APP-004, SEC-001/SEC-002 | Applicant A can read their own draft or submission, including after job closure; Applicant B and anonymous visitors cannot read either, and HR cannot read an unsubmitted draft. RLS and browser tests. |
| `app6-AC-06` | SEC-001/SEC-008 | Applicant cannot change HR status or role; errors and audit records do not expose other applicants' data or letter text. Authorization and privacy checks with synthetic users. |
| `app6-AC-07` | APP-004 proposed | Applicant can edit submitted current text while the job is published, but not after closure; the first submitted text remains intact for HR. Database and UI tests. |
| `app6-AC-08` | ACC-003, APP-001/APP-002 | Browser flow distinguishes anonymous, signed-in Applicant, and an unauthorized direct request; a recoverable error does not create a duplicate application. Browser/integration tests. |

The proposed [application delta](specs/applications-and-review.md), [security delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), and [record](record.md) form the reviewable packet. Acceptance IDs are targets, not observed test results.

## Approval record

- [x] User confirmed responsibility for the full Applicant application process in this conversation; teammate owns AI features.
- [x] User chose saved drafts and submitted-letter edits until job closure on 2026-10-07; preserve the first submitted version for HR.
- [x] User approved a 5,000-character cover-letter limit and required signup email verification, then explicitly requested password confirmation on 2026-10-07. Teammate AI revision handling remains an integration handoff.
- [x] User approved the complete proposal, deltas, design, and plan in this conversation on 2026-10-07.
- Approver / decision / date / source: Applicant owner Paul, approval and two explicit choices in the 2026-10-07 chat. Implementation is authorized; acceptance and merge remain separate gates.
