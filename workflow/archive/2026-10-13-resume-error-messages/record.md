# #76: actionable résumé validation errors

Owner: Paul. Date: 13 October 2026.
Issue: https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/76.
[Issue](issue-body.md). [Proposed APP-007 clarification](spec-delta.md).

## Approved scope amendment

Paul selected acceptance of encrypted PDFs that open without a password, while
rejecting password-required files. [Concrete amendment](encryption-amendment.md)
supersedes the original blanket-encryption rejection after approval. Initial
error-contract work is completed below; no hosted fix is claimed.
Paul replied **“Approve revised design”** in chat on 14 October 2026, approving
the linked amendment, parser replacement, deltas and test plan before implementation.

## Proposal and diagnosis

The same supplied PDF passes local bounded parser checks and user-reported local
upload, but user reports Vercel returns the generic invalid-PDF message and 400.
Code confirms worker startup/errors/timeouts and input failures are conflated.
This repair improves classification and user feedback; it does not claim a hosted
root cause or successful hosted upload. No personal document is copied into tests.

## Error contract and design

Introduce a small typed, allowlisted résumé error representation with stable codes,
safe messages and response statuses. Never echo raw exception messages from worker,
parser, request bodies or dependency paths. Preserve unrelated existing lifecycle
failure behavior. Use it in shared input/body-reading helpers and all three upload
routes so profile/fresh/existing application responses agree.

| Condition | Proposed message | Status / code |
| --- | --- | --- |
| Missing/empty file | Choose a PDF file containing at least one page. | 400 / RESUME_EMPTY |
| Invalid or too-long filename | Rename your PDF using a filename of at most 120 characters and try again. | 400 / RESUME_FILENAME_INVALID |
| Too large | This file exceeds 1 MiB. Choose a smaller PDF. | 413 / RESUME_TOO_LARGE |
| Non-PDF extension or received MIME type | Choose a PDF file (.pdf). This upload was not recognised as a PDF. | 415 / RESUME_TYPE_UNSUPPORTED |
| PDF requiring an opening password | This PDF requires a password to open. Upload a copy that opens without a password. | 422 / RESUME_PASSWORD_REQUIRED |
| Invalid structure, parser rejection or no pages | This PDF could not be read. Export a new PDF and try again. | 422 / RESUME_INVALID |
| Interrupted/unreadable request body | The file could not be received completely. Select it again and retry. | 400 / RESUME_READ_FAILED |
| Worker/module unavailable or crash | PDF checking is temporarily unavailable. Your file has not been saved. Try again later. | 503 / RESUME_VALIDATOR_UNAVAILABLE |
| Worker deadline exceeded | PDF checking took too long. Your file has not been saved. Try again. | 504 / RESUME_VALIDATION_TIMEOUT |

Worker communicates a small validated result code. Preserve 3-second deadline and
64/16 MiB memory limits. Guard single settlement, cancel timer, and terminate worker
on every outcome; distinguish dependency load/startup from document parsing. Keep
fail-closed validation before storage/finalization. Existing previous attachments
and typed fields remain. UI already displays the API error string; add UI changes
only if tests show those messages are not correctly surfaced.

## Ordered plan and checks

1. With explicit branch permission, fetch updated develop and create
   `fix/76-resume-validation-errors`; preserve existing untracked packets. Check
   remote PR #75 state without merging it. Record actual baseline.
2. Add focused failing unit tests for typed input/reader/parser failures and worker
   unavailable/crash/timeout, then implement the shared error contract and worker
   result handling. Use synthetic PDFs and deterministic worker failure mocks.
3. Test and implement consistent JSON code/message/status mapping across the three
   upload endpoints, including safe fallback, no private details, existing
   authorization and upload-retry state preservation.
4. Update affected browser assertions; run focused unit/route tests, local upload
   browser success/rejection/retained-fields scenarios if local services permit,
   scoped lint/typecheck/build and formatting. Record environmental limits honestly.
5. Separate independent reviewer checks classifications, privacy, race/cleanup and
   acceptance evidence. Fix/recheck findings; update User Guide and session log.
6. Request separate acceptance; then sync accepted APP-007 clarification and archive
   full packet. No commit, push, PR or hosted deployment in this authorization.

