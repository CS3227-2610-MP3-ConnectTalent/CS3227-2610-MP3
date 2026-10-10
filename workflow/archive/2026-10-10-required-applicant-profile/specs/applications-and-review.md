# Delta: applications-and-review.md

Issue52; Paul Cheng; proposed 2026-10-10, canonical v1.5. [Canonical](../../../specs/applications-and-review.md). Concrete approval/implementation/sync pending.

## MODIFIED

### APP-005

Before (complete canonical clause):

## APP-005: Applicant identity and contact details

Each new application MUST support a full name, verified account email, optional phone and optional portfolio URL in addition to its cover letter. Full name MUST be trimmed, bounded to 120 characters, exclude control characters and be nonblank on submission; incomplete drafts MAY omit it. Phone MUST be optional trimmed text bounded to 40 characters without control characters. Portfolio URL MUST be optional, bounded to 2,048 characters and, when supplied, an absolute HTTP(S) URL without embedded credentials. Blank optional values MUST be represented as absent. Account email MUST be displayed read-only from verified Auth identity; submission MUST record the current verified email from trusted Auth data, never browser input. Draft field saves MUST persist together with the letter as one revision and MUST NOT submit. Explicit submission MUST atomically freeze these details and the letter. Submitted details MUST be readable by the owner and authorised HR only under SEC-001, including after job closure, and MUST NOT be editable by either role through application writes. HR MUST NOT see draft details. Legacy submissions with absent fields MUST remain readable and clearly indicate details were not provided; missing data MUST NOT be fabricated from mutable account profiles. Existing drafts MAY supply these fields before submitting. Invalid saves/submissions MUST show safe field feedback while retaining entered values, without changing persisted state. APP-001/004 retain one application per job, job closure, submit-once and revision boundaries. SEC-005/007 govern exclusion from AI and logs.

- Given a partial private draft, when saved and resumed, then all entered details and letter persist without submission (form39-AC-01).
- Given a verified Applicant and valid values, when submitted, then trusted email and details freeze atomically; forged email input is ignored or rejected (form39-AC-02).
- Given invalid fields, when saving/submitting, then a safe error retains inputs and no partial write occurs (form39-AC-03).
- Given a submitted application, when the owner/HR open it, then permitted details display; draft/other-owner/anonymous reads are denied (form39-AC-04).
- Given submitted or closed-job records, when a prohibited write is attempted via UI/RPC, then the application is unchanged (form39-AC-05).
- Given a stale or lost-response write, when retried/reconciled, then no mismatched field set is reported saved and duplicate submission does not mutate existing contents (form39-AC-06).
- Given legacy data, when read or completed as a draft, then missing details are labelled or valid details can be submitted (form39-AC-07).

After (complete replacement):

## APP-005: Applicant identity and contact details

Each new application MUST support a full name, verified account email, required phone and optional portfolio URL in addition to its cover letter. Full name MUST be trimmed, bounded to 120 characters, exclude control characters and be nonblank on submission; incomplete drafts MAY omit it. Phone MUST be trimmed text bounded to 40 characters without control characters and nonblank for new submissions; incomplete drafts MAY omit it. Portfolio URL MUST be optional, bounded to 2,048 characters and, when supplied, an absolute HTTP(S) URL without embedded credentials. Blank optional values MUST be represented as absent. Account email MUST be displayed read-only from verified Auth identity; submission MUST record the current verified email from trusted Auth data, never browser input. Draft field saves MUST persist together with the letter as one revision and MUST NOT submit. Explicit submission MUST atomically freeze these details and the letter. Submitted details MUST be readable by the owner and authorised HR only under SEC-001, including after job closure, and MUST NOT be editable by either role through application writes. HR MUST NOT see draft details. Legacy submissions with absent fields MUST remain readable and clearly indicate details were not provided; missing data MUST NOT be fabricated from mutable account profiles. Existing drafts MAY supply these fields before submitting. Invalid saves/submissions MUST show safe field feedback while retaining entered values, without changing persisted state. APP-001/004 retain one application per job, job closure, submit-once and revision boundaries. SEC-005/007 govern exclusion from AI and logs.

