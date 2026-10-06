# User Guide

Status: job browsing implemented locally; other features are planned (5 October 2026).

## Access

Follow the local Supabase and environment setup in the root `README.md`, then run `corepack pnpm dev` and open <http://localhost:3000>. The demo uses neutral branding and does not require a company name.

The home page shows published jobs. Use the category links to filter the list, then select a job card to see its title, team, description, and requirements. The local seed has published jobs in Engineering, Human Resources, and Sales, plus a draft Legal job and a closed Other job; the latter two are hidden from public browsing. No public app deployment or test accounts are available yet.

There is currently no sign-in, application form, HR review page, HR posting UI, or AI feature to test. This guide must be updated as each feature is released so peer testers see only accurate instructions.

## Planned roles

- **Applicant:** browse published openings by category and read their details. Writing and submitting a text-only application and requesting a SoCLaaS cover-letter draft are planned.
- **HR:** create and manage this company's job listings, publish or close them, review applications, write private notes, change application status, and optionally request a SoCLaaS summary of a cover letter against the selected job's requirements.

Both AI features are advisory. Applicants submit their own final text; HR makes every hiring decision.
