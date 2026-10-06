# Feature record: Browse job listings

Status: in progress — implementation and automated checks complete; independent review and human decision pending

Owner: Applicant role — Paul Cheng

Spec version: 0.6 ([ProductSpec.md](ProductSpec.md))
Date: 2026-10-05

## Requirement and acceptance criteria

Scope: the applicant-facing job list, category filter, and published job detail page. HR job creation and publication are covered by a separate feature record. This slice has no AI call or application submission.

Relevant spec clauses: **Scope** (job fields, categories, and states), **Core behavior** items 2–3, **Data and access** (published and draft/closed jobs), and **Acceptance evidence** items 1–2.

1. The listings page shows published jobs from this portal. It does not show draft or closed jobs.
2. Applicants can filter published jobs by category. The result contains only published jobs in the selected category; an invalid category does not expose jobs.
3. Selecting a published job opens a detail page showing its title, team name, description, and requirements.
4. A direct request for a draft or closed job's detail does not reveal its unpublished content to an applicant or anonymous visitor.

## Agent handoffs

| Role and tool | Input/context supplied | Output and assumptions | Human verification |
| --- | --- | --- | --- |
| Analyst | ProductSpec v0.6 and this proposed record | Acceptance criteria and agreed job fields supplied by the user | Team review pending |
| Implementer (Codex) | ProductSpec v0.6, this record, and current scaffold | Added jobs migration, seed, public pages, data queries, and tests; assumed one employer per deployment and no HR write policy in this slice | Team review pending |
| Reviewer | Implementation, tests, and access rules | Pending | Pending |

## Implementation and tests

Changed files: `supabase/migrations/20261005000000_create_jobs.sql`, `supabase/seed.sql`, `supabase/tests/database/jobs_visibility.test.sql`, `src/lib/job-categories.ts`, `src/lib/jobs.ts`, `src/app/page.tsx`, `src/app/layout.tsx`, `src/app/jobs/[id]/page.tsx`, `src/app/jobs/[id]/not-found.tsx`, `src/app/error.tsx`, `tests/unit/jobs.test.ts`, `tests/e2e/job-listings.spec.ts`, `playwright.config.ts`, `.github/workflows/ci.yml`, `README.md`, `docs/UserGuide.md`, and `docs/DeveloperGuide.md`.

Tests: unit tests assert that list/detail queries include `status=published`, a chosen category or ID is passed safely, and invalid category values are rejected. The pgTAP test covers anonymous and authenticated read visibility and write grants. The Playwright test covers public cards, filtering, details, invalid categories, and direct draft/closed URLs.

Commands and results: `tsc --noEmit` passed; `eslint src tests` passed; `vitest run` passed (3 tests); `next build` passed. After local Supabase became available, `supabase test db` passed (7 checks) and `playwright test` passed (3 browser flows). The first browser run exposed a missing semantic heading for job cards; changing the card title to an `h3` resolved it. The first browser run also lacked Chromium, which was installed before the successful rerun.

Security/adversarial cases and results: Unit tests passed for query filters and invalid category input. The migration restricts public roles to `SELECT` and applies a published-only row policy. Database tests confirmed anonymous and authenticated reads hide draft/closed rows and that public roles cannot write jobs. Browser tests confirmed invalid categories and direct draft/closed URLs do not reveal jobs.

Known limitations: HR job management, applications, and AI are outside this slice. The portal needs a configured Supabase project at runtime. An independent reviewer and team owner have not yet signed off, and the feature is not deployed.

## Review and decision

Reviewer findings and fixes: Pending.

Human decision and date: Pending.

Guide/reflection/log updates: `README.md`, `docs/UserGuide.md`, `docs/DeveloperGuide.md`, `docs/Reflections.md`, and `logs/2026-10-05-browse-job-listings.md` updated; team verification pending.
