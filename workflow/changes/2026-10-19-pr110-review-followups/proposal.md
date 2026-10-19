# Proposal: PR #110 review follow-ups

- Change ID: `2026-10-19-pr110-review-followups`
- Issues: [#115](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/115), [#116](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/116), [#117](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/117), [#118](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/118)
- Owner: Unassigned for triage; requester identity/role not confirmed in this chat
- Status: Approved bounded repair scope; implementation in progress
- Date: 2026-10-19
- Baseline: ProductSpec v1.17, `develop` commit `3c9ba769f536679a3f546b5e5fbf5a254f059104`
- Affected capabilities: `applications-and-review.md` (APP-001, APP-005, APP-007, APP-008, APP-009, APP-010), `job-management.md` (JMG-004)
- Classification: Behavior corrections restoring existing requirements; no new product behavior

## Intent, problem, and motivation

PR #110 (`feat: release develop to master`) received six inline review findings. The scheduled-timezone finding is already addressed on current `develop` by the UTC fallback work in `src/lib/hr-job-input.ts`; it is excluded from this change. Five remaining findings are reproducible from the current source: rapid HR filter changes can lose state, oversized application pages select the last page, refreshed résumé props do not update the hidden application revision, withdrawal copy denies supported reapplication, and dashboard lifecycle status ignores schedule expiry.

The requester directed that the necessary findings be fixed on a branch from `develop`, with a follow-up PR targeting `develop`; production promotion to `master` remains a separate manual step.

## Goals, non-goals, and scope boundaries

- Goals: preserve the latest intended HR filter state across concurrent navigation/debounce; return out-of-range application pages to page 1; reconcile application identity/revision from refreshed server props; state accurately that only the withdrawn record is terminal; derive dashboard row status and counts from the existing operational schedule status.
- Non-goals: change canonical requirements, schedule storage or job lifecycle writes, application authorization/RLS, optimistic-concurrency enforcement, resume validation/storage, AI behavior, or deploy/merge to `master`.
- Users/roles: authorized HR users for application filters and dashboard; Applicants for draft and withdrawal messaging. Existing server authorization remains authoritative.
- Scope boundaries: the affected HR application/filter helpers, Applicant application form/withdrawal copy, and HR dashboard aggregation/rendering. No schema, migrations, provider integration, or privileged access changes.

## Alternatives and dependencies

| Alternative                                    | Benefit / cost / risk                                                       | Decision and reason                                               |
| ---------------------------------------------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Leave findings on the closed release PR        | No new code; leaves current source inconsistent with canonical requirements | Rejected because the five behaviors remain incorrect on `develop` |
| Apply only comment-specific source corrections | Restores accepted APP/JMG behavior without expanding requirements           | Chosen                                                            |

- Assumptions: existing canonical requirements remain authoritative; the review scenarios use synthetic/non-private data.
- Dependencies: the four related bug issues above; current `develop` baseline; existing operational job-status helper.
- Risks: route transitions and refreshed server props must not overwrite newer client intent; rollback is a revert of the focused fix commit(s).
- Open decisions: student owner and final acceptance remain pending; no product-policy decision is introduced.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical IDs | Given / When / Then outcome                                                                                                                                                                                         | Required evidence and owner                                                                 |
| ------------- | --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| PR110-AC-01   | #115; APP-010                     | Given rapid filter changes or a pending search, when navigation is built, then it retains the latest combined values; a page beyond the result range displays page 1.                                               | Focused source/test review and applicable local checks; contributor, then separate reviewer |
| PR110-AC-02   | #116; APP-005/007                 | Given a committed résumé mutation and refreshed server props, when the Applicant next saves/submits, then the form carries the refreshed application identity/revision without weakening server concurrency checks. | Focused source review and applicable local checks; contributor, then separate reviewer      |
| PR110-AC-03   | #117; APP-001/008                 | Given withdrawal confirmation, when the Applicant reads it, then it says the current record cannot be reopened and a new application may be started only while the job remains open.                                | Copy/spec review; contributor, then separate reviewer                                       |
| PR110-AC-04   | #118; APP-009/JMG-004             | Given a published job past `closes_at`, when HR opens the dashboard, then the row and closed total show operationally Closed without mutating stored status.                                                        | Focused source review and applicable local checks; contributor, then separate reviewer      |
| PR110-AC-05   | PR #110 timezone finding          | Given current `develop`, when schedule input is parsed without an explicit browser timestamp, then the existing UTC fallback remains present and unchanged.                                                         | Baseline/source comparison; contributor                                                     |

- Spec deltas: none; fixes restore existing clauses.
- Design: separate architecture design omitted; see `design.md` for the bounded rationale and data-flow notes.
- Plan and tasks: `plan.md`, `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed against PR #110 feedback and canonical requirements.
- [x] Proposal, no-delta statement, design omission, and plan approved for this bounded repair by the requester through the direct instruction on 2026-10-19 to create a branch from `develop` and implement necessary fixes from the fetched review comments.
- Approver: Requester; personal name and student role are not confirmed by this chat context.
- Decision/date/source: Approve bounded implementation and follow-up PR to `develop`; direct conversation, 2026-10-19 (Asia/Singapore).
- Conditions: correct only the five still-present findings; do not promote to `master`; final student acceptance of the reviewed revision remains a distinct pending gate.