- Given a partial private draft, when saved and resumed, then all entered details and letter persist without submission (form39-AC-01).
- Given a verified Applicant and valid values, when submitted, then trusted email and details freeze atomically; forged email input is ignored or rejected (form39-AC-02).
- Given invalid fields, when saving/submitting, then a safe error retains inputs and no partial write occurs (form39-AC-03).
- Given a submitted application, when the owner/HR open it, then permitted details display; draft/other-owner/anonymous reads are denied (form39-AC-04).
- Given submitted or closed-job records, when a prohibited write is attempted via UI/RPC, then the application is unchanged (form39-AC-05).
- Given a stale or lost-response write, when retried/reconciled, then no mismatched field set is reported saved and duplicate submission does not mutate existing contents (form39-AC-06).
- Given legacy data, when read or completed as a draft, then missing details are labelled or valid details can be submitted (form39-AC-07).

New draft/save/submission operations MUST require the current verified Applicant to have a complete profile under ACC-006. Submitted full name, verified email and phone MUST be present; optional fields remain optional. Existing frozen submissions with absent details MUST remain unchanged and readable with Not provided; profile changes MUST NOT supply or rewrite historical snapshots.

Scenario: Given a signed-in incomplete Applicant or invalid required values, when the affected operation is attempted, then readiness/validation blocks it without changing stored data; valid completion permits it. Existing frozen/history/role boundaries remain. See proposal AC01–06 for success/denial/failure evidence.

### APP-006

Before (complete canonical clause):

## APP-006: Private profile and optional background snapshots

A verified Applicant MUST be able to save/resume their own private profile with optional full name, phone, portfolio URL, education and work experience. Existing APP-005 contact limits/validation MUST apply; education and work experience MUST each be optional trimmed plain text of at most 2,000 characters, allowing line breaks/tabs but excluding other control characters. Blank optional values MUST become absent. Verified Auth email MUST display read-only and MUST NOT be supplied by browser input. A new application form with no persisted draft MUST prefill profile fields through ordinary data copying without AI. Existing saved drafts MUST take precedence; profile changes MUST NOT overwrite a draft or submission.

Application education/work experience MUST save atomically with the draft's other fields and MUST freeze on explicit submission with APP-004/005. These optional snapshots MUST be visible only under SEC-001/009, including after closure. HR MUST see submitted snapshots, never the mutable private profile. Legacy absent fields MUST display “Not provided”; no past snapshot may be fabricated from a current profile. Invalid/stale writes MUST retain entered values without a partial write. APP-005's nonblank full-name submission rule remains.

Scenario: Given a private profile and no saved draft, when opening a new application form, then fields prefill without AI. Given an existing draft or submission, profile changes leave its fields unchanged. Unauthorized profile access is denied under SEC-009. Invalid or stale draft writes preserve consistent saved state.

After (complete replacement):

## APP-006: Private profile and optional background snapshots

A verified Applicant MUST be able to save/resume their own private profile with required full name and phone plus optional portfolio URL, education and work experience. Existing APP-005 contact limits/validation MUST apply; education and work experience MUST each be optional trimmed plain text of at most 2,000 characters, allowing line breaks/tabs but excluding other control characters. Blank optional values MUST become absent. Verified Auth email MUST display read-only and MUST NOT be supplied by browser input. A new application form with no persisted draft MUST prefill profile fields through ordinary data copying without AI. Existing saved drafts MUST take precedence; profile changes MUST NOT overwrite a draft or submission.

Application education/work experience MUST save atomically with the draft's other fields and MUST freeze on explicit submission with APP-004/005. These optional snapshots MUST be visible only under SEC-001/009, including after closure. HR MUST see submitted snapshots, never the mutable private profile. Legacy absent fields MUST display “Not provided”; no past snapshot may be fabricated from a current profile. Invalid/stale writes MUST retain entered values without a partial write. APP-005's nonblank full-name submission rule remains.

Scenario: Given a private profile and no saved draft, when opening a new application form, then fields prefill without AI. Given an existing draft or submission, profile changes leave its fields unchanged. Unauthorized profile access is denied under SEC-009. Invalid or stale draft writes preserve consistent saved state.

Saving/completing a profile MUST reject absent or whitespace-only name/phone using APP-005 bounds and control-character rules, and MUST require a nonblank verified Auth email. Completion MUST derive from current persisted values and trusted identity, never browser metadata. Later edits MUST NOT clear required fields. Existing incomplete profiles MUST remain stored until their owner completes them; no fabricated backfill. Readiness/onboarding and history exemptions are canonical in ACC-006.

Scenario: Given a signed-in incomplete Applicant or invalid required values, when the affected operation is attempted, then readiness/validation blocks it without changing stored data; valid completion permits it. Existing frozen/history/role boundaries remain. See proposal AC01–06 for success/denial/failure evidence.

## ADDED

None. ACC-006 owns readiness across these capabilities.

## REMOVED

None. Proposed deltas remain outside canonical until separate acceptance.
