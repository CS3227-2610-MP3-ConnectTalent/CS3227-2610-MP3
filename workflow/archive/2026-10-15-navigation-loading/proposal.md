# Proposal: pending feedback for search and careers navigation

- Change ID: `2026-10-15-navigation-loading`
- Issue: [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83); follows [#81](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/81)
- Owner: Paul Cheng; shared Applicant, guest and HR presentation
- Status/date: approved by Paul for implementation and branch creation, 15 October 2026
- Baseline: updated `develop` `f65f699ff2de76466e6cf374011119aec2414a91`; canonical [ProductSpec](../../ProductSpec.md) v1.10 at branch creation. #81's v1.11 is in open PR #82, so final version/ID sync must reconcile merge order.
- Classification: bounded UI behavior change; no server, database, storage, AI or permission change
- Affected rules: [JOB-004](../../specs/public-job-listings.md), proposed [OVR-005](specs/product-overview.md); existing ACC-006, JOB-001/003 and SEC-001 remain authority for route access

## Intent and scope

The public search currently announces “Updating roles…” beside results but leaves the Search submit label unchanged. The Apply for this role link, shared Back to open roles link and Auth-frame Careers return link have no inline indication during a slow navigation. Paul requested the same loading feedback for these controls after #81 added feedback to server-action buttons.

For a pending explicit Search, display “Searching…” with a spinner and disable that submit button until the requested result settles. Keep the search field, category controls and Clear usable so a newer intent can replace an older request. The existing result-level announcement stays truthful during debounce, history restoration and server wait; no misleading spinner during the idle 300 ms typing debounce.

For Apply and named return-to-Careers links, display a small inline pending hint and accessible status only while a navigation actually waits. Keep their normal link behavior, including keyboard, modified clicks, new tab and non-JavaScript fallback. Fast or prefetched navigation may finish before a spinner is visible. Do not change destinations or imply that a loading indicator shortens server latency.

## Alternatives and dependencies

| Choice                                                                           | Decision                                                                          |
| -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Global loading overlay for all links                                             | Excluded because it blocks unrelated actions and obscures which navigation waits. |
| Fixed “please wait five seconds” copy                                            | Excluded because it gives no per-action state and time varies.                    |
| Existing result announcement plus local Search button state and Next link status | Proposed; preserves native links/forms and current router/search semantics.       |

The new branch should start from updated `develop`, without stacking on open PR #82; implementation must not import #81's unmerged component. The unrelated untracked profile/résumé packet remains untouched. No migration/dependency is planned. Source and tests should use synthetic data. If #82 merges before canonical sync, reconcile version and the reserved OVR-004/005 order; do not silently overwrite its rule.

## Acceptance

| ID         | Given / when / then                                                                                                                                                                                                               | Evidence                                         |
| ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| UI83-AC-01 | Given a delayed explicit Search, when activated, then that button promptly says “Searching…”, is unavailable to repeat clicks, and the result status remains accurate until the matching result arrives.                          | Focused browser delay and component/unit checks. |
| UI83-AC-02 | Given typing, category or Clear while a request is pending, when a newer intent occurs, then the latest search still wins and the UI does not stay busy for an obsolete request.                                                  | Existing #78 regression plus focused delay case. |
| UI83-AC-03 | Given a delayed Apply or return-to-Careers navigation, when clicked normally, then that link shows inline, accessible pending feedback without changing its destination. It clears on route completion.                           | Delayed navigation browser checks.               |
| UI83-AC-04 | Given a modified/new-tab link gesture, keyboard activation or disabled JavaScript, when using these controls, then native navigation remains available. HR still lacks Apply, and incomplete Applicants remain gated server-side. | Browser/no-JS and source/regression review.      |

## Approval gate

Paul answered “Approve plan and branch” on 15 October 2026 to the concrete #83 proposal, JOB-004 and OVR-005 deltas, design and plan, and expressly authorized `feat/83-navigation-loading` from updated `develop`. This is separate from the intake request. Commit, push, PR and hosted changes remain separate decisions.
