# Spec delta: public-job-listings

- Change/issues/owner/status: 2026-10-15-scheduled-job-times; [#88](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/88); John (Johnwz123); draft
- Canonical file: [public-job-listings.md](../../../specs/public-job-listings.md)
- Baseline: ProductSpec v1.10
- Proposed baseline: ProductSpec v1.12
- Dependencies/cross-capability IDs: [job-management.md](../../../specs/job-management.md) (`JMG-004`)
- Approval: Pending human approval

## ADDED

None

## MODIFIED

### JOB-001: Browse published job openings

- Before:
  "An anonymous visitor or authenticated Applicant MUST be able to browse open published job postings for this employer, showing title, team, category and a short summary of requirements without signing in. Job details MUST be reachable by link without revealing other Applicants' submissions. Only published jobs MUST be listed; draft and closed jobs MUST NOT appear."
- After:
  "An anonymous visitor or authenticated Applicant MUST be able to browse open published job postings for this employer, showing title, team, category and a short summary of requirements without signing in. Job details MUST be reachable by link without revealing other Applicants' submissions. Only published jobs within their active operational schedule window (`opens_at` is null or past/current, and `closes_at` is null or future) MUST be listed; draft, closed, future-scheduled, and past-deadline jobs MUST NOT appear. If `closes_at` is specified, the listing detail MAY present the closing deadline."
- Rationale/acceptance IDs: sched-AC-01, sched-AC-03
- Scenario: **Given** published jobs with active, future-scheduled, and expired dates, **When** a visitor views the job list, **Then** only currently active jobs render.
- Denial/failure scenario: **Given** a job whose scheduled `opens_at` is in the future or whose `closes_at` has elapsed, **When** an anonymous visitor or applicant requests its listing or detail, **Then** the job is not returned.

## REMOVED

None

## Delta review and sync evidence

- [x] Every changed rule and affected capability has a delta with stable IDs and scenarios.
- [ ] Independent analyst/reviewer resolved ambiguity; actual reviewer and findings linked.
- [ ] Human approval recorded before product implementation.
- [ ] Accepted final deltas synced to canonical files and version/date policy applied before archive.
- Sync commit/paths/decision evidence: Pending human approval and implementation.
