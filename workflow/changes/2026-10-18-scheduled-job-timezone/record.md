# Feature record: Scheduled job timezone handling

Status: in progress; approved browser-local timezone contract

Owner: John (Johnwz123)

Spec version: ProductSpec v1.17; [ProductSpec.md](../../ProductSpec.md)
Date: 2026-10-18

## Metadata and artifact links

- Change ID/classification: `2026-10-18-scheduled-job-timezone`; defect restoration and behavior clarification
- GitHub issue: [#111](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/111), assigned to Johnwz123
- Branch/commits/PR: `fix/111-scheduled-job-timezone`; baseline `1f6d87224aeb04194961919f59499f83f7fddb9d`; no implementation commit or PR yet
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Proposed delta: [specs/job-management.md](specs/job-management.md)
- Plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v1.17, 16 October 2026; `develop` at `1f6d87224aeb04194961919f59499f83f7fddb9d`
- Archive path: pending approval, implementation, review, acceptance and closeout

## Approval checklist

- [x] Issue created and assigned; actual issue #111 records scope, reproduction, risk and affected IDs.
- [x] Human approval of proposal, timezone delta, design and plan. John approved browser-local entry/display and UTC storage in chat on 2026-10-18.
- [ ] Implementation and relevant checks complete.
- [ ] Independent review complete; no reviewer run has occurred.
- [ ] Human acceptance recorded separately.
- [ ] Dated session summary and applicable guide/reflection updates complete.
- [ ] Pre-PR closeout complete and PR opened last.
- [ ] Accepted canonical delta synced before archive.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement IDs | Observable outcome | Evidence, result and limitation |
| --- | --- | --- | --- |
| sched-tz-AC-01 | #111; JMG-004 | HR-browser-local input is converted to the corresponding UTC instant independently of the server timezone. | Pending test-first implementation. |
| sched-tz-AC-02 | #111; JMG-004 | Existing UTC timestamps round-trip through the HR editor in HR-browser-local time without shifting. | Pending tests. |
| sched-tz-AC-03 | #111; JMG-004, JOB-001 | HR and public views display each instant in the viewer's browser timezone and label that timezone. | Pending tests. |
| sched-tz-AC-04 | #111; JMG-004 | Invalid, timezone-less, DST-gap, or reversed values are rejected without persistence. | Pending focused validation tests. |

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Intake/proposal, primary assistant | User request, issue #111, current specs/source | Draft issue/packet; incorporated John's browser-local interpretation/display and UTC storage decision | John approved scope/plan in chat on 2026-10-18 |

No separate reviewer or subagent execution has occurred.

## Implementation and tests

Changed files so far: issue packet documents only; application implementation has not started.

Commands and results:

- `git status --short --branch`, baseline/remote commit inspection: clean `develop` at `1f6d872` before branch creation; `origin/develop` matched.
- `rg` source inspection confirmed server-local `Date` parsing/formatting and default-locale schedule display. No runtime reproduction has been performed.
- Next.js local documentation read: Server and Client Components and Server Action forms guides; no code changed.
- Supabase skill reviewed; no Supabase schema, RLS, RPC or storage change is proposed.
- Unit tests, lint, typecheck and build: not run yet; implementation evidence is pending.

Security/adversarial cases: no authorization or private data flow changes proposed. Existing safe parse failure and ordering behavior must remain verified after approval.

Known limitations: code and test evidence are pending; daylight-saving overlap behavior uses the browser's earlier local-time occurrence. This packet is not evidence of behavior correction.

## Review and decision

- Reviewer findings/fixes: pending separate reviewer execution after implementation.
- Human decision/date: John approved HR-browser-local interpretation, UTC database storage, and viewer-browser-local display on 2026-10-18 in direct chat.
- Guide/reflection/log updates: pending; dated session summary will be created during closeout.

## Session evidence index

| Date/session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-18 active session | pending | Created issue #111, assigned owner, traced parser/editor/display paths, and prepared/approved the packet | Source inspection only; implementation and checks pending |

## Canonical sync and archive

- Accepted delta/human decision: proposed browser-local input and display with UTC storage, approved by John on 2026-10-18; canonical sync awaits implementation review and separate acceptance.
- Canonical sync commit/files/version/date: pending; proposed v1.18 if accepted.
- Sync verification: pending.
- Archive decision/date/path: pending approval and closeout.
- Navigation repairs after moving: pending.
- Outstanding work: implementation/test evidence, separate review, student acceptance, canonical sync, log, archive and PR.
