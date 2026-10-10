# Design: unsaved application and profile résumés (#53)

Proposed; owner Paul Cheng, 2026-10-10. [Proposal](proposal.md). Baseline canonical v1.5 plus accepted uncommitted #49/#50; no approved runtime change yet.

## Data flow and ownership

ApplicationForm owns current application ID/revision and unsaved fields. Pass a focused attachment control between background and AI; it reports resulting ID/revision/metadata to the form without remounting uncontrolled text fields. File selection is not persistence. Upload buttons are type=button and do not save other fields. Render submitted/read-only attachments outside the editable form as needed.

For a new form use a job-addressed server upload route rather than requiring an application-ID route. Verify current confirmed Applicant, same-origin mutation, selected published job, bounded PDF bytes/filename/structure and operation UUID before allocation. An atomic checked database operation follows advisory(owner/job) → job → application locks, allocating a blank private draft only if none exists and reserving its staged file. Existing draft requires matching expected revision; concurrent stale form must reload/reconcile, never overwrite another saved draft's fields. Exact-operation retries reconcile the same reservation/application rather than create duplicates. Upload/finalization and cleanup retain current immutable keys, guards and tracked tombstones.

Return only owned application ID/revision/attachment metadata after mutation; trusted client state supplies later Save/Submit revision. A lost response is reconciled through the owner/job and operation identity. Valid-upload failures may leave a private empty draft and tracked pending/retired operation; show safe recovery feedback. Invalid PDF is rejected before allocation. Submission while file upload is pending is denied server/DB-side. No auto-submit or optimistic success.

Profile uses a separate owner-scoped résumé lifecycle: optional nullable reference on applicant_profiles, profile résumé object records and a private profile-resumes bucket. It can create an owner profile shell without saving unsaved profile text; current profile schema permits partial data until completion. Current verified Applicant owns finalized reads; HR/anonymous/foreign owners get no metadata/bytes. No direct browser Storage upload/overwrite/delete. Use narrow service mutations with checked ownership and per-owner serialization, authenticated user-scoped reads and forced attachment/private-no-store responses.

Reuse shared PDF validation/worker and request-boundary helpers. Keep application and profile authorization/lifecycle modules distinct, avoiding a role-switching mega-service. Generated object IDs/paths contain no personal identifiers/filename. Replace/remove retires only old profile objects after new finalization; failed replacement preserves current reference. Keep durable cleanup records and exact-key retries; no new automatic sweeper claimed.

**Use profile résumé** is explicit: authorize/read current finalized owner profile file, copy validated bytes to a new application operation/path, reserve/finalize under application lock/freeze. Retain the selected source version during copy; a concurrent profile replacement must not produce mismatched bytes or unexpectedly select a newer file. Independent copy means subsequent profile changes/deletion cannot erase submitted application snapshots. No HR access to the source profile file.

## Security and compatibility

Origin, verified role, generated IDs, size/type/structure, owner/current-state/revision checks at server and database boundaries; authenticated RLS reads, no public URLs or new browser writes. PDF/contact/background are not added to AI; no file parsing/autofill. Existing application/upload/withdrawal guards remain. Profile uploads cannot require completed profile text, avoiding #52 onboarding loops. No upload before account/email verification.

Create additive migration via CLI after approval and apply locally via CLI so migration history is recorded. Legacy application records/files preserved. Update lifecycle readiness without rewriting frozen references or personal snapshots. Coordinated Development migration/app deployment and preview smoke are later separately authorized operations. Rollback retains metadata/files/guarded reads and blocks old routes from breaking freeze; no table/bucket/record deletion. Clean-reset rehearsal needs an isolated disposable environment, not resetting Paul's current data.

Independent review must inspect source-version copy races, first-upload/idempotency, typed-value preservation, private profile downloads and role/Storage denial before separate student acceptance.
