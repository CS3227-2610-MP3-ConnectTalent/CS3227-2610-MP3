# Proposal: HR recruitment dashboard

- Change ID: `2026-10-12-hr-dashboard`
- Issues: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68)
- Owner: John Wong (`Johnwz123`), confirmed in chat on 2026-10-12
- Status: approved for implementation
- Date: 2026-10-12
- Baseline: [ProductSpec v1.8](../../ProductSpec.md), commit `84761e1`
- Affected capabilities: [APP-003 / APP-008](../../specs/applications-and-review.md), [JMG-001 / JMG-003](../../specs/job-management.md), [SEC-001 / SEC-002](../../specs/security-and-privacy.md)
- Classification: behavior change; HR-only read path and navigation, no schema change

## Intent, problem, and motivation

HR currently uses separate job-management and application-review pages. A read-only landing page will summarize existing recruitment activity so HR can see job lifecycle totals, application review workload and per-job volumes before opening a detailed page. The user selected this feature for a visible, meaningful university software engineering project addition.

## Goals, non-goals, and scope boundaries

- Goals: add an authorized `/hr` dashboard with job counts by lifecycle state, active submitted-application counts by review status, a distinct withdrawn count, and per-job active/withdrawn counts. Link to existing HR job and application pages. Show zero/empty states and a safe unavailable state.
- Non-goals: applicant-facing metrics, new write actions, applicant ranking, AI, charts or export libraries, filtered review routes, database tables/views/RPCs, migration, and changes to application/job lifecycle rules.
- Users/roles: verified HR may view aggregates. Anonymous visitors and Applicants receive the existing HR route denial behavior. Public visitors and Applicants receive no counts.
- Scope boundaries: server-rendered `/hr` page, focused pure aggregation helper, `job_id` in the existing HR application-list read, HR navigation link, targeted tests and critical E2E registration, user-guide text, and the proposed APP-009 delta. Do not modify AI behavior or private application content.

## Alternatives and dependencies

| Alternative                                              | Benefit / cost / risk                                                                                    | Decision and reason                                                                                 |
| -------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Keep current separate HR pages                           | No implementation cost; HR still has no overview                                                         | Rejected because it does not meet the selected outcome                                              |
| Add a database view/RPC for counts                       | Can scale aggregation beyond application-list reads; adds a migration and another privilege/RLS boundary | Rejected for this bounded first version; current HR reads already provide the needed rows and roles |
| Aggregate existing HR reads in a pure server-side helper | Small, testable change with no new persistence or external service                                       | Proposed; reuse validated HR read modules and aggregate only after authorization                    |

- Assumptions: the single-employer deployment and current HR data volume are suitable for aggregating the existing list results in server memory. Reassess with database-side aggregation and paging if the HR list becomes large.
- Dependencies: issue #68 is triaged and assigned to John Wong; packet artifact approval is required before implementation. No external service or migration is needed.
- Risks: aggregate counts remain HR-sensitive; mitigate with existing `requireHR` checks and the signed-in RLS-scoped session. Duplicate job titles could merge counts; group strictly by `job_id`. Withdrawn records retain a prior review status; exclude them from active status totals and count them separately.
- Open decisions: none within the approved in-chat design. Packet approval is recorded; any scope change requires renewed approval.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                                                                     | Required evidence and owner                                        |
| ------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| HRD-AC-01     | #68; proposed APP-009; JMG-001/003            | Given an authorized HR account, when `/hr` loads, then it shows draft/published/closed job totals and active submitted application totals for Submitted, In review, Shortlisted and Rejected, with Withdrawn shown separately.                  | Unit aggregation and HR browser journey; John Wong                 |
| HRD-AC-02     | #68; proposed APP-009; APP-008                | Given multiple jobs including two with the same title and at least one closed job, when the dashboard groups application rows, then each job ID has its own active/withdrawn counts and the closed job remains present.                         | Unit fixture with duplicate titles plus browser fixture; John Wong |
| HRD-AC-03     | #68; proposed APP-009                         | Given no jobs or applications, when HR opens `/hr`, then the page shows zero counts and clear empty table guidance.                                                                                                                             | Unit/page test and browser empty-state assertion; John Wong        |
| HRD-AC-04     | #68; proposed APP-009; SEC-001/002            | Given an anonymous visitor or Applicant, when `/hr` is requested, then access is denied and no aggregate values are rendered.                                                                                                                   | Browser denial cases using synthetic records; John Wong            |
| HRD-AC-05     | #68; proposed APP-009; SEC-001/002            | Given an authorized HR user, when the page loads or either HR read fails, then it links only to existing HR pages and shows a generic unavailable message without applicant names, contact details, letters, notes, file data or query details. | Page unit tests, browser links/failure checks, review; John Wong   |

- Spec deltas: [`specs/applications-and-review.md`](specs/applications-and-review.md), proposed APP-009.
- Design: [`design.md`](design.md), required because this adds an HR-sensitive route and spans route, data, navigation and tests.
- Plan and tasks: [`plan.md`](plan.md) and [`tasks.md`](tasks.md).
- Evidence: [`record.md`](record.md).

## Approval record

- [x] Issue #68 is open, labeled `enhancement`, assigned to John Wong, and its scope/IDs/risks are recorded.
- [x] John Wong approved the bounded in-chat design on 2026-10-12 with “Looks good, please proceed.” This approval covers the short design only.
- [x] John Wong approved this proposal, APP-009 delta, design, and implementation plan before product code changes on 2026-10-12.
- Approver: John Wong, student owner
- Decision/date/source: John Wong approved the complete packet in chat on 2026-10-12 with “Looks good, I approve. Please proceed.”
- Conditions: keep implementation to the read-only, HR-only dashboard described here; record any scope change and obtain renewed approval.
