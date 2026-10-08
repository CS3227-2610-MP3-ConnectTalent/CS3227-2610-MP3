# Proposal: Add Supabase agent skills and shadcn registry integration

- Change ID: `2026-10-08-supabase-agent-skills-registry`
- Issue: [#23](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/23)
- Owner: Unassigned for triage; requester identity/student role not recorded
- Status: Retrospective traceability packet; implementation already present on branch
- Date: 2026-10-08
- Baseline: ProductSpec v0.7, 2026-10-07; no product behavior delta
- Affected capabilities: No canonical product capability changes; OPS-003 is operational context only
- Classification: Developer guidance and UI registry configuration; no runtime application behavior

## Intent, problem, and motivation

The branch's first commit added the Supabase Agent Skills and configured the Supabase shadcn registry. Review found that this already-authorized setup was not covered by either existing branch packet. Issue #23 and this packet were created after implementation to restore traceability; they do not imply the work began issue-first.

## Goals, non-goals, and scope boundaries

- Goals: Keep the two Supabase skills and lock entries in the repository; make the Supabase shadcn registry available through `components.json`; preserve the installed upstream skill content.
- Non-goals: Change application behavior, authentication, database schema/migrations/RLS, hosted project settings, environment variables, credentials, or deployment.
- Users/roles: Repository contributors and coding agents; no Applicant or HR interaction changes.
- Scope boundaries: `.agents/skills/supabase/`, `.agents/skills/supabase-postgres-best-practices/`, `skills-lock.json`, `components.json`, and the corresponding lockfile change in the original setup commit.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep both official Supabase skills vendored with a skills lock | Local discovery and version/hash traceability; imported guidance must be refreshed deliberately. | Implemented as previously requested. |
| Configure the Supabase shadcn registry | Allows `@supabase/...` registry names; does not install or execute components by itself. | Implemented as previously requested. |
| Omit repository-owned copies/configuration | Less repository content, but contributors lack the requested local guidance and registry alias. | Rejected by the original setup request. |

- Assumptions: The installed skill content is sourced from `supabase/agent-skills`; the shadcn registry endpoint is the one configured by Supabase.
- Dependencies: Supabase's upstream agent-skills repository and shadcn registry.
- Risks: Vendored guidance can become stale. Keep source/hash metadata and update it deliberately when upstream content changes.
- Open decisions: Issue owner/triage remains unassigned; a maintainer should assign one through normal issue triage.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| supabase-agent-skills-registry-01 | Issue #23; process criterion, no product ID | Given the repository is checked out, when a contributor inspects `.agents/skills/`, then both Supabase skills and their source metadata are present. | Tree/content and lockfile review; contributor. |
| supabase-agent-skills-registry-02 | Issue #23; process criterion, no product ID | Given `components.json` is read by shadcn, when a Supabase registry alias is requested, then `@supabase` resolves to the configured official registry URL. | JSON parse and exact mapping inspection; contributor. |
| supabase-agent-skills-registry-03 | Issue #23; no product delta | Given the setup is reviewed, then it introduces no app, schema, auth, secret, or deployment behavior. | Diff review; reviewer. |

- Spec deltas: None; developer tooling/configuration only.
- Design: `design.md`; narrow configuration and vendored guidance with no runtime/data flow.
- Plan and tasks: Retrospective inventory and verification in `plan.md` and `tasks.md`; implementation predates the issue packet.
- Evidence: `record.md`.

## Approval record

- [x] Original setup scope was directly requested by the user on 2026-10-07.
- [x] Issue #23 and this packet were added on 2026-10-08 after review found the traceability gap.
- Approver: Requesting user; identity and student role are not recorded in repository evidence.
- Decision/date/source: Original implementation request in the conversation, 2026-10-07; current user explicitly authorized branch archive and PR after review on 2026-10-08.
- Conditions: Preserve upstream skill files; record actual checks and the known upstream whitespace warning; do not claim student identity, product acceptance, or CI execution without evidence.
