# Product overview

Baseline: ProductSpec v0.6, 5 October 2026; reorganized 6 October 2026 without intended behavior changes.

## OVR-001: One employer per deployment

The product MUST be the careers site for one company. Each deployment represents that company's own vacancies, applicants and HR staff. Neutral "Careers" branding and reuse without naming a company are permitted. This release MUST NOT provide employer signup, company switching, cross-company search or a multi-tenant company table. Hosting several employers in one deployment requires a new specification and authorization design.

Scenario: Given a deployed portal, when a visitor browses its openings, then the portal contains that employer's listings and provides no employer registration or cross-company browsing flow.

## OVR-002: First-release actors and scope

The first release MUST support multiple job openings and one text-only application per applicant per job. Its two user roles are external Applicant and company HR staff. Planned AI features MUST use the course-required SoC LLM.

| Role | Owns | AI feature | Human control |
| --- | --- | --- | --- |
| Applicant | Own application and final cover letter | Draft from applicant notes and the published job | Edit and explicitly submit final text |
| HR | This company's job listings, review, and status of submitted applications | Summarize a submitted letter against published requirements | Publish jobs, read the original application, and decide status |

See [applications and review](applications-and-review.md), [Applicant AI draft](applicant-ai-draft.md) and [HR AI summary](hr-ai-summary.md) for these behaviors, and [SEC-001 / SEC-002](security-and-privacy.md) for canonical access boundaries.

## OVR-003: Non-goals

Resume upload, email automation and AI hiring decisions MUST NOT be part of the first release.

## Unresolved ownership and implementation evidence

Assign one student primary responsibility for each role and record team-level work and reviews in feature records. Names remain to be filled in by the team; this migration does not assign them.

The source v0.6 described only a placeholder home-page scaffold and stated its acceptance criteria were not yet met. Those are historical source-baseline statements, not a fresh inspection of current implementation. Intended requirements and release evidence remain distinct; see [OPS-003](deployment-and-operations.md).
