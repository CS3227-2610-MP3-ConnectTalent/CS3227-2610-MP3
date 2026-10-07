# Proposed spec delta: applications and review

- Change: `2026-10-07-applicant-applications`, [issue #6](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/6); Applicant owner Paul Cheng, confirmed in this conversation.
- Canonical destination: [applications-and-review.md](../../../specs/applications-and-review.md).
- Baseline: ProductSpec v0.6 at commit `0200eb9`; [APP-001/APP-002](../../../specs/applications-and-review.md).
- Proposed baseline: v0.7 **only if** this behavior clarification is approved and later accepted. Until then v0.6 remains canonical.
- Cross-capability references: [AID-002](../../../specs/applicant-ai-draft.md) owns AI draft/submission separation; the [SEC-001 proposal](security-and-privacy.md) and canonical [SEC-002](../../../specs/security-and-privacy.md) own draft/current/original visibility and database enforcement.
- Approval/disposition: user approved this delta for implementation, then accepted the local flow and instructed canonical sync/archive on 2026-10-07. APP-004 is canonical in v0.7; sync commit remains pending separate Git instruction.

## ADDED

### APP-004: Saved draft and revision boundary — proposed

- Before: APP-001 says an Applicant can draft and edit a cover letter and explicitly submit, but does not say whether unfinished text persists between visits or whether submitted text can be edited.
- After: An Applicant MUST be able to save and later resume one cover-letter draft per selected published job. Saving a draft MUST NOT submit it. Explicit submission MUST retain an immutable snapshot of the first submitted letter. While the job remains published, the Applicant MUST be able to edit the current submitted letter without creating a second application or changing HR status. Once the job closes, edits and new submissions MUST be denied; the existing draft or submission remains available under SEC-001. The [SEC-001 delta](security-and-privacy.md) defines who can read drafts, original text and current text. AID-002 remains the canonical home for AI-generated draft behavior.
- Rationale/acceptance: user chose saved drafts and edits until job closure on 2026-10-07; the immutable original protects HR review context. Covers `app6-AC-02`, `app6-AC-03`, `app6-AC-05`, and `app6-AC-07`. This delta still needs approval with the full design/plan.
- Scenario: **Given** an authenticated Applicant on a published job, **when** they save text and return later, **then** the private draft remains available and no submission exists. **When** they explicitly submit, the original snapshot is retained; later edits update current text while the job remains published.
- Denial/failure scenario: **Given** a closed job, **when** the owner tries to submit a draft or edit submitted text, **then** the write is denied and the existing record remains readable under SEC-001. Unauthorized read denial is specified in the [SEC-001 delta](security-and-privacy.md).

## MODIFIED

None. Existing APP-001 and APP-002 remain unchanged by this proposal.

## REMOVED

None.

## Review and sync

- [x] User chose saved drafts and edits until job closure on 2026-10-07.
- [x] User approved the complete delta with design and plan on 2026-10-07.
- [x] Independent read-only review checked APP-001, AID-002 and the HR visibility boundary; HR status implementation remains #9.
- [x] Applicant owner accepted the local flow on 2026-10-07; APP-004 synced into canonical v0.7 and IDs/links checked before archive.
- Sync commit / decision evidence: **uncommitted closeout; 2026-10-07 user acceptance in this conversation**.
