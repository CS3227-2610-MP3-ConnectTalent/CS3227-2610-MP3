# Proposal: complete and safely default the environment example

- Change ID: 2026-10-09-env-example
- Issues: [#35](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/35)
- Owner: John (accountable student)
- Status: approved
- Date: 2026-10-09
- Baseline: [ProductSpec v1.1](../../ProductSpec.md)
- Affected capabilities: [OPS-002 / OPS-003](../../specs/deployment-and-operations.md); documentation only, no behavior delta
- Classification: documentation/configuration only; low risk

## Intent, problem, and motivation

The current `.env.example` has SoCLaaS enabled while its API key is a placeholder, and it omits the legacy server-key fallback used by the AI quota/audit client. The local test/seed admin variable has a separate purpose and must remain distinct from the application runtime credential. The example should enumerate current app and local test configuration while remaining safe when copied.

## Goals, non-goals, and scope boundaries

- Goals: document required public Supabase settings, opt-in SoCLaaS settings, either supported server-only AI audit key, and local-only test/seed settings; keep credentials as nonfunctional placeholders; identify platform-provided environment values.
- Non-goals: change application behavior, tests, database schema, hosted settings, deployment secrets, model selection, or variable names consumed by code.
- Users/roles: developers configuring the local Next.js application and local Supabase stack.
- Scope boundaries: edit `.env.example` and the SDD packet/log only; preserve no real credentials and do not inspect `.env.local` or `.env.dev`.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep SoCLaaS enabled with placeholder credentials | One less setup step, but a copied template can attempt a provider request with a fake key. | Rejected; default AI to disabled until real credentials/model are configured. |
| Reuse the runtime Supabase variable in local tests | Fewer names, but it weakens the local-test boundary and conflates separate consumers. | Rejected; retain `TEST_SUPABASE_SERVICE_ROLE_KEY` for local seed/E2E only. A local secret-key value may be copied under both names when needed locally. |
| List every optional Supabase service credential as an app setting | Appears exhaustive, but mixes disabled Studio/provider/S3 integrations with Next.js runtime settings. | Rejected; document them as optional Supabase config references in the record, not as required app variables. |

- Assumptions: the user-approved SoCLaaS endpoint remains the course gateway; a key may have different model/rate entitlements.
- Dependencies: local Supabase status for local public/admin keys; SoCLaaS course access for model credentials.
- Risks: accidentally enabling provider calls with placeholder values; mitigated by `SOCLAAS_AI_ENABLED=false` and comments.
- Open decisions: none.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| ENV-AC-01 | #35; OPS-002/OPS-003, no product delta | Given a developer copies the example, when it is used unchanged, then AI remains disabled and credentials remain placeholders. | Static inventory and final `.env.example` review; John |
| ENV-AC-02 | #35; OPS-002 | Given AI is enabled locally, when credentials are configured, then one documented modern/legacy server key is available for quota/audit RPCs and the test-only variable remains separate. | Compare names/consumers and inspect final file; John |
| ENV-AC-03 | #35; OPS-003 | Given setup variables are reviewed, then manually set app/test values are covered, platform-provided values are identified, and disabled optional Supabase integrations are not presented as app prerequisites. | Environment-reference inventory and whitespace/file-structure checks; John |

- Spec deltas: N/A; documentation/configuration only, no product behavior change.
- Design: omitted; a single example-file edit does not change architecture, authorization, schema, integrations, or data flow.
- Plan and tasks: `plan.md` and `tasks.md`.
- Evidence: `record.md`.

## Approval record

- [x] Scope, issue criteria, affected IDs, and unresolved questions reviewed.
- [x] Proposal, no-delta/design-omission, and plan approved before the file change.
- Approver: John, accountable student.
- Decision/date/source: approved by the user request in chat on 2026-10-09 to review, correct `.env.example`, commit/push, and open a PR if the review found no additional blockers.
- Conditions: preserve the local-only test credential boundary; do not commit real credentials; target `develop`.
