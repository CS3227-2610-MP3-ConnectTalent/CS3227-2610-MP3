# Independent review: issue #81

- Reviewer: separate read-only `/root/pending_feedback_review` test-engineer execution, 14 October 2026
- Scope: branch baseline `f65f699` plus uncommitted #81 source, tests and evidence; no implementation or test edits by the reviewer
- Outcome: no unresolved blocking source finding after fixes and recheck

## Findings and disposition

1. A status region created only after pending begins may not announce reliably to assistive technology. The implementer kept an empty `role="status"` region mounted at idle and updated the unit regression. Reviewer recheck passed.
2. A unit mock that set both HR forms pending did not prove that only the submitted form disables. The implementer added a delayed HR note browser case: Add note disables, Update status remains enabled, and a repeat Add note click issues no second POST. The first run failed because the test removed its request route too early; the test was corrected and the scenario passed.
3. The record said the idle status role existed only while pending. This wording was corrected to match the persistent live region.

## Evidence and limits

The reviewer ran `node node_modules/vitest/vitest.mjs run tests/unit/pending-action-forms.test.tsx tests/unit/auth-pages.test.tsx tests/unit/client-state-components.test.tsx` (13/13 passed) and `git diff --check` (passed), and read the final source. The implementer separately ran the delayed sign-in and HR browser checks, complete unit suite, typecheck, scoped lint/format and production build; those commands are detailed in [record.md](../record.md). The reviewer did not rerun every check. Hosted response timing, full assistive-technology use and every other action under an individually delayed response remain untested.
