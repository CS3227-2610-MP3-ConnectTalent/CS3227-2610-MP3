# Design: search and navigation pending feedback

- Change/issue: `2026-10-15-navigation-loading`, [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83)
- Owner/status/date: Paul Cheng; approved for implementation, 15 October 2026
- Inputs: [proposal](proposal.md), [JOB-004 delta](specs/public-job-listings.md), [OVR-005 delta](specs/product-overview.md)
- Scope: `src/components/job-listing-filters.tsx`, `src/components/use-job-listing-filters.ts` or its controller only if required, a small link-status child component, shared return link, Auth frame and job detail link; focused tests and guides/evidence. Existing data modules, server actions and RLS are excluded.

## Decisions and alternatives

| Decision                                                             | Alternative                                     | Reason / approval                                                                                                                                             |
| -------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Use existing `useTransition`/history pending state for Search button | New global state or fixed timer                 | The search already tracks request state; no artificial wait or duplicate source of truth. Approved 15 October 2026.                                           |
| Use Next 16 `useLinkStatus` as a descendant of each targeted `Link`  | Intercept all anchors with custom router pushes | Local Next docs support link-local status and preserve native href/modified gestures. Fast prefetched links may not show a spinner. Approved 15 October 2026. |
| Keep input, category and Clear enabled                               | Lock the full filter form                       | JOB-004 requires latest intent to win; only repeat explicit Search activation is blocked. Approved 15 October 2026.                                           |

## Data flow and failure behavior

Search input retains its existing 300 ms controller/debounce and validated URL. On explicit Search, the controller cancels debounce and starts its existing router transition. The form receives that transition/history state, changes the Search button label, sets disabled/`aria-busy` and leaves the existing result status live. Invalid input never starts a request; the button remains usable for correction. A newer query/category/Clear may supersede a request, with the controller retaining its existing request/confirmation safeguards. Do not hide stale cards in a way that contradicts the current history rule.

Target links remain Next `<Link>` with real href. A small client descendant of each targeted link calls `useLinkStatus()` and renders a fixed-size spinner plus persistent status text while pending. It must not force `prefetch={false}` merely to make a spinner observable. Apply visibility remains determined server-side; destination routes keep existing role/readiness checks. The shared return component covers job detail/profile/HR jobs, including the HR load-error state; the Auth-frame Careers link gets the same hint. Audit other explicit “back to Careers/open roles” links and include only true return links, not arbitrary navigation.

No data, API, schema, secret, AI or authorization path changes. No migration. Normal completion and RSC failure with a successful document fallback clear pending feedback. A browser-held total network failure can leave the old page and pending hint visible; Paul approved that limit in the [failure-boundary amendment](failure-amendment.md) on 15 October 2026. If a destination is prefetched and resolves immediately, no intermediate pending frame is required. Rollback reverts this UI-only commit; native links/search and server checks remain.

## Verification and review

Write a failing focused component/browser assertion for delayed Search label/disabled state and a delayed Apply/return link status before implementation. Verify real href, keyboard/modified clicks, no-JavaScript search, HR Apply denial and incomplete Applicant redirect through existing browser coverage. Run focused unit/browser, typecheck, lint, build and independent source review; report hosted/assistive-technology limits honestly. No DB tests because no DB changes.

- [x] Paul approved the concrete design with both deltas and plan on 15 October 2026 before product edits.
