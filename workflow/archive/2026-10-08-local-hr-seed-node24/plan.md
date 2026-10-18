# Plan: local HR seed and Node 24 docs (#24, #25)

Status: approved for implementation on 8 October 2026 by Paul Cheng. Inputs: [proposal](proposal.md), [design](design.md), [tasks](tasks.md). Baseline: ProductSpec v0.9 at `develop` `644bda6`. No product delta; canonical sync N/A if scope remains local tooling/docs.

| Task | Depends on | Files and result | Evidence |
| --- | --- | --- | --- |
| T01 issue/branch/packet | None | #24/#25 linked; branch from updated `develop`; #21 closed | Issue URLs, branch and packet check |
| T02 test-first guards and provisioning | Approval | `tests/unit/local-hr-seed.test.ts`, `scripts/seed-local-hr.mjs`, `package.json`; exact local URL guard, Auth create/rerun, no-application HR promotion | Focused red/green and negative tests; no secret output |
| T03 local integration and old-account cleanup | T02, running local stack | Inspect synthetic HR identities without logging private fields; revoke only the uniquely identified earlier fixture's HR role and retain its review history, as Paul later directed; run new command and sign in | Local before/after role/history counts and login result |
| T04 setup docs | Approval, T02 | `README.md`, `CONTRIBUTING.md`, relevant Developer Guide; Node 24/Corepack explanation and local seed instructions | Link/content check, `git diff --check`; no app test for docs-only portion |
| T05 review and closeout | T02–T04 | Independent security/privacy review, feature record, dated log, student acceptance; archive after acceptance | Actual handoff, check outputs, separate student decision |
| T06 PR | T05 | Issue-linked PR to `develop` when separately authorized | PR evidence; merge/release later |

Keep #21 demo files and any hosted Supabase/Vercel configuration out of this branch. Script failures must not alter an unrelated account. No commit, push, PR, hosted operation or release is authorized by this plan alone.

- [x] Student approved proposal, design and plan before T02/T04 implementation.
- Approval source/date: explicit “Approve as written (Recommended)” reply in this conversation, 8 October 2026.
