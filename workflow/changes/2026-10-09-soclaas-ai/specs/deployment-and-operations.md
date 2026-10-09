# Spec delta: Deployment and operations

- Change/issues/owner/status: 2026-10-09-soclaas-ai; #7 and #10; John; written delta approved, implementation plan approval pending
- Canonical file: [deployment-and-operations.md](../../../specs/deployment-and-operations.md)
- Baseline: ProductSpec v1.0, 8 October 2026, commit 0a0f5c4; OPS-002
- Proposed baseline: v1.1
- Dependencies/cross-capability IDs: SEC-006/SEC-007, AID-001/AID-002, AIS-001/AIS-002
- Approval: John approved the written delta in chat on 2026-10-09.

## MODIFIED

### OPS-002: Operational safeguards and audit evidence

- Before: Operational evidence demonstrates SEC-006 limits, caps, timeouts, retry/error handling, and SEC-007 audit fields/privacy. Exact thresholds remain unresolved pending quota review.
- After: Before enabling either AI feature in an environment, the operator MUST verify the configured SoCLaaS model is available to that key and review that key’s current request/budget limits. Each deployment MUST use a server-only key and MUST enforce the SEC-006 application limits: three requests per user per rolling minute and 60 per deployment per rolling minute. Development, preview, staging, and production SHOULD use separate provider keys where available so usage is not combined across environments. Operational evidence MUST show bounded output, 20-second timeout, no automatic provider retry, safe provider 429/5xx handling, metadata-only audit outcomes, and rollback by disabling the AI actions while ordinary application submission and HR review remain available.
- Rationale/acceptance IDs: Explicitly reconcile app caps with varying provider-key quotas and make live operation/rollback observable; AI-AC-05/AI-AC-06.
- Scenario: Given an environment configured for AI, when its readiness is reviewed, then model access, key-specific quota, application limits, safe error handling and rollback are verified without sending private applicant text.
- Denial/failure scenario: Given missing/invalid credentials, unavailable model, or lower provider limits than the app cap, when AI is invoked, then the feature reports a safe unavailable state and never exposes the key or retries automatically.

## Delta review and sync evidence

- [x] John approved this written delta on 2026-10-09.
- [ ] Verify actual key-specific limit and configured model through SoCLaaS before live evaluation.
- [ ] Do not sync to the canonical specification until post-implementation acceptance.
- Sync commit/paths/decision evidence: Pending; no canonical file changed.
