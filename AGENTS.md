# Repository guidance

Read [CONTRIBUTING.md](CONTRIBUTING.md) for engineering practices and the
[workflow index](workflow/README.md) and [agent process](workflow/AgentProcess.md)
for issue-first Spec-Driven Development (SDD), approvals, evidence, and PR-last
closeout. Product requirements live in `workflow/specs/`; do not replace them with
assumptions in code or prompts.

## Product and architecture

- Keep Applicant and HR interfaces clear and distinct. Present each role only the
  navigation, data, and actions it needs; enforce access on the server and in
  Supabase RLS, never only by hiding UI controls.
- Give pages, components, data-access modules, validation, and services one clear
  responsibility. Keep storage/query behavior in focused server-side modules under
  `src/lib/`; avoid duplicated authorization or persistence logic.
- Reuse components and abstractions when the behavior and ownership are genuinely
  shared. Prefer simple explicit code over role-switching mega-components, duplicated
  policy, or abstractions that hide distinct Applicant/HR rules.
- Validate untrusted inputs and AI output at boundaries. Keep credentials and
  privileged keys server-side; use synthetic applicant data in development/tests.

## Change and evidence discipline

- Start with the appropriate GitHub issue, then create the linked packet in
  `workflow/changes/`. Record the human-approved proposal, design/omission, and plan
  before implementation. Follow the packet tasks and keep scope bounded.
- For behavior changes, use test-first development: observe a focused test fail for
  the intended behavior, implement, then verify and refactor. For docs/config-only
  work, run relevant static checks and state application tests as N/A.
- Use `.agents/skills/` for detailed workflow and specialist instructions and
  `.codex/agents/` for named Codex subagent profiles. A skill/profile is guidance;
  it does not prove an agent ran or grant student approval.
- Keep commits focused and use Conventional Commits, such as
  `feat(jobs): add category filtering` or `docs(workflow): clarify review gates`.
- Before PR creation, complete independent review, record the separate student
  acceptance decision, sync/archive as applicable, and add a dated summary under
  `logs/`. Open an issue-linked PR using `.github/pull_request_template.md` only after
  those gates are evidenced. Do not claim tests, agent runs, approvals, or deployment
  results that did not occur.

See [CONTRIBUTING.md](CONTRIBUTING.md) for setup, commands, detailed coding guidance,
and the full contribution sequence.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
