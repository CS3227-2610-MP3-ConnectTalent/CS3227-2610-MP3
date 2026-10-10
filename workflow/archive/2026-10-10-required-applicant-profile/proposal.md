# Proposal: required Applicant profile and phone (#52)

Owner Paul Cheng; 10 October 2026. [Issue #52](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/52). Approved as written on 2026-10-10; branch permission pending and implementation deferred for résumé-first #53. Current preparation branch feat/49-50-application-form-withdrawal contains accepted uncommitted work; canonical baseline v1.5. Original proposed gate wording below is historical; [record](record.md) identifies actual decisions. No runtime/schema changes in this packet.

## Request and current behavior

Paul requests mandatory name, email and phone, with profile completion after signup before seeing open roles. Current profile accepts empty name/phone and calls every editable field optional. Verified email is already trusted and read-only. Sign-in/confirmation routes do not check profile completion; browsing is public. Application submission requires name but not phone.

## Proposed contract

1. Signup remains email/password/confirmation plus verification. On successful confirmation or later sign-in, an Applicant with missing name/phone goes to **Complete your profile**. Name and phone are required to save the completed profile; email is required, verified and read-only from Auth.
2. Full name is trimmed nonblank text up to 120 characters. Phone is trimmed nonblank text up to 40 characters, with existing control-character denial. No country-specific formatting rule or claim of phone-number verification. Portfolio, education/work experience and PDF remain optional.
3. Signed-in incomplete Applicants visiting listings, category filters, job detail or apply are redirected to profile before page data loading. Application save/submit operations require current profile completion on server and database; published-job AI drafting likewise checks readiness before provider calls. Guest public browsing and HR stay available. This is an onboarding rule, not confidentiality for publicly readable jobs; signing out/public API browsing remains possible.
4. Existing incomplete Applicants are subject to the same readiness check on their next browse/apply operation. Existing application history/download/withdrawal and password recovery/sign-out remain accessible without a completed profile. Avoid loops: profile and Auth routes never require completion.
5. New submissions require nonblank name and phone plus trusted verified email. Application fields still belong to the application snapshot: profile changes do not overwrite existing drafts/submissions. Drafts may remain incomplete, but cannot be submitted without required details. Existing frozen submissions with missing phone are retained and labelled Not provided; no fabricated/backfilled personal information.
6. Successful first profile completion offers/redirects to open roles. Later profile editing remains available; fields cannot be cleared to make the saved profile incomplete. Lookup failures give safe retry feedback and do not treat errors as complete.

## Acceptance map

| ID | Requirement | Evidence planned |
| --- | --- | --- |
| AC01 | ACC-001/006, APP-006 | Verified signup/sign-in with absent profile reaches completion screen; empty/whitespace name/phone rejected, email read-only; unit/browser/SQL. |
| AC02 | APP-005/006 | Valid required fields persist; optional fields can stay empty; phone/name bounds and no control characters; client/server/SQL parity. |
| AC03 | ACC-006, JOB-001/003 | Incomplete signed-in Applicant direct listing/filter/detail/apply URLs go to profile before page data loading; complete Applicant/guest/HR expected routes; browser and loader tests. Public API is not a secrecy boundary. |
| AC04 | ACC-006, APP-005/006 | Direct application RPC without ready profile or submitted phone fails; AI endpoint makes no provider call for incomplete Applicant; profile/role forgery denied. |
| AC05 | APP-002/005/006/008, SEC-001/009 | Legacy immutable submission stays readable; own history/download/withdrawal and HR flow retained; no draft/profile leak or mutable-profile backfill. |
| AC06 | ACC-004/005/006 | Sign-out/recovery/profile navigation do not loop; failed/stale profile save preserves input and does not claim completion. Keyboard/mobile form checks. |

## Scope, risks and gates

No HR onboarding, SMS verification, resume parsing, public-job confidentiality, required education/experience/portfolio/PDF, account deletion or hosted changes. Name/email/phone stay excluded from AI payloads under existing SEC-005/007/009. Existing public job RLS remains public; current readiness is enforced for Applicant workflow writes. Additive/backward-compatible migration preserves legacy nulls and frozen records; old application clients may receive required-field errors after rollout, so coordinate deployment.

This default interpretation gates signed-in Applicants after signup, while guests can still browse. The complete packet requires Paul's approval under AGENTS.md. New issue-linked branch creation also requires his explicit permission. No commit/push/PR/hosted operation included. [Design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md); [accounts delta](specs/accounts-and-roles.md), [application delta](specs/applications-and-review.md), [listing delta](specs/public-job-listings.md).
