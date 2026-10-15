# Feature record: Scheduled job opening and closing times

Status: proposed

Owner: John (Johnwz123)

Spec version: ProductSpec v1.11; [ProductSpec.md](../../ProductSpec.md)
Date: 2026-10-15

## Metadata and artifact links

- Change ID/classification: 2026-10-15-scheduled-job-times; behavior change (medium)
- GitHub issues: [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88)
- Branch/commits/PR: `feat/88-scheduled-job-times`; PR pending
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: [specs/job-management.md](specs/job-management.md), [specs/public-job-listings.md](specs/public-job-listings.md)
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v1.11, commit `f5da004`
- Archive path: pending (`workflow/archive/2026-10-15-scheduled-job-times/`)

## Approval checklist

- [x] Issue triaged and scope agreed; actual issue [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88) recorded.
- [x] Human approved proposal, deltas, design, and plan before product implementation. Approved by John (Johnwz123) on 2026-10-15.
- [ ] Implementation and relevant checks complete with actual evidence below.
- [ ] Independent review complete; findings and unresolved matters recorded.
- [ ] Human acceptance recorded separately from implementation and review.
- [ ] Relevant guides/reflections updated and every session log linked.
- [ ] Pre-PR closeout complete; contributor PR opened last with issue links.
- [ ] Accepted canonical delta synced before complete packet archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| ------------------- | --------------------------------------------------- | ------------------------------------- | ------------------------------- |
| sched-AC-01 | #88; JMG-004; [job-management.md](../../specs/job-management.md) | Given a draft with future `opens_at`, when published, it displays as "Scheduled" to HR and is hidden from public listings and application submissions until `opens_at`. | Pending implementation |
| sched-AC-02 | #88; JMG-004; [job-management.md](../../specs/job-management.md) | Given a scheduled job before `opens_at`, when HR reverts it to draft, it returns to draft state with editable content and schedule. | Pending implementation |
| sched-AC-03 | #88; JMG-004, JOB-001; [public-job-listings.md](../../specs/public-job-listings.md) | Given an active job whose `closes_at` has passed, it disappears from public listings and rejects application draft saves/submissions. | Pending implementation |
| sched-AC-04 | #88; JMG-003, JMG-004; [job-management.md](../../specs/job-management.md) | Given any scheduled or live job, HR can explicitly close it at any time, permanently preserving applications and locking the job. | Pending implementation |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| ------------- | ---------------------- | ---------------------- | ------------------ |
| Product analyst / Architect | Issue #88, baseline specs | Proposal, design, spec deltas, implementation plan | Pending human approval |

## Implementation and tests

Changed files: (pending)

Commands and results: (pending)

## Review and decision

- Reviewer identity and independence: (pending)
- Findings/resolutions: (pending)
- Human decisions: (pending student approval)

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| -------------- | ---------------- | ---------------------------------- | -------------------------------------- |
| 2026-10-15 | Pending closeout | Issue #88 intake, packet creation, proposal & design | In progress |

## Canonical sync and archive

(Pending completion and human acceptance)

