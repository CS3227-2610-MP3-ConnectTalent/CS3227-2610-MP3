# Accepted #52 reconciliation — 10 October 2026

Paul approved the concrete onboarding amendment with “Approve plan and branch”, then separately accepted the implementation with **“Accept with recorded limits”**. The approved amendment supersedes conflicting historical proposal/delta/plan language. This document records its final accepted delta and sync; it does not invent a new policy or approval.

## Final ADDED / MODIFIED / REMOVED

- **ADDED ACC-006**: restricted verified Applicant session and profile-only product navigation until persisted valid name/phone plus trusted email; direct-page/API/action and database application-write readiness; Applicant AI denied before quota/provider; profile/file/recovery/sign-out exceptions. This explicitly supersedes the historical incomplete-history/download/withdrawal exception. Completing the profile restores those rights without changing records. Guests and HR unaffected.
- **MODIFIED ACC-001/005**: verification/sign-in sends incomplete Applicants to profile; My profile/Sign out only while incomplete, Careers links to profile; normal Applicant navigation returns on completion. ACC-005 qualification implements the amendment's explicit navigation requirement.
- **MODIFIED JOB-001/003**: signed-in incomplete Applicants redirect from listings/filter/detail before loading jobs; guest/HR public jobs remain public.
- **MODIFIED APP-005/006**: mandatory profile name/email/phone and submitted phone; country-labelled code plus national digits, normalized + and7–15 total digits; optional incomplete application drafts after onboarding, optional background/portfolio/PDF; new-form name/email/phone autofill without AI; remove optional/name/phone and quoted history helper prose. Existing drafts retain precedence; frozen legacy records untouched, including lifecycle withdrawal after current-profile completion.
- **REMOVED**: no requirement IDs retired. Prior contradictory proposal text is preserved as history and superseded by the approved amendment.

## Sync evidence

Canonical ProductSpec advances **v1.6 → v1.7**, dated10October2026. Updated `workflow/specs/accounts-and-roles.md`, `public-job-listings.md`, `applications-and-review.md`, their index and ProductSpec. Stable existing IDs retained; ACC-006 is new and unique. Other SEC/AI/withdrawal rules remain; no contact/PDF provider input added. #53 profile-file/first-upload proposals are not accepted/synced by #52.

Manual clause comparison verified the accepted amendment's required fields, country input bounds, strict page access, allowed onboarding routes, autofill/history distinction and retained guest/HR boundaries against canonical. Static links/IDs/version/whitespace checks are recorded in [record](record.md). No commit exists for this sync; local docs/spec changes do not establish hosted deployment. Whole packet is archived only after this sync.
