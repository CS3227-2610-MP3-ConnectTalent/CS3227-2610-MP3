# Proposal: User Guide UI workflow screenshots

- Issue: [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127)
- Author: John Wong
- Date: 20 October 2026

## Motivation & Scope

The User Guide (`docs/UserGuide.md`) provides comprehensive textual walkthroughs of the Applicant and HR reviewer journeys. However, it lacked visual screenshots for end users navigating the portal.

This change aims to:
1. Provide concrete desktop UI screenshots for key Applicant and HR workflows:
   - Section 1.2: Account creation (`create-account.png`)
   - Section 1.3: Profile completion (`complete-profile.png`)
   - Section 3.1: Open roles browsing and filtering (`careers.png`)
   - Section 3.2: Application completion and draft management (`application-form.png`)
   - Section 4.2: HR recruitment overview dashboard (`hr-dashboard.png`)
   - Section 4.3: HR job draft creation and scheduling (`hr-manage-jobs.png`)
   - Section 4.4: HR application review, search, and status tracking (`hr-application-review.png`)
2. Refine HR access copy in Section 4.1 to reflect authorized team access.
3. Label each screenshot with role, page, and viewport (desktop 1520px) per `docs/ReleaseQualityChecklist.md`.
4. Ensure all images contain synthetic/demonstration candidate data and zero private credentials or applicant personal information.

## Non-Goals & Invariants
- No runtime application code, API routes, or database schema changes.
- No canonical specification delta (product requirements and RLS policies remain unchanged).
- No modification or deletion of existing User Guide textual specifications.
