# PR #54 first-upload retry correction — #53

## Accepted closeout — 10 October 2026

Paul separately replied **“Accept with recorded limits”** to the final acceptance question after checks and independent review. Accepted limits: hosted retry testing remains pending; no commit, push, PR update or hosted operation authorized by acceptance. The complete two-file packet is archived at `workflow/archive/2026-10-10-first-upload-retry/`. Existing canonical APP-007 already requires the restored behavior; canonical sync/version change is N/A, and v1.8 remains unchanged. Historical progress wording below is preserved as evidence of the earlier sequence; the final verification table and this decision establish the current state.

[Closeout summary](../../../logs/2026-10-10-first-upload-retry-closeout.md).

Closeout checks: record/review hashes matched before and after the two-file move; nine local links in the packet and closeout summary resolved; `git diff --check` passed. APP-007's existing retry, first-upload and cleanup clauses were rechecked before archive. No runtime checks rerun during documentation-only closeout.

Subsequent publication authorization: Paul explicitly requested **“commit and push”** on 10 October 2026 for this accepted repair. Stage only the bounded service, tests, archived packet, navigation and three contributing summaries on `feat/52-required-applicant-profile`; preserve the unrelated untracked earlier profile-résumé packet. Commit/push outcomes are recorded by Git and the user-facing completion report; this authorization does not establish merge or hosted validation.

## Approved implementation — 10 October 2026

Paul replied **“Approve repair plan”** to the concrete scoped plan before coding. This approval is now recorded during implementation; historical proposed wording below remains chronological. No new branch, commit/push or hosted action authorized. Primary implements on the existing PR branch at e23fba2, preserving unrelated untracked work.

Observed test-first evidence: `corepack pnpm exec vitest run tests/unit/first-upload-retry.test.ts` initially failed three of six assertions for missing actor/job lookup, failure handling and recovery ordering. After the bounded service repair, that suite plus resume-lifecycle passed **9 tests/2 files**. PDF validation still precedes lookup; positive revision parsing/error handling fails closed; an explicit revision is never upgraded. Existing SQL locks recheck owner/state/job/revision after lookup. No SQL/schema/route/UI edits.

Independent review completed with no findings; see [review evidence](independent-review.md). Browser simulation is still in progress. The browser creates a real local owned pending reservation and aborts the initial response; Retry must still send no revision, retire the old pending state and complete while preserving fields and one application. Prior packet's canonical APP-007 already requires this behavior, so spec delta/sync is N/A. Supabase equality docs checked; changelog markdown fetch failed due unsupported tool content-type. No library upgrade inferred.

Typecheck, scoped ESLint of the service and two regression files, and `git diff --check` passed. The first browser attempt timed out before tests because local Supabase was unavailable (Docker Desktop stopped; connection refused at 127.0.0.1:54321). Docker Desktop was started; an immediate Supabase start attempt reported its database was still starting. Subsequent Docker inspection showed healthy local database/Auth/Storage/gateway containers. The two selected browser cases were restarted without resetting the database. Final outcomes will be recorded below.

The second browser run passed the adjacent privacy/submission-freeze/HR flow. The lost-response test completed upload and verified one owned application, then failed a test expectation: old metadata was `deleting`, not `retired`. Existing cleanup intentionally claims retired records into durable `deleting` tombstones. The assertion was corrected to that exact state, without product edits; the separate reviewer received this final test-only correction for review. A focused browser recheck is in progress.

[Implementation session summary](../../../logs/2026-10-10-first-upload-retry-implementation.md). Separate acceptance, archive and commit/push remain pending. Historical preparation sections below describe the state when the plan was drafted; they do not override the approval recorded above.

## Final local verification

| Check | Result and limits |
| --- | --- |
| `corepack pnpm exec vitest run tests/unit/first-upload-retry.test.ts` before repair | Intended RED: 3 failed, 3 passed. |
| `corepack pnpm exec vitest run tests/unit/first-upload-retry.test.ts tests/unit/resume-lifecycle.test.ts` after repair | GREEN: 9 passed, 2 files; independently reproduced. |
| `corepack pnpm exec playwright test tests/e2e/resume-first-profile.spec.ts tests/e2e/profile-resume.spec.ts` | Initial readiness failure while local Supabase was unavailable. After startup, adjacent private/frozen/HR case passed; first-upload case failed only its cleanup-state test expectation after successful upload. |
| `corepack pnpm exec playwright test tests/e2e/resume-first-profile.spec.ts` after test correction | Passed, 1 case (32.2 seconds): lost-response retry without revision/reload, one draft, deleting tombstone, preserved unsaved fields, profile copy and frozen submission. |
| `corepack pnpm typecheck` | Passed. |
| Scoped ESLint on service, unit and browser regression | Passed; rechecked after test correction. |
| `git diff --check` | Passed; independent reviewer also rechecked final correction. |
| Independent review | No findings, including final test-only correction. Browser/typecheck/lint are implementer evidence. |
| New database migration, hosted test, deployment | N/A migration (SQL unchanged); hosted test and deployment not run. |

