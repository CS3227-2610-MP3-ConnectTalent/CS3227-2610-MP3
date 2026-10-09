# Product specification

Current baseline: **1.2**, dated **9 October 2026** (application identity/contact details and privacy safeguards). The v1.0 email password recovery, v0.9 signup password usability and v0.8 HR review baselines were dated 8 October 2026; the v0.7 Applicant lifecycle baseline was dated 7 October 2026.

This product is a careers site for one employer per deployment, with external Applicant and company HR roles. The first release supports multiple job openings and one text-only application per applicant per job. AI drafting and summary features use the course-required SoC LLM and retain human control over submission and hiring status.

The canonical requirements now live in the capability specifications below. The split on 6 October 2026 preserved v0.6 behavior, its nine release acceptance items, role boundaries, and non-goals. The accepted 7 October 2026 change added password confirmation and email verification, persistent private drafts, submitted-letter edits until job closure, and corresponding visibility rules. The locally accepted 8 October 2026 HR change defines controlled HR assignment, submitted-only review, private append-only notes, human status actions and the team's Vercel/Supabase environment mapping. The later accepted signup change retains the email after a password mismatch, adds accessible password visibility controls, and keeps passwords out of server action error state. The accepted recovery change adds a shared Applicant/HR email reset flow with neutral acknowledgement and user-scoped password update. The accepted 9 October 2026 change adds SoCLaaS-assisted Applicant drafting before submission, freezes submitted applications, and constrains HR summaries to validated excerpts from the selected frozen letter and published requirements. The separately accepted #39 change adds private saved identity/contact details, a trusted verified-email snapshot on submission, immutable submitted fields, legacy missing-field display and structured-contact exclusion from AI and logs. This filename remains the entry point for historical references. Specifications describe intended behavior, not evidence that hosted migration or release gates are complete.

| Capability | Canonical specification | IDs |
| --- | --- | --- |
| Product boundary, actors, scope and non-goals | [Product overview](specs/product-overview.md) | OVR |
| Signup and role assignment | [Accounts and roles](specs/accounts-and-roles.md) | ACC |
| Public browsing, category filtering and details | [Public job listings](specs/public-job-listings.md) | JOB |
| HR job lifecycle | [Job management](specs/job-management.md) | JMG |
| Applications and HR review | [Applications and review](specs/applications-and-review.md) | APP |
| Applicant-controlled AI drafting | [Applicant AI draft](specs/applicant-ai-draft.md) | AID |
| HR AI summary | [HR AI summary](specs/hr-ai-summary.md) | AIS |
| Cross-cutting authorization, privacy and AI safeguards | [Security and privacy](specs/security-and-privacy.md) | SEC |
| Environments, operations and release evidence | [Deployment and operations](specs/deployment-and-operations.md) | OPS |

See [specification conventions and the change traces](specs/README.md) for ID rules, version policy and source-to-destination coverage. Applicant process ownership is Paul Cheng; HR process ownership remains unresolved in this index. The application quota is three requests per user and 24 per deployment per rolling minute as specified in SEC-006; the configured provider key may impose a separate limit.
