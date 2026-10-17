# Spec delta: applications-and-review

- Change/issues/owner/status: 2026-10-16-hr-application-filters; [#97](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/97); John (Johnwz123); approved
- Canonical file: [../../../specs/applications-and-review.md](../../../specs/applications-and-review.md)
- Baseline: v1.16, 16 October 2026
- Proposed baseline: v1.17
- Dependencies/cross-capability IDs: APP-001, APP-008, SEC-001
- Approval: John (student owner); approved on 2026-10-16 in chat

## ADDED

### APP-010: HR application review filtering, search, sorting, and pagination

- Before: Absent in baseline. `APP-001` specifies that authorized HR can list submitted applications, but does not provide search, filtering, sorting, or pagination controls, resulting in a single flat list ordered newest-first.
- After: Authorized HR MUST be able to search, filter, sort, and paginate submitted applications on `/hr/applications`.
  - Search: HR MUST be able to search applications by applicant name (`full_name`) using case-insensitive substring matching. Leading and trailing whitespace MUST be trimmed and consecutive whitespace collapsed. The search phrase MUST be limited to at most 100 characters and MUST reject disallowed control characters. With JavaScript enabled, text input MUST apply after 300 ms of typing inactivity; pressing Enter or clicking Search MUST apply immediately.
  - Job filter: HR MUST be able to filter applications by specific job opening or select all jobs.
  - Review status filter: HR MUST be able to filter applications by review status (`Submitted`, `In review`, `Shortlisted`, `Rejected`) or select all review statuses.
  - Withdrawal filter: HR MUST be able to filter applications by withdrawal state (`Active only`, `Withdrawn only`, `All`). The default view MUST show `All` submitted applications to maintain full queue visibility and backward compatibility.
  - Sorting: HR MUST be able to toggle the sort order of submitted applications between `Newest first` (`submitted_at DESC`, default) and `Oldest first` (`submitted_at ASC`).
  - Pagination: Results MUST be paginated (page size of 10 items). The UI MUST show current page, total pages/count, and provide Next / Previous navigation controls. Out-of-bounds page requests or negative numbers MUST safely fall back to page 1.
  - URL synchronization: All active search, filter, sort, and pagination state MUST be reflected in URL query parameters (`q`, `job`, `status`, `withdrawal`, `sort`, `page`) so that filtered views are bookmarkable, shareable, and preserve browser history navigation.
  - List item display: The application card in the list view MUST display the applicant's `full_name` alongside the job title, review/withdrawal status, and submission timestamp.
- Rationale/acceptance IDs: Enables HR reviewers to effectively manage and triage high application volumes. Acceptance IDs: HR-APP-FILTER-AC-01 through HR-APP-FILTER-AC-06.
- Scenario: Given an authorized HR user with multiple submitted applications across different jobs and statuses, when the user enters an applicant's name in the search bar and selects a specific job and "In review" status, only the matching active submitted applications for that job in review status appear.
- Denial/failure scenario: Given an anonymous visitor or signed-in Applicant attempting to access `/hr/applications`, access is denied under existing `requireHR()` / SEC-001 authorization before any application data or search filters are evaluated.

## MODIFIED

None.

## REMOVED

None.

## Delta review and sync evidence

- [x] Every changed rule and affected capability has a delta with stable IDs and scenarios.
- [x] Independent analyst/reviewer resolved ambiguity; actual reviewer and findings linked.
- [x] Human approval recorded before product implementation.
- [x] Accepted final deltas synced to canonical files and version/date policy applied before archive.
- Sync commit/paths/decision evidence: Synced to canonical workflow/specs/applications-and-review.md (v1.17, 16 October 2026); accepted by John (student owner).

