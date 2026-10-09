# Deployment and operations

Baseline: ProductSpec v1.1, 9 October 2026 (OPS-002 updated).

## OPS-001: Separate environments

Vercel production deployments from `master` MUST use the separate Production Supabase project. Vercel preview deployments from non-`master` branches, including `develop`, MUST use the Development Supabase project. Database migrations MUST be tested locally and reviewed before they are applied to the shared Development Supabase project. A PR preview requiring a new schema MUST be marked not ready for preview smoke until that reviewed migration is applied; migrations MUST remain compatible with the currently deployed `develop` app while previews share the database. Production Supabase schema promotion MUST be a separate reviewed release step before the production app depends on it. Auth callback origins on Vercel MUST continue to derive from Vercel-provided URLs rather than a hardcoded branch URL.

Scenario: Given a PR preview containing new HR tables, when it points to Development Supabase before migration, then the preview is reported as awaiting the migration; after a reviewed development migration and smoke test, the preview can be assessed without breaking the existing `develop` app.

Denial/failure scenario: Given a preview build or production release, when environment settings are checked, then a preview cannot use Production Supabase and the production app cannot use Development Supabase. A migration MUST NOT be silently applied to production from a feature PR.

## OPS-002: Operational safeguards and audit evidence

Before enabling either AI feature in an environment, the operator MUST verify the configured SoCLaaS model is available to that key and review that key's current request and budget limits. Each deployment MUST use server-only provider and Supabase credentials and MUST enforce the [SEC-006](security-and-privacy.md) application limits: three requests per user per rolling minute and 24 per deployment per rolling minute. The Supabase secret/service-role credential MUST be used only for quota/audit metadata RPCs; Applicant and HR content reads MUST use the signed-in RLS-scoped session. Development, preview, staging and production SHOULD use separate provider and Supabase keys where available so access and usage are not combined across environments. Operational evidence MUST show bounded output, the 20-second timeout, no automatic provider retry, safe provider 429/5xx handling, metadata-only audit outcomes and rollback by disabling the AI actions while ordinary application submission and HR review remain available.

Scenario: Given an environment configured for AI, when its readiness is reviewed, then model access, key-specific quota, application limits, safe error handling and rollback are verified without sending private applicant text.

Denial/failure scenario: Given missing/invalid credentials, an unavailable model or provider rate limiting, when AI is invoked, then the feature reports a safe retry-later state, forwards only a valid bounded retry delay, never exposes credentials/provider bodies and does not retry automatically.

## OPS-003: Consistent release and recorded evidence

Before release, the deployed release, guides, tests and reflections MUST describe the same behavior. Tests and observed results MUST be recorded in feature records for all nine release acceptance items in the [migration trace](README.md#release-acceptance-trace). A requirement or scenario in these files is not proof it passed.

Scenario: Given a candidate release, when its feature records and release artifacts are reviewed, then actual tests/observations cover all nine items and the deployed behavior, guides, tests and reflections agree.

The source v0.6 stated that the scaffold had not met these criteria. This migration supplies no new runtime or release verification and does not close pending implementation, independent review or human acceptance work.
