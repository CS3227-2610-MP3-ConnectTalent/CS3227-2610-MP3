# Delta: security and privacy

Issue #44; Paul Cheng; 2026-10-09; awaiting approval. [Canonical](../../../specs/security-and-privacy.md), v1.3 at `1667f2b`; proposed v1.4 subject to integration. Existing SEC-001–008 remain unchanged; this extension is the sole home for new profile/file permissions and privacy.

## ADDED

### SEC-009: Profile and attachment privacy

Before: no private Applicant profile or file storage in baseline.

After: Server authorization and database/Storage RLS MUST enforce:

| Data/action | Verified Applicant | Authorized verified HR | Anonymous |
| --- | --- | --- | --- |
| Mutable Applicant profile | Own read/write only | None | None |
| Application background snapshots | Own read; draft write while published | Submitted read only | None |
| Finalized résumé bytes/metadata | Own draft/submitted read; draft mutation while published via validated server workflow only | Submitted read only, including after closure | None |
| Upload reservation/staged objects | Own operation state through authorized server workflow; no arbitrary object access | None | None |

The bucket MUST be private and MUST NOT expose public object URLs. Browser credentials MUST NOT allow direct object upload/overwrite/delete bypassing server validation or frozen state. Download MUST authenticate and authorize the current user for the selected finalized attachment on every request, then return an attachment response with private/no-store caching; guessed paths or foreign/draft-HR access MUST reveal no bytes. Server credential use for staging MUST remain server-only, narrowly scoped to authorized generated object paths and never replace user-scoped private-record read authorization. Referenced submitted files MUST be protected from deletion/overwrite in permitted client/service interfaces. A privileged project administrator remains outside the normal product role boundary.

Paths MUST use generated identifiers without email or original filenames. Filenames MUST be bounded/escaped and never trusted as paths or raw HTTP headers. Files MUST NOT be rendered inline, executed, parsed for autofill or sent to AI. New profile values, education/work experience, filename, bytes and file-access tokens MUST NOT be logged or included in AI requests; existing SEC-005/007 restrictions remain. Metadata-only operational logs MAY identify actor, application, generated operation ID, outcome and cleanup state. Stored profile/application fields remain private product data, not logs. Tests MUST use synthetic PDFs and profiles under SEC-008.

Scenarios: Given another Applicant, guest or HR requesting a draft file/profile, when direct API/Storage/download access is attempted, then no private data is returned (profile44-AC-01/05). Given direct browser object overwrite/delete or stale upload finalization after submit/closure, then frozen data is unchanged (AC-06/07). Given content/log/provider inspection, then structured background and attachment values are absent, and file responses force attachment/no-store (AC-09). Authorized owner/HR downloads of a submitted file succeed after closure (AC-05/06).

## MODIFIED / REMOVED

None. ACC-005 navigation is extended only by the Applicant profile destination under APP-006; HR's navigation/actions remain distinct. Approval, review and sync pending. No new role or privileged browser key is proposed.

## Human approval record

Paul Cheng replied 'Approve as written' on 2026-10-09 to the explicit question naming the proposal, three deltas, design and plan. This supersedes pending approval wording above; branch permission and later acceptance remain separate. No implementation or canonical sync has occurred.
