# Preserved change history

Archive whole change packets at `workflow/archive/<YYYY-MM-DD-short-name>/`. Archiving preserves evidence; it does not grant implementation, merge, deployment or student acceptance approval.

Archived packets:

| Change | Disposition | Evidence |
| --- | --- | --- |
| [2026-10-07 Applicant accounts and applications](2026-10-07-applicant-applications/record.md) | Applicant owner accepted the local flow on 2026-10-07; ACC-001/APP-004/SEC-001 synced to v0.7 before archive. PR #15 is in `develop`; release remains separate. | [Independent review](2026-10-07-applicant-applications/handoffs/independent-review.md), [session summary](../../logs/2026-10-07-applicant-review-closeout.md) |
| [2026-10-07 Vercel-aware Supabase Auth redirects](2026-10-07-vercel-auth-redirects/record.md) | Requester accepted the scoped changes on 2026-10-08; no product delta. PR #19 merged to `develop`; deployment remains separate. Student role and issue triage are not independently confirmed. | [Independent review](2026-10-08-conventional-pr-titles/handoffs/independent-review.md), [session summary](../../logs/2026-10-08-supabase-auth-and-pr-title-closeout.md) |
| [2026-10-07 framework and Supabase structure](2026-10-07-framework-supabase-structure/record.md) | Requesting user accepted the reviewed work and recorded limitations on 2026-10-08; name/role not recorded. No product delta. PR #26 is open; checks and merge are tracked there. | [Independent review](2026-10-07-framework-supabase-structure/handoffs/independent-review.md), [branch review summary](../../logs/2026-10-08-supabase-branch-review-closeout.md), [conflict-resolution summary](../../logs/2026-10-08-pr-26-conflict-resolution.md) |
| [2026-10-07 local Supabase CI](2026-10-07-local-supabase-ci/record.md) | Requesting user accepted the reviewed work and recorded limitations on 2026-10-08; name/role not recorded. Local-only workflow slice of #11; PR #26 is open and the Actions result is pending. | [Feature record](2026-10-07-local-supabase-ci/record.md), [branch review summary](../../logs/2026-10-08-supabase-branch-review-closeout.md), [conflict-resolution summary](../../logs/2026-10-08-pr-26-conflict-resolution.md) |
| [2026-10-08 Conventional Commit PR titles](2026-10-08-conventional-pr-titles/record.md) | Requester accepted the process policy on 2026-10-08; no product delta. PR #19 merged to `develop`. Student role and issue triage are not independently confirmed. | [Independent review](2026-10-08-conventional-pr-titles/handoffs/independent-review.md), [session summary](../../logs/2026-10-08-supabase-auth-and-pr-title-closeout.md) |
| [2026-10-08 HR application review](2026-10-08-hr-application-review/record.md) | Paul Cheng accepted the local #9 feature with SEC-007 audit and hosted-preview limits; ACC-002/APP-002–003/SEC-001/OPS-001 synced to v0.8 before archive. PR #22 merged to `develop`; shared Development Supabase migration, preview smoke and release remain pending. | [Independent review](2026-10-08-hr-application-review/handoffs/independent-review.md), [planning summary](../../logs/2026-10-08-hr-review-planning.md), [implementation summary](../../logs/2026-10-08-hr-review-implementation.md) |
| [2026-10-08 Signup password usability](2026-10-08-signup-password-ux/record.md) | Paul Cheng accepted the local #20 fix on 2026-10-08; ACC-001 synced to v0.9 before archive. Issue creation and packet approval followed implementation; that deviation remains recorded. PR #22 merged to `develop`; hosted validation and release remain pending. | [Independent review](2026-10-08-signup-password-ux/handoffs/independent-review.md), [signup summary](../../logs/2026-10-08-signup-password-ux.md), [acceptance summary](../../logs/2026-10-08-signup-acceptance-closeout.md) |
| [2026-10-08 Supabase skills and shadcn registry](2026-10-08-supabase-agent-skills-registry/record.md) | Retrospective packet for previously authorized setup; requester accepted reviewed work/limitations on 2026-10-08; no product delta. PR #26 is open; merge is tracked there. | [Feature record](2026-10-08-supabase-agent-skills-registry/record.md), [branch review summary](../../logs/2026-10-08-supabase-branch-review-closeout.md), [conflict-resolution summary](../../logs/2026-10-08-pr-26-conflict-resolution.md) |

## Accepted change: sync, then archive

1. Record the actual human acceptance decision, reviewer independence/findings, verification scope and outstanding limitations in record.md. Resolve blockers or explicitly record the decision and conditions; do not relabel pending gates as complete.
2. Compare final accepted ADDED/MODIFIED/REMOVED deltas to their [canonical specs](../specs/README.md). Sync every accepted behavior change first. Retain existing IDs, allocate new unused IDs, preserve retired IDs and rationale in history, and keep one canonical home per rule. Update ProductSpec and affected spec version/date together under the documented version policy.
3. Verify the canonical files represent the accepted deltas; record sync commit, exact files, version/date and checks in record.md. A documentation/process-only packet states no product delta and records why canonical sync is N/A; reorganization retains the product baseline.
4. Only after accepted canonical sync and its evidence, move the entire packet intact: proposal, optional design, every delta, plan, tasks, record, handoffs and other evidence. Preserve status, commands, outcomes, approvals, failures, limitations and linked session logs. Do not retain only record.md or delete inconvenient evidence.
5. Repair current navigation and relative links that would break, record the archive path and decision/date, and verify links. Keep dated historical log statements about earlier paths unchanged. changes/ and archive/ have equal depth, but inspect links rather than assume they survive.

Rejected, withdrawn or superseded packets may be archived with their actual disposition and decision evidence. Never sync rejected/unaccepted proposed behavior into canonical requirements; preserve the complete packet and link a replacement if any. Mark incomplete gates honestly.

## Archive checklist

- [x] Disposition and real decision source/date recorded; deployment/release state explicit.
- [x] Accepted product deltas synced and verified before archive, or documented no-product-delta / rejected disposition.
- [x] Complete packet and historical evidence preserved without fabricated approvals or results.
- [x] Archive path, current indexes and relative links checked; every session log remains linked.
