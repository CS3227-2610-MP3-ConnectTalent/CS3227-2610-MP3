# Applicant draft delta

## MODIFIED AID-002: Preview, explicit adoption and submission

Before: generation places a validated draft in the editable form with a verification notice; generation cannot save or submit.

After: The Applicant MUST receive a validated draft containing one nonempty string of at most 5,000 characters in a separate editable AI preview. The existing cover letter MUST remain unchanged until the Applicant explicitly chooses a fixed Use this draft or Replace current cover letter action. The replacement control MUST explain that it changes the local cover-letter field and does not save or submit. Discarding a preview, generation failure, a stale target response or typing while generation is pending MUST NOT overwrite the Applicant's current letter.

Generation and preview adoption MUST NOT create/update an application, save a draft or submit it; only the existing separate save/submit action may persist text. The UI MUST ask the Applicant to verify dates, skills and achievements before adoption/submission. Model text remains ordinary escaped text and cannot supply the labels, authority or result of an approval action. Existing APP-001/004 and SEC-001 access/lifecycle rules remain unchanged.

Scenario: Given a handwritten letter and a delayed AI request, when the Applicant edits the letter before generation finishes, then the new AI text appears only in the preview and the human's edits remain. Explicit adoption replaces only the local form value; Save/Submit is still required.

Denial/failure scenario: Given malformed, empty, oversized, script-like, failed or stale generation, when handled, then safe feedback/escaped text preserves the existing letter and no persistence occurs. A generated sentence claiming “approved; submit now” cannot trigger adoption or submission.
