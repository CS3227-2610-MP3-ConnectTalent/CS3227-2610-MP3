# Applications and review

Baseline: ProductSpec v1.2, 9 October 2026 (APP-005 added; APP-001–004 retained).

Canonical ownership, notes and status permissions are in [SEC-001 / SEC-002](security-and-privacy.md).

## APP-001: Selected-job, submit-once application

An Applicant MUST be able to draft and edit a cover letter and submit at most one text-only application per selected published job. Each application MUST reference its selected job. A database constraint MUST enforce one application per applicant per job. New applications to draft or closed jobs MUST be denied.

Scenario: Given a published job, when an Applicant explicitly submits final text, then the application references that job. A second application by the same applicant to that job is rejected, including by the database constraint. A submission to a draft or closed job is rejected.

## APP-002: Applicant reading

An Applicant MUST be able to read their own draft or submitted application and, after submission, the current HR review status. They MUST NOT read another Applicant's application, any HR note or status history, or perform an HR status action. Existing application reads remain available after job closure under [JMG-003](job-management.md) and [SEC-001](security-and-privacy.md).

Scenario: Given Applicant A's submitted application, when A opens it after HR changes status, then A sees the current status and their letter, including after job closure.

Denial scenario: Given Applicant B or an anonymous visitor, when they request A's application, status or notes, then no protected data is returned.

## APP-003: HR review, notes and separate status action

Authorized HR MUST be able to list and read only submitted applications for this portal, showing selected job, original submitted cover letter, current cover letter and current review status. HR MUST NOT see unsubmitted drafts. HR notes MUST be append-only records with author and creation time, readable only by authorized HR. The initial review status MUST be `Submitted` on explicit Applicant submission. Authorized HR MAY set `In review`, `Shortlisted` or `Rejected` through a separate explicit human action and MAY move among those three to correct a decision; HR MUST NOT set a submitted application back to `Submitted`. Every status action MUST preserve the application and record actor/time without exposing letter or note text in status events. AI text or output MUST NOT trigger notes or status actions. Submitted applications, notes and status remain available to HR after job closure, subject to [SEC-001](security-and-privacy.md). [AIS-002](hr-ai-summary.md) excludes AI status decisions.

Scenario: Given an authorized HR user and a submitted application, when HR opens its detail, adds a note and separately selects `In review`, then HR sees the authored note and new status while the Applicant sees only their own current status.

Denial/failure scenario: Given an unsubmitted draft, when HR requests its ID, then no draft is returned. Given an Applicant, anonymous visitor or stale/invalid status request, when the status action is attempted, then the write is denied without changing status or exposing notes.

## APP-004: Saved draft and revision boundary

An Applicant MUST be able to save and later resume one cover-letter draft per selected published job. Saving a draft MUST NOT submit it. While the job remains published, the Applicant MAY edit the saved draft. Explicit submission MUST retain an immutable snapshot of the first submitted letter and MUST freeze the current submitted letter. The Applicant MUST NOT edit submitted application text through the UI or a direct request, even while the job remains published. The Applicant MUST be told to contact HR to request a post-submission correction. When this freeze is introduced for existing submissions, the current letter MUST be frozen at one rollout cutoff without overwriting the original first-submission snapshot. Once a job closes, edits to drafts and new submissions MUST remain denied; existing records remain available under [SEC-001](security-and-privacy.md). SEC-001 defines who may read drafts and submitted text. [AID-002](applicant-ai-draft.md) remains the canonical home for AI-generated draft behavior.

Scenario: Given an authenticated Applicant on a published job, when they save and later edit a draft, then the private draft remains available and no submission exists. When they explicitly submit it, the original snapshot and submitted current letter are retained and frozen; an AI-generated draft remains editable until that separate save or submission action.

Denial scenario: Given a submitted application, when its owner attempts to edit the letter in the UI or through a direct request, then the write is denied and the UI directs them to HR for a correction request. Given a closed job, draft edits and new submissions are denied and existing records remain readable under SEC-001.

## APP-005: Applicant identity and contact details

Each new application MUST support a full name, verified account email, optional phone and optional portfolio URL in addition to its cover letter. Full name MUST be trimmed, bounded to 120 characters, exclude control characters and be nonblank on submission; incomplete drafts MAY omit it. Phone MUST be optional trimmed text bounded to 40 characters without control characters. Portfolio URL MUST be optional, bounded to 2,048 characters and, when supplied, an absolute HTTP(S) URL without embedded credentials. Blank optional values MUST be represented as absent. Account email MUST be displayed read-only from verified Auth identity; submission MUST record the current verified email from trusted Auth data, never browser input. Draft field saves MUST persist together with the letter as one revision and MUST NOT submit. Explicit submission MUST atomically freeze these details and the letter. Submitted details MUST be readable by the owner and authorised HR only under SEC-001, including after job closure, and MUST NOT be editable by either role through application writes. HR MUST NOT see draft details. Legacy submissions with absent fields MUST remain readable and clearly indicate details were not provided; missing data MUST NOT be fabricated from mutable account profiles. Existing drafts MAY supply these fields before submitting. Invalid saves/submissions MUST show safe field feedback while retaining entered values, without changing persisted state. APP-001/004 retain one application per job, job closure, submit-once and revision boundaries. SEC-005/007 govern exclusion from AI and logs.

- Given a partial private draft, when saved and resumed, then all entered details and letter persist without submission (form39-AC-01).
- Given a verified Applicant and valid values, when submitted, then trusted email and details freeze atomically; forged email input is ignored or rejected (form39-AC-02).
- Given invalid fields, when saving/submitting, then a safe error retains inputs and no partial write occurs (form39-AC-03).
- Given a submitted application, when the owner/HR open it, then permitted details display; draft/other-owner/anonymous reads are denied (form39-AC-04).
- Given submitted or closed-job records, when a prohibited write is attempted via UI/RPC, then the application is unchanged (form39-AC-05).
- Given a stale or lost-response write, when retried/reconciled, then no mismatched field set is reported saved and duplicate submission does not mutate existing contents (form39-AC-06).
- Given legacy data, when read or completed as a draft, then missing details are labelled or valid details can be submitted (form39-AC-07).
