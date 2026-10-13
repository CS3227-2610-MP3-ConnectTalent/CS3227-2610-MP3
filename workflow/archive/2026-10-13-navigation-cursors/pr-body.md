## Issues and evidence

Closes #74

- [Complete change packet / feature record](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/blob/fix/74-navigation-cursors/workflow/archive/2026-10-13-navigation-cursors/record.md)
- [Dated session summary](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/blob/fix/74-navigation-cursors/logs/2026-10-13-navigation-cursors.md)
- [Independent review](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/blob/fix/74-navigation-cursors/workflow/archive/2026-10-13-navigation-cursors/independent-review.md)

## Summary and scope

- Share one top **Back to open roles** link on job details, My profile and Manage jobs, including the HR job-list error state.
- Remove duplicate **All roles** from job details.
- Use hand cursors for enabled actions and choice/file controls, preserving disabled and text-entry states.
- Preserve ACC-005 role navigation and ACC-006 required-profile gating. No auth, schema, AI/provider or hosted-setting changes. Résumé deployment troubleshooting excluded.

## Tasks, agents and checks

Proposal/design/ordered tasks are in the record above. Actual separate read-only reviewer: `/root/navigation_cursors_review`; model unavailable. Primary implemented and ran browser checks; reviewer independently reproduced static checks.

| Check / acceptance ID | Command or evidence | Result and limits |
| --- | --- | --- |
| Test-first duplicates/cursors | `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/navigation-cursors.spec.ts` | Initial two intended failures: All roles count 1, Sign in cursor default. After repair/coverage addition, final 3 cases passed. |
| Role links/logout and onboarding | Same launcher with navigation-cursors, account-navigation and required-profile specs; `PLAYWRIGHT_SERVER_COMMAND=corepack pnpm dev` | Passed 4 cases before added cursor case. Five distinct browser scenarios across these runs; synthetic local Supabase/Mailpit. |
| Typecheck | `corepack pnpm typecheck` | Passed, including final test revision. |
| Scoped ESLint | `corepack pnpm exec eslint` on changed TSX/test files | Passed; new test rechecked afterward. |
| Formatting | Scoped `corepack pnpm exec prettier --check` | Passed; reviewer independently reproduced. |
| Whitespace | `git diff --check` | Passed; reviewer independently reproduced. |
| Hosted / full accessibility / build / broad app and DB suites | Not run | Bounded presentation change verified with focused checks; no hosted result claimed. HR error-state link source-reviewed only. |

## Review, security/privacy and decisions

Independent review found no blocking defects. Reviewer noted selector-family runtime coverage was missing; a passing isolated native/control test was added and its source rechecked. It verifies global styles without submitting data, not every rendered widget.

Paul approved the concrete plan and branch with **“Approve plan and branch”**, then separately accepted with **“Accept with recorded limits”** on 13 October 2026. Later explicit request authorizes commit/push/PR. Review and acceptance do not authorize merge/deployment.

Existing server/proxy checks and HR authorization remain intact. Incomplete Applicants following the return link still land on My profile. No credential/private-data logging changes; only synthetic local fixtures used.

## Specs, docs, risks and rollback

No canonical product delta/version bump: existing ACC-005/006 preserved. Complete packet archived after acceptance; User Guide, workflow indices and session summary updated. Personal reflections unchanged.

Deployment not performed. Hosted and full accessibility checks remain pending. Global CSS affects enabled controls across the app; isolated selector tests and role journeys bound the verification. Rollback: revert this UI commit; no database rollback required. Do not change onboarding enforcement as part of rollback.

## Reviewer checklist

- [ ] Issues, requirement IDs, final packet/record and all pre-PR summaries are linked.
- [ ] Scope/design/plan approval and human acceptance are distinct recorded gates.
- [ ] Task/agent claims match actual evidence; independence and findings are explicit.
- [ ] Relevant checks/security/privacy cases have results and truthful limits.
- [ ] Accepted specs are synced before archive; docs/links reflect final paths.
- [ ] Risks, unresolved findings, rollback and deployment state are clear.

PR creation does not establish merge, deployment or release. Repository review, staging validation and release require their own evidence and human decisions under `workflow/AgentProcess.md`.
