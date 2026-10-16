# Feature record: Allow Applicants to Withdraw and Reapply

Status: accepted

Owner: John Wong (`Johnwz123`)

Spec version: ProductSpec v1.16, 16 October 2026 ([ProductSpec.md](../../ProductSpec.md))
Date: 2026-10-16

## Metadata and artifact links

- Change ID/classification: `2026-10-16-applicant-withdraw-and-reapply`; behavior change
- GitHub issues: [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Branch/commits/PR: `feat/90-applicant-withdraw-and-reapply`; PR [#91](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/91)
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/applications-and-review.md](specs/applications-and-review.md)
- Implementation plan/tasks: [plan.md](plan.md) and [tasks.md](tasks.md)
- Baseline: ProductSpec v1.15, commit `2a56ba1`
- Archive path: `workflow/archive/2026-10-16-applicant-withdraw-and-reapply/`

## Approval checklist

- [x] Issue triaged and scope agreed; issue #90 recorded.
- [x] Human approved proposal, deltas, design or omission, and plan before product implementation.
- [x] Implementation and relevant checks complete with actual evidence below.
- [x] Independent review complete; findings and unresolved matters recorded.
- [x] Human acceptance recorded separately from implementation and review.
- [x] Relevant guides/reflections updated and every session log linked.
- [x] Pre-PR closeout complete; contributor PR opened last with issue links.
- [x] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| `reapply-AC-01` | Issue #90; `APP-001` | Given an applicant who withdrew their application for an open job, when they navigate to `/jobs/[id]/apply`, then they can start and save a new draft application without conflict. | Verified: `tests/unit/applications.test.ts`, `tests/unit/apply-page.test.tsx` pass. Database test `reapply_after_withdrawal.test.sql:42-46` executed and passing in GitHub Actions CI Database checks (run 38874529048; local Docker unavailable). |
| `reapply-AC-02` | Issue #90; `APP-001` | Given an applicant with a saved draft after withdrawal, when they submit the application, then the submission succeeds and a new active application is created with status `Submitted`. | Verified: `tests/unit/applications.test.ts` passes. Database test `reapply_after_withdrawal.test.sql:48-52, 69-72` executed and passing in GitHub Actions CI Database checks (run 38874529048; local Docker unavailable). |
| `reapply-AC-03` | Issue #90; `APP-001`, `APP-008` | Given an applicant with an active (non-withdrawn) application, when a second application insert is attempted, then the partial unique index rejects it. | Verified: `applications_one_active_per_applicant_job` partial unique index verified in pgTAP `reapply_after_withdrawal.test.sql:6-14, 88-97` executed and passing in GitHub Actions CI (run 38874529048). |
| `reapply-AC-04` | Issue #90; `APP-008` | Given an applicant who withdrew and reapplied, when viewing applicant and HR detail views, then the prior withdrawn application and the new application are both accessible with their distinct timestamps, snapshots, and review states. | Verified: `tests/unit/applications.test.ts:130-158` passes. Database test `reapply_after_withdrawal.test.sql:56-66, 99-107` executed and passing in GitHub Actions CI (run 38874529048). |
| `reapply-AC-05` | Issue #90; `APP-001`, `JMG-004` | Given a closed job or scheduled job before opening, when an applicant who previously withdrew attempts to reapply, then the request is rejected with safe feedback. | Verified: RPC schedule window checks. Database test `reapply_after_withdrawal.test.sql:109-125` executed and passing in GitHub Actions CI (run 38874529048). |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Product Analyst (Self) | Issue #90; canonical `applications-and-review.md` | Prepared proposal.md and spec deltas for `APP-001` and `APP-008` | Approved by John in chat |
| Solution Architect (Self) | Proposal, constraints | Prepared design.md and plan.md specifying partial unique index | Approved by John in chat |
| Implementer | Approved proposal, deltas, design, plan | Implemented migration, schema, data access, and unit/pgTAP tests in `05d772d` | Verified via test suites |
| Independent Reviewer | Commit range `eda874d..05d772d` | Handoff report in [handoffs/independent-review.md](handoffs/independent-review.md); recommendation: Approved | Accepted by John in chat on 2026-10-16 |
| Integration Lead (Self) | Accepted deltas and packet closeout | Canonical spec sync, ProductSpec v1.16 baseline, archive, and session log | [Session log](../../logs/2026-10-16-applicant-withdraw-and-reapply.md) |

## Implementation and tests

Changed files:
- `supabase/migrations/20261016000000_applicant_reapply.sql`
- `supabase/tests/database/reapply_after_withdrawal.test.sql`
- `src/lib/applications.ts`
- `tests/unit/applications.test.ts`
- `tests/unit/apply-page.test.tsx`
- `tests/unit/data-access.test.ts`

Commands and results:
- `pnpm typecheck`: Exit code 0 (`tsc --noEmit` found 0 errors)
- `pnpm lint`: Exit code 0 (`eslint` reported 0 errors and 0 warnings)
- `pnpm test:unit`: Exit code 0 (91 test files, 538 tests passed)

## Review and decision

- Reviewer identity and independence: Independent Reviewer subagent (`d929e6b6-eaab-4fe2-9bf0-0b8b4614258c`), executed in a separate invocation from implementation.
- Findings/resolutions: No blocking findings, zero defects. Recommendation: Approved. See [handoffs/independent-review.md](handoffs/independent-review.md).
- Human decisions: Accepted and approved by John Wong in chat on 2026-10-16. Spec deltas synced to canonical `applications-and-review.md` and packet archived. See [session log](../../logs/2026-10-16-applicant-withdraw-and-reapply.md).


