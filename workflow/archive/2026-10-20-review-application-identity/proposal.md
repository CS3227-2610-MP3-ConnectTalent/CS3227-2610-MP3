# #125 — Repair review findings

Owner: Paul Cheng. Issue: https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/125

Baseline: updated `develop` at `09e59a2`; branch `fix/125-review-application-identity`.

## Problem and scope

1. An old draft form can mutate a new application for the same job after withdrawal/reapplication because record-local revision values repeat. Application writes and application résumé mutations must identify the intended record in addition to its revision.
2. HR pagination accepts partial numeric strings such as `2junk` and `2.9` instead of using the invalid-input fallback.
3. The Developer Guide identifies current requirements as v1.14 rather than integrated 1.18.
4. Its profile résumé sequence diagram names `prepare_profile_resume` rather than implemented `reserve_profile_resume`.

Restore APP-005/006 stale-write protection, APP-007 attachment boundaries, APP-008 independent reapplications and APP-010 safe query defaults. Existing product policy remains unchanged; canonical product delta is not proposed.

## Acceptance

- ID-01: Save/Submit from old draft A cannot change or submit active reapplication B even when revisions match. A and B remain unchanged by the rejected write.
- ID-02: Old upload, replacement, removal, profile-copy and retry requests cannot mutate B or its pending/finalized files. Application-ID routes must remain bound to their route record.
- ID-03: A new unsaved form can still create its first draft, upload before saving, recover the same operation after a lost response, then Save/Submit. Unknown first-upload results must reconcile only the matching operation, never adopt an unrelated current draft.
- ID-04: Normal same-record revision conflicts, owner/HR denial, closure, withdrawal, immutable submissions and idempotent retries remain enforced. Returned application identity must be checked before client state is adopted.
- PAGE-01: Only a complete positive integer page string is valid; malformed, negative, unsafe, duplicate and out-of-range values safely use page 1. Valid pagination/filter URLs keep working.
- DOC-01: Correct the two current guide statements against the actual reviewed baseline and RPC; preserve truthful historical evidence and dates.

## Non-goals

No product lifecycle, UI redesign, AI behavior, provider calls, dependency changes, hosted migration or deployment. Profile-only file ownership does not change. No commit/push/PR is authorized by implementation approval.

## Decisions

Paul requested all four fixes on a new branch on 20 October 2026, beginning with finding 1. The concrete SQL/API compatibility design and ordered plan are now proposed for approval before product/test edits.
