# Proposal: Align Next.js generated types and Supabase helper structure

- Change ID: `2026-10-07-framework-supabase-structure`
- Issue: [#16](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/16)
- Owner: Unassigned for issue triage; requesting user's name and student role were not stated.
- Status: Approved scope; implementation in progress
- Date: 2026-10-07
- Baseline: [ProductSpec v0.7](../../ProductSpec.md), 7 October 2026; no product behavior delta.
- Affected capabilities: OPS-003 is operational context only; no canonical requirement change.
- Classification: Behavior-preserving integration structure, CI configuration, and documentation cleanup; low risk.

## Intent, problem, and motivation

The repository has duplicate, unused Supabase client helpers outside `src/lib/supabase/`, while the active `src/proxy.ts` contains Supabase session code inline. `CONTRIBUTING.md` also describes Applicant authentication and applications as future work. Separately, Next.js generates and manages `next-env.d.ts` and recommends that it not be tracked. Because CI runs TypeScript before the build, it must generate Next.js types before typechecking if the file is untracked.

## Goals, non-goals, and scope boundaries

- Goals: Keep only Supabase helpers with actual consumers; group the active server and proxy helpers under `src/lib/supabase/`; retain the framework entry point at `src/proxy.ts`; ignore and untrack generated `next-env.d.ts`; run `next typegen` before CI typechecking; correct contributor status text.
- Non-goals: Change authentication or authorization semantics, route matching, database queries, migrations, seed data, RLS policies, product behavior, dependencies, deployment settings, or `.env.local`.
- Users/roles: Contributors maintain the project; Applicant and HR behavior is unchanged.
- Scope boundaries: `.gitignore`, `.github/workflows/ci.yml`, `CONTRIBUTING.md`, `next-env.d.ts` Git tracking, and the listed Supabase helper files only. Preserve the user's local generated `next-env.d.ts` contents on disk.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep generated helper files at `src/lib/` | No import changes, but duplicate and unused setup code remains. | Rejected; only active runtime helpers belong under the Supabase integration boundary. |
| Leave `src/proxy.ts` with all Supabase code inline | Simple for one file, but mixes the framework convention entry point with provider-specific cookie/session logic. | Rejected; delegate session work to `src/lib/supabase/proxy.ts` and retain the required entry point. |
| Keep tracking `next-env.d.ts` | Makes a generated file available in a fresh checkout, but contradicts current Next.js guidance and captures dev/build-specific generated paths. | Rejected; ignore/untrack it and explicitly type-generate before CI typechecking. |

- Assumptions: Existing `src/lib/client.ts`, `src/lib/server.ts`, and `src/lib/middleware.ts` have no application or test consumers; verified by repository-wide import search.
- Dependencies: Issue #16; Next.js 16 `next typegen` command; current Supabase SSR client helpers.
- Risks: Missing type generation could make CI typechecking fail. Mitigation: place the generation step before `pnpm typecheck` and verify the workflow/source configuration.
- Open decisions: Student owner assignment remains pending in issue triage.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| framework-supabase-structure-AC-01 | Issue #16; no product delta | Given the application uses Supabase from server code and Next Proxy, when the structure is updated, then active helpers live under `src/lib/supabase/`, `src/proxy.ts` remains the framework entry point, and unused duplicate helpers are removed. | Import search, typecheck, and diff review; implementer. |
| framework-supabase-structure-AC-02 | Issue #16; no product delta | Given a clean CI checkout, when TypeScript checks run, then Next types are generated before `pnpm typecheck`, and `next-env.d.ts` is ignored and untracked. | Workflow inspection, CLI type generation/typecheck, Git index inspection; implementer. |
| framework-supabase-structure-AC-03 | Issue #16; process criterion | Given a contributor reads the project boundaries, then `CONTRIBUTING.md` distinguishes implemented Applicant flows from planned HR and AI work. | Content review; implementer. |

- Spec deltas: None; no product behavior changes.
- Design: `design.md`.
- Plan and tasks: `plan.md`, `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope and acceptance criteria reviewed against the user's request and issue #16.
- [x] Proposal, no-product-delta rationale, design, and plan approved by the requesting user in this conversation.
- Approver: Requesting user; name and student role were not stated.
- Decision/date/source: Approved by direct requests to proceed with the reviewed cleanup and follow Next.js generated-file guidance, 2026-10-07.
- Conditions: Preserve current runtime authentication semantics and local generated file contents; do not claim independent review or student acceptance.
