# Proposal: signup password usability (#20)

- Change ID: `2026-10-08-signup-password-ux`.
- Issue: [#20](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/20); exact submitted [issue body](issue-body.md).
- Owner: Paul Cheng, Applicant workflow.
- Status: retrospective packet prepared after implementation; no prior packet approval is claimed.
- Baseline: ProductSpec v0.8 on `feat/9-hr-application-review`, from `develop` commit `551da67`.
- Affected requirement: [ACC-001](../../specs/accounts-and-roles.md). Classification: low-risk Applicant behavior improvement.

## Intent and bounded scope

On a signup password mismatch, show a clear error and keep the entered email so the user can correct the password. This must work with JavaScript enabled and disabled. Add accessible show/hide controls to signup password, confirmation and sign-in password fields. Continue rejecting mismatches on the server before creating an account.

No HR self-signup, role-policy change, database migration, credential logging, AI feature, or hosted deployment is in scope. The same Applicant signup route remains the public entry point.

## Acceptance targets

| ID | Given / when / then | Evidence |
| --- | --- | --- |
| `signup20-AC-01` | Given different passwords, when the Applicant submits with JavaScript enabled, then the error appears, email remains, and no signup request is sent. | Focused browser case and server unit test. |
| `signup20-AC-02` | Given JavaScript disabled, when the Applicant submits different passwords, then the server returns the error and retains the email without creating an account. | No-JavaScript browser case and server unit test. |
| `signup20-AC-03` | Given a password field, when the user toggles its eye control, then the text visibility changes without submitting; the button exposes an accessible name and pressed state. | Browser assertion, source review. |
| `signup20-AC-04` | Given matching values, when signup proceeds, then the verification flow and role policy still work. | Complete Applicant browser flow, Auth redirect unit tests and independent source review. |

## Sequence, decisions and risks

The user requested the behavior directly on 2026-10-08. Implementation began before #20 and this packet existed, contrary to the issue-first and pre-implementation packet gate in `workflow/AgentProcess.md`. This packet documents the actual sequence and does not manufacture retrospective approval. The user later explicitly requested issue tracking, evidence, independent review and a commit; this authorizes those actions, but separate student acceptance of #20 remains pending before PR closeout.

The main risk is changing server action error behavior while retaining no account creation on mismatch. The design returns only the email and a generic error, never a password, and leaves the server-side validation in place. Client-only validation was insufficient without JavaScript; the reviewer identified that gap and it was corrected. No hosted behavior is claimed.
