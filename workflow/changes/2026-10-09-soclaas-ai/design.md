# Design: SoCLaaS Applicant draft and HR summary

- Change ID/issues: 2026-10-09-soclaas-ai; [#7](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/7), [#10](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/10)
- Owner/status/date: John; proposal, design and plan approved; implementation in progress; 2026-10-09
- Inputs: proposal.md; deltas under specs/; ProductSpec v1.0 at 0a0f5c4; APP-004, AID-001/AID-002, AIS-001/AIS-002, SEC-001/SEC-002/SEC-003/SEC-004/SEC-005/SEC-006/SEC-007, OPS-002
- Scope and affected components/files: Applicant application form and AI-draft route; HR application detail and summary route; server-only SoCLaaS client/schema validation; auth/data-access helpers; additive Supabase migration for post-submit write denial, atomic quotas and metadata audit; unit/route, RLS/database, and browser security tests. The exact allowlist is in `plan.md`. The existing user edit to .env.example is preserved and excluded.

## Decisions and alternatives

| Decision | Considered alternatives | Reason and tradeoffs | Human approval reference |
| --- | --- | --- | --- |
| Applicant may edit a saved draft while the job is published; submission freezes the current letter and the Applicant is directed to HR for later corrections. | Keep submitted-letter edits until closure; permit new application versions. | A stable review record is easier to audit and summarize; correction messaging is out of scope. | John approved in chat on 2026-10-09. |
| For existing submitted records, freeze the current cover_letter at rollout and preserve original_submitted_letter unchanged. | Summarize/rewrite the original snapshot for all records. | Avoids discarding edits allowed under the old policy and avoids rewriting historical first-submission data. New submissions have equal current/original values. | Included in John’s design approval; written review pending. |
| Use two narrowly scoped server routes. Applicant/HR content reads use the signed-in session and RLS; a server-only Supabase secret key calls only quota/audit metadata RPCs whose database checks verify the actor, role, and target. | Browser model calls, privileged reads of Applicant/HR data, authenticated direct quota RPCs, or one cross-role endpoint. | Preserves RLS for sensitive content and closes direct quota-consumption abuse while keeping elevated access limited to two metadata functions. A leaked server key remains privileged and must be isolated server-side. | Initial route/RLS design approved 2026-10-09; quota/audit key exception explicitly approved by John in chat on 2026-10-09. |
| Use SoCLaaS standard chat completions with no tools; request JSON content and validate strict Zod schemas locally. | Tool-enabled Responses calls or reliance on provider-native structured output. | No action capability; local validation does not depend on undocumented model-specific schema support. | John approved design for packet drafting on 2026-10-09. |
| Enforce 3 requests/user/minute and 24 requests/deployment/minute with atomic database reservation. Only trusted server code can invoke quota/audit RPCs; provider 429 responses are handled safely with a sanitized retry delay when available. | Process-local quota or unrestricted retries. | Durable state works across app instances. The configured key was observed at 30 RPM, leaving six requests of headroom; other keys may have lower limits. | Initial plan approved 2026-10-09; John explicitly approved the 24/minute cap and server-only quota/audit key in chat on 2026-10-09. |
| Persist metadata-only submission and AI audit events; retain existing HR status-event records. | Log prompt/output or rely only on volatile console output. | Provides actor/operation/target/time/outcome without reproducing sensitive content. | John approved design for packet drafting on 2026-10-09. |

## Interfaces and data flow

### Applicant draft

1. The application form collects ephemeral experience notes, limited to 4,000 characters. Notes are not saved as application content by generation.
2. A server route authenticates with the existing Supabase SSR session and verifies the Applicant role before loading the selected job. The user-scoped client and RLS read only job ID, title, and requirements where the job is published.
3. Validate request and fields with Zod. Reserve quota and create a metadata-only invocation record atomically. If quota or audit reservation fails, do not call SoCLaaS.
4. A server-only SoCLaaS client uses SOCLAAS_BASE_URL, SOCLAAS_API_KEY, and SOCLAAS_MODEL. The prompt treats notes/job text as untrusted, asks for personal claims only from notes, requests one JSON draft string, and supplies no tools.
5. Parse response JSON and strict Zod-validate one non-empty draft string of at most 5,000 characters. Finalize audit metadata before returning. Generation never writes the application table.
6. The UI places the returned text in an editable textarea and asks the Applicant to verify dates, skills, and achievements. Existing separate save/submit actions remain the only persistence path.

### HR summary

1. The HR detail page sends only the selected application ID to a server route.
2. The route authenticates and verifies the HR role before querying the selected submitted application through the user-scoped client and RLS. It selects only application ID, job ID, and current cover_letter, then calls a checked HR-only database function that returns only the published requirements for that one submitted application. This narrow function is needed because the existing jobs RLS policy hides a job after closure; it avoids granting HR broad table access while preserving later review. It does not fetch notes, status history, another application, or unrelated profile data.
3. Reserve the same durable user/global quota and metadata audit event. Call SoCLaaS chat completions once, with no tools, on the current letter and requirements as untrusted text.
4. Parse JSON and validate a strict object with exactly three arrays: evidence_mentioned, requirements_not_addressed, and follow_up_questions. Each array has at most five strings; each string has at most 240 characters. Do not return provider debug details.
5. Finalize audit metadata before returning. Render sections as ordinary escaped text beside the unchanged source letter with a clear verification notice. The route has no application, note, or status write path; HR alone uses the existing explicit status action.

### Shared trust boundary

Applicant notes, submitted letters, job text, provider responses, and provider errors are untrusted. Prompts provide instructions but are not treated as a security boundary. Authorization, RLS, field selection, no-tools requests, strict parsing, and no mutation capability provide the enforceable limits. There is no browser-visible SoCLaaS key or Supabase secret/service-role key, database command, or model tool. The privileged metadata client cannot read Applicant or HR content.

Provider references: [SoCLaaS quickstart](https://dochub.comp.nus.edu.sg/cf/guides/soclaas/quickstart), [API reference](https://dochub.comp.nus.edu.sg/cf/guides/soclaas/api), [model list](https://dochub.comp.nus.edu.sg/cf/guides/soclaas/models), and [usage limits](https://dochub.comp.nus.edu.sg/cf/guides/soclaas/usage-limits). The default request limit is not assumed to apply to every key; readiness checks verify the actual configured key.

## Authorization and privacy impact

- Authenticate each request and verify the exact role before protected data loads or provider calls.
- Applicant route reads one published job through RLS; HR route reads one submitted application and its fixed job requirements through RLS.
- Use the signed-in user’s Supabase session for all Applicant/HR data reads. A server-only secret key is used only for quota/audit RPCs; it is never available to the browser. The key has project-wide RLS-bypass capability, so environment isolation and restricted use are required.
- Quota/audit functions use fixed search_path, explicit profile verification/role/target checks, and execute grants limited to service_role. The HR requirements read remains an authenticated, auth.uid()-checked function. Direct table writes to quota/audit storage are not granted to browser roles. HR audit reads follow SEC-001.
- The database submission function writes a submission metadata event in the same transaction as submission. Existing application_status_events remain the record of HR status changes. AI invocation rows record actor, operation, target, time, and outcome only.
- Do not log notes, letters, prompts, model output, bearer tokens, API keys, or raw provider response bodies. If final audit update fails after model use, withhold generated output and emit only safe metadata to the server operational log.
- A malicious letter can ask for HR notes, another applicant’s data, or a status change. Those values are absent from the payload and the model has no tools. Application status remains controlled by the separate HR server/database action.

## Failure behavior

| Failure / adversarial input | Observable outcome / state guarantees | Verification |
| --- | --- | --- |
| Missing session / wrong role | 401/403 response; no protected query or model call; UI shows sign-in/access state. | Route test spies on data/provider calls; AI-AC-07. |
| Applicant requests unpublished job or HR requests missing/inaccessible/draft application | Deny before model call; use a non-enumerating not-found response for inaccessible application IDs. | Route/RLS tests with synthetic users; AI-AC-01/03/07. |
| Invalid ID, notes over 4,000, or invalid request body | 400 validation state; no provider call; typed form values remain. | Zod/route tests; AI-AC-05. |
| Per-user or deployment quota reached | 429 with retry interval; no provider call; user can manually retry after the interval. | Atomic concurrent quota test; AI-AC-05. |
| SoCLaaS 429/5xx, network failure, or 20-second timeout | Safe busy/unavailable message; no provider auto-retry; no partial output or database mutation. | Mocked client failure/timeout tests; one live synthetic provider error case where available. |
| Empty, malformed, extra-field, or over-limit model JSON | Reject the whole result; show safe generation error; do not render HTML or mutate application/status. | Zod and script-like output tests; AI-AC-05. |
| Audit reservation fails before provider call | Fail closed and do not call SoCLaaS. | Mock RPC failure and assert provider call count zero. |
| Final audit write fails after provider response | Withhold output; keep application/status unchanged; server fallback contains metadata only. | Mock terminal-audit failure and inspect response/log capture. |
| Prompt injection requests secrets, private notes, or status mutation | Only selected text exists in prompt; no tool or mutation path; original source remains visible and status unchanged. | Deterministic payload/status tests plus separately reported live synthetic evaluation; AI-AC-06. |

UI failures must not clear Applicant notes or typed cover-letter text. HR errors must leave the source letter and current status visible and unchanged. Loading indicators terminate on every outcome; the user must invoke any retry manually.

## Migration and backward compatibility

- Use additive database migration(s); do not alter or backfill existing original_submitted_letter values.
- Remove/revoke Applicant access to the submitted-letter edit RPC and enforce the submitted-state denial inside the database function/policy, not only in the UI. Keep draft save and explicit submission behavior.
- Freeze existing submitted rows at their current cover_letter values at deployment. The current value becomes the stable AI source; the initial original_submitted_letter remains historical.
- Add atomic quota and AI metadata audit storage/functions. Write submission metadata in the same transaction as application submission. Reuse application_status_events for HR transitions.
- Preserve current application status and existing HR notes/events. No model output is stored.
- Add only server-side SoCLaaS configuration if a needed placeholder is missing; inspect no secret-bearing local environment files and preserve the existing user edit to .env.example.

## Rollout and rollback

- Readiness: verify the configured model is returned by the SoCLaaS model endpoint; review the API key’s current quotas/budget; configure separate keys by environment when available; keep secrets server-only.
- Rollout: apply the additive local migration, run deterministic unit/route and local Supabase/RLS tests, review the final migration, then evaluate live only with synthetic examples.
- Rollback: disable both AI actions/server routes with a server-side feature flag. Ordinary Applicant save/submit and HR review continue to work. Keep additive audit/quota tables and submitted letter values; no destructive rollback or automatic restoration of post-submission edits.
- Monitoring: review metadata-only outcomes and quota usage; do not log prompt, input, output, or provider bodies.

## Review and unresolved decisions

- [x] Architecture/design was approved in chat for packet drafting by John on 2026-10-09; robust error handling is an explicit condition.
- [x] John approved the written design in chat on 2026-10-09.
- [x] John reported coordinating the APP-004 delta with Paul Cheng on 2026-10-09; this report is not independently verified and does not change the process-owner record.
- [ ] Confirm actual SoCLaaS model access and key-specific quotas before live evaluation.
- Human implementation-plan approval: John approved `plan.md` and `tasks.md` in chat on 2026-10-09.
