# #76 independent review

- Owner: Paul. Requirement: APP-007 error handling/encryption amendment, inherited
  by APP-006 profile résumés; SEC-009 privacy boundary.
- Reviewer: separate Codex agent `/root/resume_validation_review`, security/privacy
  reviewer invocation on 14 October 2026; model not independently identified.
- Implementer: primary Codex `/root`. Reviewer did not implement or edit files.
- Baseline: `7bbf7af8aa6ddf27e596fd1e67609bc27e764efd`, branch
  `fix/76-resume-validation-errors`, uncommitted scoped changes.
- Inputs: approved record/delta/encryption amendment, parser and safe errors,
  three upload routes, dependencies/tracing, synthetic tests/fixtures, guides.
- Excluded: unrelated profile-resume packet, private env values, hosted operations.

## Findings and recheck

No blocking security defect identified. One low finding: Developer Guide dependency
overview still attributed runtime parsing to pdf-lib. Implementer corrected this
to PDF.js, with pdf-lib retained for synthetic fixture generation. Reviewer then
read the correction and confirmed it resolved; no outstanding source findings.

## Independent checks

Reviewer ran `corepack pnpm exec vitest run` for the five resume-input/request/
validation-errors/worker-errors/error-routes suites: **63 passed**. Further existing
authentication and three résumé route suites: **27 passed**, total **90**.
`git diff --check` passed with line-ending warnings. Real synthetic parser files
ran; route/auth dependencies and worker-failure events are mocked.

Source review confirmed origin/role/ownership checks, validation before mutations,
original bytes retained, no passwords collected, allowlisted responses, discarded
parser output, guarded single settlement, bounded worker termination and no added
AI data. Existing application/profile and Storage policies were read; this is not
a new database integration-test run. Installed PDF.js 6.4.299 has no
`isEvalSupported` option or `new Function`/`eval` calls. Bootstrap `eval: true`
executes fixed developer source; uploaded bytes are separate worker data.

## Implementer evidence and limits

Implementer reported build success, three tracing manifests containing main/worker
and platform canvas files, and isolated Windows traced-file execution outside the
repository: AES-256 open/password fixtures produced valid/password in 486/365 ms.
Reviewer did not reproduce packaging or browser runs. Implementer ran three local
development browser journeys, plus one passing production-server browser journey.
Production test shutdown stalled; after verifying identity, its test-only server
was stopped and Playwright exited 0 with one passed case.

Hosted/Linux execution remains unverified. Structural validation is not malware
scanning; V8 heap limits are not a total process-memory cap. Student acceptance,
spec sync/archive, commit/push/PR and release remain separate decisions.

## PR-preparation portability recheck

The same separate reviewer independently verified the later `*.pdf binary`
attribute: text conversion/diff/merge are disabled for all four synthetic fixtures,
their raw working-file hashes match staged Git blobs, and staged whitespace checks
pass. No findings; earlier application/security review still applies. No application
tests repeated for this correction. Spec/archive/log edits were outside this recheck.
