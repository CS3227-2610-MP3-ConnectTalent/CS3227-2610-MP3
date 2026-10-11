# Unit coverage target and PR reporting Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use `superpowers:subagent-driven-development` (recommended) or `superpowers:executing-plans` to implement this plan task-by-task.

**Goal:** Improve global coverage to the 90% objective for lines, statements, branches, and functions, and publish one safe, updating PR comment with unit-test results and those four metrics. Coverage below target is informational and does not block CI; unit-test failures remain blocking.

**Architecture:** Keep unit execution and coverage artifact generation in the existing read-only app CI workflow, with no coverage threshold that fails the job. A separate default-branch `workflow_run` reporter downloads only the exact run's JUnit and coverage artifact, validates the PR association and current head, then upserts a marked comment without checking out or executing PR code. Reuse standard-library Python parsing and GitHub REST handling, with unit tests for report parsing, PR selection, and comment updates.

**Tech Stack:** Vitest 5 / V8, GitHub Actions artifacts and workflow-run events, Python standard library, GitHub REST API, pnpm 12.8.1, Node.js 24.

**Spec:** [Design](design.md) and [proposal](proposal.md); no product-spec delta.

## Global Constraints

- Vitest measures the existing `src/**/*.{ts,tsx}` include scope; do not remove paths or add exclusions to reach the target.
- Report a 90% objective for each of `lines`, `statements`, `branches`, and `functions`; do not configure coverage thresholds that fail CI or block merges.
- Coverage below 90% is labeled below target in the job summary and PR comment. Unit-test failures continue to fail CI.
- Unit tests remain `tests/unit/**/*.test.ts` and `tests/unit/**/*.test.tsx`.
- The PR test workflow remains read-only and runs on pull requests to `develop` and `master`.
- Only the default-branch report workflow may write a PR comment; it must not check out or execute PR code or artifact contents.
- A comment update requires a unique open PR association, target base `develop` or `master`, and an exact current-head SHA match.
- A report run older than the report currently shown for the same PR head must not replace the newer report; preserve run id, attempt, and creation time in the report marker for ordering.
- No credentials, private applicant data, production database, or hosted Supabase project may be used.
- Repository ruleset changes are out of scope in the approved design; merge blocking is unconfirmed pending an administrator decision.

## Review Focus

- Any metric below 90% must be reported as below target without failing coverage CI; test the 89.99%/90.00% boundary in report-status logic.
- Missing or malformed JUnit/coverage data must yield an explicit unavailable state and must never look like a passing test run.
- XML with a DTD/entity, malformed JSON/XML, oversized files, or unexpected structures must be rejected without evaluation or execution.
- A fork PR may receive a report only when the base repository, sole PR association, fork repository, and current head SHA match the completed CI run. Stale SHA, closed PR, wrong base branch, or ambiguous workflow associations must never receive a comment update.
- Repeated workflow runs for the same PR must update one marker comment; a prior run must not overwrite a result for a newer head.

---

### Task 58-01: Record the current coverage gap map

**Files:**

- Read: `vitest.config.ts`
- Read: `tests/unit/**/*.test.ts`, `tests/unit/**/*.test.tsx`
- Read: `src/**/*.{ts,tsx}`
- Evidence: `record.md` (baseline metrics and link to local coverage output when available)

**Interfaces:**

- Consumes: approved `design.md`, current source include and unit-test suite.
- Produces: baseline four-metric totals and a file/branch gap map for the unchanged coverage scope.

- [x] **Step 1: Run the baseline coverage command after plan approval**

Run: `pnpm test:unit:coverage`

Expected: existing suite exits successfully and writes `coverage/coverage-summary.json`, `coverage/lcov.info`, and `coverage/index.html`. Record line, statement, branch, and function percentages and identify uncovered behavior branches from the detailed output. If the environment cannot run pnpm, record the exact failure and use the PR's CI artifact after a branch is available.

- [x] **Step 2: Map each reported gap to an existing behavior/test boundary**

Record each affected `src/` path, the uncovered behavior or branch, and its existing or planned `tests/unit/` file in `record.md`. Do not edit source or tests in this inventory step.

### Task 58-02: Add meaningful tests for uncovered behavior

**Files:**

