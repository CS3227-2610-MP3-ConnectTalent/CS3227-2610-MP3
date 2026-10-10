# Delta: public-job-listings.md

Issue52; Paul Cheng; proposed 2026-10-10, canonical v1.5. [Canonical](../../../specs/public-job-listings.md). Concrete approval/implementation/sync pending.

## MODIFIED

### JOB-001

Before (complete canonical clause):

## JOB-001: Published-only browsing

The public UI and data MUST expose only this company's published openings. Applicants MUST be able to browse those openings. See [OVR-001](../../../specs/product-overview.md) for the employer boundary, [JMG-002 / JMG-003](../../../specs/job-management.md) for publication and closing, and [SEC-001](../../../specs/security-and-privacy.md) for access rules.

Scenario: Given draft, published and closed jobs, when a visitor browses public listings, then only published jobs appear.

After (complete replacement):

## JOB-001: Published-only browsing

The public UI and data MUST expose only this company's published openings. Applicants MUST be able to browse those openings. See [OVR-001](../../../specs/product-overview.md) for the employer boundary, [JMG-002 / JMG-003](../../../specs/job-management.md) for publication and closing, and [SEC-001](../../../specs/security-and-privacy.md) for access rules.

Scenario: Given draft, published and closed jobs, when a visitor browses public listings, then only published jobs appear.

For a signed-in verified Applicant with an incomplete required profile, the app listing/category route MUST redirect to profile completion before querying/rendering openings under ACC-006. Guests and HR retain public published browsing. This is onboarding, not confidentiality of public jobs; public API/guest access remains available.

Scenario: Given a signed-in incomplete Applicant or invalid required values, when the affected operation is attempted, then readiness/validation blocks it without changing stored data; valid completion permits it. Existing frozen/history/role boundaries remain. See proposal AC01–06 for success/denial/failure evidence.

### JOB-003

Before (complete canonical clause):

## JOB-003: Published job detail

Each job MUST have a title, team name, description and requirements. Applicants MUST be able to open a published job and read its title, team, description and requirements.

Scenario: Given a published job, when an Applicant opens its detail page, then those four fields are visible.

After (complete replacement):

## JOB-003: Published job detail

Each job MUST have a title, team name, description and requirements. Applicants MUST be able to open a published job and read its title, team, description and requirements.

Scenario: Given a published job, when an Applicant opens its detail page, then those four fields are visible.

The app job-detail route MUST apply ACC-006 to signed-in incomplete Applicants before loading the job. Complete Applicants, guests and HR retain published-detail access. Direct apply/write eligibility is enforced by ACC-006 and APP-005.

Scenario: Given a signed-in incomplete Applicant or invalid required values, when the affected operation is attempted, then readiness/validation blocks it without changing stored data; valid completion permits it. Existing frozen/history/role boundaries remain. See proposal AC01–06 for success/denial/failure evidence.

## ADDED

None. ACC-006 owns readiness across these capabilities.

## REMOVED

None. Proposed deltas remain outside canonical until separate acceptance.
