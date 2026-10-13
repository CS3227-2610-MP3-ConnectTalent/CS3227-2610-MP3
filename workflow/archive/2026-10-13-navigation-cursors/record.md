# #74: return navigation and clickable cursors

Owner: Paul. Date: 13 October 2026.
Issue: https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/74.
Baseline: local `develop` at `736ba48`; remote freshness not yet checked.
[Issue scope](issue-body.md).

## Accepted closeout — 13 October 2026

Paul separately replied **“Accept with recorded limits”** after the final local
checks and independent review. This accepts the bounded #74 repair for archive;
earlier pending statements below are historical. Existing ACC-005 presentation and
ACC-006 onboarding rules preserved; no product delta or canonical version change,
so spec sync N/A. Complete three-file packet archived to
`workflow/archive/2026-10-13-navigation-cursors/`.

Hosted/full accessibility verification remains pending and HR load-error placement
is source-reviewed only. No commit, push, PR, merge or deployment authorized by this
acceptance. Generated session summary verification remains pending.

Archive checks: all three packet SHA-256 hashes matched across the move; local
archive/log links and Git whitespace passed. Both workflow indices now reference
the accepted archive. No runtime checks repeated for evidence-only closeout.

## Subsequent submission authorization

Paul explicitly requested add/commit/push and PR creation on 13 October 2026.
This authorizes publication of the accepted UI repair from
`fix/74-navigation-cursors` into `develop`, superseding earlier publication-pending
wording. It does not authorize merge, deployment or résumé/AI repairs.
[Prepared PR body](pr-body.md). Original three-file archive is preserved; this body
is a later submission artifact. Actual Git/GitHub outputs establish publication.

## Proposal and design

Restore consistent presentation under ACC-005, preserving ACC-006 required profile
onboarding. No new product capability, schema or role permission; canonical delta
N/A for this bounded presentation repair.

Use a small shared Back to open roles link component targeting `/`, styled
consistently at the top of job detail, My profile and Manage jobs content. Remove
job detail's duplicate All roles link. Include the Manage jobs load-error state.
Keep contextual Manage jobs return links in HR create/edit pages, since they return
to the job list rather than the public roles list. My applications/status behavior
is unchanged. Incomplete Applicants cannot bypass onboarding through the return
link: existing server/proxy checks still redirect them to My profile.

Add a shared cursor rule for enabled native buttons, actionable anchors and
button-like controls, including file chooser buttons and applicable select,
checkbox/radio controls. Audit existing components for cursor overrides. Disabled
controls retain non-actionable styling; text entry fields retain text cursors.
Preserve keyboard focus, responsive layout and all server authorization.

## Plan and observable acceptance

1. Refresh remote develop read-only; with explicit branch permission create
   `fix/74-navigation-cursors` from updated develop, preserving unrelated untracked
   packet. No commit/push/PR authorization included.
2. Read relevant installed Next.js guides before code. Add focused failing checks
   for single return link/placement and hand cursor on representative enabled
   controls. Implement link component, page wiring and cursor styling, then recheck.
3. Verify real-browser computed cursors and keyboard/link behavior for job detail,
   profile, HR jobs and shared auth/application controls when local Supabase is
   available. Verify disabled/text controls and incomplete-profile route denial.
   If local ports block these checks, record the limit; do not claim browser passes.
4. Run scoped formatting/lint, typecheck and relevant tests. Obtain separate
   independent source/evidence review, fix findings and record actual rechecks.
5. Update guide wording if necessary and dated session summary; request distinct
   human acceptance before complete archive. Hosted tests/deployment excluded.

Approval: Paul replied **“Approve plan and branch”** on 13 October 2026 before
implementation. Fetch/fast-forward confirmed develop current at `736ba48`; branch
`fix/74-navigation-cursors` created. Installed Next.js CSS/link guides read.
Focused browser checks added before implementation; outcomes pending. AI
provider/configuration troubleshooting remains teammate work. Commit/push/PR not
authorized.

## Implementation and evidence

Shared link inserted as first main-content child on job detail, profile and HR job
list, including list-error state. Job detail duplicate removed. Global enabled
action/native-choice/file cursors and disabled states implemented; text input
cursors untouched. Existing server authorization/gating unchanged. User Guide and
focused browser checks updated.

Test-first: initial two browser tests failed on duplicate All roles (1 instead of
0) and Sign in cursor (default instead of pointer). After implementation four
workflow cases passed, including Applicant/HR return links/logout and signup
onboarding denial. Reviewer identified selector coverage gap; added isolated
choice/file/ARIA/data-disabled test and final three cursor/link cases passed.
Five distinct scenarios across runs. Scoped format, lint, typecheck and whitespace
passed; final lint/typecheck recheck pending when written.

[Separate independent review](independent-review.md): no unresolved blockers; actual
source review and reproduced static checks distinct from primary browser results.
[Session summary](../../../logs/2026-10-13-navigation-cursors.md). HR load error
source-only, hosted/full accessibility/build/broad suites not run. No student
acceptance or publication claimed. No product delta/canonical sync required.

Final recheck: scoped ESLint for the added browser case and `corepack pnpm typecheck`
both exited 0 after the final test change. All planned local checks completed with
the recorded coverage limits. Student acceptance pending.
