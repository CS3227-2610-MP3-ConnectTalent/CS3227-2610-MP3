# HR AI summary

Baseline: ProductSpec v1.1, 9 October 2026 (AIS-001/AIS-002 updated).

Every summary endpoint follows the canonical [security and privacy contract](security-and-privacy.md), including denial of Applicant access and authorization before loading data.

## AIS-001: Selected submitted-letter inputs

The HR AI summary MUST accept only one authorized submitted application's current cover letter as frozen under [APP-004](applications-and-review.md) and that job's published requirements. The server MUST verify the HR role before loading either field and MUST load no HR notes, status history, other application or unrelated personal data. Job-scoped loading and excluded data are defined in [SEC-005](security-and-privacy.md).

Scenario: Given authorized HR selecting a submitted application, when the summary request is made, then model input contains only that application's frozen current letter and its job's fixed published requirements.

Denial scenario: Given an Applicant, anonymous visitor, unsubmitted application or inaccessible application ID, when summary is requested, then it is denied before protected data or a model call is produced.

## AIS-002: Evidence summary without hiring decisions

The model response MUST contain only two arrays of integer sentence IDs: evidence IDs into the selected submitted letter and gap IDs into that job's published requirements. The server MUST reject extra fields, non-integers, duplicate IDs, more than five IDs in either array and IDs outside the corresponding source range. The server MUST map accepted IDs to bounded excerpts from those exact sources and generate neutral follow-up questions itself; no model-authored free text is returned in the HR summary. The displayed object MUST contain exactly three arrays: `evidence_mentioned`, `requirements_not_addressed` and `follow_up_questions`. Each array MUST contain no more than five strings, and each string MUST contain no more than 240 characters. The summary MUST NOT score, rank, recommend hiring or rejection, change status, create notes or trigger another action. HR MUST see it beside the source letter with a notice to verify every point against that letter. HR retains access to the application and alone decides status through [APP-003](applications-and-review.md).

Scenario: Given valid model JSON, when HR receives the summary, then the three bounded sections appear beside the submitted letter with a verification notice and no status change. An adversarial letter cannot expose HR notes or cause a hiring action under [SEC-003](security-and-privacy.md) and [SEC-005](security-and-privacy.md).

Denial/failure scenario: Given malformed output, provider failure or adversarial letter text requesting private data or a hiring action, when summary generation fails or completes, then no private data is added, no partial result is shown and application status remains unchanged.
