# Applications and review

Baseline: ProductSpec v0.7, 7 October 2026 (APP-004 added; APP-001 through APP-003 retain their IDs and behavior).

Canonical ownership, notes and status permissions are in [SEC-001 / SEC-002](security-and-privacy.md).

## APP-001: Selected-job, submit-once application

An Applicant MUST be able to draft and edit a cover letter and submit at most one text-only application per selected published job. Each application MUST reference its selected job. A database constraint MUST enforce one application per applicant per job. New applications to draft or closed jobs MUST be denied.

Scenario: Given a published job, when an Applicant explicitly submits final text, then the application references that job. A second application by the same applicant to that job is rejected, including by the database constraint. A submission to a draft or closed job is rejected.

## APP-002: Applicant reading

An Applicant MUST be able to read their own application. Reading another applicant's application or changing HR status is denied by [SEC-001](security-and-privacy.md). Closing a job preserves existing applications under [JMG-003](job-management.md).

Scenario: Given Applicant A's submitted application, when A opens it, then A can read it; when Applicant B requests it, then access is denied.

## APP-003: HR review, notes and separate status action

HR MUST be able to read submitted applications and their original cover letters, write HR-only notes and update application status through a separate authorized action. HR retains the decision on status. [SEC-001](security-and-privacy.md) defines notes visibility and authorization; [AIS-002](hr-ai-summary.md) excludes AI status decisions.

Scenario: Given authorized HR reviewing a submitted application, when HR reads the original letter, writes a note and separately updates status, then those actions are available to HR under their permissions and the note remains inaccessible to Applicants.

## APP-004: Saved draft and revision boundary

An Applicant MUST be able to save and later resume one cover-letter draft per selected published job. Saving a draft MUST NOT submit it. Explicit submission MUST retain an immutable snapshot of the first submitted letter. While the job remains published, the Applicant MUST be able to edit the current submitted letter without creating a second application or changing HR status. Once the job closes, edits and new submissions MUST be denied; the existing draft or submission remains available under [SEC-001](security-and-privacy.md). SEC-001 defines who can read drafts, original text and current text. [AID-002](applicant-ai-draft.md) remains the canonical home for AI-generated draft behavior.

Scenario: Given an authenticated Applicant on a published job, when they save text and return later, then the private draft remains available and no submission exists. When they explicitly submit, the original snapshot is retained; later edits update current text while the job remains published.

Denial scenario: Given a closed job, when the owner tries to submit a draft or edit submitted text, then the write is denied and the existing record remains readable under SEC-001.
