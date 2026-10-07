# HR AI summary

Baseline: ProductSpec v0.6, 5 October 2026.

Every summary endpoint follows the canonical [security and privacy contract](security-and-privacy.md), including denial of Applicant access and authorization before loading data.

## AIS-001: Selected submitted-letter inputs

The HR AI summary MUST accept only the selected submitted cover letter and that job's published requirements. Job-scoped loading and excluded data are defined in [SEC-005](security-and-privacy.md).

Scenario: Given authorized HR selecting a submitted application, when the summary request is made, then model input contains only that selected letter and its job's published requirements.

## AIS-002: Evidence summary without hiring decisions

The summary MUST return evidence mentioned in the letter, requirements not addressed in the letter and possible follow-up questions. It MUST NOT score, rank, reject or change status. HR MUST retain access to the original application and decide status through [APP-003](applications-and-review.md).

Scenario: Given a summary request, when HR receives the result, then it contains the three specified kinds of summary information without a score, ranking, rejection or status mutation. An adversarial letter cannot expose HR notes or change status under [SEC-003 / SEC-005](security-and-privacy.md).
