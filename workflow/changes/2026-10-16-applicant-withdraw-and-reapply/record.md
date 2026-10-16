# Feature record: Allow Applicants to Withdraw and Reapply

Status: proposed

Owner: John Wong (`Johnwz123`)

Spec version: ProductSpec v1.15, 15 October 2026 ([ProductSpec.md](../../ProductSpec.md))
Date: 2026-10-16

## Metadata and artifact links

- Change ID/classification: `2026-10-16-applicant-withdraw-and-reapply`; behavior change
- GitHub issues: [#90](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/90)
- Branch/commits/PR: `feat/90-applicant-withdraw-and-reapply`; PR pending implementation
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/applications-and-review.md](specs/applications-and-review.md)
- Implementation plan/tasks: [plan.md](plan.md) and [tasks.md](tasks.md)
- Baseline: ProductSpec v1.15, commit `2a56ba1`
- Archive path: Pending (`workflow/archive/2026-10-16-applicant-withdraw-and-reapply/`)

## Approval checklist

- [x] Issue triaged and scope agreed; issue #90 recorded.
- [ ] Human approved proposal, deltas, design or omission, and plan before product implementation.
- [ ] Implementation and relevant checks complete with actual evidence below.
- [ ] Independent review complete; findings and unresolved matters recorded.
- [ ] Human acceptance recorded separately from implementation and review.
- [ ] Relevant guides/reflections updated and every session log linked.
- [ ] Pre-PR closeout complete; contributor PR opened last with issue links.
- [ ] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| `reapply-AC-01` | Issue #90; `APP-001` | Given an applicant who withdrew their application for an open job, when they navigate to `/jobs/[id]/apply`, then they can start and save a new draft application without conflict. | Pending implementation |
| `reapply-AC-02` | Issue #90; `APP-001` | Given an applicant with a saved draft after withdrawal, when they submit the application, then the submission succeeds and a new active application is created with status `Submitted`. | Pending implementation |
| `reapply-AC-03` | Issue #90; `APP-001`, `APP-008` | Given an applicant with an active (non-withdrawn) application, when a second application insert is attempted, then the partial unique index rejects it. | Pending implementation |
| `reapply-AC-04` | Issue #90; `APP-008` | Given an applicant who withdrew and reapplied, when viewing applicant and HR detail views, then the prior withdrawn application and the new application are both accessible with their distinct timestamps, snapshots, and review states. | Pending implementation |
| `reapply-AC-05` | Issue #90; `APP-001`, `JMG-004` | Given a closed job or scheduled job before opening, when an applicant who previously withdrew attempts to reapply, then the request is rejected with safe feedback. | Pending implementation |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Product Analyst (Self) | Issue #90; canonical `applications-and-review.md` | Prepared proposal.md and spec deltas for `APP-001` and `APP-008` | Pending review |
| Solution Architect (Self) | Proposal, constraints | Prepared design.md and plan.md specifying partial unique index | Pending review |
| Implementer | Approved proposal, deltas, design, plan | Pending T00 approval | Pending |
| Independent Reviewer | Commit range after implementation | Pending | Pending |

## Implementation and tests

Changed files: Pending implementation.

Commands and results: Pending implementation.

## Review and decision

- Reviewer identity and independence: Pending independent review subagent.
- Findings/resolutions: Pending.
- Human decisions: Pending student review in chat.