Paul replied **“Approve plan and branch”** on 13 October 2026. Updated develop to
`7bbf7af` (PR #75 merged) and created `fix/76-resume-validation-errors`. Added focused
classification/worker tests before implementation. Hosted root cause and
verification remain pending. Rollback: revert error-contract changes; no data migration.

## Implementation evidence (14 October)

- Applied `mp3-tdd-implementation`; primary Codex execution implements this packet.
- Original focused red: 16 failures for absent typed classifications and worker
  exit handling. Initial green: 28 validator/reader/worker cases. The old pdf-lib
  transpiled encryption exception does not preserve `instanceof`; that diagnosis
  is superseded by the approved parser replacement.
- Encryption red: fixture generation first needed owner-context access to temporary
  Python packages. After fixtures existed, 5 of 16 assertions failed for the intended
  blanket rejection/classification behavior. No missing-fixture failure is counted
  as behavioral red evidence.
- Encryption green: 32 tests across resume-input, resume-request,
  resume-validation-errors and resume-worker-errors passed. Real AES-128/256
  empty-password documents retain exact bytes; password-required and invalid
  encryption dictionaries reject with separate categories. Worker limits unchanged.
- Added endpoint regression tests after original error mapping implementation:
  27 status/code/privacy cases across all three endpoints (not claimed as TDD red).
  Together with existing routes, request and expanded worker tests, 61 cases passed.
- Scoped ESLint, Prettier, `git diff --check` and `corepack pnpm typecheck` passed.
- No schema/RLS/Storage policy or AI changes. No commit, push, PR or hosted mutation.

### Final checks and review

- `corepack pnpm exec vitest run tests/unit/resume-input.test.ts tests/unit/resume-request.test.ts tests/unit/resume-validation-errors.test.ts tests/unit/resume-worker-errors.test.ts tests/unit/resume-error-routes.test.ts tests/unit/application-resume-route.test.ts tests/unit/job-resume-route.test.ts tests/unit/profile-resume-route.test.ts`: **85 passed**.
- With `.env.local` loaded without printing secrets and
  `PLAYWRIGHT_SERVER_COMMAND='corepack pnpm dev'`, Playwright ran
  `profile-resume.spec.ts`, `resume-first-profile.spec.ts`,
  `resume-validation-errors.spec.ts`: **3 passed**. Covers real encrypted uploads,
  password-required errors, invalid replacements, typed-field/attachment retention,
  retry, snapshot/download and HR/private access. The service outage is simulated;
  actual worker crash/deadline classification is separately unit-tested.
- `corepack pnpm build`: **passed**. All three upload tracing manifests include
  PDF.js runtime/parser and platform canvas files. Copied only those traced
  dependencies to an OS temporary directory outside the project and executed the
  exact worker bootstrap: AES-256 open/password files returned valid/password in
  486/365 ms under unchanged limits. Windows only; not a Linux/Vercel rehearsal.
- Production Playwright with `PLAYWRIGHT_SERVER_COMMAND='corepack pnpm start --port 3100'`
  and `PLAYWRIGHT_BASE_URL='http://localhost:3100'` ran
  `resume-validation-errors.spec.ts`: **1 passed**, exit 0. Test-server teardown
  stalled after the case; verified/stopped only that test server to finish cleanup.
- [Independent review](handoffs/independent-review.md): separate reviewer
  `/root/resume_validation_review` reproduced **90 unit checks**, no blocking
  findings. One low outdated dependency-description finding fixed and rechecked.
  Reviewer did not independently repeat browser/build/trace tests.

### Task status and remaining gates

- [x] Original and amended proposal/design/plan approved by Paul.
- [x] Error contract and password-aware parser implemented, tested and documented.
- [x] Independent review completed; source findings resolved.
- [x] Logs prepared: [13 October intake](../../../logs/2026-10-13-resume-error-intake.md),
  [14 October implementation](../../../logs/2026-10-14-resume-errors-encryption.md).
- [x] Separate student acceptance: Paul replied **“Accept with recorded limits”**
  in chat on 14 October 2026 after the local evidence and hosted/Linux limit were presented.
- [x] Accepted canonical APP-007 sync: `workflow/specs/applications-and-review.md`,
  `workflow/ProductSpec.md` and `workflow/specs/README.md` updated to **v1.10,
  14 October 2026** before archive. APP-006 inherits APP-007; no ID reassignment.
- [x] Complete packet archived at `workflow/archive/2026-10-13-resume-error-messages/`.
- [ ] Hosted Vercel upload verification (later team operation).

This change is locally reviewed, not deployed. It does not establish the original
Vercel failure's root cause. Original byte/type/size boundaries and authorization
remain; structure checks do not certify malware safety or full PDF rendering.
V8 heap limits do not cap native/ArrayBuffer memory. Reverting the parser would
again reject all encrypted uploads but requires no data migration.

Acceptance is distinct from the original and amended implementation approvals.
Compared the accepted error/encryption deltas against canonical APP-007: file
categories, server failure/timeout distinction, original bytes, no passwords,
privacy, pre-storage rejection and retained fields/files all synced. No sync
commit exists yet. Dated session logs and current indexes link the final archive.
Post-archive local-link check inspected 157 links across 10 canonical/packet/log
files with no missing targets; final `git diff --check` passed.

## Authorized PR preparation — 14 October 2026

Paul explicitly requested staging, commit and PR creation in chat. Push is necessary
to open the requested PR from this local branch. Target: `develop`; issue closure
scope: #76. Remote develop remains at baseline `7bbf7af`; no existing head PR.
The application diff is unchanged since acceptance/review. Final staging excludes
the unrelated untracked `workflow/changes/2026-10-09-profile-resume/` packet.
[PR preparation summary](../../../logs/2026-10-14-resume-errors-pr.md).
Publication does not establish merge, hosted verification or release.
Staged checks identified PDF fixtures treated as text. Added `*.pdf binary` in
`.gitattributes` and verified staged bytes equal tested fixtures, avoiding CRLF
conversion of PDF offsets. No application behavior was modified.