- Create/modify: `tests/unit/<feature-matched>.test.ts` or `tests/unit/<feature-matched>.test.tsx`, selected from Task 58-01's gap map.
- Modify only when required: the corresponding `src/**/*.ts` or `src/**/*.tsx` modules listed in the gap map.

**Interfaces:**

- Consumes: the baseline gap map and existing feature contracts/tests.
- Produces: behavior-focused tests that exercise uncovered statements and branch outcomes; minimal source refactoring only where needed for clear, testable responsibilities.

- [x] **Step 1: Add behavior-focused tests across the approved coverage scope** — added focused coverage for previously untested application, auth, AI, resume, Applicant/HR UI, and data-access behavior; detailed file-level changes are in `tasks.md` and current totals are in `record.md`.

For each selected gap, assert the existing expected result, denial, fallback, or error behavior through the module's public function/action/route boundary. Do not test private implementation details or change the measured source scope. These tests may pass immediately if the behavior is already correct; record each test and its initial result in `record.md`.

- [x] **Step 2: Run focused tests and investigate failures** — expanded tests pass in the complete unit suite; no product behavior changes were needed.

Run: `pnpm exec vitest run <focused-test-file> -t <test-name>`

Expected: each assertion validates the existing behavior. If it fails, determine whether the cause is a test setup issue, an implementation defect, or a changed product expectation. Do not change product behavior or invent requirements under this coverage-only issue; record any such defect for separately approved work.

- [x] **Step 3: Implement only behavior-preserving testability changes when needed** — no product behavior or authorization rules were changed.

Refactor source only if needed to exercise existing behavior through an appropriate public boundary, and preserve authorization and persistence paths. If expected product behavior needs to change, stop and reopen the proposal/design gate.

- [x] **Step 4: Verify tests and repeat coverage** — the final CI-mode suite passes 334 tests and all four global metrics meet 90%, with the approved source scope unchanged.

Run: `pnpm exec vitest run <focused-test-file>` and `pnpm test:unit:coverage`.

Expected: focused tests pass; the four totals improve without source exclusions. Repeat the test-first cycle until each global metric reaches at least 90%. If the reviewed source scope contains generated/unreachable modules that prevent the agreed target, stop and request a separate scope decision rather than reducing the target or changing source scope without approval.

### Task 58-03: Report the four coverage metrics and preserve CI artifacts

**Files:**

- Modify: `vitest.config.ts` only if needed to preserve report outputs; never add failing global coverage thresholds.
- Modify: `scripts/ci/write-vitest-summary.py`
- Modify only if required to keep the report artifact complete: `.github/workflows/ci.yml`

**Interfaces:**

- Consumes: completed unit tests from Task 58-02 and current CI artifact name `vitest-reports`.
- Produces: a job summary showing test counts, the four coverage metrics, and their status against 90%; existing JUnit/HTML/lcov/JSON artifacts remain uploaded with `if: always()`.

- [x] **Step 1: Keep below-target coverage nonblocking** — Vitest global thresholds remain unset; the PR report is informational.

Keep Vitest global coverage thresholds unset so below-target coverage does not fail CI. Preserve generation of the four metrics and do not add per-file overrides or coverage excludes.

- [x] **Step 2: Show all four metrics in the job summary** — validated against generated JUnit and coverage artifacts; unavailable/failed states remain explicit.

Keep the JUnit test/failure/error/skipped counts. Show the four percentages, the 90% target, and whether each metric meets or is below target. State that coverage is informational; missing data is labeled unavailable, not zero or pass.

- [x] **Step 3: Run coverage and inspect artifacts** — CI-mode run passed 60 files/334 tests and generated JUnit plus coverage reports; results are recorded in `record.md`.

Run: `pnpm test:unit:coverage`

Expected: the suite passes when tests pass even if coverage is below 90%; `test-results/vitest-junit.xml`, `coverage/coverage-summary.json`, `coverage/lcov.info`, and `coverage/index.html` exist. Verify report status at just-below and at-target values; do not add a failing coverage threshold.

### Task 58-04: Build and test shared report parsing

**Files:**

- Create: `scripts/ci/vitest_reports.py`
- Modify: `scripts/ci/write-vitest-summary.py`
- Create: `tests/ci/test_vitest_reports.py`

