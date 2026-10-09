# Design: application identity/contact fields

Issue #39; Paul Cheng; 2026-10-09; approved for implementation. Inputs: [proposal](proposal.md), [application delta](specs/applications-and-review.md), [privacy delta](specs/security-and-privacy.md).

## Decisions and data flow

Store nullable `full_name`, `submitted_email`, `phone`, `portfolio_url` on the existing application row. Nullable columns preserve legacy submissions and partial drafts. The submitted email is filled only by the submission transaction from the confirmed current Auth user. Do not backfill old submitted records from present-day Auth values. Old records remain immutable with “Not provided” display; current draft email is read-only live verified account data, not a persisted client-supplied email.

Applicant form → server action + requireApplicant → bounded validation → versioned save/submit RPC → database verified current role, job lock, application advisory/row lock, expected revision → atomic write and existing submission audit trigger → protected read. Keep queries/validation in focused src/lib modules. HR detail adds a contact section from submitted-only query; name may identify submitted rows in the HR list. No public job changes or new auth roles.

Use versioned detail RPCs instead of ambiguous PostgREST overloads. Revoke authenticated execution on legacy application write RPCs at cutover, keeping definitions for rollback and preserving private administrative use. New RPCs must enforce every old guard plus field validation, trusted email, freeze and audit. Direct table writes stay denied; no service-role client in normal form actions. If narrowly privileged RPC code is needed, use a private implementation with explicit verified role/owner checks, empty search_path and revoked PUBLIC execute; the exposed interface must have explicit grants and preserve signed-in identity.

Full name/phone are not authorization inputs. Optional phone allows international formats without pretending to verify ownership. Portfolio parser allows only HTTP(S), rejects credentials/control characters and never fetches remote content. Render plain escaped text; any outbound link uses safe scheme and noreferrer/noopener. Structured fields remain outside existing explicit AI select lists and prompt builders.

## Failure/retry behavior

Use structured server action state (or equivalent validated form state) to retain name/phone/portfolio/letter on validation, stale revision and provider/database errors; never put private values in query strings. Server still rechecks auth independently. No partial field/letter writes.

Save reconciliation must compare the entire normalized field set, letter and revision outcome, not just letter equality. Duplicate submission may navigate to the already frozen record with an explicit already-submitted notice; it must never claim different attempted details were newly saved. Unexpected trusted-email lookup failure prevents submission. Preserve existing optimistic concurrency and job-close locking. Cover-letter AI controls change only cover-letter state and cannot overwrite contact input.

## Migration and compatibility

Add a new migration; do not edit historical files. Preserve existing frozen original/current letters, statuses, HR notes and metadata-only submission audit triggers. New submitted records must satisfy field requirements through the new RPCs; existing rows need no forced private-data backfill. Preserve old drafts until filled.

This is a coordinated write-API cutover: after legacy execution is revoked, older deployed code can still read applications but its save/submit calls fail safely. It is not fully write-backward-compatible. Before shared Development migration, coordinate with the teammate and confirm the new PR preview is ready; record any short old-app write interruption. No hosted migration during local implementation. Before production, use an agreed submission maintenance window and deploy tested code/migration together. Do not leave a legacy RPC path that silently permits new required-field bypass.

## Rollout / rollback

Local migrate without resetting data; test legacy fixtures, permission denials, full pipeline and races. Shared Development migration and Vercel smoke require later explicit operation/target verification. Production is separate. Rollback uses a reviewed compensating migration restoring old RPC grants only with an explicit student decision to suspend the new mandatory-field policy, then compatible code rollback. Retain added columns/snapshots; do not drop user data. Otherwise prefer fix-forward while writes fail closed. No automatic destructive database reset.

## Scope / open decisions

Allowed: application form/action and input/retry modules, Applicant/HR application queries/pages, additive migration and meaningful unit/DB/browser tests, docs and packet evidence. Existing AI provider/quota/prompt features, SMTP/env configuration and PR #38 navigation implementation are excluded; AI boundary tests may verify unchanged data projection. Proposed bounds, legacy handling and coordinated cutover were approved by Paul as recorded below. Design review is primary-agent analysis so far, not independent verification.

Implementation approval: Paul Cheng, 2026-10-09, explicit “Approve as written” reply to the question naming #39 proposal, both deltas, design and plan, including limits, freeze, legacy display and coordinated cutover. Separate acceptance with recorded limits was received on 2026-10-09; see record.md for sync/archive and remaining hosted gates.

Implementation clarification: use the dedicated unexposed application_private schema so existing HR private-schema usage stays intact. Validation matches server Unicode trimming and rejects malformed numeric/credential portfolio authorities. The final server action is unbound with a validated hidden jobId and stable form permalink; this repaired an observed no-JavaScript response hang without changing role/owner policy.
