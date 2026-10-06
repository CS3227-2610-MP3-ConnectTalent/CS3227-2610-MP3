# Applications and review

Baseline: ProductSpec v0.6, 5 October 2026.

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
