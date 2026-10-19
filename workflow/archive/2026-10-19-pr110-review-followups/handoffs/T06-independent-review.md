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

- No source change requested by the reviewer. The requested assertion that refreshed application identity reaches the résumé panel was added, and its updated focused test, typecheck, lint, formatting and whitespace checks passed. Final read-only review found no source defect and confirmed the assertion gap is closed. The requester accepted the reviewed implementation with stated limits on 2026-10-19.

## Post-review implementation follow-up

After the initial review, the requester selected “Add the missing focused tests first.” The implementation added mounted Happy DOM tests for pending filter transitions/debounce/clear cancellation and refreshed application-form revision/identity props. Against the develop baseline, 4 of the 5 new tests failed and the clear-cancellation case passed; the complete focused suite passed 11 files / 47 tests. A separate re-review of range `3c9ba769f536679a3f546b5e5fbf5a254f059104..31cbf34d6df0f0852f0e65f3b6e3698fe6f8c4eb` found no source defect and confirmed the original test gaps were covered. It noted that the form test did not assert refreshed identity reached `ResumePanel`; this was fixed in `182b4a237815579748affef08c91e5fe1840fe5d`. Final review of range `3c9ba769f536679a3f546b5e5fbf5a254f059104..182b4a237815579748affef08c91e5fe1840fe5d` found no source defect and confirmed that assertion gap is closed. A residual integration limit remains for actual Next/browser navigation interruption. Happy DOM and the dev-only dependency were reviewed; the tests still use a mocked router and do not establish actual Next/browser behavior. This follow-up evidence does not establish student acceptance.

## Final re-review execution record

- Reviewer: separate read-only test-engineer execution `/root/pr110_fix_review`; run identifier/model unavailable.
- Reviewed range: `3c9ba769f536679a3f546b5e5fbf5a254f059104..182b4a237815579748affef08c91e5fe1840fe5d`; exact HEAD matched and the branch was clean and tracking origin.
- Findings: no source defect found; prior P3 form-test gap is closed by asserting refreshed `applicationId="application-2"` reaches the `ResumePanel` mock. Prior PR110-AC-01–05 conclusions still apply. Residual P2 validation limit: actual Next/browser interruption or out-of-order navigation remains unverified because the router mock commits synchronously. No new concern from Happy DOM or its lockfile addition.
- Reviewer commands: `git status --short --branch`, `git rev-parse HEAD`, `git diff --stat` for the requested range, `git diff --name-status` from `31cbf34` to `182b4a2`, and `git show`/`rg` on the new assertion and packet. Reviewer ran no tests/checks; all reported test and static-check results are implementer-reported.
- Independence: read-only test-engineer execution did not implement or author tests. This review is not student acceptance.
- The acceptance decision explicitly records the remaining mocked-router runtime limit; see `../proposal.md` and `../record.md`.

## PR #119 post-submission re-review

- Reviewer: separate read-only test-engineer execution `/root/pr110_fix_review`; no implementation or test authorship. This is not student acceptance.
- Reviewed branch: `fix/115-pr110-review-followups` at `450ecbd87e804134fa1fe020a2ab3620faf02976`, including the uncommitted documentation changes to `proposal.md`, `tasks.md`, and both workflow indexes. Follow-up read-only link/attribution check also reviewed the new `logs/2026-10-19-pr119-review-followups.md` and this handoff.
- Compared with the prior accepted review through `182b4a2`, the only product-adjacent change was commit `284d7f1`, which adds `useSearchParams` to the `next/navigation` mock in `tests/unit/hr-application-pages.test.tsx`. No application source changed; no source or test-fixture defect was found in the repair.
- The packet updates correctly cite ProductSpec v1.18 at the recorded baseline, distinguish role-framed student acceptance from the earlier scope approval, mark T10 complete, and state that PR #119 is open and unmerged. The spec version was verified against the baseline `workflow/ProductSpec.md`, `workflow/specs/README.md`, and JMG-004.
- Initial documentation finding: both indexes linked to a not-yet-created summary. The new follow-up summary was added; a separate read-only check confirmed the links from both indexes and the archived feature record resolve. The summary accurately describes review scope and limitations.
- Reviewer commands for the source/test/docs re-review:

  ```text
  git status --short --branch
  git rev-parse HEAD
  git log -6 --oneline --decorate
  git diff --stat
  git diff --name-status
  git show --stat --oneline 284d7f1
  git show --format=fuller --no-ext-diff 284d7f1 -- tests/unit/hr-application-pages.test.tsx
  git diff --stat 182b4a237815579748affef08c91e5fe1840fe5d..450ecbd87e804134fa1fe020a2ab3620faf02976
  git diff --name-status 182b4a237815579748affef08c91e5fe1840fe5d..450ecbd87e804134fa1fe020a2ab3620faf02976
  git show 3c9ba769f536679a3f546b5e5fbf5a254f059104:workflow/ProductSpec.md | Select-Object -First 18
  git show 3c9ba769f536679a3f546b5e5fbf5a254f059104:workflow/specs/job-management.md | Select-Object -Skip 24 -First 20
  ```

- In the final link/attribution check, the reviewer ran `git status --short --branch`, `git rev-parse HEAD`, a targeted `rg -n` lookup for the three summary links, and `Get-Content` on the summary and this handoff. Exact search arguments were not retained.
- No application tests, formatting checks, or hosted product checks were run by the reviewer. No browser, hosted product, or runtime smoke is claimed by this re-review.
