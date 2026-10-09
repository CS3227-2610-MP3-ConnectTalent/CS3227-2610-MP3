# Design: profile and private PDF attachment

Paul Cheng; issue #44; 2026-10-09; draft awaiting approval. Inputs: [proposal](proposal.md) and [three capability deltas](specs/applications-and-review.md). Significant schema/Storage and privacy changes require this design. No schema/code implemented.

## Responsibilities and flow

- `src/app/profile/`: Applicant form/page/actions. `src/lib/applicant-profile.ts` owns user-scoped profile persistence; focused validation reuses existing contact schemas. Add Applicant-only My profile navigation.
- Application form/data modules add optional education/work-experience fields and copy profile values only when no saved draft exists. Existing submitted email stays trusted Auth data. HR review renders the immutable submitted background snapshot, never queries profiles.
- A focused `src/lib/application-resumes.ts` and upload/download/remove routes own file lifecycle. A separate PDF validator reads at most 1 MiB plus a bounded overflow sentinel, validates file type/structure and rejects encrypted/unparseable files. Use a maintained parser after checking its official documentation/API; never extract text for AI.
- Database migration adds private profile table with owner RLS, optional application snapshot columns, and attachment/operation metadata protected by ownership, state and job checks. Profile writes are isolated from application writes; application field updates share existing revision/lock guarantees.
- Create a private bucket with PDF/1 MiB bucket limits as defense in depth. Storage read RLS ties exact generated object IDs to finalized metadata and current Applicant/HR visibility. No authenticated browser object writes; trusted server staging uses an isolated helper and current verified role/ownership checks first. Privileged credentials never reach browser/download links.

## Staged upload and races

1. Authenticate verified Applicant, parse ID and bounded file, validate bytes before Storage writes. Reserve an operation through a DB function locking the job/application in the established consistent order; require published job, owned draft and expected revision. If no application exists, create its private draft under the one-per-job constraint without submitting.
2. Store under an immutable generated operation/object key. Never overwrite the old finalized object.
3. Finalize in a DB transaction, rechecking job state, owner, revision and reservation. Update attachment reference and revision together; clear pending operation. Submission uses the same lock order, refuses a pending upload and freezes finalized fields/reference. Closure or stale revision causes finalization denial, retaining the old reference.
4. Failed operations retain tracked staging keys for cleanup. After successful replacement/removal, retire the old object with a durable cleanup entry; delete only exact unreferenced retired/staged objects, rechecking references under lifecycle locks. No timer sweeping arbitrary prefixes. Finalization/lost-response retry reconciles the same operation ID and hash/size, never blindly overwrites a different revision. An explicit cancel/recover path must unblock a draft after interrupted upload while preserving prior attachment.

Storage writes and DB transactions are not one atomic operation. Fault tests must establish recovery, including cleanup failures and process interruption. Detailed SQL interfaces/operation states must be reconciled with existing write APIs in T01 before implementation; scope expansion returns to approval.

## Downloads and privacy

Prefer an authenticated streaming download route over signed URLs so each request rechecks current role and submission state. Resolve only a selected application's finalized attachment using the signed-in user's RLS-scoped session, then fetch bytes under matching Storage read permissions. Sanitize a bounded download filename, set attachment disposition and private/no-store headers. Never display inline previews or log filename/content. Optional PDF is user-provided untrusted content; structural validation does not guarantee it is safe to open in a PDF reader. No antivirus service is in scope.

## Failure behavior and evidence

| Failure | Guarantee / criterion |
| --- | --- |
| Invalid fields or PDF/size | Safe field/file error; no partial saved values or replacement. AC-03/04. |
| Wrong role/owner or guessed object path | Denied before privileged staging/private read. AC-01/05/06. |
| Storage upload or DB finalization failure | Prior file remains referenced/usable; staged operation tracked, safe retry/cancel. AC-08. |
| Submit/close/revision race | Recheck under common lock order; frozen reference unchanged; pending upload blocks submit safely. AC-07. |
| Cleanup failure | Retain cleanup candidate/outcome; retry exact unreferenced object only. AC-08. |
| Profile change after submit | Original application snapshots unchanged. AC-02/03. |

## Compatibility, rollout and rollback

Add nullable optional columns with no fabricated backfill. Existing submissions get no profile/file; existing drafts remain valid. Preserve old contact-only RPC callers with wrappers/default absent new fields only if they cannot erase new background/file state or bypass freeze. If safe compatibility cannot be proved, record a reviewed coordinated write-API cutover before hosted rollout rather than assuming previews are compatible. Do not silently revoke an accepted deployed API.

Local migrate/reset, RLS/Storage and race checks precede separate independent review/acceptance. Hosted bucket/settings/migration and preview tests require a separate authorized operation, targeting Development only before Production. Release must demonstrate server credentials/config, bucket limits/RLS and exact app/schema compatibility. Disable new upload/profile UI on rollback and preserve accepted data/objects; do not roll back by dropping columns/bucket or thawing submitted files. A corrected migration is preferred for security fixes. Old app rollback is allowed only after compatibility evidence; otherwise restore matching app/API version. Cleanup remains narrow and monitored.

## Alternatives and remaining gates

Public buckets and unchecked browser upload rejected. SQL-only attachment storage rejected for unnecessary DB binary load. Signed URLs deferred because they remain bearer links until expiry. AI résumé extraction excluded. Proposed behavior/limits await Paul; PDF library/API selection and exact SQL signatures are implementation details to document in T01, not claims that review has occurred. Separate security/privacy reviewer must review the implemented trust boundary; no reviewer has run for #44 yet.

## Human approval record

Paul Cheng replied 'Approve as written' on 2026-10-09 to the explicit question naming the proposal, three deltas, design and plan. This supersedes pending approval wording above; branch permission and later acceptance remain separate. No implementation or canonical sync has occurred.

## Implementation reconciliation (2026-10-09)

Explicit branch/implementation permission was subsequently supplied; worktree starts from updated develop ee79065. Current implementation requires saving the draft before uploading, then reserves under the existing advisory→job→application lock order. Private SQL v3 writer includes background fields in one revision; v2 wrappers preserve existing background and share pending-upload/freeze triggers. Existing contact clients remain compatible in DB tests.

Selected pdf-lib1.17.1 with official API checked: structure load rejects encrypted/malformed objects; at least one page required. Parser runs in an isolated Node worker with64MiB old/16MiB young heap limits and3second timeout. HTTP upload reads at most1MiB before parsing, bounded filenames and raw byte uploads avoid multipart buffering. Explicit production output tracing includes worker dependency files; this is build evidence, not Vercel execution evidence.

HTTP retries carry the client-generated operation UUID with the same selected file. An exact matching ready operation rechecks its active reference through the DB finalizer without re-upload; stale submitted/closed references cannot be replaced. Canceled/retired objects enter permanent deleting tombstones, retaining exact cleanup keys even after a successful Storage DELETE, because an earlier in-flight upload may finish later. The upload failure path and later owner cancellation/cleanup retry exact unreferenced keys. Tombstones are retained; there is no automatic scheduled cleanup or claim of eventual deletion if all clients/processes disappear. The explicit interrupted-upload control is the recovery mechanism, and operators must monitor retained staging records before release.

Next development Server Function argument logging is disabled to avoid printing profile/application values. Source helper logs no content; model services remain unchanged. Hosted secrets/bucket/migration/configuration were not touched. These refinements implement approved boundaries; separate review/acceptance are still required.
