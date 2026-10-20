# Design — application identity and stale revisions

## Chosen approach

Carry the expected application ID alongside the expected revision from each displayed form or application-file request. Validate both against the owner/job's active record within the same advisory-lock transaction used for writes. A stale request referring to withdrawn A must fail rather than target active B. A server lookup followed by an unguarded mutation is insufficient because withdrawal/reapplication can occur between them.

Keep existing records, revisions, private files and history. Do not reset revisions or rewrite old migrations. Add one forward migration and identity-aware RPC entry points/wrappers; private guards must use verified actor identity and the existing lock order. Check owner/role and expected identity before mutation, cleanup, cancellation or retry recovery. Preserve RLS and explicit search paths/grants.

## New form and retry semantics

- Null expected application identity/revision means create-only, not permission to update whichever record happens to exist.
- A successful first upload returns its newly created application identity for subsequent operations and Save/Submit.
- If that response is lost, only the same operation's persisted owner/job/application binding and file fingerprint may reconcile it. Do not resolve an arbitrary active draft into a null-identity request.
- Existing-form requests send their original expected identity even if the active record has changed. Any successful returned identity must match the expected record, except a legitimate first creation.
- Completed retries may report their original already-committed result without mutating another application. Pending recovery and cleanup must remain scoped to that original record.
- Profile-only upload behavior stays unchanged. Copying a profile file into an application uses the application identity guard and original source/operation binding.

## Interfaces and compatibility

Application hidden fields include expected application ID. File request metadata includes expected application ID; application-ID routes derive the expected identity from the route, rather than trusting a conflicting header. Server input validation rejects malformed/missing identity on updates. New versioned RPCs or explicit identity-aware wrappers enforce the transaction-level contract; old externally callable write paths without that protection must be revoked or fail closed. Existing internal functions may be reused only behind the checked transaction boundary.

Avoid permissive default parameters or fallback to identity-less writes. A reviewed migration and matching app must be deployed together; old clients may receive a safe stale/reload error. Hosted cutover is a later explicitly authorized operation. Rollback must retain identity checks, immutable snapshots and file history; prefer fix-forward to restoring vulnerable RPC access.

## Remaining small repairs

Validate the complete HR page string as a positive safe integer, rejecting duplicate parameters rather than silently choosing one. Existing pagination handles bounds. Update guide baseline reference to the actual integrated version and rename only the incorrect diagram RPC. Do not relabel historical check dates as new execution evidence.

## Verification

Observe focused tests fail on the old implementation: A/B revision collision for Save/Submit and file mutations; initial-upload lost-response retry; malformed pagination. Implement then recheck SQL permissions, transaction races, request metadata, reconciliation and normal UI journeys using synthetic local fixtures. No live AI or hosted data. Obtain separate independent source/evidence review before student acceptance and closeout.
