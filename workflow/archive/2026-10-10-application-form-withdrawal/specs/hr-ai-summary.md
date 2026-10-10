# Delta: hr-ai-summary.md

Issues #49/#50; Paul Cheng; proposed 2026-10-10; baseline canonical v1.4/24b1da8. [Canonical](../../../specs/hr-ai-summary.md); approved by Paul, separately accepted with recorded limits on 2026-10-10 and synced to canonical v1.5 before archive. Original before/after clauses preserved.

## ADDED

None

## MODIFIED

### AIS-001

Before (24b1da8, canonical hr-ai-summary.md):

## AIS-001: Selected submitted-letter inputs

The HR AI summary MUST accept only one authorized submitted application's current cover letter as frozen under [APP-004](../../../specs/applications-and-review.md) and that job's published requirements. The server MUST verify the HR role before loading either field and MUST load no HR notes, status history, other application or unrelated personal data. Job-scoped loading and excluded data are defined in [SEC-005](../../../specs/security-and-privacy.md).

Scenario: Given authorized HR selecting a submitted application, when the summary request is made, then model input contains only that application's frozen current letter and its job's fixed published requirements.

Denial scenario: Given an Applicant, anonymous visitor, unsubmitted application or inaccessible application ID, when summary is requested, then it is denied before protected data or a model call is produced.

After (complete replacement, same ID):

## AIS-001: Selected submitted-letter inputs

The HR AI summary MUST accept only one authorized submitted application's current cover letter as frozen under [APP-004](../../../specs/applications-and-review.md) and that job's published requirements. The server MUST verify the HR role before loading either field and MUST load no HR notes, status history, other application or unrelated personal data. Job-scoped loading and excluded data are defined in [SEC-005](../../../specs/security-and-privacy.md).

Scenario: Given authorized HR selecting a submitted application, when the summary request is made, then model input contains only that application's frozen current letter and its job's fixed published requirements.

Denial scenario: Given an Applicant, anonymous visitor, unsubmitted application or inaccessible application ID, when summary is requested, then it is denied before protected data or a model call is produced.

A withdrawn application under APP-008 MUST be ineligible for a new summary request. Eligibility MUST be verified before protected input loading/provider invocation and rechecked before returning a response. A withdrawal committed during an already in-flight provider request MUST prevent the response being returned as a current review summary; this does not claim the external request can be recalled.

Rationale: lifecycle/UI changes under #49/#50. Given the new state/action, when requested, then the added guard and existing access/freeze rules apply; unauthorized requests do not mutate or expose records.

## REMOVED

None. Canonical sync occurs only after separate acceptance.