Bounded rollback: revert the service/test correction; no database rollback required. This leaves the previously recorded first-upload retry defect. Full regression/build and clean-reset checks were not repeated: no schema, Next interface or dependency changes; focused runtime, compile and lint evidence covers the repair. Hosted behavior remains unverified. Separate student acceptance is pending; no archive or publication yet.

Owner Paul Cheng; 10 October 2026; proposed follow-up, implementation approval pending. Existing issue [#53](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/53), [PR #54 finding](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/54#discussion_r4237182826). Baseline e23fba2 on feat/52-required-applicant-profile. Preserve unrelated untracked earlier packet. No new branch, commit/push or review-comment reply authorized by this preparation.

## Proposal and existing specification

Restore accepted APP-007 retry/first-upload behavior under canonical v1.8 and existing #53. No new feature, permission, schema or canonical delta. The user supplied the Codex review finding. Primary used systematic-debugging and Supabase guidance to inspect actual service, client control, request helpers, approved #53 design and recovery/prepare RPCs. Static trace confirms a first-upload request may allocate a draft/pending object before its response is lost; client revision remains null, Retry generates a new operation, uploadResumeForJob skips recovery and prepare encounters the existing draft revision check. This is a source-confirmed failure path, not a claimed executed browser reproduction.

## Concrete design and plan awaiting approval

1. Add a focused failing regression for retry=true/revision=null with an existing owned private draft, demonstrating recovery must occur before preparation with its persisted revision. Cover absent record and lookup failure.
2. After PDF validation, only for explicit retry with no client revision, resolve the persisted application's revision using both actor and selected job predicates. Parse a positive integer; lookup error must fail safely. If no application exists, retain null/fresh allocation. Never accept browser-provided actor identity; existing route verification remains authoritative.
3. Feed the resolved revision into the existing locked recovery and prepare RPCs. Preserve explicit supplied revisions (no automatic stale-revision upgrade). Keep database ownership/profile/job/freeze/pending/revision checks authoritative; a change after lookup must reject safely. Retain cleanup tombstones and finalized references. Never save typed fields or submit through file recovery.
4. Verify unit failures then passes, one actual local browser regression that simulates first request leaving a pending reservation but losing its response, and adjacent retry/invalid-PDF/closed/submitted protections. Use synthetic local fixtures only. Run typecheck/scoped lint and independent review; update log/record with actual findings/results.
5. Request separate acceptance after evidence; canonical sync N/A because this restores existing APP-007. Archive with recorded limits only after acceptance. Commit/push to the existing PR require separate explicit authorization.

Allowed edits: src/lib/application-resumes.ts, focused unit/browser tests and this packet/session evidence. UI/route edits only if evidence shows an interface change is necessary; return expanded plan for approval. No SQL/migration, key, hosted or unrelated form changes.

Acceptance: interrupted first-upload Retry progresses without full reload, retains typed fields/one owned draft, recovers only under current allowed database state, and does not weaken stale explicit revision or foreign/submitted/closed denial. Invalid PDFs still fail before lookup/allocation. Query errors do not permit recovery or false success.

## Gates and limits

- [x] Existing issue/PR and accepted requirements identified; source trace completed.
- [x] Concrete follow-up plan approval, before implementation.
- [x] Failing regression, bounded implementation and relevant final checks.
- [x] Separate independent review completed with no findings.
- [x] Separate student acceptance with recorded limits and complete archive.
- [x] Commit/push authorized separately by Paul's explicit request; execution follows this record update.

No product code changed and no runtime tests executed in this preparation. Primary source inspection is self-review; bot finding is external review input, not approval. [Session summary](../../../logs/2026-10-10-first-upload-retry-intake.md).
