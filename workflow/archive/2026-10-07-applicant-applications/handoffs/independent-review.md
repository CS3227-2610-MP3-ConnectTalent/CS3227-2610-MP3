# Independent review: issue #6 Applicant applications

- Reviewer: separate Codex subagent `/root/independent_review`, 7 October 2026. The reviewer made no implementation or documentation edits and received a read-only review assignment. Model identity was not independently recorded.
- Scope: commit `f7ddb94` relative to `0200eb9`, then the uncommitted retry and race follow-up. Inputs were the packet, migration, RLS/grants, server queries/actions, tests and reported local results.
- Independence: reviewer did not implement this change or run the checks reported by the implementer. It reviewed source, test design and diff in separate executions. `git diff --check` passed in reviewer runs.

## Findings and rechecks

| Finding | Original review | Resolution and independent recheck |
| --- | --- | --- |
| F1, medium: a committed submit whose response was lost could be retried and shown as a generic save failure | The original action mapped all RPC errors to a generic failure, even if a submission existed. | Action now re-reads only the signed-in Applicant's row for the selected job through RLS, shows the existing submission and warns its text may differ. Save/edit reconciliation requires matching current text. Reviewer checked the action, helper and focused action test; no new read grant or cross-user path was found. The implementer ran 11/11 unit tests. Reviewer considers F1 resolved. A literal dropped-network browser test was not run. |
| F2, evidence gap: concurrent submit and job closure | Original pgTAP checked sequential denial and the SQL locking design, but not contested sessions. | New local Docker integration test uses separate psql sessions and checks a named competing session is waiting on a PostgreSQL `Lock` before the first transaction commits. It verifies duplicate submit, close-first and submit-first final states. First test design using `psql -c` failed to observe a lock; switching to streamed `-f -` passed. Reviewer checked the revised design and considers F2 resolved, conditional on the implementer's reported local pass. Reviewer did not independently run Docker. |
| F3, scope limitation: HR status permissions | No HR status field or HR UI exists in issue #6, so status denial cannot be end-to-end tested here. | Remains a bounded follow-up for HR issue #9. Applicant role changes and application writes have database denial checks. Do not claim full HR workflow evidence. |

No confirmed database permission bypass was found. The reviewer inspected RLS, grants, security-definer function boundaries, verified Applicant checks, job locking and original-submission preservation. The reviewer could not run Vitest/pgTAP in its sandbox because process spawning and Supabase telemetry were denied; the listed passes are implementer evidence. This is local review and test evidence, not CI, staging or production verification.
