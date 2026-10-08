# Proposed accounts-and-roles delta: password recovery

- Change: `2026-10-08-password-recovery`; [#27](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/27); Paul Cheng; approved for implementation
- Canonical: [accounts-and-roles.md](../../../specs/accounts-and-roles.md); baseline ProductSpec v0.9 at `eeebb75`; proposed v1.0
- Linked boundaries: [SEC-001/002](../../../specs/security-and-privacy.md), [OPS-001](../../../specs/deployment-and-operations.md)
- Approval: Paul Cheng, explicit “Approve as written (Recommended)” reply in this conversation, 8 October 2026. He separately answered “Accept with recorded limits (Recommended)” on 8 October after the local checks and independent review.

## ADDED

### ACC-004: Email password recovery

Before: ACC-001/002 contain no password-recovery requirement.

After: An Applicant or HR user MUST be able to request a password reset link to their account email from sign-in. The app MUST give the same visible acknowledgement whether the email belongs to an account. A valid unused Supabase recovery link MUST establish the matching user's session through the trusted callback, after which the user MAY set a new password that passes server validation and matches a confirmation field. Password input MUST NOT appear in returned action state or logs. Invalid, expired, reused and absent links MUST NOT establish a recovery session; an unauthenticated user MUST NOT change a password and MUST have a new-request path. Recovery MUST NOT create an account, change its role, or bypass existing access checks. The reset action MUST verify the current authenticated user before updating that user's password. These rules apply to both roles; SEC-001/002 boundaries remain authoritative.

Scenario: **Given** a verified Applicant or HR account, **when** its user follows a valid reset link and submits matching valid passwords, **then** only that account's password changes and normal sign-in reaches its existing role interface.

Denial/failure: **Given** an unknown address, **when** reset is requested, **then** the public response does not reveal account existence. **Given** a missing, invalid, expired or reused link and no preexisting session, **when** update is attempted, **then** no password changes and a retry path is shown. **Given** mismatched passwords, **when** update is attempted, **then** no password changes. **Given** an Applicant, **when** recovery completes, **then** HR access remains denied.

Rationale: `recovery27-AC-01` through `recovery27-AC-04`.

## MODIFIED

None; ACC-001 signup and ACC-002 HR assignment retain their rules.

## REMOVED

None.

## Sync

- [x] Concrete delta approved before implementation.
- [x] Accepted ACC-004 synced to `workflow/specs/accounts-and-roles.md` with ProductSpec/spec index v1.0 on 8 October 2026; commit pending.
