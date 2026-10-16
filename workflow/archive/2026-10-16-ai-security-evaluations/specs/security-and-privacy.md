# Security and privacy delta

## ADDED SEC-010: AI request and provider transport boundaries

Both AI endpoints MUST require JSON requests and reject a present browser Origin that does not match the request URL origin, opaque Origin values and cross-site Fetch Metadata before protected data reads or model calls. Missing Origin MAY be accepted for non-browser clients, but all existing authenticated actor/role/target checks remain mandatory. Rejections MUST be safe and uncached; unsupported request media types return 415 and cross-origin browser requests return 403.

Provider configuration MUST use the approved SoCLaaS HTTPS gateway `/v1` endpoint without URL credentials, query or fragment. HTTP loopback mocks MAY be used only outside production. Provider requests MUST NOT follow redirects. The actual streamed provider response envelope MUST be capped at 65,536 bytes before JSON parsing, independent of Content-Length, and an oversized stream MUST be cancelled. Existing 20-second deadlines, no automatic retries, quotas, minimized payloads and audit-failure behavior remain required under SEC-005/006/007.

Only one complete assistant response with stop finish status, nonempty JSON content, no refusal and no tool/function calls MAY proceed to the existing strict output validation. Truncated, ambiguous or invalid envelopes MUST fail safely without partial display or domain mutation. Model data MUST NOT be executed as instructions, markup, code or action approvals.

Scenario: Given an authorized same-origin Applicant request and a valid bounded provider completion, when processed, then the existing validated draft result is available for human review. An authorized server client without Origin remains subject to the same actor and target checks.

Denial/failure scenario: Given cross-origin browser requests, non-JSON media, unsafe gateway configuration, redirects, oversized/stalled bodies, truncated/tool/refusal responses or invalid output, when processed, then the request is denied or its result discarded, no protected content or secrets are returned, and no application/note/status/role write occurs. Existing audit requirements apply to reserved provider attempts.

No other security requirement is removed or relaxed. This is proposed only; canonical sync waits for acceptance.
