# Independent security review handoff

- Change/issues: `2026-10-09-soclaas-ai`; #7 and #10.
- Reviewer: separate delegated security/privacy reviewer (`/root/independent_security_review`), read-only, not the implementation author.
- Reviewed source: base `0a0f5c4`, merged feature HEAD `6806b08`, and the then-current uncommitted AI implementation. Scope covered AI authorization, data access, migrations/RLS, prompts, output handling, quotas/audit, submitted-letter freeze, and affected Applicant/HR paths.
- Exclusions: no `.env*` files, no applicant records, and no hosted system. Reviewer made no edits and did not rerun the implementer's recorded tests.

## Findings

### P2 — Authenticated users could consume shared AI capacity without invoking SoCLaaS

- Evidence: `supabase/migrations/20261009055743_soclaas_ai_security.sql` exposes `reserve_ai_invocation(text, uuid)` to `authenticated`; the function inserts a quota-counted `started` row. Any eligible authenticated user could call it directly through PostgREST. Twenty accounts could consume the 60-per-minute deployment quota without provider calls, denying legitimate users.
- Reviewer recommendation: restrict reservation creation to trusted server execution while retaining actor, role, and target checks; add direct-RPC denial coverage. Otherwise, obtain John's explicit acceptance of the availability risk.
- Disposition: the proposed fix needs renewed John approval because the approved plan says not to use a service-role key. The approval request is pending; no final disposition or recheck is claimed.

## Approved remediation and recheck status

- Decision: on 2026-10-09, John approved a server-only Supabase secret/service-role credential solely for quota/audit metadata RPCs and confirmed Applicant/HR content reads remain on the user RLS session. John also approved lowering the deployment cap to 24/minute while retaining provider 429 handling.
- Remediation: `20261009074830_ai_quota_service_role.sql` removes authenticated execute grants, grants the two quota/audit functions only to `service_role`, checks the supplied actor profile/role/target, and changes the deployment cap to 24. Both routes supply the authenticated actor ID to the server-only quota helper. Applicant and HR data queries continue to use the session client.
- Status: the original finding remains valid for the reviewed revision. The remediation has not yet been independently rechecked; that must be done against the final implementation commit and its current tests.

### P2 — An allowed summary string could contain a hiring recommendation

- Evidence: `src/lib/ai/schemas.ts` accepted arbitrary short strings inside the three allowed arrays; the prompt's instruction alone could not prevent a string such as “Recommend hiring this applicant.” The existing route test only rejected an extra top-level `recommendation` field.
- Reviewer recommendation: add an appropriate content control and adversarial regression test, or record the residual model-behavior risk for explicit student acceptance.
- Disposition: a lexical decision-language guard and tests for recommendation, rejection, and ranking phrases were added to the current uncommitted implementation. `pnpm exec vitest run tests/unit/ai-schemas.test.ts` passed 5/5. Separate reviewer recheck remains pending; the guard does not establish factual correctness or catch every possible paraphrase.

## Positive traces and limitations

The separate reviewer traced confirmed session and exact-role checks before protected reads/provider calls; the Applicant route reads one published job through the user session; the HR route reads one submitted application and its requirements through a target-scoped RPC; the provider is server-only, has no tools or automatic retries, and output is bounded, Zod-validated, and rendered as text. No AI status write path was found. Submitted-letter edit access is removed from the Applicant flow and the old edit RPC is revoked.

The review inspected the implementation evidence recorded in `record.md`: 64 unit tests, 122 database assertions, quota/application race checks, and Playwright 7 passed / 3 skipped. HR review and password-recovery E2E cases were skipped because the local service-role test key was unavailable. The reviewer did not rerun these checks. At review time there was no live model evaluation; the later synthetic-only evaluation is recorded separately in `record.md` and does not establish route integration or model factual correctness.

## Final recheck (2026-10-09)

- Reviewer: separate delegated Codex security/privacy reviewer, read-only and not the implementation author; no source edits.
- Revision and scope: `feat/7-10-soclaas-ai` at `9dfddb7a4d85349ba49d3915535d7cfad1f7832f`; rechecked `ab7e3da..9dfddb7` and the HR route behavior relevant to the prior P3.
- Disposition: P3 evidence gap resolved. The new HR route test forces final audit finalization to return false after generation and asserts the generic 503 response contains no summary, while the success-finalization call uses the expected actor and invocation. Reviewer found no remaining security findings in this recheck.
- Focused rerun: `& 'C:\Users\John\.bun\bin\bun.exe' node_modules/vitest/vitest.mjs run tests/unit/ai-schemas.test.ts tests/unit/ai-routes.test.ts tests/unit/ai-provider.test.ts tests/unit/hr-ai-summary.test.tsx` — 4 files/22 tests passed. Corepack was unavailable and the initial sandboxed Bun run failed with `EPERM`; the workspace-dependency rerun succeeded.
- The commit changes the test and packet record/tasks, not production code. Reviewed source boundaries remain as previously traced: authorization before protected reads/model calls, user-session application read, minimized model payload, source-ID HR mapping, metadata-only privileged quota/audit calls, no tools/status-write path, and provider error handling. These source observations and mocked unit coverage do not prove hosted RLS or deployment configuration.
- Residual limitation: the model can select an inaccurate source sentence ID; HR must check extracted points against the original letter. No live SoCLaaS call was made for this recheck. `.env.example` remains modified in the working tree and was not inspected or edited by the reviewer.
