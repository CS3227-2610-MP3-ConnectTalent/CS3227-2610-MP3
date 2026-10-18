# Design: form integration and retained withdrawal

[#49](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/49), [#50](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/50); Paul Cheng; 2026-10-10; approved as written, implementation/review results in [record](record.md). Inputs: [proposal](proposal.md), three deltas. Baseline24b1da8.

## UI and interfaces

Apply/detail pages pass only owned application ID/revision/attachment state to focused controls. ApplicationForm owns fields and cover-letter state; ApplicantAiDraft becomes a section with a button handler, avoiding nested forms and implicit submit. ResumePanel stays a focused mutation component visually inside the shared application surface; type=button upload actions do not invoke save/submit. Native file input remains accessible through explicit label/keyboard styling, with selected filename and clear disabled reasons. No duplicate My applications link below fields.

Removing permanent cancellation must preserve recovery: an explicit user Retry/Replace path validates the candidate before canceling its owned pending reservation, retires only unreferenced staging keys, then reserves a new operation or reconciles an exact ready retry. Preserve immutable ready references, operation identity and durable deleting tombstones. Validate before any recovery mutation; use the existing server-authorized cancellation helpers, not browser Storage writes. Surface safe retry feedback, not raw provider errors. Empty/invalid file selection never removes a good attachment. A transient error-specific Retry upload action is permitted; permanent Cancel interrupted upload is removed.

## Withdrawal data/authorization

Add nullable withdrawn_at and withdrawn_by with paired-null constraint and immutable owner/actor identity. Keep submission_state draft/submitted and review_status enum unchanged; effective display status is withdrawn when the timestamp exists. Append one minimal immutable withdrawal event/metadata (application/actor/time only; no content). Submission/contact freeze triggers must permit only the controlled lifecycle update, never general client field changes. No direct authenticated UPDATE grant added. Migration-created RPC checks auth.uid(), verified current Applicant role, owns submitted application and locks it; idempotent repeat returns existing result, without rewriting original actor/time. Authorization remains server and RLS.

Use existing advisory→job→application lock ordering where relevant; withdrawal never requires published job state. HR notes/status writes and summary eligibility recheck withdrawn_at under the same application lock. Withdrawal racing a note/status allows only the action serialized before withdrawal; after it commits all further processing is denied. For external summary requests, authorization must be checked before model calls, and rechecked before returning results; already in-flight provider work cannot be recalled, but no summary may be returned as current after withdrawal. No changes to provider prompts/models/quotas except withdrawn eligibility. Update service-role quota/summary authorization RPCs as needed so direct requests cannot bypass the rule.

Owner and authorized HR retain submitted-history reads and downloads; HR draft/private-profile access remains denied. Audit/withdrawal events contain IDs/actions/time only; Applicant still cannot read HR notes/events. List status combines lifecycle first, then review status; owner withdraw button requires explicit confirmation and no optimistic success before server reconciliation. Detail shows frozen content and terminal message; no edit/restore/reapply controls.

## Failure behavior and migration

Stale/retried withdrawal reconciles only owner ID and committed lifecycle state. Unauthorized or draft requests fail without changes. DB failures do not report withdrawn; UI retains state and gives safe retry feedback. Existing records migrate with both lifecycle fields null, preserving all original data/RPC clients. Withdrawal returns no private HR content. No blanket DELETE policy or Storage cleanup on withdrawal. Structural PDF validation is not malware scanning.

## Rollout and rollback

Local synthetic checks first; no reset of user data without authorization. New additive migration created via CLI only after approval, reviewed before any hosted operation. Shared Development migration/preview and production rollout require separate approval. Deploy migration/guards before exposing withdrawal UI; old clients cannot edit submitted data. If rolling back, disable new UI/actions first and retain lifecycle metadata, deny HR processing of already withdrawn records; do not clear flags or delete data. Document any operational retention concern for future policy, not pretend soft withdrawal erases personal data.

## Review/approval

At preparation, primary inspected source and proposed terminal/no-reapply, retained HR visibility and post-closure withdrawal. Paul subsequently approved those rules as written. The separate reviewer examined implemented metadata/trigger/privilege boundaries and reported no unresolved blocking finding. Paul then separately accepted locally with recorded limits; [record](record.md) distinguishes these gates and the v1.5 sync/archive.
