# Delta: applications and review

Issue #44; Paul Cheng; 2026-10-09; awaiting approval. [Canonical](../../../specs/applications-and-review.md), v1.3 at `1667f2b`; proposed v1.4 subject to integration. Permissions have one home in [SEC-009 delta](security-and-privacy.md). APP-002–005 remain unchanged.

## MODIFIED

### APP-001: Selected-job, submit-once application

Before: Applicant drafts/edits a cover letter and submits at most one **text-only** application per selected published job; selected-job reference, database uniqueness and draft/closed-job denial.

After: An Applicant MUST be able to draft/edit a cover letter and submit at most one application per selected published job, with details under APP-005/006 and an optional attachment under APP-007. Each application MUST reference its selected job. A database constraint MUST enforce one application per applicant per job. New applications to draft or closed jobs MUST be denied.

Scenario: Given an existing submitted application, when another submission/upload completion is attempted for that Applicant/job, then no second application is created and frozen contents remain unchanged. profile44-AC-07.

## ADDED

### APP-006: Private profile and optional background snapshots

Before: no saved Applicant profile or application education/work-experience fields in v1.3.

After: A verified Applicant MUST be able to save/resume their own private profile with optional full name, phone, portfolio URL, education and work experience. Existing APP-005 contact limits/validation MUST apply; education and work experience MUST each be optional trimmed plain text of at most 2,000 characters, allowing line breaks/tabs but excluding other control characters. Blank optional values MUST become absent. Verified Auth email MUST display read-only and MUST NOT be supplied by browser input. A new application form with no persisted draft MUST prefill profile fields through ordinary data copying without AI. Existing saved drafts MUST take precedence; profile changes MUST NOT overwrite a draft or submission.

Application education/work experience MUST save atomically with the draft's other fields and MUST freeze on explicit submission with APP-004/005. These optional snapshots MUST be visible only under SEC-001/009, including after closure. HR MUST see submitted snapshots, never the mutable private profile. Legacy absent fields MUST display “Not provided”; no past snapshot may be fabricated from a current profile. Invalid/stale writes MUST retain entered values without a partial write. APP-005's nonblank full-name submission rule remains.

Scenarios: Given an owned saved profile and no draft, when opening a new application form, then values prefill without AI (AC-02). Given a saved draft or submission, when the profile changes, then the application remains unchanged (AC-02/03). Given unauthorized profile access, then no data/write is allowed (AC-01; SEC-009). Given invalid/stale input, then persisted fields remain consistent and safe feedback retains input (AC-03). IDs use prefix profile44-.

### APP-007: Optional private PDF attachment

Before: no attachment; overview explicitly excluded résumé upload.

After: An Applicant MUST be able to attach at most one optional PDF résumé of no more than 1,048,576 bytes to their own draft application while its job is published, and replace/remove it before submission. No attachment MUST be required to submit. The server MUST validate filename/type, bounded byte length and PDF structure; non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be rejected before finalization. Type/structure validation MUST NOT be described as malware scanning. The interface MUST state the PDF/size limit and show safe upload errors without losing text/profile fields or the previous attached file.

Submission MUST atomically freeze the finalized attachment reference together with application fields. A pending upload MUST NOT be submitted as an attachment; submission while an active upload is pending MUST return a retryable message. Replacement/removal/finalization MUST be denied after submission or job closure, including direct requests and races. Existing owned/submitted downloads MUST remain available after closure under SEC-009. An upload begun before closure/submission MUST NOT subsequently finalize or mutate frozen attachment state. DB/Storage failures and retries MUST preserve prior referenced files and track unreferenced staging objects for bounded cleanup; cleanup MUST NOT delete a referenced or another application's object. Legacy records MUST remain usable without a file.

Scenarios: Valid optional upload/download and rejected invalid file preserve prior state (AC-04/08). Direct post-submission, closed-job and cross-owner writes fail unchanged (AC-06/07). Lost-response retry reconciles to the matching finalized operation, not another file (AC-07/08). Legacy/mobile/keyboard flows remain usable (AC-10). Private read/download and AI/log rules have their canonical home in SEC-009.

## REMOVED

None. Human approval, independent review and canonical sync pending. No scenario is an observed test result.

## Human approval record

Paul Cheng replied 'Approve as written' on 2026-10-09 to the explicit question naming the proposal, three deltas, design and plan. This supersedes pending approval wording above; branch permission and later acceptance remain separate. No implementation or canonical sync has occurred.
