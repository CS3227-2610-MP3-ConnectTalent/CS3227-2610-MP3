# Résumé upload failure diagnostics

- Date: 2026-10-14
- Issue/PR: [#76](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/76) / [#77](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/pull/77)
- Change packet: [workflow/changes/2026-10-14-resume-upload-diagnostics](../workflow/changes/2026-10-14-resume-upload-diagnostics/record.md)
- Baseline: `e5d6ca5`; branch `fix/76-resume-validation-errors`; accepted follow-up publication to the existing PR is in progress.

## Diagnosis

Read-only Vercel and Supabase logs for the Preview failure showed `prepare_application_resume` returning HTTP 200, followed by a direct `application_resume_objects` table read failing with HTTP 403 / SQLSTATE `42501` (`permission denied for table application_resume_objects`). Later attempts encountered HTTP 409 / SQLSTATE `23505` on `resume_one_pending`, because the first failed flow left its reservation pending. The migration keeps browser roles from directly reading this table and exposes the upload mutation through security-definer RPCs. The application’s direct read was outside that RPC-based path and the database rejected it.

The Preview environment-variable names required by the source were present in the Vercel Preview environment. The successful preparation RPC also shows that the Preview reached the intended Supabase project with a key able to execute the RPC. The observed failure is the table privilege boundary, not evidence of a missing variable name. Secret values were not opened or recorded. No Vercel or Supabase settings were changed.

The local timeout is still not attributable to the user's specific PDF because that private file was neither inspected nor uploaded. At diagnosis, the worker budget was 3 seconds. Parser imports now start concurrently, and timeouts record only a fixed parser phase and elapsed milliseconds. One test run performed while other checks competed for CPU had three parser cases hit that limit; the parser suite passed when rerun by itself under the original limit.

## Implementation

- Job résumé uploads now use the validated `prepare_application_resume` RPC result for application revision, state, and object path. The returned path must match the returned application UUID and current operation UUID before Storage access.
- A `ready` result completes idempotently without a second Storage write. A `pending` result uploads to the returned path and finalizes through the existing RPC.
- Removed the direct private-table SELECT from the upload preparation path. No database grant, migration, storage policy, or environment setting changed.
- Added allowlisted preparation error codes and safe user messages for pending upload, closed job, changed application, operation conflict, and unexpected server failure. Unexpected failures carry a random reference code in the response and UI.
- Structured server logs carry only a reference, static stage/category, allowlisted SQLSTATE, numeric status, or worker phase/timing. Raw error text, actor/application IDs, filenames, hashes, paths, and PDF bytes are excluded.
- Added tests for pending conflicts, invalid RPC paths, idempotent ready results, no direct table lookup, redacted logs, reference display, worker phase markers, and parser startup/validation.

## Bounded timeout revision

On 2026-10-14, Paul approved a bounded increase of the PDF worker deadline from 3 to 5 seconds. The change is implemented in `src/lib/resume-pdf-check.ts`; the 64/16 MiB worker memory limits and 1 MiB file cap remain unchanged. The timeout regression now checks that validation remains pending at 3 seconds and times out at 5 seconds.

The focused regression could not be run in this shell: `pnpm` is not installed/on PATH, and invoking the local Vitest shim failed because `node` is not available. A TypeScript transpile-only syntax check passed for the changed source and test files in the Node REPL. Prettier standalone formatted and checked the changed source, test, packet and log files. Vitest itself could not load in the Node REPL because its `node:process` import is disallowed there. The 5-second change still needs an executable test run. No Vercel/Supabase setting, database object or deployment was changed.

## Verification

The implementation was developed test-first. Before the fix, the first-upload/lifecycle/worker/preparation regression run showed eight intended behavioral failures. The UI reference-code assertion also failed before its implementation.

Final focused checks:

- `pnpm exec vitest run tests/unit/first-upload-retry.test.ts tests/unit/resume-lifecycle.test.ts tests/unit/resume-worker-errors.test.ts tests/unit/resume-preparation-errors.test.ts tests/unit/resume-error-routes.test.ts tests/unit/job-resume-route.test.ts tests/unit/resume-panel-actions.test.ts` — 7 files, 67 tests passed.
- `pnpm exec vitest run tests/unit/resume-validation-errors.test.ts` — 16 tests passed, including synthetic malformed and supported encrypted-PDF fixtures.
- `pnpm exec eslint src/components/resume-panel-actions.ts src/lib/application-resume-uploads.ts src/lib/resume-errors.ts src/lib/resume-pdf-check.ts src/lib/resume-request.ts tests/unit/first-upload-retry.test.ts tests/unit/job-resume-route.test.ts tests/unit/resume-lifecycle.test.ts tests/unit/resume-panel-actions.test.ts tests/unit/resume-worker-errors.test.ts tests/unit/resume-preparation-errors.test.ts` — passed.
- `pnpm exec tsc --noEmit` — passed.
- `pnpm exec prettier --check src/components/resume-panel-actions.ts src/lib/application-resume-uploads.ts src/lib/resume-errors.ts src/lib/resume-pdf-check.ts src/lib/resume-request.ts tests/unit/first-upload-retry.test.ts tests/unit/job-resume-route.test.ts tests/unit/resume-lifecycle.test.ts tests/unit/resume-panel-actions.test.ts tests/unit/resume-worker-errors.test.ts tests/unit/resume-preparation-errors.test.ts workflow/changes/2026-10-14-resume-upload-diagnostics/proposal.md workflow/changes/2026-10-14-resume-upload-diagnostics/design.md workflow/changes/2026-10-14-resume-upload-diagnostics/plan.md workflow/changes/2026-10-14-resume-upload-diagnostics/tasks.md workflow/changes/2026-10-14-resume-upload-diagnostics/record.md` — all matched files passed.
- `pnpm build` — passed, including Next.js compilation, TypeScript, static page generation, and route listing.
- `git diff --check` — passed; Git printed line-ending conversion warnings for edited TypeScript files.

During one concurrent run, three PDF cases timed out at about 3 seconds while ESLint, TypeScript, and formatting checks ran at the same time; the other 78 tests passed. The PDF validation suite was rerun alone and passed all 16 tests under the prior 3-second budget. This is recorded as a failed concurrent run, not hidden by the successful rerun.

## Handoff and limits

- At the time of the initial implementation summary, the changes were uncommitted on the current PR branch. The accepted follow-up is now being published to the existing PR; final commit and deployment evidence will be recorded after those actions complete.
- The hosted root cause is confirmed from existing logs; a fresh Preview smoke test has not been possible without publishing a new revision.
- The exact local PDF, its page count, encryption state, and timeout phase were not inspected. Tests used synthetic fixtures only.
- Paul accepted the implementation in chat on 2026-10-14: “I accept the changes. Please proceed.” A separate read-only test-engineer review found no blocking source defect. It identified missing direct tests for the known `P0001` classifier mappings; RPC-level cases for the closed-job message, all three application-changed/draft messages, and operation reuse were added to `tests/unit/first-upload-retry.test.ts`, and reviewer follow-up confirmed they cover every current mapping. The reviewer attempted `pnpm exec vitest run tests/unit/resume-worker-errors.test.ts`, which could not execute because `pnpm` was unavailable. The updated classifier cases have not run. The reviewer confirmed the P3 finding is resolved; the revised timeout regression and hosted checks remain unverified.
- Next evidence needed: run the revised timeout regression and focused upload tests when Node/pnpm are available; publish an authorized revision to create a fresh Preview, then perform a synthetic or user-controlled upload smoke test and inspect redacted runtime logs.
