# Proposal: upload before Save draft and private profile résumé (#53)

Paul Cheng; 2026-10-10; proposed, complete approval and branch permission pending. [Issue53](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/53). Preparation on feat/49-50-application-form-withdrawal; canonical v1.5 and accepted uncommitted #49/#50 preserved. #52 mandatory-profile packet is approved but deferred at Paul's request.

## Request and source evidence

Paul asks to remove Save draft as the prerequisite for résumé upload, place résumé after work experience and before Draft with AI, and offer optional résumé upload on profile after signup or later. Current UI disables the picker without applicationId and places ResumePanel after ApplicationForm; its database object foreign key and checked upload RPC require a saved application. Profile has no file reference/control.

## Proposed behavior

1. A verified Applicant on an open job can choose/upload a PDF immediately without clicking Save draft or supplying other application fields. Validate the PDF first. The upload may allocate an owned private application/draft record internally for the attachment; **it does not save the user's other typed fields or submit**. That record may appear in My applications. Viewing a form or rejecting an invalid file creates no draft. Preserve typed fields across upload/refresh and reconcile application ID/revision for later Save/Submit.
2. Put the résumé controls inside the one application form, directly below work experience and above Draft with AI. Upload/replace/remove/reuse buttons are type=button; AI/file actions do not trigger form submission. Existing submitted/closed/withdrawn restrictions remain.
3. Add an optional private PDF résumé on My profile, usable after email verification during onboarding or on later profile visits. It can upload/replace/remove/download independently of saving name/phone/background; no unsaved text implicitly persists. No anonymous/pre-verification file upload.
4. Keep **PDF only, maximum 1 MiB**, existing bounded structure validation, no claim of malware scanning, safe error/retry and tracked cleanup. No public URLs, inline PDF rendering, AI upload or parsing/autofill from PDF.
5. Offer **Use profile résumé** explicitly on an editable application when a saved profile résumé exists. Copy to an independent application attachment snapshot using generated paths and the normal authorization/freeze rules. Profile edits/replacement/removal do not mutate existing applications or submitted files. No automatic attachment or cross-application sharing of a mutable reference.
6. HR cannot read mutable profile files. HR sees only an explicitly submitted application's copied/uploaded résumé; drafts remain hidden. Existing owner/HR retained downloads and withdrawal history stay available.

## Acceptance map

| ID | Requirement | Observable checks planned |
| --- | --- | --- |
| AC01 | APP-007 | Fresh job form chooser/upload enabled; valid upload succeeds without Save draft; only private draft metadata/file persists, unsaved fields unchanged; no submission. Invalid PDF creates no draft. Browser + SQL/service tests. |
| AC02 | APP-007, AID-002 | One application form; work experience → résumé → AI order; upload/AI actions never save/submit; keyboard/mobile checks. |
| AC03 | APP-006/007, SEC-009 | Verified profile upload/replace/remove/download without text-save; foreign/HR/anonymous/unverified direct access denied; file limits/error preservation. |
| AC04 | APP-006/007, SEC-009 | Explicit profile reuse creates independent application snapshot; changing/removing profile file leaves saved/submitted attachment bytes unchanged. |
| AC05 | APP-004/007/008 | Submission/closure/withdrawal/pending-upload races deny late file changes; duplicate/retried first upload creates no second application; lost responses reconcile operation/revision safely. |
| AC06 | SEC-005/007/009 | No public Storage writes, filenames in paths, file/contact payload in AI/logs or mutable-profile HR read; existing valid snapshot downloads retained. |

## Scope and gates

No required résumé, DOC/DOCX, larger files, unauthenticated signup uploads, resume parsing, new AI feature, required education/experience, blanket erasure/sweeper, hosted migration or provider-key changes. The approved #52 policy is not implemented here: later readiness checks must permit optional profile uploads during completion; its final compatible plan may need reconciliation.

The internal private-record creation and explicit profile-reuse snapshot are proposed implementation policies requiring approval of this concrete packet under AGENTS.md. New branch permission is separately outstanding: Paul's latest answer asked for this feature first, not permission to switch/create. No commit/push/PR/hosted operation included. [Design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md), [application delta](specs/applications-and-review.md), [security delta](specs/security-and-privacy.md).
