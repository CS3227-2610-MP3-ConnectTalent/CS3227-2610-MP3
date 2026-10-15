# Design: form-scoped pending feedback

- Change/issue: `2026-10-14-pending-action-feedback`; [#81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Owner/status/date: Paul Cheng; approved for implementation; 14 October 2026
- Inputs: [proposal](proposal.md), [OVR-004 delta](specs/product-overview.md), ProductSpec v1.10
- Scope: shared submit feedback component plus uncovered auth/navigation and HR server-action forms; preserve existing Applicant/AI controls

## Decision

Use a small client component nested inside each form and React `useFormStatus()` to read only that form's pending state. This follows the installed Next.js 16 [forms guide](../../../node_modules/next/dist/docs/01-app/02-guides/forms.md) and keeps server-rendered forms/server actions in place. The component displays an action-specific pending label and a concise status announcement, disables only its own submit control, and preserves caller classes and native button attributes. Existing `useActionState` forms may use their current `pending` value where that is clearer; avoid two competing state sources. No timer or global overlay is needed.

| Option                                                  | Tradeoff                                                                          |
| ------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `useFormStatus` child in each form                      | Proposed: immediate client feedback, server form remains native, shared behavior. |
| Convert each server page/form to a stateful client page | Rejected: broader hydration and duplicated action logic.                          |
| Add a fixed wait before navigation                      | Rejected: lengthens response and does not represent actual server work.           |

## Data flow and boundaries

Browser submit → native validation → form-scoped pending status/disabled control → existing server action → existing Auth/HR validation, permissions and storage → redirect/error. The pending component receives only UI labels and presentation props. It never receives credentials, application text or role authority. Server actions and Supabase RLS still decide whether a write is allowed. Button disabling is a UI guard against normal repeat clicks, not idempotency against requests made elsewhere.

The audit target is sign-in, sign-out, signup, forgot/reset password, HR notes/status, HR job draft save, publish and close. Existing Applicant application/profile/résumé/withdrawal and AI controls already express pending; check them for regression rather than replace their business-specific state. A separate form must never disable another form or imply its action is running.

## Failure and compatibility

If HTML validation rejects submit, pending does not start. If an action returns an error, the component returns to its idle label and the current error remains visible. Successful redirects unmount the pending form. With JavaScript unavailable, the original submit button and server form action remain usable, without a client-only loading state. Keyboard and screen-reader status must remain clear without exposing private form values.

No database migration, API signature or environment configuration. Rollback removes the component usage and reverts to previous labels; it does not alter stored data. Hosted latency/performance remains a separate diagnosis. Browser timing checks should use controlled delayed action responses where practical, and record any limits honestly.

## Approval

Paul answered “Approve plan and implement” to the concrete #81 packet on 14 October 2026 in this conversation. Implementation evidence is recorded separately.
