# Design: public job search

Issue #78; owner Paul; 14 October 2026; approved for implementation on 14 October 2026 (see record.md).
Inputs: [proposal](proposal.md), [delta](specs/public-job-listings.md).
Baseline `7bbf7af`. IDs: JOB-004 proposed; SEARCH-01–07.

## Data flow and boundaries

1. Existing Supabase session/onboarding proxy runs before the listings page.
2. Server page parses category and q; invalid query/category yields safe feedback
   and skips job reads.
3. Existing publishable-key reader fetches all eligible published rows using its
   keyset paginator and category restriction. A pure helper performs normalized
   literal substring matching on validated public fields; preserve current sorting.
4. Server renders filtered cards/count/empty/error state. No separate search API
   or privileged client is introduced.
5. A focused client filter component coordinates text, category and navigation,
   with progressive-enhancement GET form fallback. No full private dataset or key
   reaches that component.

Use src/lib/job-search.ts for normalization/validation/matching and URL construction.
Keep data reads in src/lib/jobs.ts, page orchestration in src/app/page.tsx,
filter controls in src/components/job-listing-filters.tsx. Extract existing
result/card markup to src/components/job-listing-results.tsx if needed to keep
page/components within current size/complexity limits. Reuse Input/Button and
existing category styling; no layout redesign.

## Debounce and navigation

One coordinator owns the current input and category. Construct local URLs using
URLSearchParams, never concatenate user input into executable navigation or SQL.
Use current local text when changing category, cancel its pending timer and apply
both atomically. Clear cancels the timer and keeps current category. Normalized
unchanged destinations do not navigate. Category controls retain semantic links
with progressive fallback; enhanced actions use the coordinator.

Automatic typing uses replace; explicit Search/Enter/category/Clear uses push;
both preserve scroll. Distinguish server-confirmed parameters from unsent input so
an older response cannot erase newer typing. Cancel timers on unmount/navigation
and composition start, apply only the newest scheduled intent, and resync filters
for back/forward. Show pending status without clearing previous confirmed cards;
committed count/results must correspond to the committed filters. Verify behavior
with delayed responses, not only mocked router call counts. Implementation may use
a small dedicated hook under src/components/use-job-listing-filters.ts if needed.

## Authorization/privacy/failures

- No auth, RLS, schema, migration, Storage or AI policy changes. Existing publishable
  reads remain subject to published-only policies and onboarding remains server-side.
- q is untrusted; validate bounds and multiplicity on server; render escaped text.
  Client feedback mirrors the limit; no HTML maxlength truncates Unicode surrogate
  pairs. Server validation remains authoritative.
- Read failure shows generic unavailable state; raw Supabase details must not enter
  the UI. Invalid category keeps existing Unknown category behavior. Invalid search
  has its own safe message, retains the category and offers recovery.
- Never add custom query logging, suggestions from private data or external calls.
  URL searches remain visible in normal history/access logs.
- Server-side in-memory search retains current all-row query cost; no performance
  claim beyond reduced requests during typing. Dataset growth is a later concern.

## Compatibility, rollout and rollback

Optional q extends existing /?category=... URLs. Blank q is current behavior.
No added dependencies or migration; no relationship to unmerged #77.
After local checks/review/acceptance and an authorized PR, team validates the preview
and promotes normally. No deployment is authorized here. Revert this feature to
restore category-only listings; no data restoration is required.

Design/plan approval: Paul, “Approve plan and implement”, 14 October 2026. No independent design review claimed.

Implementation detail: the focused JobFilterController under src/lib/ owns only
typing/timers/route acknowledgements, exposed to React through useSyncExternalStore.
The hook connects it to Next router transitions and popstate/unmount handling.
Results remain server components. This makes exact debounce timing testable without
mocking browser delays or changing the approved data flow.
