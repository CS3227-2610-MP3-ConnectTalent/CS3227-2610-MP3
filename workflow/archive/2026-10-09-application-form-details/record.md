# Feature record: #39 application details

- Issue: [#39](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/39); owner Paul Cheng; 2026-10-09.
- Status: accepted locally with recorded limits on 2026-10-09; canonical v1.2 sync complete before archive. Hosted cutover/testing and source-control submission remain pending.
- Baseline: develop `089e8bb`, ProductSpec v1.1.
- Branch: `feat/application-form-details`, explicitly requested and created before issue intake; document this checkout-order exception, do not claim issue-first branch creation. No commit/push/PR for #39.
- Artifacts: [proposal](proposal.md), [application delta](specs/applications-and-review.md), [privacy delta](specs/security-and-privacy.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- IDs: proposed APP-005, modified SEC-005/007; existing APP-001–004/ACC-001/SEC-001/002/004 retained.

## Actual decisions and observations

Paul selected full name, verified email, optional phone and portfolio URL in a prior reply. He requested an independent branch without waiting for PR #38, then “okay do it” for the issue/proposal. These authorise preparation; they do not approve this concrete packet's validation limits, migration cutover or design. At intake, full-packet approval remained pending; actual later approval is recorded below.

Source inspection: ApplicationForm stores only coverLetter; save/submit actions call existing RPC signatures and error redirects lose new unsaved field state. Retry matching currently compares only letter for saves. HR query explicitly reads submitted records. AI query explicitly selects id/job/letter and preserves the appropriate boundary. Accepted canonical APP-004 freezes submitted text immediately; this packet retains that rule.

One primary Codex execution applied intake/proposal/planning skills and Supabase guidance. At intake, no subagent/reviewer ran and no code, SQL, canonical or env changes had been made; later implementation and reviewer dispatch are recorded below. Some initial read commands failed on Windows wildcard paths; bounded rg/LiteralPath reads supplied the required source context. Issue #39 created via gh from a temporary body file. No credentials/private Applicant values copied.

## Checks, decisions and remaining gates

Packet link and whitespace checks: recorded after drafting below. At drafting, product checks were Not run. Implementation approval and subsequent local checks are recorded below; separate acceptance, canonical sync/archive, source-control submission and hosted operations remain pending. PR #38's acceptance/review do not cover this feature.

Session: [intake/planning summary](../../../logs/2026-10-09-application-form-intake.md); generated-summary student verification pending.

Draft static checks: all 25 local Markdown targets resolved across seven packet artifacts and this session summary. `git diff --check` passed. These checks establish document consistency only, not implementation or runtime behavior.

Human approval: Paul Cheng approved the complete named #39 proposal, both deltas, design and plan via “Approve as written” on 2026-10-09, before implementation. The concrete bounds and migration cutover were included in the approval question. T00 complete; T01 begins. No authorisation to commit/push/PR or hosted migration.

## Implementation and observed verification

T01: focused contact validation failed 12/13 assertions against the initial unvalidated stub; the two legacy-API permission assertions failed 2/2 (pgTAP reported failure although psql itself exited 0). After implementation, contact validation passed 13/13. The versioned RPC, trusted email, private draft/contact fields, freeze trigger, server state, complete-field retry, form/HR rendering and privacy tests were added. Historical migration files are unchanged; existing regression callers now use complete-field RPCs without weakening their prior denial assertions.

Initial CLI migration attempt failed because this checkout's `.env.local` could not be parsed by Supabase CLI. Using a temporary copy of config/migrations avoids that parser without changing `.env.local`. Local history showed three merged AI migrations still pending; `migration up --local --include-all` applied those baseline migrations and #39 locally, with no reset or hosted call. First DB regression exposed a schema-permission collision and a test referring to nonexistent jobs.closed_at. New functions were moved into separate application_private schema and prior HR private-schema usage restored; test fixture closure was corrected. The final migration directly creates the isolated schema and does not revoke existing HR schema access. Local development-time function definitions were updated to match the final file without deleting records.

Observed checks so far: full units 98/98 and typecheck passed; scoped lint passed; DB suite 198/198 passed; original three submission/closure race cases passed. New concurrent complete-field draft case is being verified. First contact browser failed only because its alert selector also matched Next's route announcer; corrected to p[role=alert]. Expanded browser run passed 9/11, with contact-flow timeout and HR job-closure display timeout still under diagnosis; do not label this run passed. Contact/browser and URL regressions are being rechecked. Build and final checks pending.

Actual separate read-only reviewer `/root/application_details_independent_review` inspected source/SQL/tests and independently passed 30 focused units after sandbox EPERM escalation. It found a low SQL/server portfolio-validator disagreement with concrete malformed authorities; no blocking access/privacy defect. Implementer aligned validators and added SQL/unit regressions; independent fix recheck remains pending. Status-wording updates distinguish intake observations from actual approval/implementation. No live model call, hosted migration, commit/push/PR or student acceptance.

Unrelated concurrent changes to docs/Reflections.md and new student-specific reflection files were observed and left untouched. Do not attribute them to this implementation or include them in a #39 submission without review.

## Final revision evidence (2026-10-09)

| Check / acceptance | Exact command or evidence | Result and limits |
| --- | --- | --- |
| Contact validation / AC-01–03 | `corepack pnpm exec vitest run tests/unit/application-details.test.ts` | Initial 12/13 behavior failures; first green 13/13; expanded authority/Unicode cases included in final full suite. |
| Full units / AC-01–03/06–08 | `corepack pnpm test:unit` | Passed 106 tests / 19 files. Covers field boundaries, all-input retention, forged email exclusion, complete-field retry, legacy safe display and explicit AI projection. |
| Database / AC-01–02/04–08 | `corepack pnpm exec supabase --workdir <temporary-local-config> test db` | Passed 206 checks / 7 SQL files. Temporary config uses same local project_id and avoids root env parser; no hosted endpoint. |
| Local function lint | `corepack pnpm exec supabase --workdir <temporary-local-config> db lint --local --schema public,application_private --level warning` | Passed, no schema errors found. Hosted security advisors Not run; no hosted changes authorised. |
| Final migration replay | Local psql transaction removed contact schema/columns, replayed the final migration and checked new grants/URL rejection/unchanged HR schema usage, then rolled back | Passed. Transaction-only replay from the pre-contact shape; all existing local records restored, no reset. This is not hosted migration evidence. |
| Concurrency / AC-05–06 | `corepack pnpm test:race` | Passed four lock-observed races: duplicate submit, close-first, submit-first and competing complete-field draft revisions. Fixtures cleaned up. |
| Browser / AC-01–05/07–08 | `node --env-file=.env.local node_modules/@playwright/test/cli.js test tests/e2e/application-details.spec.ts tests/e2e/applicant-applications.spec.ts tests/e2e/hr-application-review.spec.ts tests/e2e/hr-job-management.spec.ts tests/e2e/password-recovery.spec.ts tests/e2e/job-listings.spec.ts` | Final run passed 11/11 in 2.1 minutes. Local synthetic data, Mailpit, mocked AI; no live provider call. Legacy missing-contact display is unit/DB-covered rather than a dedicated browser fixture. |
| Typecheck / build | `corepack pnpm typecheck`; `corepack pnpm build` | Passed; compile, TypeScript and route generation completed. No tracked generated next-env.d.ts diff. |
| Scoped ESLint | Explicit changed src/lib, application actions/pages/components and changed unit/E2E/race test paths via `corepack pnpm exec eslint` | Passed on final source/test revision. Repository-wide lint Not run: known nested worktree/generated-output issue is outside #39. |
| Independent verification | [Separate review handoff](handoffs/independent-review.md) | Final independent focused suite passed 37/37 / 5 files; whitespace/read-only SQL checks passed. Low URL finding and trailing-dot follow-up resolved; no blocking finding. Full suites/browser/build are implementer evidence. |
| Hosted migration / preview / release | Not run | Coordinated write-API cutover remains necessary; old app writes fail after legacy grants revoked. Separate operational authorisation needed. |

Browser debugging history is retained: initial selector ambiguity corrected; expanded run was 9/11; HR closure timeout passed unchanged on scoped and final reruns. Contact no-JavaScript POST failed while using a bound action; adding permalink alone did not fix it. Switching to an unbound action with validated hidden jobId and the stable permalink made the focused flow and final regressions pass, with input retention. prevState grants no authority. The final action still independently verifies identity, role and owner through server/RPC boundaries.

Final guides describe new fields and migration cutover. New contact values stay out of AI projection and metadata audits; user-typed notes/letters are not claimed to be automatically redacted. Submitted email is frozen, not taken from mutable account data on reads. Existing original letter, notes/status and submission audits remain intact. No unresolved blocking findings; human acceptance pending, so no canonical sync/archive/commit/push/PR. `.env.local` and unrelated student reflection edits remain untouched.

Session summaries: [intake](../../../logs/2026-10-09-application-form-intake.md), [implementation/review](../../../logs/2026-10-09-application-form-implementation.md). Generated-summary verification remains pending with Paul.

Final static closeout-before-acceptance check: 124 local Markdown targets resolved across 13 packet/guide/log/index files; `git diff --check` passed. Review and all local checks complete; separate acceptance is the next gate.

## Separate acceptance and closeout (2026-10-09)

Paul Cheng replied “Accept with recorded limits” to the explicit #39 acceptance question naming the implemented behavior, final local check counts, independent review and pending hosted migration/preview checks. This is separate from his pre-implementation “Approve as written”. It authorises canonical sync/archive only; no commit, push, PR or hosted operation was authorised.

Accepted APP-005 and SEC-005/007 were synced to workflow/specs/applications-and-review.md and workflow/specs/security-and-privacy.md, with workflow/ProductSpec.md and workflow/specs/README.md advanced from this branch's v1.1 baseline to v1.2, dated 9 October 2026. APP-001–004 and all previous SEC-007 obligations remain intact. APP-005 was unused in this checkout. PR #38 is an independent navigation branch; combined version traces require reconciliation during integration. Sync commit: pending explicit commit authorisation.

The complete eight-file packet is archived at workflow/archive/2026-10-09-application-form-details/ after accepted-delta comparison. Current guide/index links use the archive; historical dated logs retain their original path descriptions. Docs/Reflections.md, docs/JohnReflections.md and docs/PaulReflections.md remain student-owned and untouched. Hosted cutover, preview checks and release remain pending; existing clients lose write permission when the new migration is applied, requiring coordinated rollout.

Closeout session: [acceptance/sync/archive summary](../../../logs/2026-10-09-application-form-closeout.md). Generated-summary student verification remains pending. Static closeout checks are recorded below after execution.

Post-archive checks: 300 local Markdown targets resolved across 19 files; APP-005 canonical clause/scenarios match the accepted delta exactly; SEC-005/007 preserve previous obligations with the approved additions; complete eight-file inventory preserved; `git diff --check` passed. Historical log narrative remains unchanged; only their navigation targets were repaired.

Source-control follow-up: on 2026-10-09 Paul explicitly requested “git commit and psuh”, authorising staging the intended #39 files, a focused commit and push to origin/feat/application-form-details. PR creation, merge and hosted operations remain unauthorised. The separate student reflection changes are excluded. This commit contains the implementation and accepted canonical sync; its ID can be read from branch history after creation.

## Authorised combined submission follow-up

On 2026-10-09 Paul requested commit and PR submission, then explicitly chose “Use one combined PR instead”. Submit #39 and #40 together from feat/application-form-details into develop. GitHub confirms PR #38 merged as00b4d4c; sync that baseline before opening, retain both accepted requirement sets asv1.3 and keep student reflection edits out of commits. This authorises commit/push/combined PR, not merge or hosted rollout.

Final submission preparation: accepted integration commit d61b814; fetched origin/develop00b4d4c (mergedPR38). Six expected overlapping navigation/spec/index conflicts resolved with previously reviewed combined versions; post-resolution typecheck and18focused units passed. Automatic merge retained upstream guide edits. Student reflection changes were backed up/stashed separately and excluded from integration edits. [Combined PR preparation summary](../../../logs/2026-10-09-application-details-combined-pr.md) records this session; verification pending. No hosted operations.

Actual separate final merge recheck by /root/signup_navigation_review: no blocking findings, no unresolved conflicts, staged whitespace check passed; navigation source matches merged develop and canonicalv1.3 retains all accepted IDs. Reviewer did not rerun post-merge units/typecheck; those are implementer evidence.
