# User Guide UI Workflow Screenshots — 20 October 2026

John Wong requested creating an issue, branch, commit, push, and pull request for staged User Guide changes containing UI screenshots for key Applicant and HR workflows, followed by remediating automated PR review comments.

## Intake and Issue Creation
- Created issue [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127) (`docs(user-guide): add UI workflow screenshots to user guide`).
- Created branch `docs/127-user-guide-screenshots` from `develop`.
- Opened PR [#128](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/128).

## Summary of Changes
- Embedded visual UI walkthrough screenshots across Applicant and HR sections in `docs/UserGuide.md`:
  - `create-account.png`: Account creation & password requirements
  - `complete-profile.png`: Profile completion form
  - `careers.png`: Careers page and search/filter interface
  - `application-form.png`: Application submission and draft management (with unpopulated candidate inputs)
  - `hr-dashboard.png`: HR recruitment overview dashboard
  - `hr-manage-jobs.png`: HR job draft creation and scheduling
  - `hr-application-review.png`: HR candidate application review, search, and status management
- Refined HR evaluator access copy to authorized team access.
- Created image assets in `docs/assets/user-guide/`.
- Labeled all screenshots with explicit role, page, and viewport (`Desktop (1520px)`) metadata per `docs/ReleaseQualityChecklist.md:49`.
- Strictly preserved all existing user guide content without unauthorized deletion.

## Review Feedback Remediation
- **Synthetic Data**: Replaced `application-form.png` to remove personal candidate details (full name and phone number), leaving input fields unpopulated.
- **Viewport Labels**: Added role, page, and desktop viewport labels to all 7 markdown image embeds and caption lines.
- **Change Packet Completeness**: Restored `proposal.md`, `design.md`, `plan.md`, `tasks.md`, and `handoffs/independent-review.md` in `workflow/archive/2026-10-20-user-guide-screenshots/`.
- **Independent Review**: Formatted and documented formal independent review evidence under `handoffs/independent-review.md` and updated `record.md`.

## Verification
- Code style: `pnpm exec prettier --check docs/UserGuide.md logs/2026-10-20-user-guide-screenshots.md workflow/archive/2026-10-20-user-guide-screenshots/` (passed, 0 errors).
- Site compilation: `npm --prefix website run build` (passed, 0 broken links, static files generated).
- Application tests: N/A (documentation and image assets only).

## Closeout and PR Readiness
- Evidence record: [workflow/archive/2026-10-20-user-guide-screenshots/record.md](../workflow/archive/2026-10-20-user-guide-screenshots/record.md).
- User authorization: John Wong authorized branch creation, commit, push, PR submission, and review comment resolution.