**Interfaces:**

- Create `read_test_counts(report_path) -> dict[str, int] | None` for `tests`, `failures`, `errors`, and `skipped` across JUnit `testsuite` and `testsuites` roots.
- Create `read_coverage_metrics(summary_path) -> dict[str, float] | None` for `lines`, `statements`, `branches`, and `functions` from `coverage-summary.json`'s `total` block.
- Create `render_markdown(test_counts, coverage_metrics, workflow_status, run_url) -> str` with explicit unavailable/error states and no HTML from report values.
- Preserve current summary writer behavior while using the shared parser.

- [x] **Step 1: Write Python unittest cases first**

Cover passing/failing/skipped JUnit counts for both root shapes; empty/missing/malformed XML; rejection of DTD/entity declarations; missing/malformed coverage JSON; all four percentages; and report rendering with failed or unavailable results.

- [x] **Step 2: Run focused tests and investigate failures** — final 23-test suite passes; the initial failing-test transcript was not retained in the packet.

Run: `python -m unittest discover -s tests/ci -p "test_vitest_reports.py" -v`

Expected: tests fail because the parser module/interfaces do not yet exist.

- [x] **Step 3: Implement the standard-library parser and refactor the job summary**

Apply file-size bounds before parsing; reject DTD/entity declarations; validate expected object shapes and finite 0–100 percentages; do not trust or evaluate artifact-provided markup.

- [x] **Step 4: Run the CI-report unit suite** — the initial suite passed 23 tests; after review regressions were added, the final suite passed 28 tests. Direct summary generation was also verified against real local artifacts.

Run: `python -m unittest discover -s tests/ci -p "test_*.py" -v`

Expected: parser/reporting cases pass with no network access.

### Task 58-05: Add the artifact-only PR report workflow

**Files:**

- Create: `.github/workflows/test-report.yml`
- Create: `scripts/ci/report_vitest_pr.py`
- Create: `tests/ci/test_report_vitest_pr.py`
- Read/modify only if necessary: `.github/workflows/ci.yml`

**Interfaces:**

- Reporter consumes the `workflow_run` event payload, exact upstream run id, `vitest-reports` artifact, GitHub token, repository metadata, and `GITHUB_STEP_SUMMARY`.
- Reporter validates source workflow `CI`, event `pull_request`, repository, one associated PR, PR open state, base `develop`/`master`, and equality of run head SHA to the current PR head.
- Reporter uses GitHub REST `actions: read`, `contents: read`, `pull-requests: read`, and `issues: write`; the normal CI workflow retains `contents: read` only.
- Reporter upserts one issue comment containing a stable marker, run URL/conclusion, test counts, all four percentages, and explicit unavailable/failure state.

- [x] **Step 1: Add tests for PR association and comment upsert** — mocked tests cover same-repository and fork associations, stale and unsafe PRs, pagination, duplicate marker handling, and run ordering.

Cover valid same-repository and fork PR associations; stale SHA; closed PR; wrong base; no/multiple PR associations; upstream non-PR event; list-comments pagination; first comment creation; marker comment update; no duplicate marker comments; and GitHub API failure.

- [x] **Step 2: Run focused reporter tests** — final CI helper test suite passes; the initial failing-test transcript was not retained in the packet.

Run: `python -m unittest discover -s tests/ci -p "test_report_vitest_pr.py" -v`

Expected: tests fail for missing reporter behavior. Tests must mock HTTP and make no network writes.

- [x] **Step 3: Implement default-branch reporter logic** — reporter checks out only the default branch, consumes the exact run artifact, and does not execute PR code.

Use the event's run id to download only artifact `vitest-reports` using `actions/download-artifact@v4` with repository, run-id, and `GITHUB_TOKEN` (`actions: read`). Explicitly check out only the default branch if a checkout is needed; never check out the PR head. Parse the artifact through Task 58-04's functions and use GitHub REST for PR/comment calls. Do not interpolate artifact values into shell commands.

- [x] **Step 4: Fail closed on unsafe associations; report safe missing data** — mocked tests verify unsafe/stale/ambiguous paths and explicit unavailable states.

