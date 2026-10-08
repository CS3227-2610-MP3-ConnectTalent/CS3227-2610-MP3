# Deployment and operations

Baseline: ProductSpec v0.8, 8 October 2026 (OPS-001 updated).

## OPS-001: Separate environments

Vercel production deployments from `master` MUST use the separate Production Supabase project. Vercel preview deployments from non-`master` branches, including `develop`, MUST use the Development Supabase project. Database migrations MUST be tested locally and reviewed before they are applied to the shared Development Supabase project. A PR preview requiring a new schema MUST be marked not ready for preview smoke until that reviewed migration is applied; migrations MUST remain compatible with the currently deployed `develop` app while previews share the database. Production Supabase schema promotion MUST be a separate reviewed release step before the production app depends on it. Auth callback origins on Vercel MUST continue to derive from Vercel-provided URLs rather than a hardcoded branch URL.

Scenario: Given a PR preview containing new HR tables, when it points to Development Supabase before migration, then the preview is reported as awaiting the migration; after a reviewed development migration and smoke test, the preview can be assessed without breaking the existing `develop` app.

Denial/failure scenario: Given a preview build or production release, when environment settings are checked, then a preview cannot use Production Supabase and the production app cannot use Development Supabase. A migration MUST NOT be silently applied to production from a feature PR.

## OPS-002: Operational safeguards and audit evidence

Operational evidence MUST demonstrate [SEC-006](security-and-privacy.md) limits, caps, timeouts and retry/error handling, and [SEC-007](security-and-privacy.md) audit fields/privacy. Those requirements have one canonical home in the security specification; exact quota thresholds remain unresolved pending SoC LLM quota review.

Scenario: Given release evidence for model outage/quota errors and audited operations, when reviewed, then it shows the safeguards and audit rules rather than recording sensitive letter text or keys.

## OPS-003: Consistent release and recorded evidence

Before release, the deployed release, guides, tests and reflections MUST describe the same behavior. Tests and observed results MUST be recorded in feature records for all nine release acceptance items in the [migration trace](README.md#release-acceptance-trace). A requirement or scenario in these files is not proof it passed.

Scenario: Given a candidate release, when its feature records and release artifacts are reviewed, then actual tests/observations cover all nine items and the deployed behavior, guides, tests and reflections agree.

The source v0.6 stated that the scaffold had not met these criteria. This migration supplies no new runtime or release verification and does not close pending implementation, independent review or human acceptance work.
