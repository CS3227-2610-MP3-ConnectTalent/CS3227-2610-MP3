# Preserved change history

Archive whole change packets at `workflow/archive/<YYYY-MM-DD-short-name>/`. Archiving preserves evidence; it does not grant implementation, merge, deployment or student acceptance approval.

## Accepted change: sync, then archive

1. Record the actual human acceptance decision, reviewer independence/findings, verification scope and outstanding limitations in record.md. Resolve blockers or explicitly record the decision and conditions; do not relabel pending gates as complete.
2. Compare final accepted ADDED/MODIFIED/REMOVED deltas to their [canonical specs](../specs/README.md). Sync every accepted behavior change first. Retain existing IDs, allocate new unused IDs, preserve retired IDs and rationale in history, and keep one canonical home per rule. Update ProductSpec and affected spec version/date together under the documented version policy.
3. Verify the canonical files represent the accepted deltas; record sync commit, exact files, version/date and checks in record.md. A documentation/process-only packet states no product delta and records why canonical sync is N/A; reorganization retains the product baseline.
4. Only after accepted canonical sync and its evidence, move the entire packet intact: proposal, optional design, every delta, plan, tasks, record, handoffs and other evidence. Preserve status, commands, outcomes, approvals, failures, limitations and linked session logs. Do not retain only record.md or delete inconvenient evidence.
5. Repair current navigation and relative links that would break, record the archive path and decision/date, and verify links. Keep dated historical log statements about earlier paths unchanged. changes/ and archive/ have equal depth, but inspect links rather than assume they survive.

Rejected, withdrawn or superseded packets may be archived with their actual disposition and decision evidence. Never sync rejected/unaccepted proposed behavior into canonical requirements; preserve the complete packet and link a replacement if any. Mark incomplete gates honestly.

## Archive checklist

- [ ] Disposition and real decision source/date recorded; deployment/release state explicit.
- [ ] Accepted product deltas synced and verified before archive, or documented no-product-delta / rejected disposition.
- [ ] Complete packet and historical evidence preserved without fabricated approvals or results.
- [ ] Archive path, current indexes and relative links checked; every session log remains linked.
