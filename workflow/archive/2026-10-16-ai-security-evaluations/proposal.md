# Proposal: AI security hardening and adversarial evaluations

- Issues: [#94 security and human control](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/94), [#95 evaluations and evidence](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/95).
- Owner: Paul Cheng for this follow-up; John remains the original AI implementation contributor.
- Baseline: `origin/develop` `2a56ba1`, ProductSpec v1.15; branch `feat/94-95-ai-security-evals`, 16 October 2026.
- Classification: bounded AI behavior/security and evaluation changes. No schema migration or new model tool authority.

## Problem and goals

Both AI features already authorize users/targets, minimize provider inputs, validate schemas, enforce durable quotas, fail closed on audit failure and keep the model away from database actions. The source audit found missing explicit AI-route origin/media-type guards, no application-level provider response-envelope cap or completion-status validation, permissive remote HTTPS provider configuration, and automatic insertion of generated text into the current cover letter. Existing tests are not a reproducible adversarial model evaluation.

Add enforceable guards at those boundaries, an explicit draft-review/adoption action, meaningful offline/adversarial evaluations, an optional bounded baseline-versus-refined-prompt live comparison, and evidence addressing all four assignment AI-security questions. Avoid claiming that schemas, mock tests or a few successful model responses prove general prompt-injection immunity or factual accuracy.

## Scope and exclusions

Allowed: AI server modules/routes, Applicant AI component and minimal parent wiring, AI/privacy/browser tests, synthetic `tests/evals/` fixtures/harness, dedicated evaluation runner/configuration, package scripts and CI evaluation/report wiring, ignored local evaluation output, guide/security/evaluation documentation, this packet and logs. Preserve the normal Applicant/HR pipeline, existing HR summary shape/source mapping and authorization/RLS/quota contracts.

Excluded: hosted deployments/settings, credentials/environment-file mutation, application schema/role changes, new hiring automation, resume parsing or transmission, external browsing/retrieval by the model, model tool calls, new SDD toolkits, and personal reflection rewriting. If a new database defect is confirmed, prepare a separate bounded repair rather than broadening this plan silently.

## Acceptance criteria

| ID        | Requirement and observed evidence required                                                                                                                                                                                                                                                                                             |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AISEC-01  | SEC-002/004/010: both routes reject cross-origin browser requests and non-JSON bodies before protected reads/provider calls; normal same-origin and authenticated no-Origin server requests retain authorization checks.                                                                                                               |
| AISEC-02  | SEC-006/010: safe SoCLaaS configuration, no provider redirects, streamed 64 KiB response cap, one complete assistant response only, no tool/refusal/truncated/ambiguous output; test boundary sizes, absent/incorrect content length, abort/error and no automatic retries.                                                            |
| AISEC-03  | AID-002: generation first produces an editable preview; original cover-letter edits remain intact until explicit Use/Replace adoption. Discard/failure and concurrent typing preserve the letter; neither generation nor adoption saves/submits.                                                                                       |
| AISEC-04  | AID-001, AIS-001/002, SEC-002..008: exercise role/ownership/data minimization, prompt-data separation, strict source IDs, escaped output, quota/audit failure, withdrawal recheck, and unchanged human-controlled status/submission.                                                                                                   |
| AIEVAL-01 | OPS-004: versioned corpus has at least 48 meaningful synthetic benign/adversarial cases, provenance, attack/source labels, expected outcomes and limitations; offline reports distinguish contract checks from model behavior.                                                                                                         |
| AIEVAL-02 | OPS-004: optional live comparison uses 12 fixed cases (six/feature) × baseline/refined prompts, maximum 24 completions total at six/minute sequentially, 20-second request deadline, no retries; safe metadata report and ignored synthetic review material. Unavailable configuration/rate limits remain Blocked/Failed, never green. |
| AIEVAL-03 | SEC-007/008, OPS-004: CI runs offline only with no provider key, emits allowlisted case/category results, and cannot accept model-authored verdicts or execute output. Raw prompts/responses/provider errors/keys never enter committed summaries or CI artifacts.                                                                     |
| AIEVAL-04 | OPS-003/004: threat-to-control-to-test matrix and four-question evidence guide distinguish implemented, tested, observed, human-reviewed and pending states; preserve failures and probabilistic/hosted limits.                                                                                                                        |

## Decisions, alternatives and gates

Keep current controls and extend them rather than replace them. Phrase blacklists alone are rejected as an injection defense because they can reject benign text and cannot establish authority. A second LLM judge is not required: deterministic properties and explicit human quality review have distinct responsibilities. No new runtime dependency is planned.

The live option is proposed for the already configured public SoCLaaS gateway and `llama3.1:8b`, using only the named `ai-security-v1-live12` synthetic dataset described in the threat model. No live call has occurred during intake. Paul may approve implementation with the bounded live comparison, or approve offline implementation only; record the actual choice. Before any approved live run, finish deterministic controls/tests and obtain a separate safety review of the harness/fixtures. A changed target/model/dataset scope or increased call budget requires a new decision.

See [threat model](threat-model.md), [design](design.md), [plan](plan.md), [tasks](tasks.md), [record](record.md) and capability deltas in `specs/`. Paul approved implementation and bounded live evaluations on 16 October 2026, as recorded with the actual decision source. Acceptance, commit, push, PR and deployment remain separate.
