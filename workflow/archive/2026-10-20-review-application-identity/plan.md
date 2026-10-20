# Ordered implementation plan

1. Reproduce finding 1 with focused failing regression tests: draft A remains open, A is submitted/withdrawn, B is created with the same revision; old Save/Submit/file operations must not touch B. Include existing application-ID and unsaved job routes.
2. Implement forward migration with actor/application identity checks inside existing transaction locks; restrict identity-less RPC access. Preserve first-create and exact-operation retry behavior.
3. Wire identity through Applicant forms, actions, retry reconciliation, résumé route/services and response adoption. Add tests for wrong owner, malformed identity, stale identity, current identity, null initial identity and interrupted first uploads.
4. Run meaningful focused unit/database checks; run applicable local browser and race suites when Docker is available. Establish the first finding is fixed before the other repairs.
5. Add failing malformed-pagination tests, implement complete positive-safe-integer validation and verify valid/filter/history pagination paths.
6. Correct the two Developer Guide statements and check the source references, relative links and scoped formatting. Guides may describe added stale-request rejection if needed; no personal reflection edits.
7. Run typecheck, lint, relevant unit/database/browser checks and inspect final diff. Obtain a separate independent reviewer; fix and recheck findings. Record actual failures and unavailable checks.
8. Present results for separate student acceptance. Only afterward sync any accepted clarification if required, archive the full packet and write a dated session summary. Commit, push, PR, hosted migration and deployment require their respective explicit authorizations.

Allowed files: Applicant form/action/attachment/retry modules and résumé routes/services/components; one new Supabase migration and relevant SQL/unit/race/browser tests; HR query parser and tests; Developer Guide; this packet and dated logs/indexes. Excluded: AI implementation/prompts/providers, personal reflection prose, secrets/env, dependency locks and unrelated existing packets.

Owner: Paul. Implementation coordinator: current Codex execution. Independent reviewer not assigned yet; planned roles do not claim an agent run.
