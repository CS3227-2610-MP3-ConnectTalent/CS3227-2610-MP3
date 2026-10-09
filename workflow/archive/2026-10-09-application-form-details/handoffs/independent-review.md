# Independent review handoff: #39 application details

- Date: 2026-10-09. Student owner: Paul Cheng. Baseline: develop `089e8bb` plus current uncommitted #39 diff.
- Actual reviewer: separate read-only Codex security/privacy execution `/root/application_details_independent_review`; no implementation involvement or file edits. Model identifier not recorded.
- Inputs: [approved proposal](../proposal.md), both [application](../specs/applications-and-review.md)/[privacy](../specs/security-and-privacy.md) deltas, [design](../design.md), [plan](../plan.md), source/migration/test changes and implementer check evidence.
- Scope: form39-AC-01–08, role/owner/RLS/grants, trusted email, freeze, complete-field revision/retry, validation and safe display, AI/audit minimization and coordinated migration risks.
- Exclusions: hosted operations, secrets, student acceptance, unrelated concurrent reflection edits. Browser/build/DB/race suites were not independently rerun.

## Findings and actual rechecks

| Finding/evidence | Result and disposition |
| --- | --- |
| Initial focused unit attempt | Sandbox `spawn EPERM`; infrastructure failure, not product failure. Escalated run passed 30 focused tests. |
| Low URL disagreement | Read-only SQL accepted malformed `https://%` and invalid IPv4 while Node URL rejected them; safe empty port had opposite mismatch. Rendering revalidated, no access escalation/XSS/SSRF demonstrated. Implementer aligned accepted authority syntax and added regression cases. |
| First fix recheck | 35 focused units passed; original cases corrected. Reviewer identified two residual malformed numeric hosts with trailing dots. |
| Final fix recheck | 37 focused tests across five files passed; read-only SQL confirmed malformed/trailing-dot authorities rejected, safe empty port accepted, and Unicode whitespace normalization. Low finding resolved for all reported triggers. |
| Evidence wording | Intake-only no-approval/no-implementation statements were stale. Primary updated historical qualifiers/current statuses and actual approval evidence. |
| Final source/whitespace | `git diff --check` passed. No new blocking issue found. Unbound action's hidden jobId is UUID-validated and remains untrusted; verified Applicant guard, DB role/job/owner checks and scoped reconciliation persist. prevState grants no authority. |

Reviewer source trace confirmed new schema is unexposed, normal users cannot execute its implementation directly, only authenticated v2 wrappers are callable, and legacy writes are revoked. Existing RLS denies draft contacts to HR/other owners. Auth supplies submitted email, frozen trigger preserves separate HR status writes, locks/revisions preserve complete-field concurrency. Escaped display and safe outbound links never fetch portfolios. AI projections retain selected letter/job only; metadata submission audit stays intact.

Final reviewer disposition: no unresolved blocking findings. Student acceptance and hosted cutover/testing remain pending. This handoff was drafted by the primary agent from the actual separate reviewer messages; it is not a claim that the reviewer wrote the file.
