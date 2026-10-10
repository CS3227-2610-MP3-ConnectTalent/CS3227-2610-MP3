# Delta: security-and-privacy.md

Issues #49/#50; Paul Cheng; proposed 2026-10-10; baseline canonical v1.4/24b1da8. [Canonical](../../../specs/security-and-privacy.md); approved by Paul, separately accepted with recorded limits on 2026-10-10 and synced to canonical v1.5 before archive. Original before/after clauses preserved.

## ADDED

None

## MODIFIED

### SEC-001

Before (24b1da8, canonical security-and-privacy.md):

## SEC-001: Access boundaries

Access MUST follow these boundaries. Additional profile, background-snapshot and attachment permissions have their canonical home in SEC-009 below:

| Data/action | Applicant access | HR access |
| --- | --- | --- |
| This company's published jobs, categories and requirements | Read | Read/close |
| Draft jobs | None | Read/write/publish |
| Closed jobs | Title of a job on their existing application | Read |
| Saved draft application and cover letter | Own draft read/write while its job is published; own read after closure | None |
| Submitted application, original/current letter and current review status | Own read; no submitted-letter or status write | Read for review; status write through a separate authorized human action |
| HR notes and status-change history | None | Read; append notes and status events through authorized actions |
| Role assignment | Cannot set or change | Controlled administration only |
| Audit events | None | Read as authorized |

Creating jobs, editing job drafts, publishing and closing MUST be restricted to HR. An Applicant MUST NOT edit another Applicant's draft or submission, change any submitted letter, change HR status or invoke the HR summary. Applicant A MUST NOT read Applicant B's application, status or AI draft, or see HR notes/history. Anonymous users MUST NOT read any protected application, note or status event or access AI endpoints. HR MUST NOT read unsubmitted drafts, including a draft owned before an account's controlled promotion from Applicant to HR. HR write actions MUST check a verified user's current HR role on the server and in the database. Status events and logs MUST exclude letter and note text. Closing a job MUST NOT broaden or revoke these existing-record read boundaries. [APP-004](../../../specs/applications-and-review.md) owns save/submit/edit lifecycle and job-close behavior. Public published-job browsing remains available under [JOB-001](../../../specs/public-job-listings.md).

Scenario: Given a submitted application, when its owner and authorized HR open it, then each sees their permitted fields; the owner sees current status but not notes/history.

Denial scenario: Given anonymous access, another Applicant or an HR user requesting a saved draft, when the record is fetched by direct ID, then server checks and RLS return no protected data. Given an Applicant sending an HR write request, when authorization runs, then the operation is denied.

After (complete replacement, same ID):

## SEC-001: Access boundaries

Access MUST follow these boundaries. Additional profile, background-snapshot and attachment permissions have their canonical home in SEC-009 below:

| Data/action | Applicant access | HR access |
| --- | --- | --- |
| This company's published jobs, categories and requirements | Read | Read/close |
| Draft jobs | None | Read/write/publish |
| Closed jobs | Title of a job on their existing application | Read |
| Saved draft application and cover letter | Own draft read/write while its job is published; own read after closure | None |
| Submitted application, original/current letter and current review status | Own read; no submitted-letter or status write | Read for review; status write through a separate authorized human action |
| HR notes and status-change history | None | Read; append notes and status events through authorized actions |
| Role assignment | Cannot set or change | Controlled administration only |
| Audit events | None | Read as authorized |

Creating jobs, editing job drafts, publishing and closing MUST be restricted to HR. An Applicant MUST NOT edit another Applicant's draft or submission, change any submitted letter, change HR status or invoke the HR summary. Applicant A MUST NOT read Applicant B's application, status or AI draft, or see HR notes/history. Anonymous users MUST NOT read any protected application, note or status event or access AI endpoints. HR MUST NOT read unsubmitted drafts, including a draft owned before an account's controlled promotion from Applicant to HR. HR write actions MUST check a verified user's current HR role on the server and in the database. Status events and logs MUST exclude letter and note text. Closing a job MUST NOT broaden or revoke these existing-record read boundaries. [APP-004](../../../specs/applications-and-review.md) owns save/submit/edit lifecycle and job-close behavior. Public published-job browsing remains available under [JOB-001](../../../specs/public-job-listings.md).

Scenario: Given a submitted application, when its owner and authorized HR open it, then each sees their permitted fields; the owner sees current status but not notes/history.

Denial scenario: Given anonymous access, another Applicant or an HR user requesting a saved draft, when the record is fetched by direct ID, then server checks and RLS return no protected data. Given an Applicant sending an HR write request, when authorization runs, then the operation is denied.

APP-008 withdrawal is the only new Applicant lifecycle write: a verified owner MAY withdraw their submitted record, including after closure, via the controlled operation only. HR cannot withdraw. Existing submitted read/download and notes privacy boundaries MUST remain after withdrawal; subsequent HR note/status writes and summary requests MUST be denied. Neither withdrawal nor retry grants general row UPDATE/DELETE or public Storage access.

Rationale: lifecycle/UI changes under #49/#50. Given the new state/action, when requested, then the added guard and existing access/freeze rules apply; unauthorized requests do not mutate or expose records.

## REMOVED

None. Canonical sync occurs only after separate acceptance.
