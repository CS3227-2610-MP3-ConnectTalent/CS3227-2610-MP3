# Independent review — first-upload retry

Date: 10 October 2026. Reviewer: separate Codex execution `/root/application_withdrawal_review`, reused through a bounded follow-up. Model identifier unavailable. The reviewer did not implement this repair.

## Scope and result

Reviewed the uncommitted service and regression diff against baseline `e23fba2`, the approved repair plan and APP-007. **No findings or blocking issue reported.** This is technical review, not student acceptance or repository PR approval.

- Persisted revision lookup is restricted to explicit Retry with a missing revision and filtered by both actor and job.
- PDF validation precedes lookup. Query errors and invalid persisted revisions fail closed.
- Explicit supplied revisions remain unchanged; stale-write checks are preserved.
- Existing locked recovery/prepare RPCs still enforce owner, role, job, state and revision after lookup, including concurrent changes.
- Recovery does not save typed fields or submit an application; retained cleanup records remain in use.
- The browser regression allocates a real local pending record, aborts the first response and asserts retry without a client revision, retirement of the old pending record and one application.

## Independently executed checks

`corepack pnpm exec vitest run tests/unit/first-upload-retry.test.ts tests/unit/resume-lifecycle.test.ts`: **9 passed, 2 files**.

`git diff --check`: passed.

Browser execution, lint and typecheck are implementer evidence, not independently reproduced by this reviewer. Database schema, hosted behavior and full accessibility testing were outside this bounded review. No SQL or hosted settings changed.

See the [record](record.md) for final implementer checks and the separate acceptance gate.

## Final test correction recheck

The reviewer inspected the final browser assertion changing `retired` to `deleting`. This matches existing `claim_resume_cleanup`: recovery retires the pending operation; cleanup claims it and retains its unreferenced deleting tombstone for later retry. Product source remained unchanged. Source/static review found no issue, and `git diff --check` passed again. The successful browser rerun is implementer evidence, not a reviewer-executed browser run.
