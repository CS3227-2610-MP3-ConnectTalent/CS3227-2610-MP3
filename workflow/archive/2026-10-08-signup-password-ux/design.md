# Design record: signup password usability (#20)

This is a retrospective description of the implemented design, not evidence of design approval before coding.

- `SignUpForm` is a client component with immediate mismatch handling. It prevents a mismatched submit and retains the current form fields.
- The `signUp` server action also rejects a mismatch. `useActionState` returns only `{ email, error }` for validation/Auth errors; no password appears in response state or URL. React's progressive form behavior returns the email when JavaScript is unavailable.
- `PasswordInput` is a focused reusable component for signup and sign-in. Its `type="button"` control toggles only that input's visibility and exposes `aria-label`/`aria-pressed`.
- Auth role assignment, verification and Supabase data access are unchanged. No schema, migration or privileged key is involved.
- Rollback is to revert the #20 form/action/component commit; the server mismatch rejection and public Applicant-only signup remain the safety boundary.
