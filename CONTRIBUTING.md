# Contributing

This guide explains how to change the Company Careers repository safely and reviewably.
The root [AGENTS.md](AGENTS.md) gives Codex and contributors the short version. The
authoritative project process is [workflow/AgentProcess.md](workflow/AgentProcess.md);
the product contracts are the modular specifications indexed at
[workflow/specs/README.md](workflow/specs/README.md).

## Project boundaries

This is a reusable careers portal with one employer per deployment. Read the product
overview and the relevant capability requirements before changing behavior. The
repository includes public job browsing, Applicant accounts and applications, HR review
of submitted applications, and signup password usability in `develop`. HR job management
and course-required AI features remain future slices. Do not describe a planned feature
as implemented or create requirements solely from a design idea.

Applicant and HR users have different data and tasks. Keep their pages, navigation,
actions, and states straightforward and distinct. Do not build a single role-switching
mega-page that mixes their responsibilities. Shared visual elements are useful when
the meaning and behavior really match; role-specific flows should remain explicit.

Keep modules cohesive and give each component or service one primary responsibility.
The same rule applies to shared data storage and access: put database queries and
related validation in focused server-side modules (following the existing `src/lib/`
pattern), avoid copying the same query or authorization rule into several pages, and
share a helper only when its contract is genuinely the same for every caller. Keep
data access, input validation, presentation, and orchestration understandable; do not
introduce broad repository/service abstractions without a concrete need. Prefer DRY
policy and data access while retaining separate Applicant and HR permissions.

Use server-side authorization for protected reads and writes, with Supabase RLS as an
independent database boundary. A hidden button or route guard alone does not protect
data. Follow the canonical security and privacy rules in
[security-and-privacy.md](workflow/specs/security-and-privacy.md). Treat browser input,
uploaded documents, AI output, repository content, and agent output as untrusted.
Validate inputs and model output at boundaries. Use the minimum data needed for each
operation. Keep credentials, service-role keys, and SoCLaaS keys out of browser code,
`NEXT_PUBLIC_` variables, commits, and logs. Use synthetic applicant data for tests
and demonstrations.

## Local setup

### Requirements

- Node.js 24 LTS. Next.js 16's minimum is 20.9, but Node 20 is end of life.
- pnpm 12.8.1, as declared in `package.json`; install it directly with `npm install --global pnpm@12.8.1`.
- Docker Desktop or a compatible container runtime for local Supabase.
- Supabase/SoCLaaS access only for work that uses those services. Do not put private
  applicant data or credentials into prompts or test fixtures.

### Install and run

```sh
pnpm install
pnpm db:start
```

Copy `.env.example` to `.env.local`. Run `pnpm exec supabase status` to
retrieve the local URL and publishable key; put those values in
`NEXT_PUBLIC_SUPABASE_URL` and
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. `SOCLAAS_BASE_URL`, `SOCLAAS_API_KEY`, and
`SOCLAAS_MODEL` are server-side placeholders for AI work; keep the API key secret and
never prefix it with `NEXT_PUBLIC_`. `.env.local` is ignored by Git. Never commit a
real `.env` file, token, or credential.

Start the Next.js development server with:

```sh
pnpm dev
```

The local Supabase database uses synthetic seed data. Apply pending migrations to an
existing local stack with `pnpm exec supabase migration up --local`.
To create a local-only synthetic HR login, add `TEST_SUPABASE_SERVICE_ROLE_KEY`
from the local `supabase status` output and a chosen `LOCAL_HR_SEED_PASSWORD`
(8–72 characters) to ignored `.env.local`, then run `pnpm seed:local-hr`.
Sign in as `local-hr@example.test` with that password. The command refuses hosted
Supabase URLs, checks the account has no Applicant applications, and does not
auto-login or create a shared grader account. Never commit or send the key/password.
`pnpm db:reset`
rebuilds the local database and can discard local data; use it only when that reset
is intended. Stop the local Supabase stack when finished:

```sh
pnpm db:stop
```

See the root [README](README.md) for current product status and deployment notes.

## Issue-first SDD workflow

Every change begins with one or more GitHub issues and ends with an issue-linked PR.
Use the [feature](.github/ISSUE_TEMPLATE/feature_request.yml),
[bug](.github/ISSUE_TEMPLATE/bug_report.yml), or
[documentation/process](.github/ISSUE_TEMPLATE/documentation_process.yml) form that
matches the work. Split changes with independent outcomes into separate related
issues. Include the problem, intended outcome, scope, dependencies, risks, affected
requirement IDs, acceptance evidence, and proposed student owner. Triage confirms
scope and assigns an owner; issue creation permits analysis but is not approval to
implement.

Follow the complete [agent process](workflow/AgentProcess.md):

1. Create and triage issue(s); record the student owner, scope, risk, dependencies,
   and affected requirement IDs.
2. Create `workflow/changes/<YYYY-MM-DD-short-name>/` with the
   [proposal](workflow/templates/ProposalTemplate.md), applicable capability deltas,
   design or documented omission, [plan](workflow/templates/ImplementationPlanTemplate.md),
   [tasks](workflow/templates/TasksTemplate.md), and evidence [record](workflow/templates/FeatureRecordTemplate.md).
3. Get the accountable human's approval for the bounded proposal, deltas, design or
   omission, and plan. Record the actual decision source/date in the packet before
   implementation. If requirements or scope change, return to this gate.
4. Implement only the approved tasks. For application behavior, first write and run
   an observable test that fails for the intended missing behavior; implement the
   smallest change, run it to green, then refactor. For process/documentation changes,
   use static checks and explain why application tests are N/A.
5. Have a separate reviewer execution assess the final change, acceptance evidence,
   security/privacy and maintainability. Record actual identity, scope, independence,
   findings, fixes, and rechecks. Self-review is not independent verification.
