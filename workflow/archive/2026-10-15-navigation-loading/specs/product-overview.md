# Proposed product-overview delta: navigation pending feedback

- Change/issue: `2026-10-15-navigation-loading`, [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83)
- Owner/status: Paul Cheng; approved for implementation on 15 October 2026
- Canonical: [product-overview.md](../../../specs/product-overview.md)
- Baseline: develop ProductSpec v1.10; PR #82 proposes OVR-004 in v1.11 and is still open at intake
- Proposed baseline: next available minor version after confirmed develop; OVR-005 reserved subject to merge-order reconciliation
- Existing boundaries: JOB-001/003/004, ACC-006 and SEC-001 remain authoritative

## ADDED

### OVR-005: Pending feedback for selected route links

- Before: No cross-role rule requires inline feedback on Apply for this role or return-to-Careers links while a client navigation waits. OVR-004 in open PR #82 addresses server-backed form submits and explicitly excludes navigation links.
- After (amended and approved 15 October 2026): A visible Apply for this role link or named return-to-Careers link MUST show an action-specific, visually and assistive-technology perceivable pending hint while its client navigation has started but has not reached the destination. The hint MUST clear when the client route completes, is superseded, or renders an application error/destination. If the browser holds a full-document navigation after a total network failure, the browser controls loading; the app does not promise an in-page reset while its JavaScript cannot run. Fast and prefetched navigation MAY complete without a visible intermediate state. The link MUST preserve its real href and normal keyboard, modified-click, new-tab and no-JavaScript behavior. Pending feedback MUST NOT grant route access, change the destination, expose private state, or replace server authorization.
- Rationale/acceptance: UI83-AC-03/04; indicate which delayed navigation is in progress without changing route policy.
- Scenario: **Given** a published job and an eligible Applicant, **when** Apply for this role waits for its route, **then** its link shows “Opening application…” until navigation completes.
- Denial/failure scenario: **Given** HR on public job detail or an incomplete Applicant following a return link, **when** a direct destination is requested, **then** existing UI visibility and server-side access/onboarding rules still apply. A cancelled client navigation or an application-handled error clears the hint. A browser-held total network failure is outside the in-page clearing guarantee and is recorded as a limitation.

## MODIFIED

None. OVR-004 remains a separate server-action rule if PR #82 merges.

## REMOVED

None.

## Review and sync

- [x] Paul approved this delta with the proposal/design/plan on 15 October 2026 before implementation.
- [x] Independent re-review and Paul's separate “Accept with recorded limits” decision on 15 October 2026 preceded canonical sync.
- [x] OVR-005 synced to branch baseline v1.11 on 15 October 2026; open PR #82 also proposes v1.11 with OVR-004, so integration must reconcile the version without losing either requirement.
