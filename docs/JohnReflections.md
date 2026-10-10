# John’s reflection

## Contribution and evidence

Describe your actual role, AI-feature work and team-level contributions. The [SoCLaaS packet](../workflow/archive/2026-10-09-soclaas-ai/record.md) records the AI implementation, model evaluation and acceptance limits. Use it to verify specific statements; distinguish your work from Paul’s Applicant/HR pipeline work.

## AI Security

1. Which untrusted inputs reach Applicant drafting and HR summaries? Discuss direct instruction injection, system-message impersonation, data exfiltration requests and factual fabrication in notes/letters/requirements. Which risks occur in development prompts/issues/handoffs?
2. Explain safeguards you actually implemented and tested: selected data projections, server/RLS authorization, no model tools/status authority, request/output validation, escaped rendering, quotas and fail-closed audit handling. Link actual test results and reflect on the observed factual summary error.
3. Explain model timeouts, input/output limits, request quotas and disabled retries. Separately discuss development-agent task/access limits and what is merely an instruction versus technically enforced.
4. Describe actual approval/acceptance gates and human oversight. Explain remaining weaknesses and a concrete improvement, without claiming production checks that were not performed.

## Spec-Driven Development

1. What did your AI specification need to define before implementation, including allowed inputs, failure behavior and human decision boundaries?
2. Which ambiguity would stop an agent from implementing correctly? Show one precise success/denial/failure scenario.
3. How did a requirement change flow through deltas, code, tests, review, acceptance and canonical sync? Explain submitted-letter immutability with verified change history.
4. Which tests demonstrate intent rather than mirror code? Explain what local/provider evidence can and cannot establish.

## Basic Multi-Agent SE

1. Which specialist roles would help your tasks and which were actually dispatched? Distinguish applying a skill from another execution.
2. How should a role be specified and evaluated? Identify actual evidence and proposed future evaluation separately.
3. What context must a handoff retain: approved scope, inputs/baseline, IDs, tests/failures, findings, permissions and human decisions?
4. Where could errors or malicious instructions enter the spec–implementation–review chain? Give a concrete example or clearly label a hypothetical scenario.
5. What evidence lets a person verify an agent’s work? Reflect on reviewer independence, commands/results, commits, limitations and generated-summary verification.

## Conclusion and AI acknowledgement

Write your own conclusions about what worked, what failed and what you would change. State the AI tools you actually used and their specific purposes, and accept responsibility for verifying the final content. Confirm reuse/contribution details and current hosted testing/release state before submission.
