# Proposed spec delta: deployment and operations

- Change/issue/owner: `2026-10-08-hr-application-review`; [#9](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/9); Paul Cheng; accepted locally 2026-10-08.
- Canonical destination: [OPS-001](../../../specs/deployment-and-operations.md).
- Baseline: ProductSpec v0.7 at `551da67`; accepted text synced to v0.8 on 2026-10-08 before archive.
- Cross-capability: HR migration and preview verification in [design](../design.md); OPS-003 still governs release evidence.
- Approval: Paul Cheng approved this delta and rollout plan with the complete packet in an explicit 2026-10-08 conversation reply. Shared database migration remains a later coordinated operation.

## ADDED

None.

## MODIFIED

### OPS-001: Separate environments

- Before: staging and production must use separate app/database settings; branch-to-environment mapping is unspecified.
- After: Vercel production deployments from `master` MUST use the separate Production Supabase project. Vercel preview deployments from non-`master` branches, including `develop`, MUST use the Development Supabase project. Database migrations MUST be tested locally and reviewed before they are applied to the shared Development Supabase project. A PR preview requiring a new schema MUST be marked not ready for preview smoke until that reviewed migration is applied; migrations MUST remain compatible with the currently deployed `develop` app while previews share the database. Production Supabase schema promotion MUST be a separate reviewed release step before the production app depends on it. Auth callback origins on Vercel MUST continue to derive from Vercel-provided URLs rather than a hardcoded branch URL.
- Rationale/acceptance: user-supplied topology and the shared Development Supabase preview risk; `hr9-AC-07`. This rule does not imply that the projects or migration automation have been verified.
- Scenario: **Given** a PR preview containing new HR tables, **when** it points to Development Supabase before migration, **then** the preview is reported as awaiting the migration; after a reviewed development migration and smoke test, the preview can be assessed without breaking the existing `develop` app.
- Denial/failure scenario: **Given** a preview build or production release, **when** environment settings are checked, **then** a preview cannot use Production Supabase and the production app cannot use Development Supabase. A migration must not be silently applied to production from a feature PR.
- Rule relocation: none.

## REMOVED

None.

## Review and sync

- [x] Complete packet approved by student owner for implementation on 2026-10-08.
- [x] Separate read-only review checked environment/migration plan; hosted compatibility and preview smoke remain pending under the accepted limit.
- [x] Accepted OPS-001 text synced to canonical v0.8 before archive.
- Sync commit: `47c4a3f`. Human decision: 2026-10-08 conversation acceptance with recorded limits; see [record](../record.md).
