# Active change packets

Issue [#39](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/39) was separately accepted with recorded limits by Paul Cheng on 2026-10-09. Its [complete application-form details packet](../archive/2026-10-09-application-form-details/record.md) is archived after APP-005 and SEC-005/007 synced to canonical v1.2 on this independent branch. Commit/push/PR and coordinated hosted cutover/testing remain pending.

The accepted packet for issues [#7](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/7) and [#10](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/10) is [archived here](../archive/2026-10-09-soclaas-ai/record.md). John is the accountable student for this feature, assigned in chat on 2026-10-09. He approved the proposal, deltas, design, plan and security amendments, then accepted the implementation after independent recheck. Canonical ProductSpec v1.1 sync is committed as `7f326eb`; PR submission is the remaining final contributor action.

The issue #6 Applicant accounts and applications packet was accepted locally and [archived](../archive/2026-10-07-applicant-applications/record.md) on 2026-10-07 after canonical v0.7 sync. PR #15 is present in `develop` as `2fad6ed`; release remains separate.

The issue #9 HR application review packet was accepted locally with recorded limits and [archived](../archive/2026-10-08-hr-application-review/record.md) on 2026-10-08 after canonical v0.8 sync. PR #22 is merged to `develop`; the shared Development Supabase migration, preview smoke and release remain separate actions.

The issue [#20](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/20) [signup password UX packet](../archive/2026-10-08-signup-password-ux/record.md) records a follow-up implemented before issue creation. Its proposal/delta are retrospective; Paul Cheng separately accepted the local behavior after independent review, and ACC-001 was synced to v0.9 before archive. PR #22 is merged to `develop`; hosted validation and release remain pending.

The Vercel-aware Supabase Auth redirect and Conventional Commit PR-title packets are archived in [workflow/archive](../archive/README.md); PR #19 is merged to `develop`.

The Supabase setup packets for PR #26 are archived in [workflow/archive](../archive/README.md). PR #26 merged into `develop` at `eeebb75`; its archived record retains the checks and limits observed before merge. No product-spec sync was needed for its configuration and contributor-workflow changes.

[Issue #27](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/27) was accepted locally with recorded limits on 8 October 2026. Its [complete password-recovery packet](../archive/2026-10-08-password-recovery/record.md) was archived after ACC-004 synced to canonical v1.0. Commit, PR, hosted validation and release remain pending; the #27 branch is separate from uncommitted #24/#25 local HR seed work.

Start future contributor changes with a triaged GitHub issue, then create `workflow/changes/<YYYY-MM-DD-short-name>/`. Record all issue numbers/URLs, dependencies, student owner, issue-linked branch and risk classification. Issue creation is intake, not approval to implement product behavior.

Copy and fill the [templates](../templates/ProposalTemplate.md):

| Packet artifact | Source template / rule |
| --- | --- |
| proposal.md | [Proposal](../templates/ProposalTemplate.md): problem, scope, acceptance evidence, approval |
| design.md | [Design](../templates/DesignTemplate.md): required for architecture, authorization, schema, AI boundaries, integrations, risk or multiple modules; narrow work records an omission reason |
| specs/<capability>.md | [Spec delta](../templates/SpecDeltaTemplate.md): one file per changed [canonical capability](../specs/README.md), using ADDED/MODIFIED/REMOVED and stable IDs |
| plan.md | [Implementation plan](../templates/ImplementationPlanTemplate.md): dependency order, owners, files and verification |
| tasks.md | [Tasks](../templates/TasksTemplate.md): checkboxes tied to actual evidence |
| record.md | [Feature record](../templates/FeatureRecordTemplate.md): approvals, exact results, independent review, human decisions and every session log |
| handoffs/<task-role>.md, if used | [Agent handoff](../templates/AgentHandoffTemplate.md): bounded assignment and actual returned evidence |

A defect restoring existing specified behavior cites the existing IDs; change the delta only if expected behavior changes. Documentation/process-only work may use a lightweight record with an approved design/plan and an explicit no-product-delta statement. Do not invent product requirements or completed verification to fill fields.

- [ ] Human approval of proposal, deltas, design/omission and plan recorded before product implementation.
- [ ] Relevant test-first, docs, security, migration, deployment or rollback work planned; justify N/A categories.
- [ ] Implementation checks, independent review and human acceptance recorded as distinct gates.
- [ ] Before PR, complete closeout and list every dated session summary in record.md with limitations.
- [ ] Open an issue-linked PR as the last contributor action; post-submission review, merge and release are separate decisions.
- [ ] Sync accepted product deltas to canonical specs before [archiving](../archive/README.md) the complete packet.

Keep active proposals here until disposition. Preserve rejected/withdrawn work and its decision in history without syncing rejected behavior. Do not overwrite [legacy evidence](../records/README.md) with a new proposal.
