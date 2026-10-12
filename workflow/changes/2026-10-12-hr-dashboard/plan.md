# Implementation plan: HR recruitment dashboard

- Issue: [#68](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/68)
- Owner/status/date: John Wong (Johnwz123); approved for implementation; 2026-10-12
- Inputs: proposal, APP-009 delta, design and plan approved in chat by John Wong on 2026-10-12
- Baseline: ProductSpec v1.8 at 84761e1; APP-003/008, JMG-001/003, SEC-001/002; proposed APP-009; HRD-AC-01 to HRD-AC-05
- Constraints: feat/68-hr-dashboard from clean develop; synthetic test data; no migration/provider calls. Before code, read the installed Next.js 16.3.8 guide in node_modules/next/dist/docs/.

## Dependency-ordered work

| ID                        | Dependency | Owner                       | IDs                                   | Files / expected change                                                                                         | Verification / evidence                                                                                              |
| ------------------------- | ---------- | --------------------------- | ------------------------------------- | --------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| T00 packet approval       | None       | John Wong                   | APP-009; HRD-AC-01 to 05              | Proposal, delta, design, plan, tasks, record                                                                    | Approved in chat on 2026-10-12; evidence recorded in packet                                                          |
| T01 failing tests         | T00        | John Wong                   | APP-009; HRD-AC-01 to 05              | tests/unit/hr-applications.test.ts, tests/unit/hr-dashboard.test.ts, tests/unit/hr-dashboard-page.test.tsx      | Focused Vitest fails for the missing behavior; record failure before implementation                                  |
| T02 data/page             | T01        | John Wong                   | APP-009; SEC-001/002; HRD-AC-01 to 05 | src/lib/hr-dashboard.ts, src/lib/hr-applications.ts, src/app/hr/page.tsx, src/components/account-navigation.tsx | Focused unit/page tests for status math, denial and safe read failure                                                |
| T03 browser/docs          | T02        | John Wong                   | APP-009; HRD-AC-01 to 05              | tests/e2e/hr-dashboard.spec.ts, tests/e2e/support/hr-dashboard-journey.ts, package.json, docs/UserGuide.md      | Synthetic HR journey; anonymous/Applicant denial; links, counts, empty/error; add to test:e2e:critical               |
| T04 final checks          | T02/T03    | John Wong                   | APP-009; HRD-AC-01 to 05              | No new behavior files                                                                                           | pnpm lint, pnpm typecheck, focused/full unit, pnpm build and local critical E2E as available; exact results recorded |
| T05 independent review    | T04        | Separate reviewer execution | SEC-001/002; HRD-AC-01 to 05          | Final diff/evidence                                                                                             | Record independent context, findings, fixes and rechecks; pending                                                    |
| T06 student acceptance    | T05        | John Wong                   | APP-009; HRD-AC-01 to 05              | Reviewed implementation and record                                                                              | Separate decision against actual evidence; pending                                                                   |
| T07 sync/archive/closeout | T06        | John Wong                   | APP-009                               | Canonical application spec/index/ProductSpec, archive, guide, dated logs summary                                | Sync accepted delta to v1.9, verify links/IDs, archive packet; record actual limits                                  |
| T08 PR                    | T07        | Authorized contributor      | #68                                   | Final diff and issue-linked PR                                                                                  | Conventional Commit title, Closes #68, template, checks/review/acceptance links; PR is last contributor action       |

## Integration and handoffs

T01 precedes implementation under repository test-first policy. Its query regression test observed the missing job_id selection before the fix. T02 adds job_id to the validated HR submitted-application row and aggregates validated job/application records in a pure helper. It does not add a public endpoint or browser query. T03 uses synthetic fixtures, keeps browser actions in a support module, and registers its E2E test with the critical script. No task changes canonical specs before student acceptance.

John Wong is the implementer. No subagent has been dispatched. Independent review is a separate execution and cannot be claimed by the implementer.

## Approval and completion evidence

- [x] John Wong approved the proposal, APP-009 delta, design and plan before product implementation.
- [x] Tasks match this order and record failing-then-passing evidence.
- [x] Independent review and student acceptance are separate gates.
- [x] User Guide, checks and implementation limitations are recorded; dated summary, separate review and student acceptance remain closeout gates.
- Approval: complete packet approved by John Wong in chat on 2026-10-12 (“Looks good, I approve. Please proceed.”).
- Plan changes: added the focused HR query regression test to T01 and extracted browser actions to tests/e2e/support/hr-dashboard-journey.ts for the repository function-length limit; behavior and acceptance scope are unchanged.
