## Expected behavior

Under ACC-001, a password mismatch is rejected before account creation and produces a clear error. The signup form should retain the entered email, including when JavaScript is unavailable. Signup password and confirmation fields, and the sign-in password field, should each have an accessible show/hide control that does not submit the form.

## Actual behavior

The baseline server action redirected to `/auth/sign-up?error=password-mismatch`, remounting the form and clearing the email. Password fields had no visibility control.

## Reproduction steps

1. Open `/auth/sign-up`, enter a synthetic email and two different valid-length passwords.
2. Submit. The mismatch error appears, but the email field is empty in the baseline implementation.
3. Inspect signup and sign-in password fields: no show/hide button exists in the baseline implementation.

## Environment and evidence

Local Next.js/Supabase, Applicant public signup, Windows, `feat/9-hr-application-review` from `develop` commit `551da67`. Source evidence: baseline `src/app/auth/sign-up/page.tsx` and `src/app/auth/actions.ts`. The follow-up was implemented locally before this issue was opened; this ordering gap will be recorded in the change packet. Focused browser tests, including one with JavaScript disabled, and the complete local browser suite passed after the change. No hosted result is claimed.

## Affected requirements and impact

ACC-001 signup mismatch behavior. No account or role-policy change; ACC-002 HR assignment remains controlled and unaffected. Low-risk Applicant usability issue. The server still rejects mismatches before calling Supabase Auth. No privileged data or hosted deployment is involved.

## Proposed owner and dependencies

Paul Cheng, Applicant workflow. The #9 branch is the current checkout; this follow-up needs separate evidence and review from the accepted #9 work.
