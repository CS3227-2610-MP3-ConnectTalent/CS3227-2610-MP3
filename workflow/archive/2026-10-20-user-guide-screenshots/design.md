# Design: User Guide visual workflow assets

- Issue: [#127](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/127)
- Author: John Wong
- Date: 20 October 2026

## Design Structure

1. **Asset Organization**:
   - Location: `docs/assets/user-guide/`
   - Image format: PNG, captured from candidate release at desktop viewport width ($1520\text{px}$).
   - Image set:
     - `create-account.png`: Signup form with password validation indicators.
     - `complete-profile.png`: Initial profile form requiring verified email, name, and phone.
     - `careers.png`: Public jobs listing with category pills and search input.
     - `application-form.png`: Job application submission form with prefilled verified email and blank candidate inputs.
     - `hr-dashboard.png`: HR aggregate counts and per-job review status summary.
     - `hr-manage-jobs.png`: HR job authoring form with scheduled opening/closing inputs.
     - `hr-application-review.png`: HR candidate review dashboard with search, filter dropdowns, sorting, and pagination.

2. **Presentation & Viewport Labeling**:
   - Every screenshot embed in `docs/UserGuide.md` includes:
     - Descriptive alt text with role, page, and viewport.
     - Explicit italicized caption: `*Role: <Role> | Page: <Page> | Viewport: Desktop (1520px)*`.
   - Adheres to `docs/ReleaseQualityChecklist.md:49`.

## Reason for Architecture & Schema Design Omission
This change is strictly limited to documentation text and static visual PNG image assets. No runtime code, database tables, migrations, RLS security policies, AI prompt boundaries, or API endpoints are introduced or modified. Formal architectural and data design is therefore omitted per `workflow/templates/DesignTemplate.md`.
