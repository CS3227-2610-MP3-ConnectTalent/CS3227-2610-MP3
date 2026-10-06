# Applicant job browsing implementation — 5 October 2026

Verification status: **team review pending**.

The user approved the shared job fields and asked Codex to build the public listing, category filter, and job detail page on `feature/applicant-job-listings`. Codex added a Supabase `jobs` migration with published-only public read access, synthetic seed jobs, server-side query functions, and Next.js pages for browsing and details. It also added unit, pgTAP, and Playwright tests, made unit tests a CI check, and updated the user/developer guides and feature record. No HR job management, application submission, or AI endpoint was added.

Typecheck, lint, three unit tests, and the production build passed. After local Supabase was available and `.env.local` was created from the running stack's URL and publishable key, seven pgTAP permission checks passed. The first Playwright run could not launch because Chromium was missing. After installing Chromium, the browser run exposed a missing semantic heading on job cards. Codex changed the title to an `h3` and aligned the test server origin with `localhost`; all three browser flows then passed. Independent review and team approval remain pending.

The pre-existing deletion of `logs/README.md` was intentionally carried onto this branch by the user and was not changed by Codex during this implementation.