Do not write a comment for an ambiguous, closed, wrong-repository, wrong-base, or stale PR association. For a unique current PR with absent/invalid JUnit or coverage data, upsert an explicit unavailable report that cannot be mistaken for passing tests. Compare incoming run id, attempt, and creation time to the existing report marker so delayed older runs cannot overwrite newer results, including across different head SHAs. The underlying CI workflow remains authoritative for unit-test pass/fail; coverage status is informational.

- [x] **Step 5: Run CI report unit tests and inspect permissions** — the final 28-test suite passes; live GitHub workflow behavior remains pending default-branch availability.

Run: `python -m unittest discover -s tests/ci -p "test_*.py" -v`

Expected: parser and mocked GitHub API tests pass; reporter token permissions are isolated to its job; no PR code/artifact execution or PR-workflow write permission exists.

### Task 58-06: Update current contributor guidance

**Files:**

- Modify: `README.md`
- Modify: `CONTRIBUTING.md`
- Modify: `docs/DeveloperGuide.md`
- Modify: `workflow/changes/README.md`, packet `proposal.md`, `design.md`, `record.md`, and `tasks.md` as evidence is produced.

- [x] Update README, CONTRIBUTING, and Developer Guide to explain the report-only four-metric target, failed-test behavior, reporter trust boundary, and Dependabot scope without claiming unverified repository settings.
- [x] Check changed-file formatting, relative Markdown links, and whitespace. The initial full repository formatter check found 187 pre-existing files; those were formatted during closeout and the follow-up full check passes (recorded in `record.md`).

### Task 58-07: Run final implementation checks

**Files:** no additional files; verify the completed Task 58-01 through Task 58-06 diff.

- [x] Run `pnpm format:check`; the initial run found 187 pre-existing unformatted files. After `pnpm format`, the full repository check passes.
- [x] Run `pnpm lint`, `pnpm exec next typegen`, `pnpm typecheck`, and `pnpm build`; all pass.
- [x] Run `CI=true pnpm test:unit:coverage --reporter=dot`; 60 files/334 tests pass and all four reported metrics meet 90%. No threshold makes coverage a failing CI condition. One earlier reviewer run timed out once in the existing PDF input test; its isolated file and this later full run passed.
- [x] Run `python -m unittest discover -s tests/ci -p "test_*.py" -v`; the final 28 tests pass.
- [ ] Require the existing Supabase CI database, integration, and critical-browser jobs to pass for the PR. They use local disposable services; no hosted credentials. The scheduled full browser suite is not a per-PR requirement unless the changed paths warrant it.
- [ ] Verify the PR comment on a hosted test PR, including update, failed-test, stale, and ambiguous cases. The default-branch workflow is not available for live rehearsal on this branch; mocked coverage is recorded above. Do not claim fork execution unless observed.

## Integration and handoffs

Coverage/backfill and report work belong to issue #58; Dependabot is independently planned in [dependabot-plan.md](dependabot-plan.md) for issue #59. Both may land in one issue-linked PR after each issue's acceptance evidence is complete. Tasks 58-04/58-05 share report-parser interfaces and must stay ordered. The primary agent implemented inline after approval; separate security and test reviewers completed read-only reviews, recorded in the packet handoffs. Issue owner remains pending triage.

The baseline command initially could not start through the normal PowerShell PATH. After plan approval, the directly installed pnpm 12.8.1 executable ran with Node v24.16.0; baseline totals and the unchanged source scope are recorded in `record.md` and `coverage-baseline.csv`.

## Approval and completion evidence

- [x] User approved the revised report-only coverage policy, written proposal/design, and both issue scopes (recorded 2026-10-11).
- [x] User approved this plan and `dependabot-plan.md` for inline implementation in chat on 2026-10-11.
- [x] `tasks.md` matches both plans and records actual evidence.
- [x] Independent review and human acceptance are recorded as separate gates; the user accepted implementation on 2026-10-11.
- [x] No product-spec sync was expected; the accepted packet was archived after documenting N/A.
- Approval/date/source: approved in chat by user on 2026-10-11; inline implementation authorized.
- Changes to this plan: coverage reporting is informational per the revised user decision; any future coverage merge gate or GitHub ruleset change requires a separate decision and plan amendment.
