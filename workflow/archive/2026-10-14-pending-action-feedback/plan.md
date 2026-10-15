# Plan: pending feedback for slow form actions

- Change/issue: `2026-10-14-pending-action-feedback`; [#81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Owner/status/date: Paul Cheng; approved for implementation; 14 October 2026
- Inputs: [proposal](proposal.md), [OVR-004 delta](specs/product-overview.md), [design](design.md)
- Baseline: `origin/develop` `f65f699`, ProductSpec v1.10
- Constraints: `feat/81-pending-action-feedback`; no schema/AI/provider changes, no hosted operation; preserve unrelated profile/résumé packet

| Order | Task                                                                                                                                                     | Evidence                                              |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| T01   | Obtain explicit student approval for this complete packet.                                                                                               | Approval source/date in record; implementation waits. |
| T02   | Write focused failing tests for pending/disabled, native invalid input, error recovery and separate-form ownership.                                      | Preserve red command/output.                          |
| T03   | Implement shared or existing-state submit feedback; apply to audited auth/navigation/HR forms while retaining established Applicant/AI pending behavior. | Minimal reviewed diff.                                |
| T04   | Run focused unit and browser checks, typecheck, lint, format and build; inspect no-JavaScript fallback and relevant role flows.                          | Exact commands/results, limits in record.             |
| T05   | Obtain independent review of changed UI, repeat-click and security boundaries; fix and recheck findings.                                                 | Actual reviewer identity and handoff.                 |
| T06   | Ask Paul for separate acceptance. If accepted, sync OVR-004, archive packet, update guides/log, inspect final diff.                                      | Acceptance source and closeout evidence.              |
| T07   | Commit/push and open issue-linked PR into `develop` only when separately authorized under standing instruction.                                          | Actual commit/PR or pending stated honestly.          |

Test-first applies to the behavior code. Database tests are N/A because no SQL/data boundary changes; existing server guards remain. Cross-browser/hosted checks are useful but must be recorded as not run if unavailable. Existing affected pages have independent forms, so a shared pending component must read the closest form only. Changes to action permissions or latency remediation would require a new plan and approval.

Paul authorized this concrete plan by answering “Approve plan and implement” on 14 October 2026 in this conversation. Branch creation had been authorized separately by the original request.
