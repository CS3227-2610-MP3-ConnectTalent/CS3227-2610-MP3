# Proposal: streamline job-list loading feedback

- Change ID: `2026-10-15-view-role-loading`
- Issue: [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83); follow-up to open PR #85
- Owner: Paul Cheng; guest, Applicant and HR job-list visitors
- Status/date: approved by Paul for implementation, 15 October 2026
- Baseline: `feat/83-navigation-loading` after its PR #85 formatting repair; [ProductSpec](../../ProductSpec.md) branch version v1.11
- Affected rules: [JOB-004](../../specs/public-job-listings.md), proposed [OVR-005](specs/product-overview.md)
- Classification: bounded UI behavior change; no server, data, role or permission change

## Intent and scope

The Search button already shows “Searching…” while a request waits, so the additional visible “Updating roles…” line repeats progress information. The result-level live announcement still serves category, debounce and browser-history navigation. Keep that announcement for assistive technology but visually hide it. Keep the results busy state and stale-results protection.

Each job card is one native link to the role detail page. Its “View role” label currently has no pending feedback. Add the existing fixed-space inline link hint to the card link, with an action-specific accessible status while its client navigation waits. Keep the card's real href, keyboard/modified-click/new-tab behavior, and server-side access checks. Fast prefetched navigation may finish without a visible hint.

No loading overlay, artificial delay, disabled card, changed search semantics or new route is proposed. Reusing `PendingLinkStatus` avoids a second pending-state implementation. The change remains on the existing #83 branch; no new branch, commit, push or PR is authorized by this proposal.

## Acceptance

| ID         | Expected result                                                                                                                                                                             | Evidence                                                      |
| ---------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| UI83-FU-01 | While search/category/history results wait, no extra visible “Updating roles…” line appears, but the live status and `aria-busy` remain accurate. Search still shows its own pending state. | Focused component and delayed browser checks.                 |
| UI83-FU-02 | A delayed View role navigation shows an inline hint and accessible “Opening role…” status until the route changes. Its real destination and native link behavior remain.                    | Focused unit and delayed browser checks.                      |
| UI83-FU-03 | Existing search, Apply and return-link behavior still passes.                                                                                                                               | Targeted regressions, typecheck, lint and independent review. |

## Approval

Paul answered “Approve and implement” on 15 October 2026 to the separate question naming this proposal, OVR-005 delta, design omission and plan. This authorizes implementation on the existing #83 branch. Commit, push, merge and release remain separate decisions.
