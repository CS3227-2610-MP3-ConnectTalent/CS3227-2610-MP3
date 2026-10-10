# Implementation plan: formatting and complexity gates

- Change/issues: 2026-10-10-quality-gates; [#51](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/51)
- Owner/status/date: Johnwz123; approved/in progress; 2026-10-10
- Approved inputs: `proposal.md`; design omission recorded there; no product spec delta; user approval in chat on 2026-10-10
- Baseline and affected IDs: ProductSpec v1.4; no product requirement IDs; acceptance IDs QG-AC-01 through QG-AC-05
- Constraints: issue branch `chore/51-quality-gates` from `origin/develop`; do not inspect or modify the three personal reflection files; preserve logs, workflow archive/records, pnpm lockfile formatting, generated output and vendor output; fixed externally based limits only

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role                                    | Requirement and acceptance IDs | Exact files / expected change                                                                                                                      | Verification command or review / expected evidence                                                                                       |
| --------------- | ---------- | ----------------------------------------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| T00             | none       | Johnwz123 / student owner                             | QG-AC-01–05                    | Record issue approval of proposal/plan before implementation                                                                                       | Approval is recorded in `proposal.md` and `record.md`; completed 2026-10-10                                                              |
| T01             | T00        | implementer                                           | QG-AC-01, QG-AC-05             | Add Prettier dependency/config/scripts and ignore rules; format approved maintained supported files while preserving excluded files                | `pnpm format:check`, `git diff --check`, review changed paths and formatting diff                                                        |
| T02             | T00        | implementer                                           | QG-AC-02                       | Add SonarJS plugin and configure cyclomatic 20/classic, cognitive 15, max 300 lines/file, max 50 lines/function, using ESLint default rule options | `pnpm lint`; demonstrate the rules report violations using a controlled temporary or rule-test probe that is removed before closeout     |
| T03             | T01, T02   | implementer                                           | QG-AC-03                       | Add format check and retain lint as blocking steps in `.github/workflows/ci.yml`                                                                   | Review final workflow; run local scripts and report actual GitHub CI result if available                                                 |
| T04             | T02        | implementer                                           | QG-AC-04                       | Refactor only first-party JS/TS source/test/config code that exceeds fixed limits; preserve behavior and avoid threshold overrides                 | Run `pnpm lint`, `pnpm typecheck`, and `pnpm test:unit` after any behavior-bearing refactor; inspect diff and test evidence              |
| T05             | T01–T04    | independent reviewer, if separate execution available | QG-AC-01–05                    | Review final changed paths, exact rule scopes/values, refactors, ignore boundaries, CI enforcement, and behavior preservation                      | Independent findings, fixes, and rechecks recorded in handoff/record; otherwise mark independence unavailable and require student review |
| T06             | T05        | John / student owner                                  | QG-AC-01–05                    | Record acceptance or changes requested separately from implementation/review                                                                       | Actual decision/date/source in `record.md`                                                                                               |
| T07             | T06        | implementer                                           | process-only closeout          | Confirm no product delta, archive complete packet, update navigation if required, create dated session log, and inspect/commit closeout            | `git diff --check`, archive/index/link checks, record and summary links, final commit evidence                                           |
| T08             | T07        | authorized contributor                                | issue #51                      | Open PR to `develop` as final contributor action after closeout                                                                                    | PR link, `Closes #51`, template, packet/archive/log, actual checks/review/acceptance evidence                                            |

For any implementation refactor that changes application code, use the relevant existing unit tests first to observe intended behavior, then refactor while preserving the test result; add no new test unless the approved implementation scope requires one. T00 approval is complete; implementation may proceed within this plan.

## Integration and handoffs

This change has no application architecture or runtime integration design. `package.json`/`pnpm-lock.yaml`, `eslint.config.mjs`, formatter files, and the CI workflow are the shared tooling boundary. Apply formatter scripts and ignore policy before formatting; configure ESLint rules before lint-driven refactors; wire CI after local commands exist. Keep source refactors separate and focused if multiple files violate the limits.

## Approval and completion evidence

- [x] Human approved the proposal, formatter policy/ignores, limits, and this plan before implementation.
- [ ] `tasks.md` matches task order and names evidence.
- [ ] Independent review and human acceptance are recorded as separate gates.
- [ ] Closeout includes all checks, changed paths, behavior/rollback limits, and dated session summary.
- [ ] No product delta is synchronized; record this rationale before archive.
- [ ] PR is created only after complete packet archive and pre-PR evidence.
- Approval/date/source: Johnwz123 approved in chat on 2026-10-10.
- Changes to this plan: none.
