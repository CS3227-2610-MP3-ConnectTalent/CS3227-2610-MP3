# Delta: applications-and-review.md

Issues #49/#50; Paul Cheng; proposed 2026-10-10; baseline canonical v1.4/24b1da8. [Canonical](../../../specs/applications-and-review.md); approved by Paul, separately accepted with recorded limits on 2026-10-10 and synced to canonical v1.5 before archive. Original before/after clauses preserved.

## ADDED

### APP-008: Confirmed Applicant withdrawal

Before: no withdrawal operation in v1.4.

After: A verified Applicant MUST be able to explicitly confirm withdrawal of their own submitted application, including after job closure. Withdrawal MUST be terminal for this release and MUST record immutable owner actor/time without physically deleting the application, files, notes, snapshots or status history. The UI MUST show Withdrawn in Applicant/HR lists/details, offer View, and offer Withdraw only for an owned submitted nonwithdrawn record. Confirmation cancellation MUST leave persisted data unchanged. Repeating the same authorized withdrawal MUST reconcile idempotently without changing original actor/time. Draft, other-owner, anonymous, unverified and HR withdrawal requests MUST be denied at server/database boundaries. Submitted contents MUST remain frozen; withdrawals MUST NOT create or permit reapplication/restoration for the same job. The original one-application-per-Applicant/job constraint remains. Authorized owner and HR MUST retain submitted-history/attachment reads under SEC-001/009; HR MUST NOT add notes/change status or invoke a new summary for withdrawn applications. New statuses/notes MUST serialize against withdrawal, and an AI response MUST recheck eligibility before returning. An already in-flight external provider request cannot be recalled. Lifecycle status MUST be distinct from HR-controlled review status. No blanket soft-delete behavior for other entities is introduced.

Scenarios (AC04–07): owner confirms then sees Withdrawn and frozen retained details; cancel does nothing; closed-job withdrawal succeeds; repeated request retains actor/time; unauthorized/draft request changes nothing; later HR processing denied; races serialize consistently. Withdrawal retains personal data and MUST NOT be described as erasure.

## MODIFIED

### APP-002

Before (24b1da8, canonical applications-and-review.md):

## APP-002: Applicant reading

An Applicant MUST be able to read their own draft or submitted application and, after submission, the current HR review status. They MUST NOT read another Applicant's application, any HR note or status history, or perform an HR status action. Existing application reads remain available after job closure under [JMG-003](../../../specs/job-management.md) and [SEC-001](../../../specs/security-and-privacy.md).

Scenario: Given Applicant A's submitted application, when A opens it after HR changes status, then A sees the current status and their letter, including after job closure.

Denial scenario: Given Applicant B or an anonymous visitor, when they request A's application, status or notes, then no protected data is returned.

After (complete replacement, same ID):

## APP-002: Applicant reading

An Applicant MUST be able to read their own draft or submitted application and, after submission, the current HR review status. They MUST NOT read another Applicant's application, any HR note or status history, or perform an HR status action. Existing application reads remain available after job closure under [JMG-003](../../../specs/job-management.md) and [SEC-001](../../../specs/security-and-privacy.md).

Scenario: Given Applicant A's submitted application, when A opens it after HR changes status, then A sees the current status and their letter, including after job closure.

Denial scenario: Given Applicant B or an anonymous visitor, when they request A's application, status or notes, then no protected data is returned.

The owner UI MUST include explicit View/status and confirmed Withdraw controls governed by APP-008. Withdrawn lifecycle status MUST take precedence over prior HR review status; owner history remains readable.

Rationale: lifecycle/UI changes under #49/#50. Given the new state/action, when requested, then the added guard and existing access/freeze rules apply; unauthorized requests do not mutate or expose records.

### APP-003

Before (24b1da8, canonical applications-and-review.md):

## APP-003: HR review, notes and separate status action

Authorized HR MUST be able to list and read only submitted applications for this portal, showing selected job, original submitted cover letter, current cover letter and current review status. HR MUST NOT see unsubmitted drafts. HR notes MUST be append-only records with author and creation time, readable only by authorized HR. The initial review status MUST be `Submitted` on explicit Applicant submission. Authorized HR MAY set `In review`, `Shortlisted` or `Rejected` through a separate explicit human action and MAY move among those three to correct a decision; HR MUST NOT set a submitted application back to `Submitted`. Every status action MUST preserve the application and record actor/time without exposing letter or note text in status events. AI text or output MUST NOT trigger notes or status actions. Submitted applications, notes and status remain available to HR after job closure, subject to [SEC-001](../../../specs/security-and-privacy.md). [AIS-002](../../../specs/hr-ai-summary.md) excludes AI status decisions.

Scenario: Given an authorized HR user and a submitted application, when HR opens its detail, adds a note and separately selects `In review`, then HR sees the authored note and new status while the Applicant sees only their own current status.

Denial/failure scenario: Given an unsubmitted draft, when HR requests its ID, then no draft is returned. Given an Applicant, anonymous visitor or stale/invalid status request, when the status action is attempted, then the write is denied without changing status or exposing notes.

After (complete replacement, same ID):

## APP-003: HR review, notes and separate status action

