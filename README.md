# Company Careers

Reusable careers portal for one employer per deployment. Applicants can browse published jobs and use the sign-up/application flow. HR review of submitted applications, private notes and explicit status actions is merged into `develop`. Issue #27 adds a locally accepted password-recovery flow on this branch; hosted validation remains separate. Supabase Auth requires email verification; RLS protects private drafts, submitted applications, and AI audit metadata. Applicant cover-letter drafting and HR cover-letter summaries use SoCLaaS behind server-only routes. The stack is Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth/PostgreSQL, Zod, and SoCLaaS.

## Prerequisites

- Node.js 24 LTS (Next.js 16 technically supports 20.9+, but Node 20 is end of life)
- pnpm 12.8.1, pinned in `package.json`; Corepack selects that version, or you can install the same pnpm version directly
- Docker Desktop (or a compatible container runtime) for local Supabase
- A Supabase project; SoC LLM access is needed only to enable the AI features

## Local setup

```sh
corepack pnpm install
corepack pnpm db:start
```

For a fresh local Supabase stack, `db:start` applies the jobs, Applicant, HR review, and AI security migrations plus synthetic seed postings. For an existing local stack, use `corepack pnpm exec supabase migration up --local` to apply pending migrations without resetting data; restart the stack to apply email-confirmation config. Copy `.env.example` to `.env.local`. Run `corepack pnpm exec supabase status` and set the local Supabase URL and publishable key. `APP_SITE_URL` is optional; local development defaults to `http://localhost:3000`. If set, it must be a site origin without a path. Vercel deployments resolve their callback origin from Vercel's system environment variables.

To enable SoCLaaS, configure `SOCLAAS_AI_ENABLED=true`, `SOCLAAS_BASE_URL`, `SOCLAAS_API_KEY`, and `SOCLAAS_MODEL` in the server environment using the course SoCLaaS guide. The quota/audit metadata RPCs also require the server-only `SUPABASE_SECRET_KEY` (preferred) or legacy `SUPABASE_SERVICE_ROLE_KEY`; the AI privileged helper is used only for these metadata RPCs. Private résumé staging/cleanup also requires this server-only key, even with AI disabled. Applicant and HR data reads continue through the signed-in user’s RLS-scoped Supabase session. Never expose any of these credentials in browser code or `NEXT_PUBLIC_` variables. The AI routes fail closed when the feature flag or required settings are missing. Confirm the model and the configured key’s actual limits before making live calls. Then start the app:

```sh
corepack pnpm dev
```

For a repeatable **local-only** HR login, add `TEST_SUPABASE_SERVICE_ROLE_KEY` from `corepack pnpm exec supabase status` and a developer-chosen `LOCAL_HR_SEED_PASSWORD` (8–72 characters) to ignored `.env.local`, then run `corepack pnpm seed:local-hr`. Sign in as `local-hr@example.test` using that password. The command creates or reuses only this synthetic verified account, checks that it has no Applicant applications, and refuses any Supabase URL other than the local port 54321. It does not auto-login or provision a shared/hosted account. Keep the local admin key and password out of Git and chat. `supabase/seed.sql` continues to seed jobs; a database reset removes local Auth accounts, so rerun the command afterward.

Visit <http://localhost:3000> to browse published jobs. Select a category or open a job card to read its details. The sample draft and closed postings must not appear. For Applicant flows, sign up with a matching confirmation password and verify using the local mail viewer at <http://127.0.0.1:54324>, then sign in, save/submit a cover letter, and visit **My applications**. The local mail viewer captures verification messages; they do not arrive in Gmail. Use `localhost` for the app throughout the confirmation flow.

To test password recovery locally, use **Forgot password?** on the sign-in page, enter a synthetic Applicant or HR email, and open the reset message in the same browser through the local mail viewer. Enter and confirm a new password, then sign in again. The local Supabase Auth allowlist includes the exact `/auth/callback?flow=recovery` URL; restart the local stack after changing `supabase/config.toml`. For hosted testing, allowlist that exact callback URL in each Supabase project and configure email delivery before testing. The request page gives the same acknowledgement whether the account exists or not.

## AI assistance and privacy

- Applicants may enter up to 4,000 characters of experience notes for a selected published job. The server sends only those notes, the job title, and published requirements to SoCLaaS. The result fills the editable cover-letter field; generation does not save or submit an application. Applicants should verify dates, skills, and achievements before saving or submitting.
- Submitted applications are frozen. The current submitted letter remains stable for HR review and AI summaries; an Applicant who needs a correction is directed to HR.
- HR may request a summary for one submitted application. The server sends only its current submitted letter and that job’s published requirements. HR sees the source letter beside three short summary sections and must verify them. The endpoint rejects output containing common hiring-decision or ranking language; this lexical guard cannot prove semantic correctness. The model has no tools and cannot write notes or change status, and HR alone changes status.
- Both routes validate inputs and outputs, time out after 20 seconds, make no automatic provider retry, and cap output at 500 tokens for drafts and 350 for summaries. The database enforces a shared limit of three AI requests per user and 24 per deployment per rolling minute, leaving headroom below the configured key’s observed 30 requests/minute limit. A lower key-specific SoCLaaS limit still applies. A SoCLaaS 429 returns a safe retry-later response with a sanitized `Retry-After` value when the provider supplies a valid one.
- AI audit rows record actor, operation, target, time, and outcome only. Submission events record actor, application, and time. Applicant notes, cover letters, prompts, model output, API keys, and provider bodies are not written to these audit tables or server logs. Set `SOCLAAS_AI_ENABLED=false` to make both AI routes fail closed.

## Checks

```sh
corepack pnpm lint
corepack pnpm typecheck
corepack pnpm build
```

Vitest, Playwright, and Supabase database test runners are configured through `vitest.config.ts`, `playwright.config.ts`, and `supabase/config.toml`. With local Supabase running and seeded, run `corepack pnpm test:unit`, `corepack pnpm test:e2e`, `corepack pnpm test:db`, `corepack pnpm test:race`, and `corepack pnpm test:ai-race`. The HR and password-recovery browser tests require `TEST_SUPABASE_SERVICE_ROLE_KEY` from the **local** Supabase stack; without it, those cases are skipped. They create synthetic users/jobs and must never run with a hosted project key. The race checks need Docker and this project's local Supabase database container. CI runs lint, typecheck, unit tests, and build; database, race and browser tests are local gates until CI has a Supabase stack.

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

The team maps Vercel production from `master` to Production Supabase and every non-`master` preview, including `develop`, to Development Supabase. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` for each environment. Vercel supplies `VERCEL_PROJECT_PRODUCTION_URL` and `VERCEL_URL` for callback origins; `APP_SITE_URL` is optional for local or non-Vercel deployments. In Supabase Auth URL Configuration, allow the relevant callback origins. Preview access controls can block external Applicant confirmation. Configure an email sender before public deployment. Set SoCLaaS credentials and the Supabase quota/audit key as server-side secrets for each environment. A PR preview depending on the HR schema requires a reviewed Development Supabase migration first; Production Supabase is a separate release operation. Never use a service-role or secret key in browser code or a `NEXT_PUBLIC_` variable. The team must manage deployment outside any Codex/Claude build-and-host environment.

The remote has `develop` as its default branch and `master` as its release branch. Create feature branches from `develop` and merge them back through reviewed PRs. Promote tested releases from `develop` to `master` through a separate PR. The GitHub Pages workflow publishes the [static product website](https://cs3227-2610-mp3-connecttalent.github.io/CS3227-2610-MP3/) from `master`. See `workflow/AgentProcess.md` for the full change flow.
