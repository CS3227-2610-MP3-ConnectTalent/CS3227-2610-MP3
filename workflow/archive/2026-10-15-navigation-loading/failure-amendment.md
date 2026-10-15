# Proposed amendment: total navigation failure boundary

- Issue/packet: [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83), [proposal](proposal.md), [OVR-005 delta](specs/product-overview.md), [design](design.md)
- Owner/status: Paul Cheng; approved on 15 October 2026 via “Approve documented limit”.
- Reason: a separate reviewer requested a hard-failure check before acceptance.

## Observed failure and scope

The delayed Search and successful Apply/return routes passed. A Playwright test that aborted the Careers route's RSC request showed Next falling back to full document navigation and removing the pending link. A stronger probe aborted both the RSC request and that document fallback. The old page remained mounted with Next `useLinkStatus().pending` true for the 20-second assertion window. A 20-second React timer intended to clear the hint also did not fire while the browser held the failed document navigation; it was removed rather than retained as an unproven repair. These are local synthetic network failures, not an observed Vercel incident.

## Requested boundary change

Revise OVR-005's unconditional “hint MUST clear when navigation ... fails” to: “The hint MUST clear when a client route completes, is superseded, or renders an application error/destination. If the browser holds a full-document navigation after a total network failure, the browser controls the loading state; the application does not promise an in-page reset while its JavaScript cannot run.” The native link remains usable on retry once the browser returns control. Keep all other approved feedback, href, role and no-JavaScript requirements.

This narrows one failure clause; it does not change server access, data, destination, timing of normal feedback or tests for ordinary delayed navigation. Record the hard-failure case as a known limitation rather than a passed check. If Paul requires an in-page reset during a browser-held document failure, #83 cannot honestly be accepted as implemented; the team would need a different navigation design and a new approved plan.

## Decision

- Student decision: Paul answered “Approve documented limit” on 15 October 2026 to this concrete amendment, separately from the earlier implementation approval. Independent re-review and implementation acceptance remain pending.

## Later closeout

The separate reviewer re-reviewed the amended requirement and found no blocking issue. Paul then answered “Accept with recorded limits” for #83 on 15 October 2026. Canonical sync and archive are recorded in the [feature record](record.md); the earlier pending sentence above is historical.
