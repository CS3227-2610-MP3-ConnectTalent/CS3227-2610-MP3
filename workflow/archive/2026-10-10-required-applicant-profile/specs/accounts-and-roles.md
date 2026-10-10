# Delta: accounts-and-roles.md

Issue52; Paul Cheng; proposed 2026-10-10, canonical v1.5. [Canonical](../../../specs/accounts-and-roles.md). Concrete approval/implementation/sync pending.

## MODIFIED

### ACC-001

Before (complete canonical clause):

## ACC-001: Public Applicant signup

Public signup MUST create only an Applicant account for this company's portal. The signup form MUST ask for password confirmation, and the server MUST reject a mismatch before creating an account. On a password-confirmation mismatch, the signup page MUST show a clear error and retain the entered email for correction, including when JavaScript is unavailable. Signup and sign-in password fields MUST have an accessible, non-submitting visibility control. Password values MUST NOT be returned in server action error state. The Applicant MUST verify the email address before signing in or using protected Applicant actions. Local development mail delivery and production SMTP configuration are operational setup, not part of the role policy.

Scenario: Given matching passwords and a reachable email address, when the user signs up, then the new account has only the Applicant role, a verification link is sent and protected Applicant actions remain unavailable until confirmation.

Denial scenario: Given different password and confirmation values, when signup is submitted, then no account is created and the user sees a clear error. Given an unverified account, sign-in and protected Applicant actions are denied.

Scenario: Given an entered email and different password values, when signup is attempted, then the user sees the mismatch error, the email remains on the form, and no account is created, with or without JavaScript.

Scenario: Given a password field, when its visibility control is activated, then that field switches between obscured and visible text without submitting the form.

After (complete replacement):

## ACC-001: Public Applicant signup

Public signup MUST create only an Applicant account for this company's portal. The signup form MUST ask for password confirmation, and the server MUST reject a mismatch before creating an account. On a password-confirmation mismatch, the signup page MUST show a clear error and retain the entered email for correction, including when JavaScript is unavailable. Signup and sign-in password fields MUST have an accessible, non-submitting visibility control. Password values MUST NOT be returned in server action error state. The Applicant MUST verify the email address before signing in or using protected Applicant actions. Local development mail delivery and production SMTP configuration are operational setup, not part of the role policy.

Scenario: Given matching passwords and a reachable email address, when the user signs up, then the new account has only the Applicant role, a verification link is sent and protected Applicant actions remain unavailable until confirmation.

Denial scenario: Given different password and confirmation values, when signup is submitted, then no account is created and the user sees a clear error. Given an unverified account, sign-in and protected Applicant actions are denied.

Scenario: Given an entered email and different password values, when signup is attempted, then the user sees the mismatch error, the email remains on the form, and no account is created, with or without JavaScript.

Scenario: Given a password field, when its visibility control is activated, then that field switches between obscured and visible text without submitting the form.

After verification/sign-in, an Applicant with an incomplete required profile MUST enter profile completion before browsing/applying through the signed-in app flow, under ACC-006. Email remains required and read-only from verified Auth; no additional unverified email field is used for profile completion.

Scenario: Given a signed-in incomplete Applicant or invalid required values, when the affected operation is attempted, then readiness/validation blocks it without changing stored data; valid completion permits it. Existing frozen/history/role boundaries remain. See proposal AC01–06 for success/denial/failure evidence.

## ADDED

### ACC-006: Required Applicant profile onboarding

A verified Applicant MUST complete full name and phone, with required read-only email from verified Auth, before browsing job listings/details or starting/saving/submitting applications in the signed-in app flow. Verification/sign-in MUST send incomplete Applicants to profile completion. Signed-in direct listing/filter/detail/apply requests MUST enforce the same redirect before loading jobs. Protected application write RPCs MUST independently require a complete current profile; Applicant AI drafting MUST check readiness before quota/provider calls, without sending profile fields to AI. Readiness MUST derive from current verified identity and persisted nonblank bounded values, never user-editable metadata. Profile/database errors MUST NOT be treated as completed profiles.

Completion MUST preserve guest public browsing and HR role flows. Profile, account verification/recovery/sign-out and owned existing application history/download/withdrawal MUST remain usable without completion to avoid loops or loss of retained-record access. Existing incomplete Applicants MUST complete the same fields when next attempting affected browse/apply operations. A successful first completion MUST lead/offer a fixed internal open-roles destination. HR MUST NOT access Applicant profiles. APP-005/006 own field validation/snapshots; SEC-001/005/007/009 retain private-data/AI boundaries. Public listings remain publicly accessible when signed out or through the public API; this is onboarding, not a secret-data boundary.

Scenarios: Given verified signup/sign-in and missing name/phone, profile completion appears. Given valid required fields and verified email, saving completion unlocks browsing/apply. Given forged metadata, direct RPC or failed lookup, eligibility is not granted. Given HR, guest or owner viewing existing records/withdrawing, the completion gate does not interfere. Recovery and profile routes do not loop.
## REMOVED

None. Proposed deltas remain outside canonical until separate acceptance.
