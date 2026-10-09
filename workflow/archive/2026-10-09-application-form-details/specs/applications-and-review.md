# Delta: applications and review

Issue #39; owner Paul Cheng; approved for implementation on 2026-10-09 via “Approve as written”; separately accepted with recorded limits on 2026-10-09. Canonical: [applications and review](../../../specs/applications-and-review.md), baseline v1.1. APP-005 is unused on this branch; check concurrent changes again before sync.

## ADDED

### APP-005: Applicant identity and contact details

Before: the form contains only a cover letter; identity/contact fields have no explicit product contract.

After: Each new application MUST support a full name, verified account email, optional phone and optional portfolio URL in addition to its cover letter. Full name MUST be trimmed, bounded to 120 characters, exclude control characters and be nonblank on submission; incomplete drafts MAY omit it. Phone MUST be optional trimmed text bounded to 40 characters without control characters. Portfolio URL MUST be optional, bounded to 2,048 characters and, when supplied, an absolute HTTP(S) URL without embedded credentials. Blank optional values MUST be represented as absent. Account email MUST be displayed read-only from verified Auth identity; submission MUST record the current verified email from trusted Auth data, never browser input. Draft field saves MUST persist together with the letter as one revision and MUST NOT submit. Explicit submission MUST atomically freeze these details and the letter. Submitted details MUST be readable by the owner and authorised HR only under SEC-001, including after job closure, and MUST NOT be editable by either role through application writes. HR MUST NOT see draft details. Legacy submissions with absent fields MUST remain readable and clearly indicate details were not provided; missing data MUST NOT be fabricated from mutable account profiles. Existing drafts MAY supply these fields before submitting. Invalid saves/submissions MUST show safe field feedback while retaining entered values, without changing persisted state. APP-001/004 retain one application per job, job closure, submit-once and revision boundaries. SEC-005/007 govern exclusion from AI and logs.

- Given a partial private draft, when saved and resumed, then all entered details and letter persist without submission (form39-AC-01).
- Given a verified Applicant and valid values, when submitted, then trusted email and details freeze atomically; forged email input is ignored or rejected (form39-AC-02).
- Given invalid fields, when saving/submitting, then a safe error retains inputs and no partial write occurs (form39-AC-03).
- Given a submitted application, when the owner/HR open it, then permitted details display; draft/other-owner/anonymous reads are denied (form39-AC-04).
- Given submitted or closed-job records, when a prohibited write is attempted via UI/RPC, then the application is unchanged (form39-AC-05).
- Given a stale or lost-response write, when retried/reconciled, then no mismatched field set is reported saved and duplicate submission does not mutate existing contents (form39-AC-06).
- Given legacy data, when read or completed as a draft, then missing details are labelled or valid details can be submitted (form39-AC-07).

## MODIFIED

None; APP-005 extends fields without changing APP-001–004 lifecycle.

## REMOVED

None. Canonical sync only after independent review and separate student acceptance.
