# Proposed public-job-listings delta: search action feedback

- Change/issue: `2026-10-15-navigation-loading`, [#83](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/83)
- Owner/status: Paul Cheng; approved for implementation on 15 October 2026
- Canonical: [public-job-listings.md](../../../specs/public-job-listings.md)
- Baseline: develop ProductSpec v1.10, JOB-004; final baseline/version reconciled against PR #82 before sync
- Proposed baseline: next available minor version after confirmed develop; OVR-005 is the paired cross-role link rule

## ADDED

None.

## MODIFIED

### JOB-004: Public text search — pending control clause

- Before: The responsive interface labels search, preserves typing focus and scroll, announces pending/results status, distinguishes no matches/invalid search/loading failure, and provides a usable explicit Search action without JavaScript.
- After: The responsive interface MUST label search, preserve typing focus and scroll, announce pending/results status, and distinguish no matches, invalid search and generic loading failure. When an explicit Search starts a route request that has not resolved, its submit control MUST promptly show action-specific visible and assistive-technology pending feedback and be unavailable for repeat activation until the current request settles or is superseded. This MUST NOT disable typing, category or Clear controls needed to express a newer intent, and it MUST NOT show a loading state solely for the idle 300 ms debounce before a request starts. It MUST provide a usable explicit Search action without JavaScript. All other JOB-004 matching, URL/history, ordering, input, published-only and accessibility clauses remain unchanged.
- Rationale/acceptance: UI83-AC-01/02/04; make the actionable Search control reflect the existing result-level pending state while retaining latest-intent behavior.
- Scenario: **Given** a visitor activates Search and the server response is delayed, **when** the route request remains pending, **then** Search shows “Searching…” and cannot be activated again, while a newer category or query choice remains usable.
- Failure scenario: **Given** invalid native input or a completed/superseded request, **when** Search cannot start or ends, **then** the button does not remain disabled and the current result state is truthful.

## REMOVED

None.

## Review and sync

- [x] Paul approved this delta with the proposal/design/plan on 15 October 2026 before implementation.
- [x] Independent re-review and Paul's separate “Accept with recorded limits” decision on 15 October 2026 preceded canonical sync.
- [x] JOB-004 synced to branch baseline v1.11 on 15 October 2026; open PR #82 also proposes v1.11 and requires integration version reconciliation.
