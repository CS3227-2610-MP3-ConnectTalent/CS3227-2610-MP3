# First-upload retry review intake — 10 October 2026

Paul supplied PR #54's Codex P2 finding about interrupted first uploads when the client revision is absent. Primary Codex /root inspected actual application-resumes service, ResumePanel, request helper, lifecycle tests and existing recovery/prepare SQL, plus accepted #53 design. Systematic-debugging/Supabase guidance was applied; no separate agent execution or runtime reproduction yet.

Source trace supports the finding: Retry replaces operation ID, a lost first response leaves client revision null, recovery is conditional on non-null revision, and preparation requires the persisted draft revision. Proposed bounded restoration resolves only the actor/job-owned persisted revision for explicit null-revision Retry before existing locked RPCs. Explicit supplied stale revisions are not upgraded; typed fields/finalized attachments and existing guards remain.

Existing [issue #53](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/53) and [PR #54 review](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/54#discussion_r4237182826) link the [proposed packet](../workflow/changes/2026-10-10-first-upload-retry/record.md). Branch feat/52-required-applicant-profile; baseline e23fba2. No new branch, code/schema/env edits, commit/push or external comment. AGENTS.md requires concrete plan approval before implementation; separate acceptance/publication remain later gates. No new product requirement or canonical version proposed. Synthetic local tests are planned, not executed results. Student summary verification pending.
# Final navigation

This follow-up was later accepted with recorded limits and [archived](../workflow/archive/2026-10-10-first-upload-retry/record.md). See the [closeout summary](2026-10-10-first-upload-retry-closeout.md). The original intake wording below describes the earlier proposal state.
