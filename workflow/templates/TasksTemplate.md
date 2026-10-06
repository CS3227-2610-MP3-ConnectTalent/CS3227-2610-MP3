# Tasks: <short name>

Copy to `workflow/changes/<YYYY-MM-DD-short-name>/tasks.md`. Match plan.md task IDs and dependencies. Check a box only after its named evidence exists; assignment or a claimed result alone is insufficient.

- Change/issues: <date-name; issue links>
- Plan/record: <plan.md; record.md>
- Status/owner: <pending / in progress; student>

## Before implementation

- [ ] T00 — <human owner> records approval of proposal, deltas, design or omission, and plan. Evidence: <decision/date/source in record.md>; dependencies: <none>.

## Ordered implementation

- [ ] T01 — <student / agent role> implements <bounded deliverable>. Depends on: <T00>. IDs: <canonical and acceptance IDs>. Files: <exact paths>. Verification: <command/review and expected outcome>. Evidence: <actual command/output and commit link in record.md; pending until run>.
- [ ] T02 — <owner / role> integrates <next deliverable>. Depends on: <T01>. IDs: <IDs>. Files: <paths>. Verification: <command and expected result>. Evidence: <record/log link>.

Expand with test-first, documentation, security, migration, deployment or rollback tasks only where relevant. Record N/A and the reason for omitted categories in plan.md; do not imply irrelevant checks ran.

## Review and closeout

- [ ] <task ID> — Independent reviewer <name/tool> checks the final diff, acceptance cases and risks; records independence, findings and their resolution. Depends on: <implementation IDs>. Evidence: <review artifact and commit range>.
- [ ] <task ID> — Human owner <name> records acceptance or changes requested with date and limitations. Evidence: <actual decision in record.md>.
- [ ] <task ID> — <owner> updates applicable guides/reflections and lists every session summary in record.md. Evidence: <paths and checks>.
- [ ] <task ID> — <owner> completes pre-PR closeout: exact commands/outcomes, unresolved matters, session coverage and issue links. Evidence: <record.md and dated logs>.
- [ ] <task ID> — <authorized contributor> opens the issue-linked PR as the last contributor action. Evidence: <PR URL and Closes #N; keep pending until created>.

## Post-submission (separate decisions)

- [ ] <task ID> — <human owner> records merge/release decision and actual verification as applicable. Evidence: <decision/commit/release or N/A reason>.
- [ ] <task ID> — <owner> syncs accepted deltas to canonical specs before archive, verifies IDs/version/navigation, then preserves the entire packet under workflow/archive/<change-ID>/. Evidence: <sync commit, archive path, checks; docs-only: explicit no product delta>.
