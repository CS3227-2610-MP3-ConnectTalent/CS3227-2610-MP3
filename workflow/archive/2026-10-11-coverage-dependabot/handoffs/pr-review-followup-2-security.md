# PR review follow-up 2: security review handoff

- Issues/tasks: #58, QG-AC-04 and QG-AC-05; post-submission review for PR #61.
- Human accountable owner: issue owner remains pending triage.
- Assignment: `/root/coverage_security_review`, separate read-only follow-up execution on 2026-10-12; no implementation edits or test authorship.
- Scope: artifact provenance, report wording, GitHub token redirects, bounded extraction, destination path writes, parsed report integrity, and current-head comment updates.
- Baseline/revision: merge commit `a2c44e01d9706fd32ccf2dfb2fbc800abf775cfc` to the post-fix worktree on `chore/58-coverage-and-dependabot` (before the follow-up commits).
- Exclusions: `docs/PaulReflections.md` and other personal reflection content were not inspected.

## Findings and dispositions

### P2: PR-controlled artifacts are not independently attested

The PR's CI workflow can be changed to skip tests and upload schema-valid fabricated JUnit or coverage data. Artifact bounds and schema validation prevent unsafe extraction and malformed values, but cannot prove that the reported tests ran. The initial report could therefore pair fabricated figures with a successful workflow conclusion.

The report now labels its source: counts and coverage are from artifacts supplied by the PR's CI run and are not independently attested. README, CONTRIBUTING, and Developer Guide repeat that limitation. The 90% target remains report-only. This resolves the misleading-presentation portion; it does not authenticate the artifact. Whether this disclosure satisfies QG-AC-05 remains for the user to decide. No claim of independently verified test execution or coverage is made.

### P3: dangling destination symlink

The downloader previously tested `exists()` before `is_symlink()`, which misses dangling symlinks. It now checks the destination, parent directories, and target files with `is_symlink()` unconditionally before writes. A regression simulates `exists() == False` and `is_symlink() == True`, then verifies rejection before directory creation or file writes.

## Recheck evidence and limitations

- Reviewer source recheck: report disclosure is present in `scripts/ci/vitest_reports.py`; unconditional symlink checks are present in `scripts/ci/download_vitest_artifact.py`; regression is in `tests/ci/test_download_vitest_artifact.py`.
- Reviewer did not execute tests. Implementer ran `python.exe` `unittest` discovery for `tests/ci`; 39 tests passed after the fixes. Test-first runs showed the new provenance assertion and dangling-symlink test failing before implementation.
- The implementer ran the repository-wide installed Prettier check; it passed. Hosted reporter, GitHub token, artifact authenticity, and live PR comment behavior remain unverified.
- Reviewer independence: separate agent execution from the implementer; reviewer made no edits. The reviewer had reviewed an earlier revision of the reporting change, so this was an independent follow-up recheck, not a first-look review.
- Human disposition of the remaining QG-AC-05 authenticity limitation: pending.
