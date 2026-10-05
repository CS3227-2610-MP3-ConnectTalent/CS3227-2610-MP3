# Product specification

Version: 0.4 (single-company careers site, 5 October 2026)

## Scope

This product is the careers site for one company. Each deployment represents that company's own vacancies, applicants, and HR staff. The first release supports multiple job openings and accepts one text-only application per applicant per job. Its two user roles are external Applicant and the company's HR staff. The planned AI features use the course-required SoC LLM. This document defines intended behavior; the current scaffold implements only a placeholder home page.

The company identity is fixed for the deployment and will be chosen before release. The site may show a short company introduction alongside its careers pages, but it is not a full corporate website. There is no employer sign-up, company switching, cross-company search, or multi-tenant company table. A later decision to host other employers would require a new spec and authorization design.

Each job has a title, description, requirements, and one required category from a small controlled list: Engineering, Human Resources, Legal, Sales, or Other. HR manages the company's jobs as draft, published, or closed. HR can edit draft content; published content stays fixed so submitted applications can be reviewed against the same requirements. Applicants can browse published jobs and filter by category. The category is descriptive metadata; it does not grant access or determine hiring decisions.

| Role | Owns | AI feature | Human control |
| --- | --- | --- | --- |
| Applicant | Own application and final cover letter | Draft from applicant notes and the published job | Edit and explicitly submit final text |
| HR | This company's job listings, review, and status of submitted applications | Summarize a submitted letter against published requirements | Publish jobs, read the original application, and decide status |

Assign one student primary responsibility for each role. Record team-level work and reviews in feature records; the names are still to be filled in by the team.

## Core behavior

1. Public sign-up creates an Applicant account for this company's portal. HR accounts for the company are assigned only through a controlled administrative step.
2. HR creates and edits draft job listings and explicitly publishes or closes them. Only published jobs appear in public listings and accept new applications. Closing a job preserves its existing applications for applicants and HR.
3. An Applicant browses published jobs, optionally filters them by category, reads a selected job, drafts and edits a cover letter, and submits at most one application for that job.
4. An Applicant reads only their own application and cannot change its HR status.
5. HR reads submitted applications, writes HR-only notes, and updates status through a separate authorized action.
6. The Applicant AI draft accepts only that applicant's notes and the selected published job text. A draft never submits an application.
7. The HR AI summary accepts only the selected submitted cover letter and that job's published requirements. It returns evidence mentioned, requirements not addressed in the letter, and possible follow-up questions. It does not score, rank, reject, or change status.

No resume upload, email automation, or AI hiring decision is in the first release.

## Data and access

| Data | Applicant access | HR access |
| --- | --- | --- |
| This company's published jobs, categories, and requirements | Read | Read/close |
| Draft jobs | None | Read/write/publish |
| Closed jobs | Title of a job on their existing application | Read |
| Application and cover letter | Own record only | Read for review |
| HR notes | None | Read/write by authorized HR |
| Role assignment | Cannot set or change | Controlled administration only |
| Audit events | None | Read as authorized |

The database must enforce row-level security in addition to server-side authorization. Only HR can create jobs, edit drafts, publish, or close jobs; published and closed job content cannot be edited. An Applicant cannot submit a new application to a draft or closed job. A database constraint must enforce one application per applicant per job. Each application must reference its selected job, and AI requests must load only that job's details and requirements. The browser must never receive a key that bypasses row-level security or the SoC LLM key.

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

1. The UI and data expose only this company's published openings to the public. Every job has a valid category, and applicants can filter published jobs by category; there is no employer registration or cross-company browsing flow.
2. HR can create a draft, edit it, publish it, and close a published job. Published requirements stay fixed. Applicants cannot perform those actions, see draft jobs, or submit to draft or closed jobs. Category filters never expose unpublished jobs, invalid categories are rejected, and an applicant can submit at most one application for each selected job.
3. Anonymous users cannot access protected records or AI endpoints.
4. Applicant A cannot read Applicant B's application or AI draft; an Applicant cannot invoke the HR summary.
5. AI requests use only the selected application's job details. HR summary requests contain only the selected letter and that job's published requirements; adversarial letters cannot expose HR notes or change status.
6. Malformed AI output is rejected safely; script-like output is displayed as text.
7. Oversized and repeated AI requests are limited, including behavior when the SoC LLM is unavailable or returns a quota error.
8. Browser flows demonstrate distinct Applicant and HR interfaces and human-controlled submission/status changes.
9. Staging and production use separate app/database settings. The deployed release, guides, tests, and reflections describe the same behavior.

Record tests and observed results in feature records. These criteria are not yet met by the scaffold.
