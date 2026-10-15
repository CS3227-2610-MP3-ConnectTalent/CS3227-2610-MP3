# Product overview

Baseline: ProductSpec v1.11 on this branch, 15 October 2026; accepted #84 action feedback (earlier requirements retained).

## OVR-001: One employer per deployment

The product MUST be the careers site for one company. Each deployment represents that company's own vacancies, applicants and HR staff. Neutral "Careers" branding and reuse without naming a company are permitted. This release MUST NOT provide employer signup, company switching, cross-company search or a multi-tenant company table. Hosting several employers in one deployment requires a new specification and authorization design.

Scenario: Given a deployed portal, when a visitor browses its openings, then the portal contains that employer's listings and provides no employer registration or cross-company browsing flow.

## OVR-002: First-release actors and scope

The first release MUST support multiple job openings and one application per applicant per job, including a cover letter, identity/contact details, optional education/work experience and one optional private PDF résumé. Its two user roles remain external Applicant and company HR staff. Planned AI features MUST use the course-required SoC LLM.

| Role      | Owns                                                                      | AI feature                                                  | Human control                                                  |
| --------- | ------------------------------------------------------------------------- | ----------------------------------------------------------- | -------------------------------------------------------------- |
| Applicant | Own application, final cover letter, private profile and draft attachment | Draft from applicant notes and the published job            | Edit and explicitly submit final text                          |
| HR        | This company's job listings, review, and status of submitted applications | Summarize a submitted letter against published requirements | Publish jobs, read the original application, and decide status |

See [applications and review](applications-and-review.md), [Applicant AI draft](applicant-ai-draft.md) and [HR AI summary](hr-ai-summary.md) for these behaviors, and [SEC-001 / SEC-002](security-and-privacy.md) for canonical access boundaries.

## OVR-003: Non-goals

Email automation and AI hiring decisions MUST NOT be part of the first release. Résumé parsing, AI profile autofill, multiple application attachments and HR access to Applicant profiles MUST NOT be provided by this change. Removing the résumé-upload exclusion does not alter accepted Auth verification/recovery behavior. Attachment permissions/lifecycle are defined in [SEC-009](security-and-privacy.md) and [APP-006/007](applications-and-review.md).

## OVR-006: Pending feedback for remaining request actions

Application Save draft and Submit application, résumé upload/replace/remove/profile-copy/retry, and error-page route retry MUST show action-specific pending feedback when their request or transition waits. The active request action MUST not be available for repeat activation while pending; conflicting file actions MUST remain unavailable until settlement. On an application-handled failure, the controls MUST return to a usable state with truthful error/retry feedback. Pending UI MUST preserve native form validity, keyboard behavior, typed Applicant content, attachment lifecycle and server-side authorization. Immediate local-only controls do not require artificial loading indicators. A visual state does not replace backend idempotency, RLS or role checks.

Scenario: Given a slow application draft save, when **Save draft** is activated, then that button says “Saving draft…” while Submit is unavailable. Given a slow résumé operation, its active button names the operation and competing file controls stay unavailable until resolution. Invalid form input or a rejected file retains native/server validation and existing safe errors without revealing a private file.

## Unresolved ownership and implementation evidence

Assign one student primary responsibility for each role and record team-level work and reviews in feature records. Names remain to be filled in by the team; this migration does not assign them.

The source v0.6 described only a placeholder home-page scaffold and stated its acceptance criteria were not yet met. Those are historical source-baseline statements, not a fresh inspection of current implementation. Intended requirements and release evidence remain distinct; see [OPS-003](deployment-and-operations.md).
