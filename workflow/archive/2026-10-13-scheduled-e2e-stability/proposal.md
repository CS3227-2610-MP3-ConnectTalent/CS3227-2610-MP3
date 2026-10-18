# Proposal: stabilize the scheduled full Playwright suite

- Change ID: `2026-10-13-scheduled-e2e-stability`
- Issues: [#71](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/71); related accepted CI contract [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/55)
- Owner: Johnwz123; scope and ownership approved on 2026-10-13
- Status: approved for implementation
- Date: 2026-10-13
- Baseline: ProductSpec v1.9; `develop` at `e1115a06a8798b5ddc23cf3d6c267dd4e1176297`
- Affected capabilities: none; this is CI test maintenance
- Classification: defect in the scheduled test suite; medium size because the full local browser suite and one intermittent assertion need verification

## Intent, problem, and motivation

Scheduled Supabase CI run [#55](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38223999064) passed database checks and integration race suites, then failed in the full Playwright suite. Two resume-upload tests repeatedly hit Playwright strict-mode errors because a generic `getByRole("status")` matches both the invalid-PDF notice and in-flight save notices. A separate submitted-letter assertion failed once and passed on retry. The latest push run [#65](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/actions/runs/38365592473) passed the database, integration, and PR-critical browser jobs, but skipped the full scheduled/manual suite.

The current source renders distinct status messages for resume validation, resume upload, and application save. The observed deterministic failures are test selector ambiguity; they do not establish a product defect.

## Goals, non-goals, and scope boundaries

- Goals:
  - Make invalid-PDF assertions identify the validation message they intend to check.
  - Check every analogous resume-upload helper assertion, including the replacement-resume path.
  - Re-run the full browser suite against local Supabase and synthetic fixtures.
  - Investigate the submitted-letter flake if it recurs; preserve its trace and avoid guessing at a repair.
- Non-goals: Applicant UI behavior, Supabase schema or policy, hosted project data, schedule cadence, and Vitest report changes.
- Users/roles: repository contributors and maintainers; no Applicant/HR behavior changes.
- Scope boundaries: test helpers under `tests/e2e/support/`, and `tests/e2e/applicant-applications.spec.ts` only if its observed flaky assertion recurs with diagnostic evidence. Do not modify application code or weaken/remove the scheduled suite.

## Alternatives and dependencies

| Alternative                                                 | Benefit / cost / risk                                           | Decision and reason                                                                               |
| ----------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| Use a specific message/text locator for invalid-PDF notices | Preserves accessibility behavior and removes ambiguity in tests | Recommended; aligns the assertion with the intended message                                       |
| Remove one of the application's `role="status"` regions     | Could make the generic locator unique                           | Rejected; changes user-facing accessibility behavior without evidence that either status is wrong |
| Exclude the two failing specs from the scheduled suite      | Turns the run green quickly                                     | Rejected; hides existing coverage and violates issue #55's full-suite criterion                   |
| Change the full-suite schedule or workflow failure policy   | Avoids a red scheduled job                                      | Rejected; the failures are in test assertions, and failures should remain visible                 |

- Assumptions: the existing local test stack and synthetic fixtures are usable; a complete hosted schedule rerun is needed after integration to establish hosted behavior.
- Dependencies: issue #71; local Supabase and Mailpit; `pnpm test:e2e`.
- Risks: changing a locator can accidentally assert a different notice; use exact/filtered validation copy and preserve the invalid-upload assertion. The intermittent submitted-letter failure remains unresolved unless reproduced.
- Design: omitted. This is a bounded test-only selector correction; it changes no product interface, authorization, data flow, schema, or workflow architecture. The failure and test data path are documented in the record.
- Open decisions: implementation evidence, independent review, student acceptance, and PR closeout remain pending.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs        | Given / When / Then outcome                                                                                                                                                                                                | Required evidence and owner                                                 |
| ------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| SCHED-AC-01   | Issue #71; restores issue #55 acceptance criterion 4 | Given an invalid synthetic PDF and multiple live status regions, when the upload helper asserts the rejection, then it uniquely checks the validation notice and does not fail because unrelated save statuses also exist. | Focused Playwright runs for the affected resume/profile specs; implementer. |
| SCHED-AC-02   | Issue #71; no product-spec delta                     | Given the selector correction, when `pnpm test:e2e` runs on local Supabase with synthetic fixtures, then the scheduled/manual full suite completes successfully.                                                           | Exact full-suite command/output; implementer.                               |
| SCHED-AC-03   | Issue #71; no product-spec delta                     | Given the prior one-time submitted-letter failure, when the full suite is repeated, then the assertion passes; if it recurs, its trace is captured and the cause is resolved before the suite is called stable.            | Full-suite rerun and trace if needed; implementer/reviewer.                 |

- Spec deltas: none; no Applicant/HR behavior changes.
- Design: omission reason above; no architecture or application interface changes.
- Plan and tasks: [plan.md](plan.md), [tasks.md](tasks.md).
- Evidence: [record.md](record.md).

## Approval record

- [x] Issue scope and ownership triaged.
- [x] Human approved this proposal, design omission, and plan before implementation.
- Approver: Johnwz123
- Decision/date/source: explicit approval in this ChatGPT conversation on 2026-10-13.
- Conditions: none recorded

## PR review amendment — 2026-10-13

In response to PR #73 review, the test now waits for a non-user-facing `data-hydrated="true"` marker before replacing the controlled saved-letter value. The marker uses separate server and client snapshots so it remains false in server-rendered and initial hydration output, then becomes true after client hydration; it changes no displayed content, application initialization, authorization, persistence, or product requirement. The user authorized addressing the PR comments and committing/pushing the corrections in this conversation. The test retains the replacement-value and submitted-value assertions.

A review-run follow-up exposed several Applicant journey assertions expiring at Playwright's default five-second limit while local server actions were still completing. Traces recorded a successful save response after about 4.97 seconds and the expected interrupted-upload response after about 6.75 seconds. Playwright's assertion default is now 20 seconds for the E2E suite, matching the earlier diagnostic run that passed the focused specs; this changes no application behavior and still fails if an action does not complete within the bound.
