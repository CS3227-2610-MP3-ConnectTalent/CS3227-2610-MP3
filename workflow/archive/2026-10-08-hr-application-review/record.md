# Feature record: HR application review

Status: **locally accepted by Paul Cheng on 2026-10-08 with recorded SEC-007 and hosted-preview limits; canonical v0.8 sync and complete-packet archive done**.

Owner: Paul Cheng for the full application workflow, per this conversation. The teammate owns AI features; issue #9 has no GitHub assignee.

Spec baseline: ProductSpec v0.7 at `develop` commit `551da67` on 2026-10-08. Accepted canonical [ProductSpec v0.8](../../ProductSpec.md) synced on 2026-10-08; no commit yet.

## Metadata and artifacts

- Change ID/classification: `2026-10-08-hr-application-review`; behavior change and implementation of existing HR requirement; authorization/schema risk.
- Issue: [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9), read with `gh issue view 9` on 2026-10-08; dependency Applicant [PR #15](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/15), present in `develop` as `2fad6ed`.
- Branch: `feat/9-hr-application-review`, created from up-to-date `develop`/`origin/develop` at `551da67` after `git fetch origin develop` on 2026-10-08. No new commit, push or PR for #9.
- Artifacts: [proposal](proposal.md), [ACC delta](specs/accounts-and-roles.md), [APP delta](specs/applications-and-review.md), [SEC delta](specs/security-and-privacy.md), [OPS delta](specs/deployment-and-operations.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [implementer handoff](handoffs/T01-T06-implementer.md), [independent review](handoffs/independent-review.md). Archive: `workflow/archive/2026-10-08-hr-application-review/`, moved intact after canonical sync on 2026-10-08.
- IDs: ACC-002, APP-002/003/004, JMG-003, SEC-001/002/007/008, OPS-001/003; `hr9-AC-01`–`07`.

## Decisions and gates

- [x] Issue #9 was read and triaged; branch and packet are linked to it.
- [x] User selected four statuses (`Submitted`, `In review`, `Shortlisted`, `Rejected`), add-only authored/timestamped notes and manual HR assignment after verified signup on 2026-10-08. User supplied Vercel production/preview to separate Supabase project mapping and warned that PR previews share the Development Supabase schema.
- [x] Paul Cheng approved the **complete** proposal, four deltas, design and plan, including the transition rule and migration/preview gate, in an explicit 2026-10-08 conversation reply: “Approve as written (Recommended)”. This is implementation approval only.
- [x] Local implementation and test-first evidence exists. Database red/green and HR sign-in behavioral red/green are recorded in the [implementation summary](../../../logs/2026-10-08-hr-review-implementation.md); HR input test's missing-module failure is not counted as behavioral red.
- [x] Separate read-only implementation review exists: [independent review](handoffs/independent-review.md). Its F1 evidence gap was resolved and rechecked; F2/F3 limits remain and were explicitly included in the student's later local acceptance.
- [x] Paul Cheng separately accepted the locally implemented #9 feature on 2026-10-08 by replying “Accept with recorded limits (Recommended)” to the question naming incomplete audit coverage and pending shared Development Supabase migration/preview smoke. This was after the separate review and local checks, and is not merge or release approval.
- [x] Accepted ACC-002, APP-002/003, SEC-001 and OPS-001 deltas synced into canonical ProductSpec v0.8 and affected capability specs on 2026-10-08. Archive and final link checks follow this sync; no commit yet.
- [ ] PR opened to `develop`, merged, shared Development Supabase migrated or deployed. All pending separate actions.

Approved policy: `Submitted` is initial-only; HR can change among `In review`/`Shortlisted`/`Rejected` without a required reason; HR promotion uses a verified account with no existing Applicant applications. A changed policy or expanded scope needs a revised packet and approval.

## Acceptance map (targets, not observed passes)

| ID | Requirement | Required evidence / current state |
| --- | --- | --- |
| `hr9-AC-01` | [ACC-002](../../specs/accounts-and-roles.md), [SEC-001/002](../../specs/security-and-privacy.md) | Local pgTAP denies Applicant role writes and promoted-owner draft reads; HR browser login and Applicant HR-route denial passed. Actual admin promotion is a local synthetic fixture; hosted provisioning pending. |
| `hr9-AC-02` | [APP-003](../../specs/applications-and-review.md), SEC-001 | Local pgTAP and browser confirm submitted-only HR list/detail, original/current letter and draft direct-ID denial. |
| `hr9-AC-03` | APP-003, SEC-001 | Local pgTAP confirms note author/time, Applicant no-read and no direct writes; browser confirms HR note and Applicant no-note view. Anonymous no-table-grant assertion passed. |
| `hr9-AC-04` | APP-002/003, SEC-001 | Local pgTAP denies Applicant/unverified HR status RPC; browser shows separate HR status action and own Applicant status. |
| `hr9-AC-05` | APP-003/004, [JMG-003](../../specs/job-management.md) | Local pgTAP and browser confirm submitted review, note and status after job closure; existing Applicant closure edit denial remains in DB suite. |
| `hr9-AC-06` | SEC-002/007 | Local pgTAP rejects invalid/stale status and oversized note, with only committed status event; server logs RPC attempts without note/letter text. Full invalid/unauthorized attempt audit and two-session HR contention remain open. |
| `hr9-AC-07` | [OPS-001/003](../../specs/deployment-and-operations.md) | Existing Applicant DB/browser/race tests pass after local additive migration. Development Supabase migration and Vercel preview smoke pending; Production Supabase untouched. |

## Handoffs, commands and limits

- Packet author/implementer: primary Codex execution in this conversation using MP3 intake, proposal/spec, design/planning, implementer, test-first and debugging skills. A separate read-only security/privacy reviewer execution `/root/independent_review` reviewed the completed working tree on 2026-10-08; [handoff](handoffs/independent-review.md). Skill use by the implementer was not a separate agent run.
- Read-only source inspection: `gh issue view 9`, current canonical specs and migration/auth code, Vercel URL resolver, `.env.example`, CI, templates and process. First sandboxed `gh issue view` failed due to network proxy; permitted unsandboxed retry returned issue #9. `git fetch origin develop` succeeded; `develop` and `origin/develop` were both `551da67`; branch creation succeeded.
- Packet/link check: passed during initial planning; final changed-file check pending. Product implementation/check results are in the [implementation summary](../../../logs/2026-10-08-hr-review-implementation.md).
- Baseline observation at `551da67` before #9: HR could read submitted rows through application RLS, but no HR page, private note table or status action existed, and sign-in sent all users to Applicant pages. This change implements those interfaces and role-aware sign-in. Vercel Auth callback origin already used Vercel-provided URLs and was not changed here.
- Shared database limitation: every non-`master` Vercel preview, including PR previews, points to Development Supabase per the user's architecture. A new HR preview cannot be claimed working before the reviewed additive migration is applied there. This packet neither applies that migration nor changes Production Supabase. The separate reviewer found no confirmed permission bypass but noted the missing hosted compatibility check and partial SEC-007 audit coverage, both accepted as visible limits by the student.

## Session evidence

| Date/session | Summary | Verification |
| --- | --- | --- |
| 2026-10-08 HR intake and packet planning | [Planning summary](../../../logs/2026-10-08-hr-review-planning.md) | Drafted from visible conversation and local/issue inspection; student verification of summary pending. |
| 2026-10-08 HR implementation and local checks | [Implementation summary](../../../logs/2026-10-08-hr-review-implementation.md) | Actual commands, failures, fixes, reported check results and limits; student verification pending. |

Implementation approval, local checks, independent read-only review, local student acceptance and canonical v0.8 sync are recorded in [implementer](handoffs/T01-T06-implementer.md) and [reviewer](handoffs/independent-review.md) handoffs and above. The complete packet was archived after sync; final link/content checks passed. Commit, PR, shared Development Supabase migration, preview smoke and release: **pending separate actions**.
