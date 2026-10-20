# Proposal: application and HR review regressions

- Change ID: 2026-10-19-review-flow-regressions
- Issues: [#120](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/120), [#121](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/121), [#122](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/122), [#123](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/123)
- Owner: Pending student assignment
- Status: approved for implementation and PR preparation
- Date: 2026-10-19
- Baseline: ProductSpec v1.18, 18 October 2026
- Affected capabilities: `applications-and-review.md` APP-002, APP-003, APP-004, APP-005/form39-AC-06, APP-007, APP-008 and APP-010
- Classification: defects restoring existing requirements; four bounded user-visible integrity, navigation, and record-reading defects

## Intent, problem, and motivation

The 19 October repository review reproduced four defects: stale application fields can be saved under a newer revision; a withdrawn application's résumé route can cancel a later active application upload for the same job; pending HR search can replace filters restored by browser history; and Applicant detail omits the current frozen letter on legacy records where it differs from the original snapshot.

## Goals, non-goals, and scope boundaries

- Goals: keep revision tokens aligned with displayed application data; reject the unscoped legacy résumé-cancel intent on application URLs; cancel stale debounced searches on history restoration; display both current and original letters when they differ.
- Non-goals: change canonical product behavior, storage schema, retention, hiring workflow, AI behavior, authorization roles, or issue scope.
- Users/roles: Applicants use draft and history pages; HR uses the review list. Existing server and RLS boundaries remain authoritative.
- Scope boundaries: application form/resume response state, application résumé API, Applicant application detail, HR search filter/navigation and their focused tests; workflow packet and dated log.

## Alternatives and dependencies

| Alternative                        | Benefit / cost / risk                                                                                         | Decision and reason                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Keep the current behavior          | No change cost; loses saved edits and violates existing requirements                                          | Rejected; four issues contain reproducible failures. |
| Repair each state boundary locally | Keeps existing data contracts and role rules; requires regression tests across concurrent and lifecycle cases | Chosen; matches the canonical specifications.        |

- Assumptions: issues #120–#123 restore specified behavior and require no canonical requirement delta.
- Dependencies: clean `develop` baseline `7495e576e8a4426834b294d4b36ab25300e6b65a`; local Supabase stack is available but its schema is two migrations behind.
- Risks: concurrent draft writes and withdrawn/reapplied record lifecycles; mitigate with optimistic revision checks and exact-record denial tests.
- Open decisions: none affecting product behavior; student ownership/acceptance remains a separate human gate.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                                                          | Required evidence and owner                                         |
| ------------- | --------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- |
| review-AC-01  | #122; APP-004, APP-005/form39-AC-06           | Given a stale form and newer persisted revision, when a stale action returns, then old fields cannot be saved as the new revision.                                                                                   | Test-first mounted/action tests; implementation evidence.           |
| review-AC-02  | #121; APP-007, APP-008                        | Given a withdrawn application URL and a newer same-job application, when the unsupported unscoped résumé-cancel intent is requested, then the API rejects it and the newer application's pending state is unchanged. | Test-first API denial test; no cross-application cancellation call. |
| review-AC-03  | #120; APP-010                                 | Given an outstanding debounced search, when Back/Forward restores filters, then the pending query cannot replace the restored URL/state.                                                                             | Test-first mounted browser-history test.                            |
| review-AC-04  | #123; APP-002, APP-003, APP-004               | Given a legacy record whose current and original letters differ, when its owner opens detail, then both are clearly labelled and readable.                                                                           | Test-first render test for equal/different snapshots.               |

- Spec deltas: none; all fixes restore current requirements.
- Design: `design.md` because shared revision state, lifecycle-bound API behavior, and multiple UI modules are involved.
- Plan and tasks: `plan.md` and `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] User requested creation of issues, fixes, commit/push, and a PR for these reviewed defects in the current chat on 2026-10-19. This authorizes implementation and PR preparation within the four issue scopes.
- Approver/source: user, direct request in this chat on 2026-10-19.
- Conditions: preserve canonical behavior; record ownership/acceptance separately; PR to `develop`; merge/release remain separate decisions.