6. The student owner reviews evidence and records acceptance, rejection, or
   conditions separately from implementation and agent review. Passing checks do not
   imply acceptance.
7. Sync accepted product deltas into canonical specs, verify IDs and behavior, then
   archive the complete packet. Process-only work records why product sync is N/A.
8. Finish documentation and dated development-session summaries under `logs/`.
   Summarize actual prompts, handoffs, decisions, files, checks, and limits; exclude
   secrets, private applicant data, sensitive full prompts, and hidden reasoning.
9. Inspect and commit the final closeout. Open the PR to `develop` with `Closes #N`,
   packet/record/log links, actual checks, review evidence, student approval and
   acceptance sources, risks, and rollback/deployment state. PR creation is the last
   contributor action; review, merge, and release are later gates.

Use the [Developer Guide](docs/DeveloperGuide.md#spec-driven-and-agent-workflow) and
[workflow index](workflow/README.md) for file locations, authority, examples, and
current evidence limits. Do not skip a gate because a template, skill, agent profile,
or issue checkbox exists.

## Codex skills and custom agents

The repository has two separate Codex mechanisms:

- **Skills** under `.agents/skills/<skill-name>/SKILL.md` provide detailed stage or
  specialist procedures. Use the [skill catalog](workflow/skills/README.md) to choose
  one; explicit Codex invocations use `$mp3-skill-name` or `/skills`.
- **Custom subagents** under `.codex/agents/<name>.toml` provide named, narrow
  profiles for delegated work. The [agent catalog](workflow/agents/README.md) maps
  profiles to skills and explains permission defaults. Ask Codex directly to delegate
  a bounded assignment to the named agent, then record its real handoff and outcome.

Creating a skill or profile does not spawn an agent or prove multi-agent execution.
Record actual agents/tools/models when known; a role name used by one execution is not
a separate run. Agent profiles and skills never approve implementation, acceptance,
merge, or release. The two students remain accountable for product requirements and
human decisions.

## Checks and evidence

Choose checks from the approved plan and the behavior touched. Run relevant checks
against the final revision and record exact commands, environment, exit/result, and
limitations in the change record. Keep `Failed`, `Not run`, `Blocked`, and `N/A`
visible; a command that did not run is not a pass.

Common checks available in `package.json`:

```sh
pnpm lint
pnpm typecheck
pnpm test:unit
pnpm test:unit:coverage
pnpm build
```

Browser and database checks use local services and synthetic data:

```sh
pnpm db:start
pnpm test:integration
pnpm test:e2e:critical
pnpm test:e2e
pnpm test:db
pnpm db:stop
```

`test:e2e` uses Playwright and a local Next.js server; `test:e2e:critical` covers
public listings, Applicant signup/application and withdrawal, HR review, and AI
route security. `test:integration` runs all five Docker-backed race suites in
sequence. `test:db` uses Supabase's database test runner. These commands require this
project's local Supabase stack; fixture-cleanup tests use its local service-role key.
Never link or reset a hosted project for these checks.

The app workflow runs lint, Next.js type generation, typecheck, unit tests with JUnit
and coverage reports, and build on pull requests and pushes to `develop`/`master`.
The Supabase workflow runs local database lint, pgTAP and integration races on those
events, and also on its nightly 02:00 UTC schedule and manual dispatch. Critical
Chromium journeys run on pull requests and branch pushes; the full Playwright suite
runs nightly and on manual dispatch. CI starts a disposable local Supabase stack and
generates its own fixture key. The app workflow publishes a job summary
and downloadable Vitest artifacts; there is no coverage threshold. Repository
administrators still need to require the desired status checks in GitHub branch
protection settings.

For documentation-only or Codex configuration changes, validate relevant Markdown
links/content, TOML syntax/required fields, profile-to-skill references, changed-file
scope, and whitespace with `git diff --check`. Application tests are normally N/A
because those files do not change application behavior; state this explicitly.

## Conventional Commits

Use one focused commit per coherent, locally checked increment:

```text
type(scope): imperative summary
```

Examples:

- `feat(jobs): add category filtering`
- `fix(applications): reject duplicate submissions`
- `test(auth): cover applicant access denial`
- `refactor(data): centralize published job queries`
- `docs(workflow): clarify independent review evidence`

Choose a type that describes the change (`feat`, `fix`, `test`, `refactor`, `docs`,
`build`, or `chore`); use a concise scope where helpful and an imperative summary.
Commits do not grant approval. Keep unrelated work out of the staged change and link
issue numbers in the packet and PR.

### Pull request titles

As a repository policy, use the [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/) format for PR titles:

```text
type[optional scope][!]: description
```

Examples: `fix(auth): resolve Vercel redirects` and
`docs(workflow): require Conventional Commit PR titles`. The title summarizes the
whole PR; individual commit subjects still follow the focused commit guidance above.
Place `!` before the colon for a breaking change, as in `feat(auth)!: change callback behavior`.

## Pull request checklist

Before opening a PR:

- Check that the PR title follows `type[optional scope][!]: description`.
- Confirm every issue is linked and use `Closes #N` for each issue resolved by the PR.
- Link the approved packet, final record, complete archive path if applicable, and
  every dated session summary.
- Report exact checks and results, actual agent handoffs, reviewer independence,
  findings/rechecks, student approval and acceptance sources, and unresolved limits.
- Explain accepted canonical-spec sync or the justified no-product-delta case.
- Include documentation, security/privacy, deployment, and rollback implications.
- Review the final diff and run `git diff --check`.

Use [.github/pull_request_template.md](.github/pull_request_template.md). PR opening
ends contributor work for that change. Do not represent a created PR as merged,
deployed, or released.
