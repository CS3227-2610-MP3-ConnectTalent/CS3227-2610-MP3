# Job management

Baseline: ProductSpec v0.6, 5 October 2026.

Job fields and categories are defined in [JOB-002 / JOB-003](public-job-listings.md). Canonical permissions for every state are in [SEC-001 / SEC-002](security-and-privacy.md).

## JMG-001: Draft creation and editing

HR MUST be able to create and edit this company's draft job listings. Jobs MUST be managed as draft, published or closed.

Scenario: Given authorized HR, when they create a draft and edit its content, then the draft reflects the edits without appearing in public listings.

## JMG-002: Explicit publication and fixed content

HR MUST explicitly publish jobs. Published job content MUST stay fixed so submitted applications can be reviewed against the same requirements; published and closed content MUST NOT be edited. Only published jobs accept new applications, as defined in [APP-001](applications-and-review.md).

Scenario: Given an HR-created draft, when HR publishes it, then it becomes available publicly and accepts applications; subsequent edits to published content are denied.

## JMG-003: Closing preserves applications

HR MUST be able to explicitly close a published job. Closing MUST preserve its existing applications for applicants and HR. See [SEC-001](security-and-privacy.md) for closed-job visibility and [APP-001](applications-and-review.md) for submission eligibility.

Scenario: Given a published job with an existing application, when HR closes it, then the existing application remains available under its access rules, the job no longer appears publicly or accepts new applications, and its content cannot be edited.
