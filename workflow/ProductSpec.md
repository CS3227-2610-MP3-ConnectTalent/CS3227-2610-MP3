# Product specification

Version: 0.2 (single-company scope, 5 October 2026)

## Scope

This is one company's hiring portal, not a marketplace for multiple employers. The first release has one published job opening and accepts one text-only application per applicant for that opening. Its two user roles are external Applicant and that company's HR staff. The planned AI features use the course-required SoC LLM. This document defines intended behavior; the current scaffold implements only a placeholder home page.

The company is fixed for this deployment. There is no employer sign-up, company dashboard, cross-company search, or multi-tenant company table in the first release. A later decision to support multiple companies would require a new spec and authorization design before implementation.

| Role | Owns | AI feature | Human control |
| --- | --- | --- | --- |
| Applicant | Own application and final cover letter | Draft from applicant notes and the published job | Edit and explicitly submit final text |
| HR | Review and status of submitted applications | Summarize a submitted letter against published requirements | Read the original and decide status |

Assign one student primary responsibility for each role. Record team-level work and reviews in feature records; the names are still to be filled in by the team.

## Core behavior

1. Public sign-up creates an Applicant account for this company's portal. HR accounts for the company are assigned only through a controlled administrative step.
2. An Applicant reads the published job, drafts and edits a cover letter, and submits at most one application for that job.
3. An Applicant reads only their own application and cannot change its HR status.
4. HR reads submitted applications, writes HR-only notes, and updates status through a separate authorized action.
5. The Applicant AI draft accepts only that applicant's notes and the published job text. A draft never submits an application.
6. The HR AI summary accepts only the selected submitted cover letter and published requirements. It returns evidence mentioned, requirements not addressed in the letter, and possible follow-up questions. It does not score, rank, reject, or change status.

No resume upload, email automation, or AI hiring decision is in the first release.

## Data and access

| Data | Applicant access | HR access |
| --- | --- | --- |
| This company's published job and requirements | Read | Read |
| Application and cover letter | Own record only | Read for review |
| HR notes | None | Read/write by authorized HR |
| Role assignment | Cannot set or change | Controlled administration only |
| Audit events | None | Read as authorized |

The database must enforce row-level security in addition to server-side authorization. A database constraint must enforce one application per applicant for the published job. The browser must never receive a key that bypasses row-level security or the SoC LLM key.

## AI and security contract

- Authenticate and authorize at each AI endpoint before loading data or making a model call.
- Treat applicant notes and cover letters as untrusted data, including text that impersonates system messages or asks the model to ignore instructions.
- Do not give the model tools or database access. AI endpoints return text/structured data only and cannot mutate application status.
- Validate input lengths and structured output with Zod. Render model text as escaped text, never raw HTML.
- Exclude HR notes, other applications, secrets, and unrelated personal data from model requests.
- Apply per-user usage limits, model output caps, timeouts, and clear retry/error handling. Exact thresholds must be set after reviewing SoC LLM quotas.
- Log actor, operation, target, timestamp, and outcome without logging cover-letter text or API keys.
- Use synthetic applicant records for development and security tests.

## Acceptance evidence required before release

1. The UI and data expose only this company's published opening; there is no employer registration or cross-company browsing flow.
2. Anonymous users cannot access protected records or AI endpoints.
3. Applicant A cannot read Applicant B's application or AI draft; an Applicant cannot invoke the HR summary.
4. HR summary requests contain only the selected letter and published requirements; adversarial letters cannot expose HR notes or change status.
5. Malformed AI output is rejected safely; script-like output is displayed as text.
6. Oversized and repeated AI requests are limited, including behavior when the SoC LLM is unavailable or returns a quota error.
7. Browser flows demonstrate distinct Applicant and HR interfaces and human-controlled submission/status changes.
8. Staging and production use separate app/database settings. The deployed release, guides, tests, and reflections describe the same behavior.

Record tests and observed results in feature records. These criteria are not yet met by the scaffold.
