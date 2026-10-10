# Required Applicant profile implementation — 10 October 2026

## Prompts and decisions

1. Paul requested mandatory full name/email/phone, profile-only onboarding after account verification, country-code dropdown plus national number, application autofill and removal of optional/helper prose.
2. The earlier #52 approval was expanded through a concrete amendment; Paul replied **“Approve plan and branch”**, authorizing implementation and feat/52-required-applicant-profile carrying prior uncommitted #49/#50/#53 work. No commit/push/PR/hosted authorization was inferred.
3. Secure profile saving uses a restricted authenticated verified session; incomplete Applicants cannot use other product tabs, but profile/files/recovery/sign-out remain available. Guest and HR access continue.

## Actual work and failures

Primary used implementer/TDD, Supabase/Postgres and verification guidance; read installed Next.js guides and official Supabase SSR guidance. Shared phone/readiness modules, country labels, profile/application forms, Auth/callback/navigation/request guards, Applicant AI authorization and database triggers were implemented. The library calling-code source is acknowledged in DeveloperGuide. No location lookup or phone-verification promise was added. No profile fields/PDFs enter AI prompts.

Git branch creation was denied in the sandbox and succeeded after escalation. Focused unit validation and SQL tests first failed for missing mandatory behavior. Existing unit/SQL fixtures were updated for explicit completed profiles and required submission phones. A revision-only draft-save bypass was exposed by a failing SQL assertion and fixed. Its first fixture attempt omitted job_title and was corrected before the intended failure. Migration was CLI-created/applied locally; the final guard definition was updated locally with CREATE OR REPLACE. No reset/hosted database change.

Signup browser testing exposed runtime Intl country-name differences between Node and Chromium and an ambiguous country label; checked-in labels and explicit htmlFor/id fixed hydration/selection. Existing browser fixtures initially attempted a service-role table insertion denied by private check-function privileges, then used authenticated save_applicant_profile RPCs. A documentation shell command had quoting parse errors and made no edits; apply_patch replaced it. These are recorded failures, not passed attempts.

## Verification and review

Local actual results: 155 unit tests /29 files; final 354 SQL checks /11 files; one signup/Mailpit onboarding browser flow plus three profile/résumé/withdrawal regression flows; eleven résumé/withdrawal races with observed lock waits; TypeScript, scoped lint and production build passed. Direct draft phone format parity needed a further failing regression and guard correction; the old 555 new-draft fixture was normalized. Reviewer then found a legacy-withdrawal regression; SQL reproduced it after correcting a wrong initial RPC signature. Validation now targets inserts/draft writes, allowing withdrawal of unchanged frozen snapshots; three assertions pass. [Feature record](../workflow/archive/2026-10-10-required-applicant-profile/record.md) records commands, review and limits. Synthetic fixtures are scoped/cleaned; no secrets or private Applicant data reproduced.

Separate reviewer `/root/application_withdrawal_review` was reused under the repository's independent-review requirement; it initially reproduced 22 focused unit tests, later 44 tests/5 files and country dataset consistency. This was a separate execution; the primary implemented. Review wording/evidence and medium legacy-withdrawal findings were corrected. Final source/regression re-review resolved the finding and identified no remaining blocker. See [handoff](../workflow/archive/2026-10-10-required-applicant-profile/handoffs/independent-review.md) for independence and limits; broader runtime results were not independently rerun.

## Pending decisions and limits

#52 and #53 separate student acceptance remain pending. Canonical specs are unchanged until acceptance, and no archive/publication is inferred. Hosted migration/preview, clean-reset rehearsal, full assistive-technology audit and exhaustive profile-edit concurrency testing remain pending. Prior uncommitted work and the unrelated earlier packet were preserved. Student verification of this AI-generated summary is pending.
