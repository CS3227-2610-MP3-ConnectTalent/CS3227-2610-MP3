# Implementation plan: Vitest coverage report action

- Change/issues: `2026-10-14-vitest-coverage-action`; #72
- Owner/status/date: Johnwz123; accepted / archived with PR submission pending; 2026-10-14
- Approved inputs: [proposal.md](proposal.md), [design.md](design.md); no product spec delta
- Baseline and affected IDs: ProductSpec v1.9; VCA-AC-01 through VCA-AC-04
- Constraints: issue-focused branch `fix/72-vitest-coverage-action`; no Supabase/product behavior changes; no PR code execution in the privileged workflow; preserve current attempt scoping

## Dependency-ordered work

| Task ID / order | Depends on | Owner / agent role | Acceptance IDs | Exact files / expected change | Verification / evidence |
| --- | --- | --- | --- | --- | --- |
| T00 | None | Johnwz123 | All | Record approved scope and design; no product delta | User decision recorded in proposal/record |
| T01 | T00 | Implementer | VCA-AC-01, 02, 03 | `.github/workflows/ci.yml`, `.github/workflows/test-report.yml`, `vitest.config.ts`; produce JSON reports, upload exact attempt artifact, use upstream action with least privilege | YAML/action static checks, diff review, hosted run pending |
| T02 | T01 | Implementer | VCA-AC-04 | Remove custom `scripts/ci` report helpers and their `tests/ci` tests; preserve Renovate config test; update `README.md` and `CONTRIBUTING.md` | Static reference scan, docs review, `git diff --check`; application tests N/A |
| T03 | T01-T02 | Separate reviewer | VCA-AC-01 through 04 | Review changed workflows, permission boundary, action input/path mapping, cleanup, and evidence | Independent handoff with findings and exact revision |
| T04 | T03 | Johnwz123 | VCA-AC-01 through 04 | Record post-change acceptance or requested changes separately from review | Actual student decision in record |
| T05 | T04 | Johnwz123 | Process | Dated log, no-product sync, archive complete packet, then commit/push/PR as authorized | Closeout and PR evidence |

For config/documentation-only work, application behavior tests are N/A. Run relevant static checks and inspect the full diff. Hosted comment creation/update cannot be proved before the reporter reaches the default branch.

## Integration and handoffs

Implementation is sequential. Provide the separate reviewer the approved packet, exact baseline, changed-file list, static-check output, the observed hosted failure run, and the final implementation revision. Reviewer does not modify implementation files. Student acceptance is a separate gate after findings are resolved.

## Approval and completion evidence

- [x] Human approved the proposal, design, and plan on 2026-10-14; see [proposal.md](proposal.md#approval-record).
- [x] tasks.md matches work and evidence.
- [x] Independent review and human acceptance are recorded as separate gates.
- [x] Closeout log and packet archive are complete before PR submission.
- Approval/date/source: user approval in this conversation, 2026-10-14.
- Changes to this plan: none.
