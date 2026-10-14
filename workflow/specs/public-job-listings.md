# Public job listings

Baseline: ProductSpec v1.10, 14 October 2026 (accepted #78 public text search; prior #52 signed-in Applicant onboarding gate retained).

## JOB-001: Published-only browsing

The public UI and data MUST expose only this company's published openings. Applicants MUST be able to browse those openings. See [OVR-001](product-overview.md) for the employer boundary, [JMG-002 / JMG-003](job-management.md) for publication and closing, and [SEC-001](security-and-privacy.md) for access rules.

Scenario: Given draft, published and closed jobs, when a visitor browses public listings, then only published jobs appear.

Signed-in verified Applicants with incomplete required profiles MUST be redirected from listing/category routes to My profile before querying/rendering openings under [ACC-006](accounts-and-roles.md). Guests and HR retain public published browsing; public job data remains public. Given an incomplete signed-in Applicant, direct category or listing navigation leads to profile completion; valid completion restores browsing.

## JOB-002: Controlled category and filtering

Each job MUST have one required category from Engineering, Human Resources, Legal, Sales or Other. Invalid categories MUST be rejected. Applicants MUST be able to optionally filter published jobs by category. Filters MUST NOT expose unpublished jobs. Category is descriptive metadata; it MUST NOT grant access or determine hiring decisions.

Scenario: Given published and unpublished jobs in Engineering, when an Applicant filters by Engineering, then only published Engineering jobs appear. When an invalid category is supplied for a job, then it is rejected.

## JOB-003: Published job detail

Each job MUST have a title, team name, description and requirements. Applicants MUST be able to open a published job and read its title, team, description and requirements.

Scenario: Given a published job, when an Applicant opens its detail page, then those four fields are visible.

The app job-detail route MUST apply [ACC-006](accounts-and-roles.md) before loading the job for an incomplete signed-in Applicant. Complete Applicants, guests and HR retain published-detail access. Direct apply/write eligibility follows ACC-006 and APP-005. Given an incomplete Applicant opening a direct job-detail/apply URL, the app leads to profile completion.

## JOB-004: Public text search

Public listing visitors MUST be able to search published openings using a literal case-insensitive phrase across title, team, description or requirements. Leading/trailing whitespace MUST be removed and runs of whitespace collapsed for matching in both the query and fields. At least one field MUST contain the entire normalized phrase. A selected category MUST also match. Empty search MUST preserve current category results. Existing published-date/ID ordering MUST remain. Matching MUST cover all rows retrieved by the existing public paginated reader, including matches after its first page; unpublished jobs MUST NOT become visible.

The query MUST be one string of at most 100 Unicode characters after normalization. Repeated `q` values, disallowed control characters or overlong input MUST show safe invalid-search feedback with no job results. Blank values MUST be equivalent to no query. Tab/newline whitespace MAY normalize to ordinary spaces; other control characters MUST be rejected. Percent, underscore, commas and parentheses MUST be literal text, not query-language syntax.

With JavaScript enabled, typing MUST apply after 300 ms of inactivity. Enter or Search MUST apply immediately and cancel pending debounce work; composition input MUST NOT trigger navigation until composition completes. Clear search MUST remove only text immediately; All roles MUST clear only category. Query/category MUST persist in shareable URL parameters and restore on refresh and back/forward. Debounced edits MUST replace the current history entry; explicit changed Search/category/Clear actions MUST add an entry. Stale timers/navigation responses MUST NOT override newer intended filters or trigger after leaving the page.

The responsive interface MUST label search, preserve typing focus and scroll, announce pending/results status, and distinguish no matches, invalid search and generic loading failure. It MUST provide a usable explicit Search action without JavaScript. Existing JOB-001/002/003, ACC-006 and SEC-001 remain authoritative for published-only access, role/onboarding and category rules. No private data or AI MUST be included in search.

Scenario: Given published and unpublished jobs with matching text, when a visitor searches and selects a category, then only published jobs matching the entire normalized phrase in that category appear, including a match beyond the first database page. Given malformed search input, the visitor sees safe guidance and no job results. Given an incomplete signed-in Applicant opening a search URL, the app leads to profile completion before reading jobs.
