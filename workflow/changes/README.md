# Change packet index

## Active follow-up work

Issue [#90 allow applicants to withdraw and reapply](2026-10-16-applicant-withdraw-and-reapply/record.md) proposes replacing the whole-table `(applicant_id, job_id)` unique constraint with a partial unique index `WHERE withdrawn_at IS NULL`, allowing applicants who withdrew to draft and submit a new application for the same job while preserving all historical withdrawn applications, timestamps, and notes. Pending human scope/design/plan approval.

Issue [#76 résumé validation and errors](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/76) has an active upload-reliability follow-up in [PR #77](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/77). The [packet](2026-10-14-resume-upload-diagnostics/record.md) documents the Preview permission failure, the validated RPC-path repair, the five-second PDF deadline and safe diagnostics. The newest review fixes and approved single Upload / confirmed Delete résumé UI pass focused and full local unit checks; final GitHub/Supabase/Vercel status and review-thread closeout are pending publication. Hosted upload verification remains unverified, and its smoke test was skipped at the user's direction.

## Accepted and archived work

Issue [#88 scheduled job opening and closing times](../archive/2026-10-15-scheduled-job-times/record.md) was accepted by John on 15 October 2026 after independent review verification and passing quality gates. JMG-004 and JOB-001 synced to canonical v1.15 before complete packet archive. [Closeout summary](../../logs/2026-10-15-scheduled-job-times.md). PR pending submission.

Issue [#84 remaining action feedback](../archive/2026-10-15-remaining-action-feedback/record.md) was separately accepted by Paul with recorded limits on 15 October 2026 after independent review. OVR-006 synced to this branch's canonical v1.11 before complete archive; OVR-004/005/006 are reconciled in this branch at v1.14. [Closeout summary](../../logs/2026-10-15-action-feedback-closeout.md).
Issue [#83 View role loading follow-up](../archive/2026-10-15-view-role-loading/record.md) was separately accepted by Paul with hosted/accessibility limits on 15 October 2026. OVR-005 and branch canonical v1.12 were synced before the complete packet was archived; [session summary](../../logs/2026-10-15-view-role-loading-followup.md). PR #85 subsequently merged to `develop`.

Issue [#83 navigation loading](../archive/2026-10-15-navigation-loading/record.md) was separately accepted by Paul with recorded limits on 15 October 2026 after independent re-review. JOB-004/OVR-005 synced to branch canonical v1.11 before complete archive; PR #82's parallel OVR-004 is reconciled in integrated branch v1.14. [Closeout summary](../../logs/2026-10-15-navigation-loading-closeout.md).

Issue [#81 pending action feedback](../archive/2026-10-14-pending-action-feedback/record.md) was separately accepted by Paul with recorded limits on 15 October 2026. OVR-004 synced to canonical v1.11 before complete packet archive; [independent review](../archive/2026-10-14-pending-action-feedback/handoffs/independent-review.md) found two evidence gaps that were fixed and rechecked. Local checks passed; hosted latency and full accessibility checks remain pending. Acceptance did not itself authorize commit, push or PR; PR #82 later merged to `develop`.

Issue [#78 public job search](../archive/2026-10-14-job-listing-search/record.md) was separately accepted by Paul with recorded limits on 14 October 2026. JOB-004 synced to canonical v1.10 before the complete packet archive; [independent review](../archive/2026-10-14-job-listing-search/handoffs/independent-review.md) found a request-tracking issue that was repaired and rechecked. Local checks passed; hosted/accessibility validation and repository PR review remain pending.

Issue [#76 résumé validation and errors](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/76) was separately accepted by Paul with recorded limits on 14 October 2026. APP-007 synced to v1.10 before the [original packet](../archive/2026-10-13-resume-error-messages/record.md) was archived. Its upload-reliability follow-up remains active above while PR #77 is under review; hosted upload verification is not claimed.

Issue [#74 return navigation and cursors](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/74) was separately accepted by Paul with recorded limits on 13 October 2026. The [complete packet](../archive/2026-10-13-navigation-cursors/record.md) preserves independent review and local checks. Canonical delta N/A; publication and hosted/accessibility verification remain pending.

Issue [#71 scheduled Playwright stability](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/71) is in PR #73 with issue-specific commits after review. The [complete packet](../archive/2026-10-13-scheduled-e2e-stability/record.md) and [issue-specific closeout](../../logs/2026-10-13-scheduled-e2e-closeout.md) record the hydration-ready input correction, bounded assertion timeout, final 20/20 suite, and reviewer limits. Hosted scheduled confirmation remains follow-up evidence.

Issue [#72 Vitest PR coverage report](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72) was accepted by Johnwz123 on 2026-10-14 after independent review. The [complete follow-up packet](../archive/2026-10-14-vitest-coverage-action/record.md) replaces the custom reporter with `davelosert/vitest-coverage-report-action@v2`, grants `pull-requests: write` only to the report job, and changes the PR comment to coverage-only; test totals remain in CI logs. No product sync applies. Hosted comment verification remains pending after the workflow reaches the default branch. See the [implementation summary](../../logs/2026-10-14-vitest-coverage-action-implementation.md) and [closeout summary](../../logs/2026-10-14-vitest-coverage-action-closeout.md).

Issue [#72 Vitest PR report comments](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/72) has an issue-focused diagnostic commit in PR #73 and a [complete archived packet](../archive/2026-10-13-vitest-pr-report/record.md). The PR references #72 without closing it; hosted API cause and comment create/update verification remain open until the changed reporter reaches the default branch and a later report run exercises it.

Issue [#68 HR recruitment dashboard](../archive/2026-10-12-hr-dashboard/record.md) was fully approved by John Wong on 2026-10-12. APP-009 was synced to canonical v1.9 and the complete packet archived on 2026-10-13 with known local E2E/formatting failures and missing independent-review provenance explicitly recorded. The feature branch is pushed; issue-linked PR status is tracked through #68.

Issues [#58](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/58) and [#59](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/59) were accepted by the user on 2026-10-11 and archived after closeout on 2026-10-12. The accepted work adds report-only 90% coverage reporting and weekly dependency updates: Renovate handles pnpm/npm after the Mend Renovate GitHub App is installed for this repository, while Dependabot handles GitHub Actions. The full Prettier gate passes after formatting the 187 previously unformatted files; hosted CI and the first hosted reporter run remain pending. See the [complete archived packet](../archive/2026-10-11-coverage-dependabot/record.md), [implementation summary](../../logs/2026-10-11-coverage-dependabot-implementation.md), [format closeout summary](../../logs/2026-10-12-coverage-format-closeout.md), and [PR preparation summary](../../logs/2026-10-12-coverage-dependabot-pr.md).

Issue [#60 guides and reflection alignment](../archive/2026-10-12-guides-reflection-alignment/record.md) was separately accepted by Paul on 12 October 2026 with recorded limits after independent review. The complete documentation-only packet is archived with no canonical delta. Authenticated hosted checks and Paul's personal reflection verification remain open; no publication authorized.

Issue [#51](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/51) was accepted for PR submission by Johnwz123 on 2026-10-10 after independent review and closeout. Its no-product-delta packet is [archived](../archive/2026-10-10-quality-gates/record.md), and PR #57 remains open; fresh checks are required after reconciling merged PR #56.

Issue [#55 CI test matrix](../archive/2026-10-10-ci-test-matrix/record.md) was accepted after independent review on 2026-10-10. Its tooling-only packet is archived, and PR #56 merged on 2026-10-11.

[#53 first-upload retry follow-up](../archive/2026-10-10-first-upload-retry/record.md): Paul separately accepted with recorded limits on 10 October 2026. Complete packet archived; restores existing APP-007 without a canonical delta. Hosted testing and commit/push remain pending.

[#50 withdrawal placement correction](../archive/2026-10-10-withdrawal-placement/record.md): Paul accepted via “Accept correction” on 10 October 2026; canonical APP-008 synced to v1.6 and complete packet archived. My applications offers View/status only; withdrawal stays in individual submitted application details.

[#53 upload-before-save and profile résumé](../archive/2026-10-10-unsaved-profile-resume/record.md) was separately accepted by Paul with recorded limits on 10 October 2026. Canonical v1.8 synced without reverting #52 and the complete packet archived. One combined PR for #49/#50/#52/#53 is authorized; hosted rollout remains pending.

[#52 required Applicant profile and phone](../archive/2026-10-10-required-applicant-profile/record.md) was separately accepted by Paul via “Accept with recorded limits” on 10 October 2026 after the approved onboarding amendment and independent review. Canonical v1.7 synced before complete archive; hosted rollout/reset/accessibility and Git publication remain pending.

[#49/#50 application form and withdrawal](../archive/2026-10-10-application-form-withdrawal/record.md) was separately accepted locally with recorded limits by Paul on 10 October 2026. APP-002/003/007/008, SEC-001 and AIS-001 synced to canonical v1.5 before the complete nine-file archive. Commit/push/PR and hosted rollout remain pending and require separate authorization.

[#44 private profiles and PDF résumés](../archive/2026-10-09-profile-resume/record.md) was separately accepted with recorded limits on2026-10-09 and completely archived after canonical v1.4 sync. Work remains uncommitted on feat/44-profile-resume; hosted rollout and the documented validation/cleanup limitations remain open.

[#40 signup notice/navigation integration](../archive/2026-10-09-signup-notice-navigation/record.md) was separately accepted with recorded limits on 2026-10-09 and completely archived. It combines accepted ACC-005 navigation with APP-005 contact requirements under v1.3. No commit/push/PR or hosted validation occurred for this integration.

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

| Packet artifact                  | Source template / rule                                                                                                                                                                    |
| -------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| proposal.md                      | [Proposal](../templates/ProposalTemplate.md): problem, scope, acceptance evidence, approval                                                                                               |
| design.md                        | [Design](../templates/DesignTemplate.md): required for architecture, authorization, schema, AI boundaries, integrations, risk or multiple modules; narrow work records an omission reason |
| specs/<capability>.md            | [Spec delta](../templates/SpecDeltaTemplate.md): one file per changed [canonical capability](../specs/README.md), using ADDED/MODIFIED/REMOVED and stable IDs                             |
| plan.md                          | [Implementation plan](../templates/ImplementationPlanTemplate.md): dependency order, owners, files and verification                                                                       |
| tasks.md                         | [Tasks](../templates/TasksTemplate.md): checkboxes tied to actual evidence                                                                                                                |
| record.md                        | [Feature record](../templates/FeatureRecordTemplate.md): approvals, exact results, independent review, human decisions and every session log                                              |
| handoffs/<task-role>.md, if used | [Agent handoff](../templates/AgentHandoffTemplate.md): bounded assignment and actual returned evidence                                                                                    |

A defect restoring existing specified behavior cites the existing IDs; change the delta only if expected behavior changes. Documentation/process-only work may use a lightweight record with an approved design/plan and an explicit no-product-delta statement. Do not invent product requirements or completed verification to fill fields.

- [ ] Human approval of proposal, deltas, design/omission and plan recorded before product implementation.
- [ ] Relevant test-first, docs, security, migration, deployment or rollback work planned; justify N/A categories.
- [ ] Implementation checks, independent review and human acceptance recorded as distinct gates.
- [ ] Before PR, complete closeout and list every dated session summary in record.md with limitations.
- [ ] Open an issue-linked PR as the last contributor action; post-submission review, merge and release are separate decisions.
- [ ] Sync accepted product deltas to canonical specs before [archiving](../archive/README.md) the complete packet.

Keep active proposals here until disposition. Preserve rejected/withdrawn work and its decision in history without syncing rejected behavior. Do not overwrite [legacy evidence](../records/README.md) with a new proposal.
