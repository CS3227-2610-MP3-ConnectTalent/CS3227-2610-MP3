# Independent review: PR #110 review follow-ups

- Assignment: T06; read-only source and test review against PR110-AC-01–05 and APP-001/005/007/008/009/010, JMG-004.
- Reviewer: separate test-engineer execution `/root/pr110_fix_review`; model/run identifier unavailable.
- Reviewed branch/range: `fix/115-pr110-review-followups`, `3c9ba769f536679a3f546b5e5fbf5a254f059104..1b95de20158d3b24bea8c071b78f1a60b1054aaf`.
- Independence: reviewer did not implement or author tests. This review is not student acceptance.

## Findings

- No confirmed source defects found. Filter merging/current-URL synchronization and page-one fallback match APP-010; the test asserts the exact first-page slice.
- Attachment reconciliation adopts a newer same-application revision, preserves a higher local revision against stale/null props, and adopts a changed identity. The form uses the reconciled revision in the hidden field and passes reconciled identity/revision to the résumé panel. Server revision enforcement remains present.
- Withdrawal copy distinguishes the terminal current record from a new application while the role remains published and open; focused copy test checks both statements.
- Dashboard aggregation uses operational job status, counts scheduled jobs under Published totals, and expired jobs as Closed. Existing HR authorization remains before reads; no authorization, data access, RLS, storage, or applicant-data boundary changed in the range.
- The already-fixed timezone behavior is unchanged on the baseline.

## Evidence limits

- **P2 evidence gap:** no mounted hook/router test exercises overlapping or canceled transition ordering, clear/reset behavior, and debounce cancellation. The reviewer could not establish that runtime ordering from source alone. This is a coverage limit, not a confirmed defect.
- **P3 evidence gap:** attachment tests exercise the pure reconciliation helper, not a mounted form receiving refreshed props and rendering the new hidden revision. This is a coverage limit, not a confirmed defect.
- Reviewer source-only commands: `git status --short --branch`, `git rev-parse HEAD`, and `git diff --stat 3c9ba769f536679a3f546b5e5fbf5a254f059104..1b95de20158d3b24bea8c071b78f1a60b1054aaf`; source, tests, packet and requirement text were inspected. Working tree was clean at review time. Reviewer ran no tests or checks.
- The focused Bun/Vitest suite (9 files / 42 tests), typecheck, changed-file ESLint, Prettier and `git diff --check` are implementer-reported results recorded in `T01-implementer.md`; they were not independently repeated.
- No browser, database, hosted, production, or deployment smoke is claimed.

## Decision

- No code change requested by the reviewer. Student acceptance of the reviewed commit and the listed evidence limits remains pending.
