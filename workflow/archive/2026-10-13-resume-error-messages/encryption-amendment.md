# #76 amendment: accept PDFs that open without a password

Paul selected **“Allow encrypted PDFs that open without a password; reject files
requiring a password”** on 13 October 2026 after initial error-contract work began.
This decision replaces blanket encrypted-file rejection. This concrete architecture
amendment was approved by Paul in chat (**“Approve revised design”**) on
14 October 2026 before implementing the parser replacement.

## Proposed contract

Keep the 1,048,576-byte cap, filename/type checks, optional/private attachments,
server authorization and immutable submitted snapshots. Accept ordinary PDFs and
encrypted PDFs that can be opened using no supplied password. Reject PDFs requiring
a nonempty password; do not collect, guess, store or remove passwords. Store the
original uploaded bytes unchanged. Unsupported encryption or unreadable structure
fails closed. Structural validation is not malware scanning or full rendering.

Replace the proposed RESUME_ENCRYPTED category with RESUME_PASSWORD_REQUIRED
(HTTP 422): **“This PDF requires a password to open. Upload a copy that opens
without a password.”** Other proposed error messages/statuses remain.

APP-007 before: non-PDF, oversized, malformed or encrypted/unparseable PDFs MUST be
rejected before finalization.

APP-007 after: non-PDF, oversized, malformed/unparseable or password-required PDFs
MUST be rejected before finalization. Encryption alone MUST NOT reject a PDF that
can be opened and structurally validated without a supplied password. Original
uploaded bytes MUST be retained; no password collection or decryption/rewrite step
is exposed to users. Existing safe-error clarification in spec-delta.md applies,
with password-required replacing encrypted as the rejected-file category.

## Revised design and checks

The current pdf-lib library cannot reliably validate this requirement by toggling
ignoreEncryption. Use a pinned `pdfjs-dist` server dependency (registry version
6.4.299 observed, compatible with Node 24) in the bounded Node parser worker.
Use in-memory bytes only, no external URL, no supplied password, no rendering,
text extraction, scripting, eval or external resource fetch. Load document and
inspect page structure without processing embedded actions; destroy the loading
task and terminate worker after each result. Return only allowlisted categories.
Suppress parser verbosity so filenames/content do not enter server logs.

Keep an explicit time/memory budget. Initial implementation retains the current
3-second and 64/16 MiB worker limits; measure synthetic fixtures under local and
production-build execution. If those limits cannot support this parser, report the
evidence and obtain approval for a revised budget rather than silently disabling
limits. Deployment tracing must include the PDF.js runtime, worker and required
runtime dependencies. Update next.config.ts/package.json/pnpm-lock.yaml accordingly;
keep pdf-lib for existing synthetic fixture creation.

Test-first coverage adds synthetic encrypted PDFs with empty and nonempty opening
passwords, plus ordinary, malformed and unsupported inputs. Keep category/status,
deadline/crash/late-event, private-error and retained-fields/files checks. Verify
production build/tracing, Node compatibility and resource cleanup. Use no personal
transcript/certificate in committed tests. Add provenance for generated fixtures.

Update User/Developer Guides and proposed APP-007 delta, obtain separate independent
security/evidence review and human acceptance, then sync/archive. Existing #76
branch is sufficient. No schema migration, hosted settings/deployment, commit,
push or PR is authorized by this amendment.

## Source evidence

- [pdf-lib encryption handling](https://github.com/Hopding/pdf-lib#encryption-handling): documents unsupported encrypted files and limits of ignoring encryption.
- [PDF.js API](https://mozilla.github.io/pdf.js/api/draft/api.js.html): in-memory data, password/error handling, parsing/evaluation options and loading-task lifecycle.
- Local registry read: `corepack pnpm view pdfjs-dist version engines --json`.

Initial error-message work is preserved: 28 focused validator/request/worker tests
passed after distinguishing the current library's encryption exception. These do
not prove the newly proposed encrypted-file acceptance behavior.
