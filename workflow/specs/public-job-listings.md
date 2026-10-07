# Public job listings

Baseline: ProductSpec v0.6, 5 October 2026.

## JOB-001: Published-only browsing

The public UI and data MUST expose only this company's published openings. Applicants MUST be able to browse those openings. See [OVR-001](product-overview.md) for the employer boundary, [JMG-002 / JMG-003](job-management.md) for publication and closing, and [SEC-001](security-and-privacy.md) for access rules.

Scenario: Given draft, published and closed jobs, when a visitor browses public listings, then only published jobs appear.

## JOB-002: Controlled category and filtering

Each job MUST have one required category from Engineering, Human Resources, Legal, Sales or Other. Invalid categories MUST be rejected. Applicants MUST be able to optionally filter published jobs by category. Filters MUST NOT expose unpublished jobs. Category is descriptive metadata; it MUST NOT grant access or determine hiring decisions.

Scenario: Given published and unpublished jobs in Engineering, when an Applicant filters by Engineering, then only published Engineering jobs appear. When an invalid category is supplied for a job, then it is rejected.

## JOB-003: Published job detail

Each job MUST have a title, team name, description and requirements. Applicants MUST be able to open a published job and read its title, team, description and requirements.

Scenario: Given a published job, when an Applicant opens its detail page, then those four fields are visible.
