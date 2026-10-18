# Proposed ACC-001 delta for #20

Status: accepted by Paul Cheng on 2026-10-08; synced to canonical ACC-001 v0.9 before packet archive. This proposed delta is retained as history.

## MODIFIED ACC-001: Public Applicant signup

Add: On a password-confirmation mismatch, the signup page MUST show a clear error and retain the entered email for correction, including when JavaScript is unavailable. Signup and sign-in password fields MUST have an accessible, non-submitting visibility control. Password values MUST NOT be returned in server action error state. The existing server-side rejection before account creation and email-verification requirement remain in force.

Scenario: Given an entered email and different password values, when signup is attempted, then the user sees the mismatch error, the email remains on the form, and no account is created, with or without JavaScript.

Scenario: Given a password field, when its visibility control is activated, then that field switches between obscured and visible text without submitting the form.
