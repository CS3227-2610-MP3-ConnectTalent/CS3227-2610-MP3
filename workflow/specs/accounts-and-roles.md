# Accounts and roles

Baseline: ProductSpec v1.7, 10 October 2026 (accepted #52 required profile onboarding; earlier role/recovery rules retained).

## ACC-001: Public Applicant signup

Public signup MUST create only an Applicant account for this company's portal. The signup form MUST ask for password confirmation, and the server MUST reject a mismatch before creating an account. On a password-confirmation mismatch, the signup page MUST show a clear error and retain the entered email for correction, including when JavaScript is unavailable. Signup and sign-in password fields MUST have an accessible, non-submitting visibility control. Password values MUST NOT be returned in server action error state. The Applicant MUST verify the email address before signing in or using protected Applicant actions. Local development mail delivery and production SMTP configuration are operational setup, not part of the role policy.

Scenario: Given matching passwords and a reachable email address, when the user signs up, then the new account has only the Applicant role, a verification link is sent and protected Applicant actions remain unavailable until confirmation.

Denial scenario: Given different password and confirmation values, when signup is submitted, then no account is created and the user sees a clear error. Given an unverified account, sign-in and protected Applicant actions are denied.

Scenario: Given an entered email and different password values, when signup is attempted, then the user sees the mismatch error, the email remains on the form, and no account is created, with or without JavaScript.

Scenario: Given a password field, when its visibility control is activated, then that field switches between obscured and visible text without submitting the form.

After verification/sign-in, an Applicant with an incomplete required profile MUST enter profile completion under ACC-006 before other signed-in product access. Email MUST remain read-only from verified Auth. This uses a restricted authenticated session for secure profile saving, not an unauthenticated profile write.

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

## ACC-005: Account navigation and sign out

Public job browsing/detail pages and protected Applicant/HR pages MUST provide consistent account navigation. Guests MUST have Sign in and Create account links without protected role dashboards. Verified Applicants MUST have an Applicant label, My applications link and Sign out action. Verified HR MUST have an HR label, Application review and Manage jobs links and Sign out action, without Applicant dashboard or apply controls. Role display MUST derive from the server-verified current user and database profile, never user-editable metadata. Navigation MUST NOT replace server or database authorization. Authenticated accounts without a verified supported role MUST have a generic account indication and sign out, without role-specific links. Authentication/profile lookup failures MUST NOT expose privileged role controls. A successful sign out MUST return to guest navigation and require authentication for subsequent protected requests. A failed sign out MUST give generic retry feedback and MUST NOT claim success. No password, key or private application information may appear in navigation or error feedback.

- Given a guest browsing an opening, when navigation renders, then account access links appear and no role dashboard appears (nav36-AC-01).
- Given a verified Applicant or HR account, when public or protected product pages render, then only that role's links and its label appear, with Sign out (nav36-AC-02/03).
- Given HR browsing a published job, when job detail renders, then no Applicant apply control appears (nav36-AC-03).
- Given a signed-in user, when sign out succeeds, then guest navigation appears and protected routes require login; when the provider reports failure, then generic retry feedback appears without a success claim (nav36-AC-04).
- Given an unverified account, missing/unknown role, failed role query or forged user metadata, when navigation renders, then no unsupported role controls appear (nav36-AC-05).

ACC-006 qualifies Applicant navigation during onboarding: incomplete Applicants MUST see My profile and Sign out only; Careers MUST lead to My profile and My applications MUST remain unavailable. Complete Applicants MUST have My profile and My applications alongside their role label and Sign out. HR and guest navigation are unchanged.

## ACC-006: Required Applicant profile onboarding

A verified Applicant MUST complete full name and phone, with required read-only verified Auth email, before accessing other signed-in product pages/actions. Verification/sign-in MUST send incomplete Applicants directly to My profile. Listings/filter/detail/apply, My applications and application details/download/withdrawal MUST enforce the same readiness gate on direct server requests; application writes and new application-file allocation MUST independently require readiness in the database. Applicant AI drafting MUST check readiness before quota/provider calls, without sending profile fields to AI. Readiness MUST derive from trusted verified identity and validated persisted name/phone, never user-editable metadata. Failed lookups MUST NOT grant completion.

My profile, owned optional profile-file actions, account verification/recovery and Sign out MUST remain available during onboarding. Completion restores retained-record access without modifying saved drafts or frozen submissions. Existing incomplete Applicants MUST complete the same fields; no fabricated backfill. First successful completion MUST lead to a fixed internal open-roles destination. HR MUST NOT browse Applicant profiles and MUST NOT be subject to Applicant readiness. Guests retain public published-job browsing; onboarding is not confidentiality for publicly readable jobs. Field format/snapshot rules are owned by APP-005/006; existing SEC privacy and role boundaries remain.

Scenarios: Given verified signup/sign-in with absent or malformed required profile data, My profile is the only product destination and direct restricted requests are blocked. Given a valid saved name/phone and verified email, browsing/applications unlock and new applications prefill those details without AI. Given forged metadata or a failed lookup, readiness remains denied. Profile résumé upload alone does not complete onboarding. Guest/HR/recovery/sign-out flows remain usable. After completing a current profile, the owner can access and withdraw a legacy submission without rewriting its historical phone or other frozen fields.
