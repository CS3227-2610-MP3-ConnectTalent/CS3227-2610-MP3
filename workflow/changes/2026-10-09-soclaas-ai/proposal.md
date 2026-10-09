# Proposal: SoCLaaS Applicant draft and HR summary

- Change ID: 2026-10-09-soclaas-ai
- Issues: [#7 Applicant SoCLaaS cover-letter draft](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/7); [#10 HR SoCLaaS application summary](https://github.com/CS3227-2610-MP3-ConnectTalent/CS3227-2610-MP3/issues/10)
- Owner: John, student owner for both issues; assigned in chat on 2026-10-09
- Status: Written proposal approved for implementation planning; implementation plan approval pending
- Date: 2026-10-09
- Baseline: [ProductSpec v1.0](../../ProductSpec.md), 8 October 2026, baseline commit 0a0f5c4
- Affected capabilities: applications-and-review APP-004; applicant-ai-draft AID-001/AID-002; hr-ai-summary AIS-001/AIS-002; security-and-privacy SEC-001/SEC-006/SEC-007; deployment-and-operations OPS-002
- Classification: Behavior change and two AI features; high security/privacy risk due to applicant data and an external model service

## Intent, problem, and motivation

The canonical product requirements call for one SoC LLM feature for Applicants and one for HR, but neither feature is implemented. Applicant AI should help prepare an editable cover letter from the Applicant’s notes and a selected published job. HR AI should summarize only one submitted letter against that job’s fixed published requirements. Both features must preserve human control over application submission and hiring status.

The current APP-004 rule allows an Applicant to change the current submitted letter while the job remains published. John approved changing that rule on 2026-10-09: Applicants can edit before submission, the submitted application is then frozen, and the UI directs correction requests to HR. To preserve existing data, the frozen AI source is the current cover_letter value at rollout; the existing original_submitted_letter remains unchanged as the first-submission snapshot. No existing letter is backfilled or overwritten.

## Goals, non-goals, and scope boundaries

- Goals:
  - Generate a draft from Applicant notes and only the selected published job title and requirements. Personal claims must come only from the notes.
  - Return an editable draft without writing an application. The Applicant separately saves or explicitly submits final text and is asked to verify dates, skills, and achievements.
  - Summarize the frozen current letter for one authorized submitted application against its job’s published requirements.
  - Validate model output, bound calls and usage, preserve safe state on failure, and record metadata without letter or prompt text.
  - Prevent Applicant post-submission edits in both UI and database authorization.
- Non-goals:
  - AI ranking, scoring, hiring recommendations, rejection, status changes, notes, messaging, or autonomous action.
  - Arbitrary application lookup, cross-applicant data, HR notes, status history, model tools, database commands, or persistent AI notes/output.
  - A correction-request messaging system. The UI will tell the Applicant to contact HR; it will not invent a contact address.
  - Changes to job publishing, account promotion, HR notes, or status workflows beyond metadata auditing of existing status events.
- Users/roles: Applicant owns notes, edits the draft, and submits final text. Verified HR requests a summary and independently reviews the original/current letter before making any status decision.
- Scope boundaries: Existing issues #7 and #10 are the intake. John is the feature owner based on his 2026-10-09 assignment. The canonical product index still names Paul Cheng as Applicant process owner; this proposal does not change that ownership record and requires coordination with him before implementing the APP-004 lifecycle delta. Preserve the user-owned .env.example edit and do not inspect .env.local or .env.dev.

## Alternatives and dependencies

| Alternative | Benefit / cost / risk | Decision and reason |
| --- | --- | --- |
| Keep post-submission edits and summarize the current letter | Allows corrections in place but changes the AI source over time and weakens the submitted-record boundary. | Rejected; John approved freezing the submitted application. |
| Summarize original_submitted_letter for every record | Preserves the first submission but can ignore edits made under the existing policy before rollout. | Rejected; freeze the current cover_letter at rollout and preserve the historical original without rewriting it. |
| In-memory per-user throttling | Simple, but resets across processes and does not reliably bound serverless instances. | Rejected; use an atomic database-backed quota through the authenticated session. |
| Use model tools or database access for convenience | Could enable actions but expands authority and prompt-injection impact. | Rejected; use SoCLaaS chat completions with no tools or database authority. |
| Depend on model-native structured output mode | May simplify parsing, but gateway/model support is not guaranteed by the referenced API contract. | Rejected; request JSON content and enforce a strict local Zod schema. |

- Assumptions: Published job content remains fixed under JMG-002. SoCLaaS credentials, model availability, and per-key quotas must be verified in each deployment. The [documented default service limit](https://dochub.comp.nus.edu.sg/cf/guides/soclaas/usage-limits) is 90 requests per minute, but per-key limits may be lower.
- Dependencies: Existing issues #7 and #10; Applicant/HR session and RLS helpers; SoCLaaS server credentials and model configured outside browser code; local synthetic Supabase data for security tests.
- Risks: Prompt injection or inaccurate summaries; mitigate with strict data minimization, no tools, Zod parsing, visible source letter, explicit HR verification, and no automated decisions. Provider outage/quota errors; mitigate with bounded calls, no automatic provider retry, safe UI errors, and manual retry. Existing Applicant process ownership is recorded as Paul Cheng; coordinate APP-004 before implementation.
- Open decisions: John must approve the implementation plan before implementation. Verify actual SoCLaaS model and account-specific quota before a live call. John reported coordinating with Paul Cheng about APP-004 on 2026-10-09; this report is not independently verified and does not change the recorded process-owner role.

## Acceptance evidence and artifacts

| Acceptance ID | Issue criterion and canonical requirement IDs | Given / When / Then outcome | Required evidence and owner |
| --- | --- | --- | --- |
| AI-AC-01 | #7; AID-001; SEC-001/SEC-002/SEC-005 | Given a verified Applicant and a published job, when notes are submitted, then only notes, job title and requirements reach the model; unauthorized or unpublished-job requests make no model call. | Mocked route tests inspect exact payload and denial-before-provider behavior; John |
| AI-AC-02 | #7; AID-002; APP-001/APP-004 | Given a generated draft, when returned, then it is editable and generation neither saves nor submits an application; the Applicant must explicitly save or submit final text. | Unit/E2E evidence observes no application mutation on generation and editable form behavior; John |
| AI-AC-03 | #10; AIS-001/AIS-002; SEC-001/SEC-005 | Given verified HR and one submitted application, when summary is requested, then only the frozen current letter and that job’s published requirements are sent and the validated result contains the required sections without hiring decisions. | Mocked exact-payload/schema tests and role-denial tests; John |
| AI-AC-04 | #7/#10; APP-004; SEC-001 | Given a submitted application, when the Applicant attempts a post-submission edit through UI or direct request, then no letter field changes and the Applicant sees correction guidance to contact HR. | Application UI test, direct RPC/API denial test, and local RLS/database test; John |
| AI-AC-05 | #7/#10; SEC-004/SEC-006/OPS-002 | Given oversized, repeated, timed-out, unavailable, quota-limited, empty, malformed, or script-like model output, when generation fails, then there is a bounded safe error, no partial result or state change, and no automatic retry. | Mocked boundary, timeout, quota and error-state tests; live synthetic model observations recorded separately; John |
| AI-AC-06 | #7/#10; SEC-003/SEC-007 | Given adversarial text or a model invocation, when it is processed and audited, then no tools/status writes are possible and metadata records actor, operation, target, time, and outcome without notes, letter text, prompt, output, or key. | Security tests inspect payload, status/audit rows and logs; John |
| AI-AC-07 | #7/#10; SEC-001/SEC-002/SEC-008 | Given anonymous access, Applicant A attempting Applicant B’s data, or an Applicant invoking HR summary, when the route is called, then access is denied before protected data or provider access. | Unit/route tests with a mocked model and local pgTAP/RLS evidence using synthetic records; John |

- Spec deltas: specs/applications-and-review.md, applicant-ai-draft.md, hr-ai-summary.md, security-and-privacy.md, deployment-and-operations.md
- Design: design.md
- Plan and tasks: Drafted after John approved the written proposal, deltas, and design; plan approval remains pending.
- Evidence: record.md

## Approval record

- [x] John approved the in-chat design for packet drafting on 2026-10-09 and required robust error handling. This permits drafting/review only; it does not approve the implementation plan or product implementation.
- [x] John approved the written proposal, deltas, and design in chat on 2026-10-09.
- [ ] Implementation plan and tasks approved by John before product implementation.
- Approver: John, accountable student owner
- Decision/date/source: John approved the written artifacts and reported coordinating with Paul in this conversation, 2026-10-09. Implementation plan approval remains pending.
- Conditions: Preserve current cover_letter as the frozen post-rollout value without overwriting original_submitted_letter. Treat Paul's coordination as user-reported, not independently verified. No product code until the plan gate passes.
