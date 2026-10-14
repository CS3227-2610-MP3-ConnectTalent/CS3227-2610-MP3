# Proposal: pending feedback for slow form actions

- Change ID: `2026-10-14-pending-action-feedback`
- Issue: [#81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Owner: Paul Cheng; Applicant and shared UI, with HR form presentation in scope
- Status: approved by Paul; 14 October 2026
- Baseline: [ProductSpec v1.10](../../ProductSpec.md), `origin/develop` at `f65f699`
- Affected capability: proposed [OVR-004](specs/product-overview.md); existing ACC-001/004/005, APP-001/003 and JMG-001/002/003 remain authoritative for the actions themselves
- Classification: bounded UI behavior change; low data risk, moderate interaction/regression risk

## Problem and scope

Vercel actions can take several seconds. The sign-in submit button currently gives no immediate indication that its request started. The audit also found unmarked submissions for sign out, password-reset request, HR notes/status, and HR job save/publish/close. Signup and password update disable themselves but do not show a pending label. Existing Applicant save/upload/withdrawal and AI requests already have pending behavior and will be retained.

Add prompt visual and accessible feedback to every uncovered server-action submit, and disable its submit button until that action settles or redirects. Keep native HTML validity checks and the existing errors. A local-only button or navigation link does not need a network pending state. No artificial delay or claim that the backend became faster is proposed.

## Alternatives and boundaries

| Choice                                                              | Decision                                                                          |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Tell users to wait several seconds                                  | Rejected: gives no feedback or protection from repeated clicks.                   |
| Global overlay for every interaction                                | Rejected: blocks unrelated controls and obscures separate form ownership.         |
| Small form-scoped pending control using React/Next supported status | Proposed: immediate local feedback, native form behavior and minimal shared code. |

Applicant and HR authorization, validation, transaction/idempotency and Supabase RLS remain unchanged. Client disabling reduces accidental repeat clicks but is not a server-side duplicate-prevention guarantee. No AI prompt/data, attachment, schema, API or hosted setting changes. The unrelated untracked profile/résumé packet is out of scope.

## Acceptance

| ID         | Given / When / Then                                                                                                                                                                                                          | Evidence                                                  |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| UI81-AC-01 | Given a valid sign-in form, when Sign in is submitted against a delayed server response, then it immediately says Signing in…, exposes pending status, and prevents a second submit until redirect/error.                    | Focused browser delay check plus component regression.    |
| UI81-AC-02 | Given the other uncovered auth, HR and navigation server-action forms, when each valid form submits, then its own action shows a specific pending label/status and disables repeat activation until resolution.              | Component/form tests and representative HR browser check. |
| UI81-AC-03 | Given invalid native input or a returned action failure, when the attempt is rejected, then no stuck loading state remains; the existing error/retry path works. Keyboard use and no-JavaScript native submit remain usable. | Browser or focused component checks.                      |
| UI81-AC-04 | Given existing Applicant save/upload/withdrawal and Applicant/HR AI actions, when this change lands, then their existing pending controls still work and no artificial wait is introduced.                                   | Focused regression/source audit.                          |

The requirement delta is [product-overview](specs/product-overview.md). The multi-form [design](design.md), ordered [plan](plan.md), [tasks](tasks.md) and [record](record.md) are part of this packet.

## Approval gate

Paul's request to create a new branch and add loading indicators was the intake source. He separately answered “Approve plan and implement” to the concrete #81 proposal, OVR-004 delta, design and plan on 14 October 2026 in this conversation, before product code changes. [AGENTS.md](../../../AGENTS.md) and the [agent process](../../AgentProcess.md) require that distinct gate.
