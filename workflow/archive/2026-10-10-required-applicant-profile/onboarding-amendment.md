# #52 mandatory profile / country-code amendment

Paul Cheng; 10 October 2026; approved by Paul's “Approve plan and branch”, including feat/52-required-applicant-profile carrying current work. Canonical v1.6. This amendment supersedes conflicting portions of the earlier approved proposal/design/plan/deltas. Preserve uncommitted #49/#50 and implemented, separately unaccepted #53. Student acceptance remains pending.

## Requirements and acceptance

- ACC-001/006: signup retains email/password confirmation and email verification. A verified Applicant authenticates into restricted onboarding and goes directly to My profile. Saving an owned profile requires authentication; other app access stays blocked until completion. Returning incomplete Applicants follow the same flow; HR does not.
- ACC-006/JOB-001/003/APP-002: incomplete signed-in Applicants cannot use Careers, listings/details/apply or My applications/detail navigation. Hide these destinations and enforce direct-page/action/API readiness on the server. My profile and its optional file actions, verification/recovery and Sign out remain accessible. This supersedes the earlier incomplete-profile history/withdrawal exception. Completion restores retained-record access without modifying history. Guests retain public listings: onboarding is not confidentiality for publicly readable jobs.
- APP-005/006: full name and phone are required; email is required/read-only from verified Auth. Name remains trimmed/nonblank, max120. Phone uses an accessible country-labelled dial-code dropdown and separate required national-number input. Store a normalized international +digits value of 7–15 digits total; national input accepts digits only. Shared codes can have distinct country labels; visible default Singapore +65, no inferred location. UI/server/SQL enforce bounds and reject invalid values; no SMS or country-specific validity claim. Legacy unformatted phones require profile correction, without rewriting frozen submissions.
- APP-006: new application forms autofill saved name/phone and trusted verified email without AI. Application fields can be corrected before submission. Existing drafts retain saved fields; missing required fields must be completed before submission. Profile changes never overwrite frozen history. Portfolio/education/experience/PDF remain optional.
- Remove Phone (optional), the quoted optional/maximum helper prose under name/phone, and “Existing drafts and submitted applications will stay unchanged.” Keep required labels, input limits and field errors. Profile résumé upload remains available before saving required text, but does not complete onboarding.

Acceptance checks: verified signup/sign-in routes to profile; incomplete navigation has only profile/sign-out; direct restricted URLs/mutations blocked; missing/malformed required values rejected with typed inputs retained; valid code/number/name save unlocks flow; new application prefills all three fields; HR/guest/recovery/logout and profile upload remain usable; legacy submissions stay frozen; keyboard/mobile country dropdown and redirects work.

## Design and ordered plan

Shared phone UI/normalization module in profile and application forms; focused server readiness guard derived from verified Auth and persisted validated name/phone, not a mutable completion flag. Separate role guard permits onboarding/profile file/recovery/logout. SQL validates profile/submission and workflow readiness; no blanket NOT NULL/backfill on legacy rows. Existing phone text snapshots remain. No contact data or PDF added to AI.

1. Record amendment approval and permission for feat/52-required-applicant-profile carrying current work.
2. Focused failing validation/navigation/autofill tests; shared phone and readiness implementation.
3. CLI-create additive migration; SQL denial/legacy/lock checks, recorded local history.
4. Wire verification callback/sign-in, profile-only navigation and direct page/action/API gates; profile/file/recovery/logout exceptions avoid loops.
5. Relevant browser/unit/SQL/race, typecheck/lint/build and separate independent review; guides/logs and actual failures/limits.
6. Separate acceptance, then reconciled canonical sync/archive. No commit/push/PR or hosted changes included.

Rollback preserves normalized values, legacy rows and immutable snapshots. Hosted cutover/tests require separate authorization. Paul's later “Approve plan and branch” explicitly covers this stricter gating/phone amendment; earlier approval remains historical.
