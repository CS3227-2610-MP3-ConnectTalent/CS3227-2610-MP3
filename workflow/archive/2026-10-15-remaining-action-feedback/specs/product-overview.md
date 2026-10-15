# Proposed product-overview delta: OVR-006

- Change/issue: [#84](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/84)
- Owner/status: Paul Cheng; approved for implementation on 15 October 2026; canonical sync pending acceptance.
- Canonical target: [product-overview.md](../../../specs/product-overview.md)
- Version/ID dependency: #81 proposes OVR-004 in open PR #82 and #83 proposes OVR-005 in an active branch; reconcile accepted order before sync.

## ADDED

### OVR-006: Pending feedback for remaining request actions

Application Save draft and Submit application, résumé upload/replace/remove/profile-copy/retry, and error-page route retry MUST show action-specific pending feedback when their request or transition waits. The active request action MUST not be available for repeat activation while pending; conflicting file actions MUST remain unavailable until settlement. On an application-handled failure, the controls MUST return to a usable state with truthful error/retry feedback. Pending UI MUST preserve native form validity, keyboard behavior, typed Applicant content, attachment lifecycle and server-side authorization. Immediate local-only controls do not require artificial loading indicators. A visual state does not replace backend idempotency, RLS or role checks.

- Scenario: Given a slow application draft save, when Save draft is activated, then that button says “Saving draft…” while Submit is unavailable; after an error, the entered fields and both controls remain usable.
- Scenario: Given a slow résumé operation, when its active button is clicked, then it names that operation and competing file controls are unavailable until resolution.
- Failure/denial scenario: Given invalid submission fields or a rejected file request, then native/server validation and existing safe errors remain; feedback neither submits invalid data nor reveals a private file.

## MODIFIED / REMOVED

None. Existing OVR-004 and OVR-005 proposals are separate and must not be silently replaced.

## Sync gate

Paul approved the proposal, this delta, design and plan on 15 October 2026. After local implementation and separate read-only review, Paul answered “Accept with recorded limits” on 15 October 2026. OVR-006 synced to branch canonical v1.11 before the complete packet archive. Open #81/#83 changes also propose v1.11 and require integration reconciliation; no sync commit or hosted release follows.
