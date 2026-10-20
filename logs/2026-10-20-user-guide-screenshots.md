# User Guide UI Workflow Screenshots — 20 October 2026

John Wong requested creating an issue, branch, commit, push, and pull request for staged User Guide changes containing UI screenshots for key Applicant and HR workflows, with the explicit constraint to make no further modifications to `docs/UserGuide.md`.

## Intake and Issue Creation
- Created issue [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127) (`docs(user-guide): add UI workflow screenshots to user guide`).
- Created branch `docs/127-user-guide-screenshots` from `develop`.

## Summary of Changes
- Embedded visual UI walkthrough screenshots across Applicant and HR sections in `docs/UserGuide.md`:
  - `create-account.png`: Account creation & password requirements
  - `complete-profile.png`: Profile completion form
  - `careers.png`: Careers page and search/filter interface
  - `application-form.png`: Application submission and draft management
  - `hr-dashboard.png`: HR recruitment overview dashboard
  - `hr-manage-jobs.png`: HR job draft creation and scheduling
  - `hr-application-review.png`: HR candidate application review, search, and status management
- Refined HR evaluator access copy to authorized team access.
- Created image assets in `docs/assets/user-guide/`.
- Strictly preserved all existing user guide content without deletion or further modification.

## Verification
- Code style: `pnpm exec prettier --check docs/UserGuide.md` (passed, 0 errors).
- Site compilation: `npm --prefix website run build` (passed, 0 broken links, static files generated).
- Application tests: N/A (documentation and image assets only).

## Closeout and PR Readiness
- Evidence record: [workflow/archive/2026-10-20-user-guide-screenshots/record.md](../workflow/archive/2026-10-20-user-guide-screenshots/record.md).
- User authorization: John Wong authorized branch creation, commit, push, and PR submission for `develop`.
