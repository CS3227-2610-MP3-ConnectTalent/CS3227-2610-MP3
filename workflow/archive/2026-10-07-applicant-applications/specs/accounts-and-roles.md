# Proposed spec delta: Applicant signup

- Change: `2026-10-07-applicant-applications`, [issue #6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6).
- Canonical destination: [accounts-and-roles.md](../../../specs/accounts-and-roles.md), ACC-001.
- Baseline: ProductSpec v0.6 at `0200eb9`; proposed v0.7 after human acceptance and sync.
- Decision source: user approved required email verification and a 5,000-character letter limit earlier on 2026-10-07, then explicitly requested password confirmation for signup in a follow-up message. This delta records that correction; it does not claim feature acceptance.
- Later disposition: Applicant owner accepted the local flow and instructed sync/archive on 2026-10-07. ACC-001 is canonical in v0.7; sync commit is pending separate Git instruction.

## ADDED

None.

## MODIFIED

### ACC-001: Public Applicant signup — proposed clarification

- Before: Public signup creates an Applicant account; verification and password confirmation are unspecified.
- After: Public signup MUST create only an Applicant account. The signup form MUST ask for password confirmation, and the server MUST reject a mismatch before creating an account. The Applicant MUST verify the email address before signing in or using protected Applicant actions. Local development mail delivery and production SMTP configuration are operational setup, not part of the role policy.
- Scenario: **Given** matching passwords and a reachable email address, **when** the user signs up, **then** a verification link is sent and protected Applicant actions remain unavailable until confirmation.
- Denial scenario: **Given** different password and confirmation values, **when** signup is submitted, **then** no account is created and the user sees a clear error. **Given** an unverified account, sign-in and protected Applicant actions are denied.
- Evidence target: `app6-AC-01`; browser signup/mismatch/verification tests and database role/verified-user denials.

## REMOVED

None.

## Review and sync

- [x] User explicitly requested password confirmation and had approved email verification in the 2026-10-07 chat.
- [x] Independent read-only review completed; Applicant owner accepted the local flow on 2026-10-07 in this conversation.
- [x] Accepted text synced into canonical ACC-001 under v0.7 and IDs/links checked before archive. Sync commit pending separate Git instruction.
