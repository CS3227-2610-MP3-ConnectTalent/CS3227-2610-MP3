# Design: required profile onboarding (#52)

Proposed; Paul Cheng, 2026-10-10. [Proposal](proposal.md), [plan](plan.md). Implementation must preserve accepted uncommitted #49/#50 and keep the separate issue scope reviewable.

## Flow and boundaries

Auth signup → email verification → role lookup → Applicant profile readiness → profile completion or normal Applicant flow. HR goes directly to its dashboard. Recovery callbacks retain their dedicated route. For browsing/apply, identify current verified role before querying jobs; incomplete Applicant redirects to profile. Guests/HR retain published browsing. Error loading a known Applicant's profile fails closed with safe retry UI; unsupported roles do not become Applicants.

Keep `requireApplicant` role verification distinct from a new ready-profile guard so profile/history/withdrawal/recovery remain accessible and no recursive redirect arises. A focused server-only profile module owns read/readiness, with one validated predicate reused by loaders/actions. Completion is derived from current verified Auth email plus persisted trimmed name/phone; never a user-editable metadata flag or an independent boolean that can become stale.

Profile save validates name/phone before RPC, repeats validation and current verified Applicant checks in SQL, and writes atomically. Existing profile rows may have nulls until completion; avoid global NOT NULL migration/backfill. Existing save/submit RPCs gain readiness checks under the existing lock discipline; full name/phone are nonblank on new submission. Existing snapshots/freeze/withdrawal guards remain. If concurrent profile/application operations require locking, use one documented consistent order; never require profile completion for retained-record reads or withdrawal.

AI drafting checks ready-profile eligibility but never selects contact fields into provider inputs. Gate before quota/provider. HR summary behavior remains unchanged. Public job RLS is deliberately unchanged because listings remain public to guests: this is onboarding, not secrecy.

Profile UI marks name/phone Required; email verified/read-only. First completion uses a fixed internal careers destination (no untrusted return URL). Existing draft values take precedence over profile autofill; required application phone is checked at submission with safe retained field errors. No phone-format guess beyond current 40-character/control-character contract.

## Rollout, failure and rollback

Create additive migration via CLI after approval; local synthetic test-first checks before shared rollout. Deploy checked migration and compatible app in coordinated Development cutover; hosted operations need separate authorization. Stale legacy clients may see required-field errors. Rollback keeps existing profiles/snapshots and frozen records; do not invent/backfill missing phone. Auth/profile read errors never claim a completed profile. Resetting local/hosted data is outside this plan.

No external service beyond existing Auth/AI; secrets unchanged. Independent review must inspect readiness denial, redirect-loop safety, RPC enforcement, legacy/null compatibility and data minimization before separate human acceptance.
