# Job Application Portal

Scaffold for one company's text-only hiring portal with one published opening and two roles: Applicant and HR. The planned stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Zod, and the course-required SoC LLM. This scaffold provides configuration and a placeholder home page; authentication, applications, row-level security policies, and AI endpoints are not implemented yet.

## Prerequisites

- Node.js 20.9 or newer and Corepack/pnpm 12.8.1
- Docker Desktop (or a compatible container runtime) for local Supabase
- A Supabase project and SoC LLM access when those integrations are implemented

## Local setup

```sh
corepack pnpm install
corepack pnpm db:start
```

Copy `.env.example` to `.env.local`. Run `corepack pnpm supabase status` and set the local Supabase URL and publishable key. Fill in the SoC LLM values from the course guide when AI endpoints are implemented, and keep the key in server code only. Then start the app:

```sh
corepack pnpm dev
```

Visit <http://localhost:3000>. The home page runs without credentials; Supabase and the SoC LLM are not called by the scaffold.

## Checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Vitest, Playwright, and Supabase database test runners are configured through `vitest.config.ts`, `playwright.config.ts`, and `supabase/config.toml`. Add behavior and permission tests alongside each feature, then run `corepack pnpm test:unit`, `corepack pnpm test:e2e`, and `corepack pnpm test:db`. The initial CI workflow runs lint, typecheck, and build; add the test commands once their first tests exist.

## Project layout

- `src/app`: Next.js pages and global styles
- `src/components/ui`: generated shadcn/ui components
- `supabase`: local Supabase config, future migrations, and database tests
- `workflow`: product specification, agent handoff process, and review evidence
- `docs`: current user/developer guides, reflections, and the GitHub Pages website
- `logs`: verified summaries of development interactions
- `.github/workflows`: CI and GitHub Pages publication workflows

## Deployment plan

Use separate staging and production Vercel projects, each connected to its own Supabase project. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` in each Vercel environment. Set the SoC LLM settings as server-side secrets when AI endpoints are implemented. Apply reviewed database migrations before deploying features that depend on them. Do not use a service-role key in browser code or a `NEXT_PUBLIC_` variable. The team must manage deployment outside any Codex/Claude build-and-host environment.

The remote has `develop` as its default branch and `master` as its release branch. Create feature branches from `develop` and merge them back through reviewed PRs. Promote tested releases from `develop` to `master` through a separate PR. The GitHub Pages workflow publishes the static website from `master` after GitHub Pages is enabled in repository settings. See `workflow/AgentProcess.md` for the full change flow.
