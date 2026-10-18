# Proposal: Scheduled job timezone handling

- Change ID: 2026-10-18-scheduled-job-timezone
- Issues: [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111)
- Owner: John (Johnwz123)
- Status: approved to implement browser-local scheduling with an explicit UTC no-JavaScript fallback
- Date: 2026-10-18
- Baseline: ProductSpec v1.17; [ProductSpec.md](../../ProductSpec.md)
- Affected capabilities: [job-management.md](../../specs/job-management.md) (JMG-004), [public-job-listings.md](../../specs/public-job-listings.md) (JOB-001)
- Classification: defect restoration and clarification of an underspecified time contract; application-layer behavior change, small scope, no data migration

## Intent, problem, and motivation

The HR form collects timezone-less `datetime-local` values. The server parses these as host-local times, and the edit form formats stored UTC instants with host-local getters. A server/browser timezone mismatch can therefore move a job's opening or closing instant and can change the value shown when HR edits it. HR and public detail pages also use implicit runtime timezone formatting. This can open or close applications at an unintended time, contrary to JMG-004 and JOB-001.

## Goals, non-goals, and scope boundaries

- Goals: remove dependence on the server process timezone; define one explicit schedule timezone contract; preserve round-trip entry/edit behavior with and without JavaScript; show the timezone with schedule values in HR and public views; test conversion and display behavior.
- Non-goals: change scheduling eligibility, publication/closure state, application authorization, UTC database storage, database schema, RLS, RPCs, or cron behavior.
- Users/roles: HR sets and edits schedule values; applicants and visitors read the public closing deadline. Existing server authorization and database access rules stay in force.
- Scope boundaries: `src/lib/hr-job-input.ts`, `src/app/hr/jobs/job-editor.tsx`, HR/public job detail schedule displays, focused unit tests, and JMG-004/JOB-001 documentation. No other job form, role, or persistence path is included.

## Alternatives and dependencies

| Alternative                                                                                                | Benefit / cost / risk                                                                                                                                                                                                    | Decision and reason                                                                                   |
| ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| Use the HR browser timezone for entry and each viewer's browser timezone for display; persist UTC instants | Matches each user's local clock while keeping one absolute instant in storage; viewers in different zones see different wall-clock values for the same event. A job's actual opening/closing instant remains consistent. | Chosen by John in chat on 2026-10-18; all schedule displays identify the browser's timezone.          |
| Use one explicit employer timezone for input, edit and display                                             | Gives every user the same announced wall-clock time; requires a fixed product timezone and makes the experience independent of browser settings.                                                                         | Rejected for this change because John selected per-user local interpretation and display.             |
| Keep current implicit runtime behavior                                                                     | No code cost; preserves the defect and ambiguous contract                                                                                                                                                                | Rejected                                                                                              |
| Use an explicit manual IANA timezone control for no-JavaScript submissions                                 | Lets a user choose a non-UTC zone without JavaScript; requires a timezone control and server-side DST-aware conversion                                                                                                   | Rejected for this bounded fix; John selected the simpler, labeled UTC fallback for no-JavaScript use. |

- Assumptions: persisted schedule values remain UTC instants; with JavaScript, the browser's IANA timezone defines local interpretation and display; without JavaScript, native HR schedule input is explicitly interpreted as UTC and labeled accordingly.
- Dependencies: issue #111; John's 2026-10-18 chat decision approves the bounded behavior and plan before implementation.
- Risks: browser-local times can be ambiguous during a daylight-saving fall-back and invalid during a spring-forward gap. The client conversion will reject normalized/nonexistent local values, preserve the selected browser-local instant as UTC, and show the timezone in use. A repeated local time follows the browser's standard `Date` disambiguation (earlier occurrence), a documented limitation. Users without JavaScript use the clearly labeled UTC fallback. No authorization or applicant-data boundary changes.
- Open decisions: none for this scope. Future support for choosing a timezone other than the current browser timezone requires a separate product decision.

## Acceptance evidence and artifacts

| Acceptance ID  | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                  | Required evidence and owner             |
| -------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------- |
| sched-tz-AC-01 | #111; JMG-004                                 | Given a schedule input and the approved timezone contract, when it is parsed on a server configured for a different timezone, then the resulting UTC instant is the same approved wall time. | Focused parser unit test; implementer   |
| sched-tz-AC-02 | #111; JMG-004                                 | Given an existing UTC schedule, when HR opens and saves the draft again, then the input round-trips without a time shift and identifies the approved timezone.                               | Editor/parser tests; implementer        |
| sched-tz-AC-03 | #111; JMG-004, JOB-001                        | Given a scheduled job, when HR or a public visitor sees its deadline, then the instant is rendered in that viewer's browser timezone and the timezone is identified.                         | HR/public formatting tests; implementer |
| sched-tz-AC-04 | #111; JMG-004                                 | Given invalid or reversed schedule values, when HR saves, then existing validation rejects the values and does not change scheduling rules.                                                  | Focused validation tests; implementer   |
| sched-tz-AC-05 | #111; JMG-004, OVR-004                        | Given JavaScript is disabled, when HR creates, edits, or clears an optional schedule and submits the native form, then the field is preserved and interpreted explicitly as UTC.             | Native-form parser/page tests; reviewer |

- Proposed spec delta: `specs/job-management.md` clarifies JMG-004 using the approved browser-local/UTC contract.
- Design: [design.md](design.md).
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Evidence record: [record.md](record.md).

## Approval record

- [x] Scope, issue criteria, affected IDs, and browser-local timezone contract reviewed.
- [x] Proposal, JMG-004 delta, design, and plan approved before product implementation.
- Approver: John (Johnwz123)
- Decision/date/source: John approved browser-local interpretation, UTC storage, and viewer-local display in direct chat on 2026-10-18; after independent review found a no-JavaScript regression, John selected the labeled UTC no-JavaScript fallback on 2026-10-18.
- Conditions: identify the timezone in affected controls and displays; preserve native form submissions, server authorization, UTC persistence, and existing scheduling rules.
