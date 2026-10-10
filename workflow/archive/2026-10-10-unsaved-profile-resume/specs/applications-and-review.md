# Delta: applications-and-review.md

Issue53; Paul Cheng; proposed 2026-10-10, baseline canonical v1.5. [Canonical](../../../specs/applications-and-review.md). Complete approval/implementation/sync pending.

## MODIFIED

### APP-006

Before (complete clause):

## APP-006: Private profile and optional background snapshots

A verified Applicant MUST be able to save/resume their own private profile with optional full name, phone, portfolio URL, education and work experience. Existing APP-005 contact limits/validation MUST apply; education and work experience MUST each be optional trimmed plain text of at most 2,000 characters, allowing line breaks/tabs but excluding other control characters. Blank optional values MUST become absent. Verified Auth email MUST display read-only and MUST NOT be supplied by browser input. A new application form with no persisted draft MUST prefill profile fields through ordinary data copying without AI. Existing saved drafts MUST take precedence; profile changes MUST NOT overwrite a draft or submission.

Application education/work experience MUST save atomically with the draft's other fields and MUST freeze on explicit submission with APP-004/005. These optional snapshots MUST be visible only under SEC-001/009, including after closure. HR MUST see submitted snapshots, never the mutable private profile. Legacy absent fields MUST display “Not provided”; no past snapshot may be fabricated from a current profile. Invalid/stale writes MUST retain entered values without a partial write. APP-005's nonblank full-name submission rule remains.

Scenario: Given a private profile and no saved draft, when opening a new application form, then fields prefill without AI. Given an existing draft or submission, profile changes leave its fields unchanged. Unauthorized profile access is denied under SEC-009. Invalid or stale draft writes preserve consistent saved state.

After (complete replacement):

## APP-006: Private profile and optional background snapshots

A verified Applicant MUST be able to save/resume their own private profile with optional full name, phone, portfolio URL, education and work experience. Existing APP-005 contact limits/validation MUST apply; education and work experience MUST each be optional trimmed plain text of at most 2,000 characters, allowing line breaks/tabs but excluding other control characters. Blank optional values MUST become absent. Verified Auth email MUST display read-only and MUST NOT be supplied by browser input. A new application form with no persisted draft MUST prefill profile fields through ordinary data copying without AI. Existing saved drafts MUST take precedence; profile changes MUST NOT overwrite a draft or submission.

Application education/work experience MUST save atomically with the draft's other fields and MUST freeze on explicit submission with APP-004/005. These optional snapshots MUST be visible only under SEC-001/009, including after closure. HR MUST see submitted snapshots, never the mutable private profile. Legacy absent fields MUST display “Not provided”; no past snapshot may be fabricated from a current profile. Invalid/stale writes MUST retain entered values without a partial write. APP-005's nonblank full-name submission rule remains.

Scenario: Given a private profile and no saved draft, when opening a new application form, then fields prefill without AI. Given an existing draft or submission, profile changes leave its fields unchanged. Unauthorized profile access is denied under SEC-009. Invalid or stale draft writes preserve consistent saved state.
A verified Applicant MAY optionally upload/replace/remove/download one private profile PDF resume after email verification, during onboarding or later profile visits, independently of saving profile text. APP-007 PDF/type/size/validation restrictions and SEC-009 privacy MUST apply. File operations MUST NOT implicitly save unsaved name/phone/background or complete required-profile onboarding. The application form MAY offer explicit Use profile resume for a current saved owner file. Reuse MUST produce an independently retained application attachment snapshot governed by APP-007; later profile replacement/removal MUST NOT change existing draft/submitted/withdrawn application attachments. HR MUST NOT access mutable profile resumes. No PDF-based AI/parsing/autofill is introduced; resume stays optional.

Scenario: Given a verified owner on profile with unsaved text, when uploading a valid PDF, the file persists privately without saving the text. Given explicit reuse on an editable open-job application, a separate snapshot is attached; profile replacement/removal leaves it unchanged. HR/foreign/anonymous/unverified reads/writes are denied under SEC-009.

### APP-007

Before (complete clause):

## APP-007: Optional private PDF attachment

An Applicant MUST be able to attach at most one optional PDF résumé of no more than 1,048,576 bytes to their own draft application while its job is published, and replace/remove it before submission. No attachment MUST be required to submit. The server MUST validate filename/type, bounded byte length and PDF structure; non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be rejected before finalization. Type/structure validation MUST NOT be described as malware scanning. The interface MUST state the PDF/size limit and show safe upload errors without losing text/profile fields or the previous attached file.

