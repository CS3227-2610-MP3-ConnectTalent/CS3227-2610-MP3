# Proposed product-overview delta: pending action feedback

- Change: `2026-10-14-pending-action-feedback`; [issue #81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Owner/status: Paul Cheng; approved for implementation, 14 October 2026
- Canonical: [product-overview.md](../../../specs/product-overview.md)
- Baseline: ProductSpec v1.10 at `f65f699`; proposed v1.11
- Existing affected action rules: ACC-001/004/005, APP-001/003, JMG-001/002/003; authorization remains under SEC-001/002
- Approval: Paul answered “Approve plan and implement” to this packet on 14 October 2026 in this conversation.

## ADDED

### OVR-004: Feedback for pending server actions

- Before: no cross-role rule requires feedback while a form action awaits a server response. Some controls already provide it, but sign-in and several HR/auth actions do not.
- After: A visible, enabled control that submits a server-backed action MUST show prompt, action-specific pending feedback and become unavailable for repeat activation while that submission is pending. The feedback MUST be perceivable to assistive technology. On validation failure or server error, the user MUST retain a usable retry path without a stuck pending state. Pending UI MUST NOT replace server authorization, validation, concurrency or duplicate-write protection. Native form submission without JavaScript MUST remain available where it exists today. Instant local controls and navigation links do not require this state.
- Rationale: UI81-AC-01–04; several-second hosted latency should not make a form appear inert or invite repeat clicks.
- Scenario: **Given** an Applicant or HR form with valid input and a delayed server action, **when** its submit control is activated, **then** its specific pending state is announced and repeat activation is unavailable until success/error navigation.
- Failure scenario: **Given** invalid native input or a failed server action, **when** the attempt ends or never starts, **then** the control is usable again and the existing validation/error result remains available.

## MODIFIED

None. Existing action/permission contracts remain unchanged.

## REMOVED

None.

## Review and sync

- [x] Student approves proposal, delta, design and plan before code changes.
- [x] Separate read-only review verified focus, native validation, role and repeat-submit boundaries; two findings were fixed and rechecked in [handoff](../handoffs/independent-review.md).
- [x] Paul separately accepted with recorded limits on 15 October 2026; OVR-004 was synced to canonical [ProductSpec v1.11](../../../ProductSpec.md) and [product overview](../../../specs/product-overview.md) before archive.
