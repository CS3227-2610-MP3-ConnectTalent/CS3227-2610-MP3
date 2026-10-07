# Feature record: Framework and Supabase integration structure cleanup

Status: Implementation recorded; static application checks and independent review pending

Owner: Unassigned for issue triage; requesting user identity and student role not stated

Spec version: [ProductSpec v0.7](../../ProductSpec.md)
Date: 2026-10-07

## Metadata and artifact links

- Change ID/classification: `2026-10-07-framework-supabase-structure`; behavior-preserving refactor / CI config / contributor docs.
- GitHub issue: [#16](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/16); issue owner assignment pending.
- Branch/commits/PR: current branch `chore/setup-deployment`; no PR created for this task.
- Proposal: [proposal.md](proposal.md)
- Design: [design.md](design.md)
- Deltas: None; no product behavior change.
- Implementation plan/tasks: [plan.md](plan.md), [tasks.md](tasks.md)
- Baseline: ProductSpec v0.7, 2026-10-07; OPS-003 is contextual only.
- Archive path: Pending review and closeout.

## Approval checklist

- [x] Issue #16 created through GitHub CLI after the user explicitly requested retry; user-approved scope recorded below.
- [x] Human scope/design/plan approval source recorded; requester name and student role not stated.
- [x] Approved-scope edits recorded; structural/static repository checks performed where available.
- [ ] Application lint and typecheck pending because Node.js and pnpm are unavailable in this shell; no tests were run.
- [ ] Independent review and human acceptance pending.
- [ ] Session summary and pre-PR closeout pending.
- [ ] Canonical sync is N/A because there is no product behavior change; archive and PR remain pending.

## Requirement and acceptance criteria

| Exact acceptance ID | Issue criterion / canonical requirement ID and link | Observable success / denial / failure | Evidence, result and limitation |
| --- | --- | --- | --- |
| framework-supabase-structure-AC-01 | Issue #16; no product delta | Active Supabase server and proxy helpers are grouped under `src/lib/supabase/`, `src/proxy.ts` remains the Next entry point, and unused duplicates are removed without changing cookie/session behavior. | Structural review/import search confirms the active server/proxy helpers are grouped under `src/lib/supabase/`, `src/proxy.ts` delegates to the proxy helper, and no consumers reference the removed helpers. Typecheck/lint could not run, so compilation remains unverified. |
| framework-supabase-structure-AC-02 | Issue #16; no product delta | CI generates Next types before typechecking; `next-env.d.ts` remains generated locally, is ignored, and is no longer tracked. | Workflow order reviewed; local generated file exists, is ignored, and is absent from the Git index. The CI workflow and local type generation were not executed. |
| framework-supabase-structure-AC-03 | Issue #16; process criterion | Contributor status accurately separates implemented Applicant flows from planned HR/AI work. | `CONTRIBUTING.md` updated and compared with README/source status. |

## Agent handoffs

No subagents were assigned. Implementer self-review is not independent review.

## Implementation and tests

Changed files: `.github/workflows/ci.yml`, `.gitignore`, `CONTRIBUTING.md`, `src/proxy.ts`, and `src/lib/supabase/proxy.ts`; removed unused `src/lib/client.ts`, `src/lib/server.ts`, and `src/lib/middleware.ts`; untracked `next-env.d.ts` while preserving its local contents. Added this issue packet.

Commands and results:

- `gh auth status`, duplicate issue search, and issue creation: authenticated, no duplicate found, issue #16 created. User explicitly requested GitHub CLI retry; no token value was read or recorded.
- `rg` import/reference search for removed helper paths and `updateSupabaseSession`: no consumers of the removed helpers; the new helper is called from `src/proxy.ts`.
- `Test-Path next-env.d.ts`: `True`; the local generated file remains present with its existing `.next/dev/types` imports.
- `git check-ignore -v next-env.d.ts`: ignored by `.gitignore` at the Next.js generated-file entry.
- `git ls-files next-env.d.ts`: no output; file is no longer tracked. `git rm --cached -f -- next-env.d.ts` removed only the index entry and preserved the working file.
- Workflow review: `pnpm exec next typegen` appears before `pnpm typecheck` in `.github/workflows/ci.yml`.
- `corepack pnpm exec next typegen`: could not start because `corepack` is unavailable in this shell. Direct `next.cmd typegen` could not start because `node` is unavailable on PATH. `pnpm typecheck` could not start because `pnpm` is unavailable. Lint was not run for the same toolchain limitation. No tests were run.
- `git diff --check` and `git diff --cached --check`: passed; Git reported only LF-to-CRLF working-copy warnings.

Security/adversarial cases and results: No data or authorization behavior is intended to change. Review pending.

Known limitations: GitHub issue #16 has no assigned student owner. The requesting user approved the scope directly; their name and student role were not stated. Node.js/pnpm unavailability prevented type generation, typecheck, and lint. Independent review and student acceptance have not occurred.

| Date / environment / commit | Exact command or manual check | Exit/result and counts | Output/evidence link | What this proves / does not prove |
| --- | --- | --- | --- | --- |
| 2026-10-07 / local Windows checkout / `chore/setup-deployment` | GitHub CLI auth status, duplicate issue search, issue creation | Authenticated; no duplicate found; issue #16 created | Issue #16 | Confirms issue creation; does not establish triage, implementation, acceptance, or release. |
| 2026-10-07 / local Windows checkout / `chore/setup-deployment` | Git status, import search, ignore/index checks, workflow review, diff checks | Structural checks and whitespace checks passed; app commands unavailable as detailed above | Working tree and command outputs in this record | Confirms repository structure and tracked-file handling only; does not prove compilation, runtime behavior, or CI success. |

## Review and decision

- Reviewer identity and independence: Pending separate reviewer execution.
- Findings/resolutions: Implemented the approved structure/doc/config changes; static app validation is pending due missing Node.js/pnpm. Independent review remains pending.
- Human decisions: Requesting user approved the scope and Next.js generated-file handling directly in this conversation, 2026-10-07; name and student role not stated. Student acceptance remains pending.
- Documentation/reflection updates: `CONTRIBUTING.md` status correction completed; dated session summary remains pending closeout.

## Session evidence index

| Date / session | Summary log link | Work / prompts / decisions covered | Verification status / missing coverage |
| --- | --- | --- | --- |
| 2026-10-07 / current task | Pending `logs/` summary before PR | Structure review follow-up, Next-generated file guidance, GitHub CLI issue creation, and implementation. | Implementation checks and closeout remain pending. |

## Canonical sync and archive

- Accepted delta/human decision: No product delta; no canonical sync required.
- Canonical sync commit/files/version/date: N/A.
- Sync verification: N/A; no product spec delta.
- Archive decision/date/path: Pending review and closeout.
- Navigation repairs after moving: Pending archive decision.
- Outstanding work/limitations: Run typegen, lint, and typecheck in a Node.js/pnpm-enabled environment; complete independent review and student acceptance; complete summary and closeout before PR.
