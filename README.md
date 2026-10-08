# Company Careers

Reusable careers portal for one employer per deployment. Applicants can browse published jobs and use the sign-up/application flow. HR review of submitted applications, private notes and explicit status actions is merged into `develop`; shared Development Supabase migration and preview validation remain separate. Supabase Auth requires email verification; RLS protects private drafts and submitted applications. HR job management and the course-required SoC LLM features are still planned. The stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Zod, and SoCLaaS.

## Prerequisites

- Node.js 24 LTS (Next.js 16 technically supports 20.9+, but Node 20 is end of life)
- pnpm 12.8.1, pinned in `package.json`; Corepack selects that version, or you can install the same pnpm version directly
- Docker Desktop (or a compatible container runtime) for local Supabase
- A Supabase project and SoC LLM access when those integrations are implemented

## Local setup

```sh
corepack pnpm install
corepack pnpm db:start
```

For a fresh local Supabase stack, `db:start` applies the jobs, Applicant and HR review migrations plus synthetic seed postings. For an existing local stack, use `corepack pnpm exec supabase migration up --local` to apply pending migrations without resetting data; restart the stack to apply email-confirmation config. Copy `.env.example` to `.env.local`. Run `corepack pnpm exec supabase status` and set the local Supabase URL and publishable key. `APP_SITE_URL` is optional; local development defaults to `http://localhost:3000`. If set, it must be a site origin without a path. Vercel deployments resolve their callback origin from Vercel's system environment variables. Fill in the SoC LLM values from the course guide when AI endpoints are implemented, and keep the key in server code only. Then start the app:

```sh
corepack pnpm dev
```

For a repeatable **local-only** HR login, add `TEST_SUPABASE_SERVICE_ROLE_KEY` from `corepack pnpm exec supabase status` and a developer-chosen `LOCAL_HR_SEED_PASSWORD` (8–72 characters) to ignored `.env.local`, then run `corepack pnpm seed:local-hr`. Sign in as `local-hr@example.test` using that password. The command creates or reuses only this synthetic verified account, checks that it has no Applicant applications, and refuses any Supabase URL other than the local port 54321. It does not auto-login or provision a shared/hosted account. Keep the local admin key and password out of Git and chat. `supabase/seed.sql` continues to seed jobs; a database reset removes local Auth accounts, so rerun the command afterward.

Visit <http://localhost:3000> to browse published jobs. Select a category or open a job card to read its details. The sample draft and closed postings must not appear. For Applicant flows, sign up with a matching confirmation password and verify using the local mail viewer at <http://127.0.0.1:54324>, then sign in, save/submit a cover letter, and visit **My applications**. The local mail viewer captures verification messages; they do not arrive in Gmail. Use `localhost` for the app throughout the confirmation flow.

## Checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Vitest, Playwright, and Supabase database test runners are configured through `vitest.config.ts`, `playwright.config.ts`, and `supabase/config.toml`. With local Supabase running and seeded, run `corepack pnpm test:unit`, `corepack pnpm test:e2e`, `corepack pnpm test:db`, and `corepack pnpm test:race`. The HR browser test requires `TEST_SUPABASE_SERVICE_ROLE_KEY` from the **local** Supabase stack; without it, that case is skipped. It creates synthetic users/jobs and must never run with a hosted project key. The race check needs Docker and this project's local Supabase database container. CI runs lint, typecheck, unit tests, and build; database, race and browser tests are local gates until CI has a Supabase stack.

## Project layout

- [AGENTS.md](AGENTS.md): concise repository instructions read by Codex and contributors.
- [CONTRIBUTING.md](CONTRIBUTING.md): setup, engineering practices, issue-first workflow, checks, commits, and PR requirements.
- `src/app`: Next.js pages and global styles
- `src/components/ui`: generated shadcn/ui components
- `supabase`: local Supabase config, migrations, seed data, and database tests
- [workflow](workflow/README.md): canonical capability specs, process policy, packet templates, active changes, archive, evidence records, and skill catalog
- `.codex/agents/<name>.toml`: six project-scoped Codex subagent profiles; see the [agent catalog](workflow/agents/README.md) for role/skill mapping and permission limits. Static validity does not prove runtime Codex discovery.
- `.agents/skills/<name>/SKILL.md`: fourteen present repository-scoped Codex instruction manifests (eight stages, six specialists); see the [catalog](workflow/skills/README.md) for exact paths and the [Developer Guide](docs/DeveloperGuide.md#spec-driven-and-agent-workflow). Live Codex discovery, selection and restart were not tested.
- `docs`: current user/developer guides, reflections, and the GitHub Pages website
- [logs](logs/README.md): dated development-session summaries, policy and template; historical summaries retain their stated team-verification limits
- `.github`: issue intake forms, PR evidence template, CI and GitHub Pages publication workflows

## Deployment plan

The team maps Vercel production from `master` to Production Supabase and every non-`master` preview, including `develop`, to Development Supabase. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for each environment. Vercel supplies `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL` for callback origins; `APP_SITE_URL` is optional for local or non-Vercel deployments. In Supabase Auth URL Configuration, allow the relevant callback origins. Preview access controls can block external Applicant confirmation. Configure an email sender before public deployment. Set SoCLaaS settings as server-side secrets when AI endpoints are implemented. A PR preview depending on the HR schema requires a reviewed Development Supabase migration first; Production Supabase is a separate release operation. Do not use a service-role key in browser code or a `NEXT_PUBLIC_` variable. The team must manage deployment outside any Codex/Claude build-and-host environment.

The remote has `develop` as its default branch and `master` as its release branch. Create feature branches from `develop` and merge them back through reviewed PRs. Promote tested releases from `develop` to `master` through a separate PR. The GitHub Pages workflow publishes the [static product website](https://cs3227-2610-mp3-connecttalent.github.io/CS3227-2610-MP3/) from `master`. See `workflow/AgentProcess.md` for the full change flow.
