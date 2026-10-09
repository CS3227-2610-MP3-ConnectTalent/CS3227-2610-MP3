# Spec delta: Applications and review

- Change/issues/owner/status: 2026-10-09-soclaas-ai; #7 and #10; John; delta and plan approved, implementation in progress
- Canonical file: [applications-and-review.md](../../../specs/applications-and-review.md)
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4; APP-004 Saved draft and revision boundary
- Proposed baseline: v1.1
- Dependencies/cross-capability IDs: AID-002, AIS-001, SEC-001, SEC-002, SEC-007
- Approval: John approved the written delta in chat on 2026-10-09; he reported coordinating with Paul on the process-owner impact.

## MODIFIED

### APP-004: Saved draft and revision boundary

- Before: An Applicant can save and resume one cover-letter draft per selected published job. Explicit submission retains an immutable first-submitted snapshot. While the job remains published, the Applicant can edit the current submitted letter; after closure, edits and new submissions are denied.
- After: An Applicant MUST be able to save and later resume one cover-letter draft per selected published job. Saving MUST NOT submit it. An Applicant MAY edit a saved draft while its job is published. Explicit submission MUST retain the first-submitted letter as an immutable snapshot and MUST freeze the current application letter. The Applicant MUST NOT edit any submitted application through the UI or a direct request, even while the job remains published. The Applicant UI MUST tell an Applicant who needs a post-submission correction to contact HR. HR continues to read submitted applications and the distinct original/current values where they differ. Closing a job MUST continue to deny draft edits and new submissions while existing records remain readable under SEC-001.
- Rationale/acceptance IDs: A stable submitted letter is the HR/AI review source; AI-AC-02 and AI-AC-04.
- Scenario: Given an authenticated Applicant and a published job, when the Applicant edits a saved draft and explicitly submits it, then the submission is stored and the current letter becomes immutable. Given a generated AI draft, when it is returned, then it remains editable and no application write occurs until the Applicant separately saves or submits.
- Denial/failure scenario: Given a submitted application, when its owner calls the old edit endpoint/RPC directly or uses the UI, then the current letter and status remain unchanged and correction guidance is shown. Given a closed job, draft edits and new submissions remain denied.
- Rule relocation, if any: None. Cross-role access remains canonical in SEC-001.

## Delta review and sync evidence

- [x] The affected behavior and stable APP-004 ID are identified.
- [x] John approved this written delta on 2026-10-09.
- [x] John reported coordination with the existing Applicant process owner, Paul Cheng, on 2026-10-09; not independently verified.
- [ ] Do not sync to the canonical specification until post-implementation acceptance.
- Sync commit/paths/decision evidence: Pending; no canonical file changed.
