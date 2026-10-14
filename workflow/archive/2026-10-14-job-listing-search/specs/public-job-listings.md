# Proposed public-listing delta

Issue [#78](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/78).
Owner Paul. Approved for implementation and separately accepted with recorded limits by Paul on 14 October 2026.
Canonical: [public listings](../../../specs/public-job-listings.md).
Baseline develop `7bbf7af`, product v1.9; this module currently cites v1.7.
Proposed numeric minor baseline v1.10, reconciled against any separately accepted
branch (including #76) at integration without overwriting its rules.

## ADDED — JOB-004: Public text search

Before: no text-search requirement; JOB-002 covers category filtering.

After: Public listing visitors MUST be able to search published openings using
a literal case-insensitive phrase across title, team, description or requirements.
Leading/trailing whitespace MUST be removed and runs of whitespace collapsed for
matching in both query and fields. At least one field MUST contain the entire
normalized phrase; category, when selected, MUST also match. Empty search MUST
preserve current category results. Existing published-date/ID ordering MUST remain.
Matching MUST cover all rows retrieved by the existing public paginated reader,
not just its first page; unpublished jobs MUST NOT become visible.

The accepted query MUST be one string of at most 100 Unicode characters after
normalization. Repeated q values, disallowed control characters or overlong input
MUST show safe invalid-search feedback with no job results. Blank values MUST be
equivalent to no query. Tab/newline whitespace MAY normalize to ordinary spaces;
other control characters MUST be rejected. Search syntax such as percent, underscore,
commas or parentheses MUST be literal text, never a query-language expression.

With JavaScript enabled, typing MUST apply after 300 ms of inactivity. Enter or
Search MUST apply immediately and cancel pending debounce work; composition input
MUST NOT trigger navigation until composition completes. Clear search MUST remove
only text immediately; All roles MUST clear only category. Query/category MUST
persist in shareable URL parameters and restore on refresh and back/forward.
Debounced edits MUST replace the current history entry; explicit changed
Search/category/Clear actions MUST add an entry. Stale timers/navigation responses
MUST NOT override newer intended filters or trigger after leaving the page.

The responsive interface MUST label search, preserve typing focus and scroll,
announce pending/results status, and distinguish no matches, invalid search and
generic loading failure. It MUST provide a usable explicit Search action without
JavaScript. Existing JOB-001/002/003, ACC-006 and SEC-001 remain authoritative for
published-only access, role/onboarding and category rules. No private data or AI
MUST be included in search.

Scenarios and verification IDs: SEARCH-01 through SEARCH-07 in [proposal](../proposal.md).
Examples: a title match and a description-only match appear case-insensitively;
engineering + a sales-only phrase yields no matches; a published match beyond the
first database page appears; draft/closed matches do not; a malformed q yields
safe feedback; unfinished Applicant onboarding still redirects before job reads.

## MODIFIED / REMOVED

None. Existing requirements retain their IDs and authoritative locations.

## Approval/sync

Concrete proposal/design/plan approved by Paul on 14 October 2026. Paul separately
accepted with recorded limits after review. JOB-004 was synced to canonical v1.10
before archiving this complete packet; see record.md for evidence and limits.
