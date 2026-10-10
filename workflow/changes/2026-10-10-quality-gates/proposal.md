# Proposal: formatting and complexity gates

- Change ID: 2026-10-10-quality-gates
- Issues: [#51](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/51)
- Owner: Johnwz123 (student owner; approved)
- Status: approved; implementation in progress
- Date: 2026-10-10
- Baseline: ProductSpec v1.4; this is process/tooling work and changes no product behavior
- Affected capabilities: none; no capability delta is proposed
- Classification: process/tooling only; medium change size because existing authored code may need refactoring

## Intent, problem, and motivation

CI currently runs ESLint, but the repository has no formatter check and no enforced limits for cyclomatic complexity, cognitive complexity, or code size. Add a reproducible Prettier policy and blocking ESLint rules so contributors can run the same checks locally and CI rejects violations.

Thresholds come from external engineering guidance and tool defaults, not a baseline scan of this repository. Any owned first-party source that violates the approved values will be refactored without raising the limits to accommodate existing code.

## Goals, non-goals, and scope boundaries

- Goals:
  - Add Prettier and scripts to check and apply formatting.
  - Make formatting and the four approved ESLint limits blocking CI steps.
  - Keep first-party code within fixed thresholds, refactoring violations while preserving behavior.
- Non-goals: product behavior, security/authorization, database/schema, testing-framework, coverage-reporting, docs-site, deployment, pnpm version, or reflection-publication changes.
- Users/roles: contributors maintaining the repository; Applicant and HR product behavior is unaffected.
- Scope boundaries: package/tool config, CI, maintained repository files formatted by Prettier, and only the first-party source/test/config files that must change to meet approved ESLint limits. Do not inspect or modify `Reflections.md`, `JohnReflections.md`, or `PaulReflections.md`. Do not rewrite historical records, archived packets, session logs, lockfiles with Prettier, or generated/vendor output.

### Proposed limits and basis

| Measure               | Proposed blocking limit | Basis                                                                                                                                                 |
| --------------------- | ----------------------: | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| Cyclomatic complexity |      20, classic McCabe | ESLint's `complexity` rule default is 20.                                                                                                             |
| Cognitive complexity  |         15 per function | SonarJS uses 15 as its S3776 default threshold.                                                                                                       |
| Lines per file        |                     300 | ESLint's `max-lines` default is 300; its documentation says there is no objective maximum and reports common recommendations in a 100–500 line range. |
| Lines per function    |                      50 | ESLint's `max-lines-per-function` default is 50.                                                                                                      |

These are established tool defaults, not universal industry mandates. Use ESLint's default option behavior for the line rules: blank and comment-only lines count, and IIFEs are handled as the rule does by default. The limits will be ESLint errors and will apply across the first-party JS/TS files ESLint currently checks, including tests and scripts. Generated/vendor output remains excluded. No exception overrides will be added just to preserve a current violation.

References: [SonarJS rule configuration](https://github.com/SonarSource/SonarJS/blob/master/docs/rule-configuration-patterns.md); [ESLint `complexity`](https://eslint.org/docs/latest/rules/complexity); [ESLint `max-lines`](https://eslint.org/docs/latest/rules/max-lines); [ESLint `max-lines-per-function`](https://eslint.org/docs/latest/rules/max-lines-per-function).

### Prettier policy proposed

Use Prettier's defaults for semicolons, double quotes, two-space indentation, trailing commas, and an 80-column print width; the first three match the existing project style. Check and format supported maintained repository files, including source, tests, project configuration, and maintained documentation. Ignore dependency/build/test output, `pnpm-lock.yaml`, historical workflow captures under `.superpowers/`, `logs/`, `workflow/archive/`, `workflow/records/`, externally maintained Supabase skill copies, and the three personal reflection files. Historical evidence, vendor content, and reflection authorship remain intact.

Use `eslint-config-prettier/flat` to disable any overlapping ESLint formatting rules, and the maintained `eslint-plugin-sonarjs` package for cognitive complexity. Add `pnpm format` and `pnpm format:check`; CI runs `pnpm format:check` and the existing `pnpm lint` step.

## Alternatives and dependencies

| Alternative                                                           | Benefit / cost / risk                                                                     | Decision and reason                                                                |
| --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Keep current checks only                                              | No new dependencies or refactoring; leaves formatting and complexity unenforced           | Rejected because the requested gates would remain absent.                          |
| Use Prettier defaults and the recommended SonarJS cognitive threshold | Small policy surface, aligns with observed quote/indent style and established tool values | Proposed.                                                                          |
| Set limits from the current code                                      | Easier initial adoption; embeds current violations into the standard                      | Rejected by the requester; use the approved tool defaults and refactor violations. |

- Assumptions: the issue requester is Johnwz123, confirmed as the student owner through the issue account and approval in chat. Formatter file globs and ignores are recorded above.
- Dependencies: pnpm 12.8.1 and network access for approved dev dependencies/lockfile update.
- Risks: autoformatting can create broad diffs; limit that by excluding preserved historical evidence and reviewing the formatter scope/diff. Behavior-preserving refactors can still introduce regressions; run planned unit checks and the configured CI suite after refactoring.
- Open decisions: none for the approved thresholds or formatter scope; implementation evidence and separate acceptance remain pending.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome                                                                                                                                                              | Required evidence and owner                                                                                           |
| ------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| QG-AC-01      | Issue #51; process-only                       | Given maintained supported files, when `pnpm format` is run, then those files follow the approved Prettier policy while protected historical/reflection/generated files are untouched.   | Prettier check, reviewed changed-file list/diff; implementer.                                                         |
| QG-AC-02      | Issue #51; process-only                       | Given ESLint runs on first-party JS/TS, when a function exceeds cyclomatic 20 or cognitive 15, a file exceeds 300 lines, or a function exceeds 50 lines, then `pnpm lint` exits nonzero. | Rule config plus lint output, including a temporary/config-level rule probe if needed; implementer.                   |
| QG-AC-03      | Issue #51; process-only                       | Given a PR runs CI, when formatting or lint rules fail, then the CI job fails; when they pass, later existing CI steps remain in the job.                                                | Workflow diff and CI results; implementer.                                                                            |
| QG-AC-04      | Issue #51; process-only                       | Given owned source exceeds an approved limit, when refactored, then it satisfies the fixed limit without behavior changes or a threshold exception.                                      | Lint evidence, changed-code review, and unit verification for refactored behavior-bearing code; implementer/reviewer. |
| QG-AC-05      | Issue #51; process-only                       | Given the personal reflection documents and historical evidence, when formatting runs, then these files are not read or changed by this work.                                            | Ignore configuration and final path/diff review; implementer.                                                         |

- Spec deltas: N/A; no product capability or behavior changes.
- Design: omitted; this is a bounded tooling/configuration integration with no application architecture, authorization, data, AI, or service-interface impact. The technical choices and ignore boundaries are recorded here and in `plan.md`.
- Plan and tasks: `plan.md` and `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, thresholds, formatter exclusions, and no-product-delta decision reviewed.
- [x] Proposal and plan agreed before implementation.
- Approver: Johnwz123, student owner
- Decision/date/source: approved in chat on 2026-10-10; user requested SonarJS cognitive default 15 and ESLint defaults for the other limits, then authorized implementation.
- Conditions: use complexity 20, cognitive complexity 15, max-lines 300, and max-lines-per-function 50; retain ESLint default option behavior and do not tune limits to current code.