Submission MUST atomically freeze the finalized attachment reference together with application fields. A pending upload MUST NOT be submitted as an attachment; submission while an active upload is pending MUST return a retryable message. Replacement/removal/finalization MUST be denied after submission or job closure, including direct requests and races. Existing owned/submitted downloads MUST remain available after closure under SEC-009. An upload begun before closure/submission MUST NOT subsequently finalize or mutate frozen attachment state. DB/Storage failures and retries MUST preserve prior referenced files and track unreferenced staging objects for bounded cleanup; cleanup MUST NOT delete a referenced or another application's object. Legacy records MUST remain usable without a file.

Scenario: Given a valid optional PDF and an owned open-job draft, upload/download succeeds. Invalid replacement preserves the previous attachment. Submitted/closed-job mutations fail, and a racing upload cannot finalize after closure or submission. Lost-response retries reconcile the matching operation; failed or canceled operations remain tracked for safe cleanup. Private file permissions and AI/log exclusions are defined in [SEC-009](../../../specs/security-and-privacy.md).

The upload interface MUST present keyboard-accessible visibly styled file-selection and Upload/Replace actions with clear disabled reasons. A permanent Cancel interrupted upload action MUST NOT be shown; explicit Retry/Replace MUST safely reconcile or retire only owned pending staging operations without removing the prior finalized attachment, losing form values or permitting submitted/closed mutations. Structural validation MUST precede recovery changes.

After (complete replacement):

## APP-007: Optional private PDF attachment

An Applicant MUST be able to attach at most one optional PDF résumé of no more than 1,048,576 bytes to their own draft application while its job is published, and replace/remove it before submission. No attachment MUST be required to submit. The server MUST validate filename/type, bounded byte length and PDF structure; non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be rejected before finalization. Type/structure validation MUST NOT be described as malware scanning. The interface MUST state the PDF/size limit and show safe upload errors without losing text/profile fields or the previous attached file.

Submission MUST atomically freeze the finalized attachment reference together with application fields. A pending upload MUST NOT be submitted as an attachment; submission while an active upload is pending MUST return a retryable message. Replacement/removal/finalization MUST be denied after submission or job closure, including direct requests and races. Existing owned/submitted downloads MUST remain available after closure under SEC-009. An upload begun before closure/submission MUST NOT subsequently finalize or mutate frozen attachment state. DB/Storage failures and retries MUST preserve prior referenced files and track unreferenced staging objects for bounded cleanup; cleanup MUST NOT delete a referenced or another application's object. Legacy records MUST remain usable without a file.

Scenario: Given a valid optional PDF and an owned open-job draft, upload/download succeeds. Invalid replacement preserves the previous attachment. Submitted/closed-job mutations fail, and a racing upload cannot finalize after closure or submission. Lost-response retries reconcile the matching operation; failed or canceled operations remain tracked for safe cleanup. Private file permissions and AI/log exclusions are defined in [SEC-009](../../../specs/security-and-privacy.md).

The upload interface MUST present keyboard-accessible visibly styled file-selection and Upload/Replace actions with clear disabled reasons. A permanent Cancel interrupted upload action MUST NOT be shown; explicit Retry/Replace MUST safely reconcile or retire only owned pending staging operations without removing the prior finalized attachment, losing form values or permitting submitted/closed mutations. Structural validation MUST precede recovery changes.
The application resume section MUST appear after work experience and before Draft with AI inside the one editable application form. A verified Applicant on a published job MUST be able to choose/upload before clicking Save draft, including when other fields are blank. Upload MAY allocate an owned private draft record internally for its attachment, but MUST NOT save the user's other unsaved fields or submit. Invalid files MUST be rejected before allocation; simply viewing a form MUST NOT allocate a record. Existing forms/fields MUST remain unchanged and use the reconciled owned application ID/revision for subsequent explicit Save/Submit. All upload/reuse controls MUST be type=button and MUST NOT trigger form submission.

Duplicate first-upload/retry and concurrent save/upload MUST preserve one application per owner/job and enforce current revision/operation identity; no silent overwrite or false success. Valid upload failures MAY leave a private placeholder and tracked staging state with safe retry feedback. Explicit profile-file reuse MUST freeze an independent selected-source-version copy under the same application limits/current-state checks, never a mutable shared profile reference. Existing closed/submitted/withdrawn/pending-upload restrictions remain. No manual Save draft prerequisite may be imposed merely to obtain the attachment record.

Scenario: Given a fresh open-job application form, when a valid PDF is uploaded before Save draft, a private attachment succeeds while typed fields remain unsaved and no submission occurs. Invalid files create no draft. Given profile source replacement during copy, a consistent selected-source version is used or a safe retry error occurs, never mismatched metadata/bytes. Existing finalization/freeze and exact retry scenarios remain.

## ADDED

None; existing IDs extended.

## REMOVED

None. Canonical sync only after separate acceptance.