Authorized HR MUST be able to list and read only submitted applications for this portal, showing selected job, original submitted cover letter, current cover letter and current review status. HR MUST NOT see unsubmitted drafts. HR notes MUST be append-only records with author and creation time, readable only by authorized HR. The initial review status MUST be `Submitted` on explicit Applicant submission. Authorized HR MAY set `In review`, `Shortlisted` or `Rejected` through a separate explicit human action and MAY move among those three to correct a decision; HR MUST NOT set a submitted application back to `Submitted`. Every status action MUST preserve the application and record actor/time without exposing letter or note text in status events. AI text or output MUST NOT trigger notes or status actions. Submitted applications, notes and status remain available to HR after job closure, subject to [SEC-001](../../../specs/security-and-privacy.md). [AIS-002](../../../specs/hr-ai-summary.md) excludes AI status decisions.

Scenario: Given an authorized HR user and a submitted application, when HR opens its detail, adds a note and separately selects `In review`, then HR sees the authored note and new status while the Applicant sees only their own current status.

Denial/failure scenario: Given an unsubmitted draft, when HR requests its ID, then no draft is returned. Given an Applicant, anonymous visitor or stale/invalid status request, when the status action is attempted, then the write is denied without changing status or exposing notes.

For withdrawn submitted applications under APP-008, HR MUST retain read access to history and attachments but MUST NOT add notes, change review status or initiate an AI summary. The UI MUST clearly label Withdrawn and omit processing controls; direct requests MUST be denied.

Rationale: lifecycle/UI changes under #49/#50. Given the new state/action, when requested, then the added guard and existing access/freeze rules apply; unauthorized requests do not mutate or expose records.

### APP-007

Before (24b1da8, canonical applications-and-review.md):

## APP-007: Optional private PDF attachment

An Applicant MUST be able to attach at most one optional PDF résumé of no more than 1,048,576 bytes to their own draft application while its job is published, and replace/remove it before submission. No attachment MUST be required to submit. The server MUST validate filename/type, bounded byte length and PDF structure; non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be rejected before finalization. Type/structure validation MUST NOT be described as malware scanning. The interface MUST state the PDF/size limit and show safe upload errors without losing text/profile fields or the previous attached file.

Submission MUST atomically freeze the finalized attachment reference together with application fields. A pending upload MUST NOT be submitted as an attachment; submission while an active upload is pending MUST return a retryable message. Replacement/removal/finalization MUST be denied after submission or job closure, including direct requests and races. Existing owned/submitted downloads MUST remain available after closure under SEC-009. An upload begun before closure/submission MUST NOT subsequently finalize or mutate frozen attachment state. DB/Storage failures and retries MUST preserve prior referenced files and track unreferenced staging objects for bounded cleanup; cleanup MUST NOT delete a referenced or another application's object. Legacy records MUST remain usable without a file.

Scenario: Given a valid optional PDF and an owned open-job draft, upload/download succeeds. Invalid replacement preserves the previous attachment. Submitted/closed-job mutations fail, and a racing upload cannot finalize after closure or submission. Lost-response retries reconcile the matching operation; failed or canceled operations remain tracked for safe cleanup. Private file permissions and AI/log exclusions are defined in [SEC-009](../../../specs/security-and-privacy.md).

After (complete replacement, same ID):

## APP-007: Optional private PDF attachment

An Applicant MUST be able to attach at most one optional PDF résumé of no more than 1,048,576 bytes to their own draft application while its job is published, and replace/remove it before submission. No attachment MUST be required to submit. The server MUST validate filename/type, bounded byte length and PDF structure; non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be rejected before finalization. Type/structure validation MUST NOT be described as malware scanning. The interface MUST state the PDF/size limit and show safe upload errors without losing text/profile fields or the previous attached file.

Submission MUST atomically freeze the finalized attachment reference together with application fields. A pending upload MUST NOT be submitted as an attachment; submission while an active upload is pending MUST return a retryable message. Replacement/removal/finalization MUST be denied after submission or job closure, including direct requests and races. Existing owned/submitted downloads MUST remain available after closure under SEC-009. An upload begun before closure/submission MUST NOT subsequently finalize or mutate frozen attachment state. DB/Storage failures and retries MUST preserve prior referenced files and track unreferenced staging objects for bounded cleanup; cleanup MUST NOT delete a referenced or another application's object. Legacy records MUST remain usable without a file.

Scenario: Given a valid optional PDF and an owned open-job draft, upload/download succeeds. Invalid replacement preserves the previous attachment. Submitted/closed-job mutations fail, and a racing upload cannot finalize after closure or submission. Lost-response retries reconcile the matching operation; failed or canceled operations remain tracked for safe cleanup. Private file permissions and AI/log exclusions are defined in [SEC-009](../../../specs/security-and-privacy.md).

The upload interface MUST present keyboard-accessible visibly styled file-selection and Upload/Replace actions with clear disabled reasons. A permanent Cancel interrupted upload action MUST NOT be shown; explicit Retry/Replace MUST safely reconcile or retire only owned pending staging operations without removing the prior finalized attachment, losing form values or permitting submitted/closed mutations. Structural validation MUST precede recovery changes.

Rationale: lifecycle/UI changes under #49/#50. Given the new state/action, when requested, then the added guard and existing access/freeze rules apply; unauthorized requests do not mutate or expose records.

## REMOVED

None. Canonical sync occurs only after separate acceptance.
