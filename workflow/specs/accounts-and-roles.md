# Accounts and roles

Baseline: ProductSpec v1.0, 8 October 2026 (ACC-004 added; ACC-001 updated in v0.9; ACC-002 updated in v0.8).

## ACC-001: Public Applicant signup

Public signup MUST create only an Applicant account for this company's portal. The signup form MUST ask for password confirmation, and the server MUST reject a mismatch before creating an account. On a password-confirmation mismatch, the signup page MUST show a clear error and retain the entered email for correction, including when JavaScript is unavailable. Signup and sign-in password fields MUST have an accessible, non-submitting visibility control. Password values MUST NOT be returned in server action error state. The Applicant MUST verify the email address before signing in or using protected Applicant actions. Local development mail delivery and production SMTP configuration are operational setup, not part of the role policy.

Scenario: Given matching passwords and a reachable email address, when the user signs up, then the new account has only the Applicant role, a verification link is sent and protected Applicant actions remain unavailable until confirmation.

Denial scenario: Given different password and confirmation values, when signup is submitted, then no account is created and the user sees a clear error. Given an unverified account, sign-in and protected Applicant actions are denied.

Scenario: Given an entered email and different password values, when signup is attempted, then the user sees the mismatch error, the email remains on the form, and no account is created, with or without JavaScript.

Scenario: Given a password field, when its visibility control is activated, then that field switches between obscured and visible text without submitting the form.

## ACC-002: Controlled HR assignment

Under ACC-001, public signup creates only an Applicant account. For this release, only a verified account with no existing Applicant applications MAY be assigned the HR role, by a designated administrator through a privileged, recorded manual operation outside the public app. Neither self-service profile writes, signup metadata, nor an Applicant request may grant HR access. The app MUST check the current verified user's database role for each HR page and write action; role-aware sign-in MUST send authorized HR to the HR interface and Applicants to their own interface. The access boundary for role assignment is canonical in [SEC-001](security-and-privacy.md).

Scenario: Given a verified account and an authorized administrator, when the administrator assigns HR through the controlled operation, then the user can sign in and use HR routes.

Denial scenario: Given an Applicant who alters signup data or sends an HR route/action request, when the server and database check their role, then the request cannot confer HR access.

## ACC-003: Distinct role interfaces and human control

Browser flows MUST demonstrate distinct Applicant and HR interfaces with human-controlled submission and status changes. See [APP-001 / APP-003](applications-and-review.md) and [AID-002](applicant-ai-draft.md). Protected-record and AI endpoint authorization follow [SEC-001 / SEC-002](security-and-privacy.md).

Scenario: Given each role's browser flow, when an Applicant submits final text or HR updates status, then the respective human performs the explicit action in that role's interface.

## ACC-004: Email password recovery

An Applicant or HR user MUST be able to request a password reset link to their account email from sign-in. The app MUST give the same visible acknowledgement whether the email belongs to an account. A valid unused Supabase recovery link MUST establish the matching user's session through the trusted callback, after which the user MAY set a new password that passes server validation and matches a confirmation field. Password input MUST NOT appear in returned action state or logs. Invalid, expired, reused and absent links MUST NOT establish a recovery session; an unauthenticated user MUST NOT change a password and MUST have a new-request path. Recovery MUST NOT create an account, change its role, or bypass existing access checks. The reset action MUST verify the current authenticated user before updating that user's password. These rules apply to both roles; SEC-001/002 boundaries remain authoritative.

Scenario: Given a verified Applicant or HR account, when its user follows a valid reset link and submits matching valid passwords, then only that account's password changes and normal sign-in reaches its existing role interface.

Denial/failure: Given an unknown address, when reset is requested, then the public response does not reveal account existence. Given a missing, invalid, expired or reused link and no preexisting session, when update is attempted, then no password changes and a retry path is shown. Given mismatched passwords, when update is attempted, then no password changes. Given an Applicant, when recovery completes, then HR access remains denied.
