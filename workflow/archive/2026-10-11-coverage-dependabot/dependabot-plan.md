# Dependabot version updates Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Configure weekly Dependabot version updates for the repository's pnpm dependencies and GitHub Actions without auto-merging updates.

**Architecture:** Add one root `.github/dependabot.yml` with separate npm and GitHub Actions ecosystems. Group minor and patch version updates per ecosystem, leave major updates as individual PRs, and cap each ecosystem at five open version-update PRs.

**Tech Stack:** GitHub Dependabot configuration, pnpm lockfile via Dependabot's npm ecosystem, GitHub Actions, Prettier.

**Spec:** [Design](design.md) and [proposal](proposal.md), issue #59; no product-spec delta.

## Global Constraints

- Use Dependabot ecosystem `npm` for the root `pnpm-lock.yaml`; use `github-actions` for workflow references.
- Both ecosystems use `directory: "/"` and `schedule.interval: "weekly"`.
- Group only `minor` and `patch` version updates using a wildcard group; major updates stay individual.
- Set `open-pull-requests-limit: 5` per ecosystem.
- Do not configure ignores, automatic merging, version pinning changes, or repository-level security settings.
- Do not claim Dependabot security alerts or security-update PRs are enabled unless separately verified by an authorized maintainer.

## Review Focus

- The pnpm lockfile is managed through ecosystem `npm`, and no unrelated package ecosystem is introduced.
- The group rules explicitly apply to version updates and contain only minor/patch levels; major updates remain individually reviewable.
- The five-open-PR limit is per ecosystem and applies to version updates; GitHub documents security update PR limits separately.
- The config must not set ignored packages, auto-merge, or claim external repo security settings.
- Weekly config parsing and GitHub's post-PR configuration check must pass; opening the PR does not prove the first scheduled Dependabot run occurred.

---

### Task 59-01: Add bounded weekly Dependabot version updates

**Files:**

- Create: `.github/dependabot.yml`
- Validate: `package.json`, `pnpm-lock.yaml`, `.github/workflows/*.yml`

**Interfaces:**

- Ecosystem entries: `npm` and `github-actions`.
- Group names: `npm-minor-and-patch` and `github-actions-minor-and-patch`.
- Each group has `applies-to: version-updates`, `patterns: ["*"]`, and `update-types: ["minor", "patch"]`.
- Each ecosystem has weekly schedule, root directory, and five open version-update PR limit.

- [x] **Step 1: Create the config with exactly the two project ecosystems** — added the npm and GitHub Actions entries without changing package manifests, the lockfile, or update policy beyond the approved scope.

Do not alter package manifests or lockfiles in this task; Dependabot will propose updates separately.

- [x] **Step 2: Validate YAML syntax/format and inspect semantic fields** — changed-file Prettier validation passes; entries use weekly schedules, root directories, minor/patch groups, and a five-PR cap. GitHub's hosted config check remains pending a PR.

Run: `pnpm exec prettier --check .github/dependabot.yml`

Expected: the file parses and matches repository formatting. Review the entries against the GitHub Dependabot configuration docs; on the future PR, record any GitHub-generated Dependabot config-check result. Do not claim the first scheduled PR exists before it is observed.

### Task 59-02: Document update behavior and external settings limits

**Files:**

- Modify: `CONTRIBUTING.md`
- Modify: `README.md` only if it currently describes dependency automation or security-update settings.
- Modify: packet `proposal.md`, `design.md`, `record.md`, and `tasks.md` with observed evidence.

- [x] Document weekly pnpm/GitHub Actions version updates, grouped minor/patch and separate major proposals. State that Dependabot PRs require review and are not auto-merged. Repository security-update settings remain unverified.
- [x] Check changed-file Prettier formatting, Markdown relative links, and whitespace. The initial full repository check found 187 pre-existing files; those were formatted during closeout and the follow-up full check passes.

### Task 59-03: Review and validate the dependency configuration

**Files:** no new files; review `.github/dependabot.yml` and documentation.

- [x] Run Prettier on `.github/dependabot.yml` and the full `pnpm format:check`; the initial repository-wide check found 187 unformatted files, which were formatted, and the follow-up check passes.
- [x] Verify the root pnpm lockfile is covered by the npm ecosystem and the workflow action references are covered by the GitHub Actions ecosystem.
- [ ] Record whether GitHub's PR config check accepted the file. Separately record security-alert/security-update settings as verified or pending; do not change those settings here.
- [ ] After merge, leave observation of the first scheduled update to a post-merge owner; this contributor plan ends at PR submission.

## Integration and handoffs

This plan is independent from the coverage/report deliverable in [plan.md](plan.md); both use one shared packet and may share the final PR. The configuration task can be implemented without changing application code. The primary agent implemented inline after approval; separate security and test reviewers completed read-only reviews recorded in the packet handoffs. Issue owner remains pending triage.

## Approval and completion evidence

- [x] User approved this Dependabot plan for inline implementation in chat on 2026-10-11.
- [x] Shared `tasks.md` matches this plan and records actual evidence.
- [x] Independent review and human acceptance are recorded as separate gates; the user accepted implementation on 2026-10-11.
- [x] No product-spec sync was expected; the accepted packet was archived after documenting N/A.
- Approval/date/source: approved in chat by user on 2026-10-11; inline implementation authorized.
- Changes to this plan: if the user selects repository security-update or ruleset changes, return the affected design/plan for renewed approval.
