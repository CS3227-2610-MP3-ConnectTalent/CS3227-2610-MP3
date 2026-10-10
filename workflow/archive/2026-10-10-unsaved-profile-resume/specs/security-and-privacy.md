# Delta: security-and-privacy.md

Issue53; Paul Cheng; proposed 2026-10-10, baseline canonical v1.5. [Canonical](../../../specs/security-and-privacy.md). Complete approval/implementation/sync pending.

## MODIFIED

### SEC-009

Before (complete clause):

## SEC-009: Profile and attachment privacy

Server authorization and database/Storage RLS MUST enforce:

| Data/action | Verified Applicant | Authorized verified HR | Anonymous |
| --- | --- | --- | --- |
| Mutable Applicant profile | Own read/write only | None | None |
| Application background snapshots | Own read; draft write while published | Submitted read only | None |
| Finalized résumé bytes/metadata | Own draft/submitted read; draft mutation while published via validated server workflow only | Submitted read only, including after closure | None |
| Upload reservation/staged objects | Own operation state through authorized server workflow; no arbitrary object access | None | None |

The bucket MUST be private and MUST NOT expose public object URLs. Browser credentials MUST NOT allow direct object upload/overwrite/delete bypassing server validation or frozen state. Download MUST authenticate and authorize the current user for the selected finalized attachment on every request, then return an attachment response with private/no-store caching; guessed paths or foreign/draft-HR access MUST reveal no bytes. Server credential use for staging MUST remain server-only, narrowly scoped to authorized generated object paths and never replace user-scoped private-record read authorization. Referenced submitted files MUST be protected from deletion/overwrite in permitted client/service interfaces. A privileged project administrator remains outside the normal product role boundary.

Paths MUST use generated identifiers without email or original filenames. Filenames MUST be bounded/escaped and never trusted as paths or raw HTTP headers. Files MUST NOT be rendered inline, executed, parsed for autofill or sent to AI. New profile values, education/work experience, filename, bytes and file-access tokens MUST NOT be logged or included in AI requests; existing SEC-005/007 restrictions remain. Metadata-only operational logs MAY identify actor, application, generated operation ID, outcome and cleanup state. Stored profile/application fields remain private product data, not logs. Tests MUST use synthetic PDFs and profiles under SEC-008.

Scenario: Given another Applicant, guest or HR requesting a draft file/profile, direct API/Storage/download access returns no private data. Direct browser object writes and stale finalization after submit/closure fail unchanged. Authorized submitted downloads remain available after closure; responses force attachment/no-store and new profile/file content stays out of AI inputs/logs.

After (complete replacement):

## SEC-009: Profile and attachment privacy

Server authorization and database/Storage RLS MUST enforce:

| Data/action | Verified Applicant | Authorized verified HR | Anonymous |
| --- | --- | --- | --- |
| Mutable Applicant profile | Own read/write only | None | None |
| Application background snapshots | Own read; draft write while published | Submitted read only | None |
| Finalized application résumé bytes/metadata | Own draft/submitted read; draft mutation while published via validated server workflow only | Submitted read only, including after closure | None |
| Upload reservation/staged objects | Own operation state through authorized server workflow; no arbitrary object access | None | None |

The bucket MUST be private and MUST NOT expose public object URLs. Browser credentials MUST NOT allow direct object upload/overwrite/delete bypassing server validation or frozen state. Download MUST authenticate and authorize the current user for the selected finalized attachment on every request, then return an attachment response with private/no-store caching; guessed paths or foreign/draft-HR access MUST reveal no bytes. Server credential use for staging MUST remain server-only, narrowly scoped to authorized generated object paths and never replace user-scoped private-record read authorization. Referenced submitted files MUST be protected from deletion/overwrite in permitted client/service interfaces. A privileged project administrator remains outside the normal product role boundary.

Paths MUST use generated identifiers without email or original filenames. Filenames MUST be bounded/escaped and never trusted as paths or raw HTTP headers. Files MUST NOT be rendered inline, executed, parsed for autofill or sent to AI. New profile values, education/work experience, filename, bytes and file-access tokens MUST NOT be logged or included in AI requests; existing SEC-005/007 restrictions remain. Metadata-only operational logs MAY identify actor, application, generated operation ID, outcome and cleanup state. Stored profile/application fields remain private product data, not logs. Tests MUST use synthetic PDFs and profiles under SEC-008.

Scenario: Given another Applicant, guest or HR requesting a draft file/profile, direct API/Storage/download access returns no private data. Direct browser object writes and stale finalization after submit/closure fail unchanged. Authorized submitted downloads remain available after closure; responses force attachment/no-store and new profile/file content stays out of AI inputs/logs.
Finalized profile resume bytes/metadata MUST be readable/mutable only by their current verified Applicant owner through a validated server workflow; HR and anonymous/unverified/foreign users MUST have no access. Profile storage MUST be private with the same no-public-URL, generated-path, forced-download/no-store, byte-validation and no direct browser writes guarantees. Profile uploads MUST be permitted before completion of required text, but only after verified Auth/role checks; they MUST NOT change the user's role or mark onboarding complete. Pending profile objects MUST not be downloadable as finalized files. File operations MUST not implicitly persist unsaved profile/application fields.

Explicit owner reuse MUST create an application-owned snapshot that is independently retained and subject to application RLS/closure/freeze/withdrawal rules. Later profile replacement/removal MUST NOT delete or overwrite an application snapshot. Copying MUST authorize the selected current owner source, protect or reconcile its version during transfer and prevent substitution by a foreign/stale operation. Cleanup MUST remain tracked and bounded to unreferenced generated keys; no sweeper or malware-scanning guarantee is introduced. New profile file metadata/bytes/access tokens MUST remain excluded from AI/logs as above.

Denial scenario: Given HR, another Applicant or an unverified/anonymous caller requesting profile PDF/API/Storage objects, no private metadata/bytes or mutation occurs. Given profile replacement/removal after application submission or withdrawal, the submitted snapshot and permitted existing download remain unchanged.

## ADDED

None; existing IDs extended.

## REMOVED

None. Canonical sync only after separate acceptance.
