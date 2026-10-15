# Proposed OVR-005 amendment: View role link

- Baseline: [canonical OVR-005](../../../specs/product-overview.md), branch v1.11
- Classification: MODIFIED; retain OVR-005 and its existing Apply/return rules
- Status: proposed for issue #83 follow-up; not yet canonical

Add to OVR-005: A published job card's **View role** link MUST show the same action-specific inline pending hint and accessible status as the other selected route links while its client navigation waits. The hint MUST clear when that navigation completes or is superseded. Its real href and normal keyboard, modified-click, new-tab and no-JavaScript behavior MUST remain. The existing browser-held total-network-failure limit and fast-prefetch allowance continue to apply.

Scenario: Given a published role card, when a visitor activates View role and navigation waits, then the card indicates “Opening role…” until the role detail route is reached. A fast or already-prefetched route may have no perceivable pending interval.

JOB-004's pending/results announcement remains; this amendment changes its presentation from a visible duplicate line to screen-reader-only text while keeping the live region and result `aria-busy`.
