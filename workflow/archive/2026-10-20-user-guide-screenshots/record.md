# Evidence record: User Guide UI workflow screenshots — #127

- Issue: [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127).
- Owner: John Wong; documentation change, no product runtime delta or canonical version change.
- Branch/baseline: `docs/127-user-guide-screenshots` from `origin/develop`, 20 October 2026.
- Artifacts: [proposal](proposal.md), [design](design.md), [plan](plan.md), [tasks](tasks.md).
- Sessions: [Dated session summary](../../../logs/2026-10-20-user-guide-screenshots.md).
- Handoffs: [independent review](handoffs/independent-review.md).
- Request: User requested to create an issue, branch, commit, push, and open a PR for completed staged User Guide UI walkthrough screenshots without further modifications to `docs/UserGuide.md`. Subsequent review follow-up remediated automated code review comments.
- Scope:
  - Added 7 user interface screenshots to `docs/assets/user-guide/`:
    - `create-account.png` (Section 1.2 Create and verify account)
    - `complete-profile.png` (Section 1.3 Complete profile)
    - `careers.png` (Section 3.1 Browse jobs)
    - `application-form.png` (Section 3.2 Complete application form)
    - `hr-dashboard.png` (Section 4.2 HR dashboard)
    - `hr-manage-jobs.png` (Section 4.3 Manage jobs)
    - `hr-application-review.png` (Section 4.4 Review applications)
  - Embedded image references in `docs/UserGuide.md` with explicit role, page, and desktop viewport labels per `docs/ReleaseQualityChecklist.md:49`.
  - Refined Section 4.1 HR access text.
  - No application code, database schema, or canonical product specification delta.
- Verification:
  - Formatting: `pnpm exec prettier --check docs/UserGuide.md` passed (0 errors).
  - Docusaurus website build: `npm --prefix website run build` passed (compiled successfully, 0 broken links).
  - Application tests: N/A (documentation and image assets only).
- Independent review: Verified by Independent Reviewer (`mp3-independent-verification` role) in [handoffs/independent-review.md](handoffs/independent-review.md). Remediated all 4 PR #128 review comments:
  1. Personal details replaced: user replaced `application-form.png` with a clean form having blank applicant name/phone fields.
  2. Viewport labeling: added role, page, and desktop viewport captions to all 7 screenshots.
  3. Packet restoration: restored `proposal.md`, `design.md`, `plan.md`, `tasks.md`, and `handoffs/independent-review.md`.
  4. Review auditability: documented independent review handoff, verified invariants, and findings disposition.
- Human acceptance: Explicitly authorized by John Wong on 20 October 2026 ("These changes are complete already" and "There are some unresolved review comments in the PR. Can you fetch them, address and fix them, commit and push the changes, then resolve the review comments?").
- Closeout: Complete archived packet; canonical specification sync N/A.
- Rollback: Revert branch commit.
