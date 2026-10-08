# Proposed spec delta: accounts and roles

- Change/issue/owner: `2026-10-08-hr-application-review`; [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9); Paul Cheng; accepted locally 2026-10-08.
- Canonical destination: [ACC-002](../../../specs/accounts-and-roles.md).
- Baseline: ProductSpec v0.7 at `551da67`; accepted text synced to v0.8 on 2026-10-08 before archive.
- Cross-capability: [SEC-001 delta](security-and-privacy.md) owns role access; [APP-003 delta](applications-and-review.md) owns HR review.
- Approval and acceptance: Paul Cheng approved this delta with the complete packet, then separately accepted the local feature with recorded limits on 2026-10-08. Synced to canonical v0.8.

## ADDED

None.

## MODIFIED

### ACC-002: Controlled HR assignment

- Before: HR accounts must be assigned through a controlled administrative step, but the mechanism is unspecified.
- After: Under ACC-001, public signup creates only an Applicant account. For this release, only a verified account with no existing Applicant applications MAY be assigned the HR role, by a designated administrator through a privileged, recorded manual operation outside the public app. Neither self-service profile writes, signup metadata, nor an Applicant request may grant HR access. The app MUST check the current verified user's database role for each HR page and write action; role-aware sign-in MUST send authorized HR to the HR interface and Applicants to their own interface.
- Rationale/acceptance: user chose this provisioning method; `hr9-AC-01`.
- Scenario: **Given** a verified account and an authorized administrator, **when** the administrator assigns HR through the controlled operation, **then** the user can sign in and use HR routes.
- Denial scenario: **Given** an Applicant who alters signup data or sends an HR route/action request, **when** the server and database check their role, **then** the request cannot confer HR access.
- Rule relocation: none; [SEC-001](../../../specs/security-and-privacy.md) remains the canonical access matrix.

## REMOVED

None.

## Review and sync

- [x] Complete packet approved by the Applicant workflow owner for implementation on 2026-10-08.
- [x] Separate read-only review checked role assignment and HR authorization; no confirmed bypass.
- [x] Accepted text synced to canonical ACC-002 in v0.8 before archive.
- Sync commit: `47c4a3f`. Human decision: 2026-10-08 conversation acceptance with recorded limits; see [record](../record.md).
