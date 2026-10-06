# Company Careers

Reusable careers portal for one employer per deployment. Applicants can now browse published jobs by category and read each job's details. A Supabase migration defines the shared job fields and protects unpublished jobs with row-level security. HR job management, authentication, applications, and the course-required SoC LLM features are still planned. The stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Zod, and SoCLaaS.

## Prerequisites

- Node.js 20.9 or newer and Corepack/pnpm 12.8.1
- Docker Desktop (or a compatible container runtime) for local Supabase
- A Supabase project and SoC LLM access when those integrations are implemented

## Local setup

```sh
corepack pnpm install
corepack pnpm db:start
```

For a fresh local Supabase stack, `db:start` applies the jobs migration and synthetic seed postings. Copy `.env.example` to `.env.local`. Run `corepack pnpm supabase status` and set the local Supabase URL and publishable key. Fill in the SoC LLM values from the course guide when AI endpoints are implemented, and keep the key in server code only. Then start the app:

```sh
corepack pnpm dev
```

Visit <http://localhost:3000> to browse published jobs. Select a category or open a job card to read its details. The sample draft and closed postings must not appear. Browsing needs the configured Supabase database; no sign-in or SoC LLM call is needed.

## Checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Vitest, Playwright, and Supabase database test runners are configured through `vitest.config.ts`, `playwright.config.ts`, and `supabase/config.toml`. The job-browsing slice includes unit, browser, and database permission tests. With local Supabase running and seeded, run `corepack pnpm test:unit`, `corepack pnpm test:e2e`, and `corepack pnpm test:db`. CI runs lint, typecheck, unit tests, and build. Database and browser tests pass locally but are not yet CI gates.

## Project layout

- `src/app`: Next.js pages and global styles
- `src/components/ui`: generated shadcn/ui components
- `supabase`: local Supabase config, future migrations, and database tests
- [workflow](workflow/README.md): canonical capability specs, process policy, packet templates, active changes, archive, evidence records, and skill catalog
- `.agents/skills/<name>/SKILL.md`: planned repository-scoped Codex stage/specialist instructions; see the [catalog](workflow/skills/README.md) and [Developer Guide](docs/DeveloperGuide.md#spec-driven-and-agent-workflow)
- `docs`: current user/developer guides, reflections, and the GitHub Pages website
- [logs](logs/README.md): dated development-session summaries, policy and template; historical summaries retain their stated team-verification limits
- `.github`: issue intake forms, PR evidence template, CI and GitHub Pages publication workflows

## Deployment plan

Use separate staging and production Vercel projects, each connected to its own Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in each Vercel environment. Set the SoC LLM settings as server-side secrets when AI endpoints are implemented. Apply reviewed database migrations before deploying features that depend on them. Do not use a service-role key in browser code or a `NEXT_PUBLIC_` variable. The team must manage deployment outside any Codex/Claude build-and-host environment.

The remote has `develop` as its default branch and `master` as its release branch. Create feature branches from `develop` and merge them back through reviewed PRs. Promote tested releases from `develop` to `master` through a separate PR. The GitHub Pages workflow publishes the [static product website](https://cs3227-2610-mp3-connecttalent.github.io/CS3227-2610-MP3/) from `master`. See `workflow/AgentProcess.md` for the full change flow.
