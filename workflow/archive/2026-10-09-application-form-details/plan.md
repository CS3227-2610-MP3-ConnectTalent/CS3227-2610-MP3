# Plan: #39 application details

Paul Cheng; 2026-10-09; approved for implementation. Inputs: [proposal](proposal.md), [design](design.md), both [deltas](specs/applications-and-review.md). Baseline develop `089e8bb`, branch `feat/application-form-details`.

| Task | Depends on | Owned scope and evidence |
| --- | --- | --- |
| T00 | none | Paul approves named proposal, both deltas, design and plan; record exact decision. |
| T01 | T00 | Read relevant installed Next.js guidance, Supabase docs and Postgres skills before code/SQL. Write focused validation, forged-email, draft/submit, legacy-RPC, frozen-field and RLS tests; observe intended behavior failures. |
| T02 | T01 | Add migration/versioned RPCs and validation with verified Auth email, role/owner/grants, field bounds, job locks/revision and audit preservation. DB checks for owner/HR/guest, legacy data, audit privacy and concurrency. |
| T03 | T02 | Extend focused input/query/retry modules and server action state. Units cover complete-field lost-response matching, stale writes, trusted email and input preservation. |
| T04 | T03 | Form inputs with read-only email; resumed/saved/submitted views and HR detail contact display. Browser tests use only local synthetic accounts and mocked AI. |
| T05 | T04 | Run pnpm typecheck, scoped lint, test:unit, test:db, test:race, focused applicant/HR/browser flows and build. Extend existing fixtures to provide required fields, preserving their original denial/regression purpose. Verify explicit AI projections and no contact-bearing audit payloads. Record exact failures/results/limits. |
| T06 | T05 | Separate independent reviewer execution checks acceptance/security/privacy, SQL grants/RLS, race/retry and migration cutover. Resolve blocking findings with rechecks. |
| T07 | T06 | Separate student acceptance with true remaining hosted limits. No inference from tests. |
| T08 | T07 | Accepted canonical sync with current version reconciliation, complete archive, guides/reflection/session logs and link checks. |
| T09 | T08 | Commit/push/PR only with explicit user authorisation. PR into develop is final contributor action; hosted migration/merge/release are separate. |

Commands planned, not run for this proposal: `corepack pnpm test:unit`, `corepack pnpm typecheck`, `corepack pnpm test:db`, `corepack pnpm test:race`, scoped ESLint, local-only Playwright fixtures, `corepack pnpm build`. Confirm exact package scripts before execution. Local migration only, no reset without explicit authorisation. No live model call required. Static packet link/whitespace checks apply now; behavior checks are Not run until approved implementation.

Implementation approval: Paul Cheng, 2026-10-09, explicit “Approve as written” reply to the question naming #39 proposal, both deltas, design and plan, including limits, freeze, legacy display and coordinated cutover. Separate acceptance with recorded limits was received on 2026-10-09; see record.md for sync/archive and remaining hosted gates.
